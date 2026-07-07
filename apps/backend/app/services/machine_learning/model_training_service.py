"""
Model Training Service (Orchestrator) — Phase 7

Responsibility: Wire together all ML sub-services into a single,
end-to-end training pipeline.

Supported model types and algorithms:

  REGRESSION:
    linear_regression
    random_forest_regressor

  CLASSIFICATION:
    logistic_regression
    decision_tree_classifier
    random_forest_classifier

  CLUSTERING:
    kmeans
    dbscan

  FORECASTING:
    prophet
    arima

Workflow per training request:
  1. Load dataset from file (via existing file_processing pipeline)
  2. Validate dataset (DatasetValidator)
  3. Prepare data (DatasetPreparationService)
  4. Train model (algorithm-specific service)
  5. Evaluate model (EvaluationService)
  6. Persist model to disk (ModelPersistenceService)
  7. Save MLModel + MLModelRun + MLEvaluationResult records to DB
  8. Return MLModelResponse
"""

import os
import time
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
import structlog
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.dataset import Dataset
from app.models.machine_learning import (
    MLAlgorithm,
    MLEvaluationResult,
    MLForecast,
    MLModel,
    MLModelRun,
    MLModelStatus,
    MLModelType,
)
from app.schemas.machine_learning import (
    ForecastRequest,
    MLModelResponse,
    TrainRequest,
)
from app.services.file_processing.parser import parse_file
from app.services.file_processing.cleaner import clean_dataset
from app.services.machine_learning.dataset_preparation_service import DatasetPreparationService
from app.services.machine_learning.evaluation_service import EvaluationService
from app.services.machine_learning.clustering_service import ClusteringService
from app.services.machine_learning.classification_service import ClassificationService
from app.services.machine_learning.regression_service import RegressionService
from app.services.machine_learning.forecasting_service import ForecastingService
from app.services.machine_learning.model_persistence_service import ModelPersistenceService
from app.services.machine_learning.validators import DatasetValidator
from app.services.machine_learning.utils import json_safe

logger = structlog.get_logger(__name__)

UPLOAD_DIR = "uploads"

# Map algorithm string → (model_type enum, algorithm enum)
ALGORITHM_MAP: Dict[str, tuple] = {
    "linear_regression": (MLModelType.REGRESSION, MLAlgorithm.LINEAR_REGRESSION),
    "random_forest_regressor": (MLModelType.REGRESSION, MLAlgorithm.RANDOM_FOREST_REGRESSOR),
    "logistic_regression": (MLModelType.CLASSIFICATION, MLAlgorithm.LOGISTIC_REGRESSION),
    "decision_tree_classifier": (MLModelType.CLASSIFICATION, MLAlgorithm.DECISION_TREE_CLASSIFIER),
    "random_forest_classifier": (MLModelType.CLASSIFICATION, MLAlgorithm.RANDOM_FOREST_CLASSIFIER),
    "kmeans": (MLModelType.CLUSTERING, MLAlgorithm.KMEANS),
    "dbscan": (MLModelType.CLUSTERING, MLAlgorithm.DBSCAN),
    "prophet": (MLModelType.FORECASTING, MLAlgorithm.PROPHET),
    "arima": (MLModelType.FORECASTING, MLAlgorithm.ARIMA),
}


class ModelTrainingService:
    """
    Orchestrates the complete ML training lifecycle.
    One public method per action (train, retrain, forecast).
    """

    def __init__(self, session: Session, user_id: str) -> None:
        self.session = session
        self.user_id = user_id
        self.prep = DatasetPreparationService()
        self.evaluator = EvaluationService()
        self.persistence = ModelPersistenceService()
        self.validator = DatasetValidator()
        self.regression_svc = RegressionService()
        self.classification_svc = ClassificationService()
        self.clustering_svc = ClusteringService()
        self.forecasting_svc = ForecastingService()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _load_dataset_df(self, dataset_id: str) -> tuple:
        """Load the dataset file and return (df, dataset_record)."""
        dataset: Optional[Dataset] = (
            self.session.query(Dataset).filter(Dataset.id == dataset_id).first()
        )
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        filepath = os.path.join(UPLOAD_DIR, str(dataset.stored_filename))
        if not os.path.exists(filepath):
            raise HTTPException(
                status_code=404, detail="Dataset file missing from storage"
            )

        df = parse_file(filepath, str(dataset.file_type), str(dataset.original_filename))
        df, _ = clean_dataset(df)
        return df, dataset

    def _resolve_algorithm(self, algorithm: str) -> tuple:
        """Map algorithm string to (model_type, algorithm) enum tuple."""
        if algorithm not in ALGORITHM_MAP:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported algorithm '{algorithm}'. Supported: {list(ALGORITHM_MAP.keys())}",
            )
        return ALGORITHM_MAP[algorithm]

    # ------------------------------------------------------------------
    # Train (main entry point)
    # ------------------------------------------------------------------

    def train(self, request: TrainRequest) -> MLModelResponse:
        """
        Full training pipeline entry point.
        Dispatches to the correct algorithm-specific private method.
        """
        algorithm = request.algorithm.lower()
        model_type, algorithm_enum = self._resolve_algorithm(algorithm)

        logger.info(
            "training_started",
            dataset_id=request.dataset_id,
            algorithm=algorithm,
            user_id=self.user_id,
        )

        # Load data
        df, dataset = self._load_dataset_df(request.dataset_id)
        self.validator.validate_minimum_rows(df)

        # Create DB record
        ml_model = MLModel(
            user_id=self.user_id,
            dataset_id=request.dataset_id,
            name=request.model_name,
            model_type=model_type,
            algorithm=algorithm_enum,
            status=MLModelStatus.TRAINING,
            hyperparameters=request.hyperparameters,
            feature_columns=request.feature_columns,
            target_column=request.target_column,
            test_size=request.test_size,
            random_state=request.random_state,
        )
        self.session.add(ml_model)
        self.session.flush()  # get ID before commit

        run = MLModelRun(
            model_id=str(ml_model.id),
            run_number=1,
            status=MLModelStatus.TRAINING,
            hyperparameters=request.hyperparameters,
            started_at=pd.Timestamp.utcnow().to_pydatetime(),
        )
        self.session.add(run)
        self.session.flush()

        start_time = time.time()

        try:
            if model_type == MLModelType.REGRESSION:
                result = self._train_regression(df, request, str(ml_model.id), algorithm)
            elif model_type == MLModelType.CLASSIFICATION:
                result = self._train_classification(df, request, str(ml_model.id), algorithm)
            elif model_type == MLModelType.CLUSTERING:
                result = self._train_clustering(df, request, str(ml_model.id), algorithm)
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Use /api/v1/ml/forecast for forecasting models.",
                )

            duration = time.time() - start_time

            # Update DB records
            ml_model.status = MLModelStatus.TRAINED
            ml_model.model_path = result.get("model_path")
            ml_model.training_duration = duration
            ml_model.evaluation_summary = result.get("metrics")
            ml_model.feature_importances = result.get("feature_importances")
            ml_model.feature_columns = result.get("feature_columns", request.feature_columns)

            run.status = MLModelStatus.TRAINED
            run.metrics = result.get("metrics")
            run.feature_importances = result.get("feature_importances")
            run.training_duration = duration
            run.completed_at = pd.Timestamp.utcnow().to_pydatetime()

            # Save evaluation result
            eval_result = MLEvaluationResult(
                model_id=str(ml_model.id),
                run_id=str(run.id),
                metrics=result.get("metrics"),
                confusion_matrix=result.get("confusion_matrix"),
                classification_report=result.get("classification_report"),
                roc_curve_data=result.get("roc_curve_data"),
                residuals_data=result.get("residuals_data"),
                actual_vs_predicted=result.get("actual_vs_predicted"),
                cluster_stats=result.get("cluster_stats"),
                cluster_assignments=result.get("cluster_assignments"),
            )
            self.session.add(eval_result)
            self.session.commit()

            logger.info(
                "training_completed",
                model_id=str(ml_model.id),
                algorithm=algorithm,
                duration=duration,
                user_id=self.user_id,
            )

            self.session.refresh(ml_model)
            return MLModelResponse.model_validate(ml_model)

        except HTTPException:
            raise
        except Exception as e:
            self.session.rollback()
            ml_model.status = MLModelStatus.FAILED
            ml_model.error_message = str(e)
            run.status = MLModelStatus.FAILED
            run.error_message = str(e)
            self.session.commit()

            logger.error(
                "training_failed",
                model_id=str(ml_model.id),
                algorithm=algorithm,
                error=str(e),
                exc_info=True,
            )
            raise HTTPException(
                status_code=500, detail=f"Model training failed: {str(e)}"
            )

    # ------------------------------------------------------------------
    # Regression
    # ------------------------------------------------------------------

    def _train_regression(
        self,
        df: pd.DataFrame,
        request: TrainRequest,
        model_id: str,
        algorithm: str,
    ) -> Dict[str, Any]:
        if not request.target_column:
            raise HTTPException(
                status_code=400, detail="target_column is required for regression."
            )
        self.validator.validate_target_column(df, request.target_column, allowed_types=["numeric"])
        leakage = self.validator.detect_data_leakage(
            df,
            request.feature_columns or [c for c in df.columns if c != request.target_column],
            request.target_column,
        )

        prepared = self.prep.prepare(
            df,
            target_column=request.target_column,
            feature_columns=request.feature_columns,
            test_size=request.test_size,
            random_state=request.random_state,
            scale=True,
        )

        X_train = prepared["X_train"]
        X_test = prepared["X_test"]
        y_train = prepared["y_train"]
        y_test = prepared["y_test"]
        feature_cols: List[str] = prepared["feature_columns"]

        if algorithm == "linear_regression":
            model, importances = self.regression_svc.train_linear_regression(
                X_train, y_train, request.hyperparameters
            )
        else:
            model, importances = self.regression_svc.train_random_forest_regressor(
                X_train, y_train, request.hyperparameters
            )

        y_pred = model.predict(X_test)
        metrics = self.evaluator.regression_metrics(y_test, y_pred)
        residuals = self.evaluator.regression_residuals(y_test, y_pred)

        avp: List[Dict[str, float]] = json_safe([
            {"actual": float(a), "predicted": float(p)}
            for a, p in zip(y_test, y_pred)
        ])

        # Persist
        payload = {
            "model": model,
            "feature_columns": feature_cols,
            "scaler": prepared["scaler"],
            "target_encoder": prepared.get("target_encoder"),
        }
        path = self.persistence.save(model_id, payload)

        return {
            "model_path": path,
            "metrics": metrics,
            "feature_importances": importances,
            "feature_columns": feature_cols,
            "residuals_data": residuals,
            "actual_vs_predicted": avp,
            "data_leakage_warnings": leakage,
        }

    # ------------------------------------------------------------------
    # Classification
    # ------------------------------------------------------------------

    def _train_classification(
        self,
        df: pd.DataFrame,
        request: TrainRequest,
        model_id: str,
        algorithm: str,
    ) -> Dict[str, Any]:
        if not request.target_column:
            raise HTTPException(
                status_code=400, detail="target_column is required for classification."
            )
        self.validator.validate_target_column(df, request.target_column)
        self.validator.validate_sufficient_classes(df, request.target_column)

        prepared = self.prep.prepare(
            df,
            target_column=request.target_column,
            feature_columns=request.feature_columns,
            test_size=request.test_size,
            random_state=request.random_state,
            scale=True,
            stratify=True,
        )

        X_train = prepared["X_train"]
        X_test = prepared["X_test"]
        y_train = prepared["y_train"]
        y_test = prepared["y_test"]
        feature_cols: List[str] = prepared["feature_columns"]
        target_encoder = prepared.get("target_encoder")

        if algorithm == "logistic_regression":
            model, importances = self.classification_svc.train_logistic_regression(
                X_train, y_train, request.hyperparameters
            )
        elif algorithm == "decision_tree_classifier":
            model, importances = self.classification_svc.train_decision_tree(
                X_train, y_train, request.hyperparameters
            )
        else:
            model, importances = self.classification_svc.train_random_forest_classifier(
                X_train, y_train, request.hyperparameters
            )

        y_pred = model.predict(X_test)
        y_prob = None
        if hasattr(model, "predict_proba"):
            try:
                y_prob = model.predict_proba(X_test)
            except Exception:
                pass

        # Decode labels for class names in report
        class_labels = None
        if target_encoder is not None:
            try:
                class_labels = [str(c) for c in target_encoder.classes_]
            except Exception:
                pass

        metrics, cm, report = self.evaluator.classification_metrics(
            y_test, y_pred, y_prob, class_labels
        )

        roc_data: Optional[Dict[str, Any]] = None
        if y_prob is not None:
            n_classes = len(np.unique(y_test))
            roc_data = self.evaluator.roc_curve_data(y_test, y_prob, n_classes)

        # Persist
        payload = {
            "model": model,
            "feature_columns": feature_cols,
            "scaler": prepared["scaler"],
            "target_encoder": target_encoder,
        }
        path = self.persistence.save(model_id, payload)

        return {
            "model_path": path,
            "metrics": metrics,
            "feature_importances": importances,
            "feature_columns": feature_cols,
            "confusion_matrix": cm,
            "classification_report": report,
            "roc_curve_data": roc_data,
        }

    # ------------------------------------------------------------------
    # Clustering
    # ------------------------------------------------------------------

    def _train_clustering(
        self,
        df: pd.DataFrame,
        request: TrainRequest,
        model_id: str,
        algorithm: str,
    ) -> Dict[str, Any]:
        self.validator.validate_numeric_features_exist(df)

        prepared = self.prep.prepare(
            df,
            target_column=request.feature_columns[0] if request.feature_columns and len(request.feature_columns) == 1 else "__no_target__",
            feature_columns=request.feature_columns,
            test_size=request.test_size,
            random_state=request.random_state,
            scale=True,
        ) if request.feature_columns else None

        # For clustering, use all numeric columns (scaled)
        numeric_df = df.select_dtypes(include="number").dropna()
        X, scaler = self.prep.standardize(numeric_df)
        feature_cols = list(X.columns)

        if algorithm == "kmeans":
            model, labels, algo_stats = self.clustering_svc.train_kmeans(
                X, request.hyperparameters
            )
            inertia = float(model.inertia_)
        else:
            model, labels, algo_stats = self.clustering_svc.train_dbscan(
                X, request.hyperparameters
            )
            inertia = None

        metrics = self.evaluator.clustering_metrics(X, labels, inertia)
        cluster_stats = self.clustering_svc.compute_cluster_stats(X, labels)
        assignments = self.clustering_svc.extract_cluster_assignments(X, labels)

        # Persist
        payload = {
            "model": model,
            "feature_columns": feature_cols,
            "scaler": scaler,
        }
        path = self.persistence.save(model_id, payload)

        return {
            "model_path": path,
            "metrics": metrics,
            "feature_columns": feature_cols,
            "cluster_stats": cluster_stats,
            "cluster_assignments": assignments,
        }

    # ------------------------------------------------------------------
    # Forecasting (separate endpoint)
    # ------------------------------------------------------------------

    def train_forecast(self, request: ForecastRequest) -> MLModelResponse:
        """
        Specialised training pipeline for time-series forecasting.
        """
        algorithm = request.algorithm.lower()
        if algorithm not in {"prophet", "arima"}:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported forecasting algorithm '{algorithm}'. Use 'prophet' or 'arima'.",
            )

        logger.info(
            "forecast_training_started",
            dataset_id=request.dataset_id,
            algorithm=algorithm,
            user_id=self.user_id,
        )

        df, dataset = self._load_dataset_df(request.dataset_id)
        self.validator.validate_minimum_rows(df)
        self.validator.validate_date_column(df, request.date_column)

        model_type = MLModelType.FORECASTING
        algorithm_enum = MLAlgorithm.PROPHET if algorithm == "prophet" else MLAlgorithm.ARIMA

        ml_model = MLModel(
            user_id=self.user_id,
            dataset_id=request.dataset_id,
            name=request.model_name,
            model_type=model_type,
            algorithm=algorithm_enum,
            status=MLModelStatus.TRAINING,
            hyperparameters=request.hyperparameters,
            target_column=request.value_column,
        )
        self.session.add(ml_model)
        self.session.flush()

        run = MLModelRun(
            model_id=str(ml_model.id),
            run_number=1,
            status=MLModelStatus.TRAINING,
            started_at=pd.Timestamp.utcnow().to_pydatetime(),
        )
        self.session.add(run)
        self.session.flush()

        start_time = time.time()

        try:
            if algorithm == "prophet":
                result = self.forecasting_svc.train_prophet(
                    df, request.date_column, request.value_column,
                    request.horizon, request.hyperparameters
                )
            else:
                result = self.forecasting_svc.train_arima(
                    df, request.date_column, request.value_column,
                    request.horizon, request.hyperparameters
                )

            duration = time.time() - start_time

            # Persist model
            payload = {
                "model": result["model"],
                "feature_columns": [request.value_column],
                "date_column": request.date_column,
                "value_column": request.value_column,
                "algorithm": algorithm,
            }
            path = self.persistence.save(str(ml_model.id), payload)

            # Store forecast result
            forecast_record = MLForecast(
                model_id=str(ml_model.id),
                user_id=self.user_id,
                date_column=request.date_column,
                value_column=request.value_column,
                horizon=request.horizon,
                forecast_data=result.get("forecast_data"),
                trend_data=result.get("trend_data"),
                seasonality_data=result.get("seasonality_data"),
                metrics=result.get("metrics"),
            )
            self.session.add(forecast_record)

            ml_model.status = MLModelStatus.TRAINED
            ml_model.model_path = path
            ml_model.training_duration = duration
            ml_model.evaluation_summary = result.get("metrics")

            run.status = MLModelStatus.TRAINED
            run.metrics = result.get("metrics")
            run.training_duration = duration
            run.completed_at = pd.Timestamp.utcnow().to_pydatetime()

            self.session.commit()

            logger.info(
                "forecast_training_completed",
                model_id=str(ml_model.id),
                algorithm=algorithm,
                duration=duration,
            )

            self.session.refresh(ml_model)
            return MLModelResponse.model_validate(ml_model)

        except HTTPException:
            raise
        except Exception as e:
            self.session.rollback()
            ml_model.status = MLModelStatus.FAILED
            ml_model.error_message = str(e)
            run.status = MLModelStatus.FAILED
            run.error_message = str(e)
            self.session.commit()

            logger.error(
                "forecast_training_failed",
                model_id=str(ml_model.id),
                algorithm=algorithm,
                error=str(e),
                exc_info=True,
            )
            raise HTTPException(
                status_code=500, detail=f"Forecast training failed: {str(e)}"
            )

    # ------------------------------------------------------------------
    # Retrain existing model
    # ------------------------------------------------------------------

    def retrain(
        self,
        model_id: str,
        hyperparameters: Optional[Dict[str, Any]] = None,
        test_size: float = 0.2,
        random_state: int = 42,
    ) -> MLModelResponse:
        """Retrain an existing model with optional new hyperparameters."""
        ml_model = self.session.query(MLModel).filter(
            MLModel.id == model_id, MLModel.user_id == self.user_id
        ).first()
        if not ml_model:
            raise HTTPException(status_code=404, detail="Model not found")

        # Count existing runs
        run_count = self.session.query(MLModelRun).filter(
            MLModelRun.model_id == model_id
        ).count()

        # Build a TrainRequest from existing model config
        train_req = TrainRequest(
            dataset_id=str(ml_model.dataset_id),
            model_name=str(ml_model.name),
            algorithm=ml_model.algorithm.value,
            target_column=str(ml_model.target_column) if ml_model.target_column else None,
            feature_columns=list(ml_model.feature_columns) if ml_model.feature_columns else None,
            test_size=test_size,
            random_state=random_state,
            hyperparameters=hyperparameters or (ml_model.hyperparameters or {}),
        )

        df, dataset = self._load_dataset_df(str(ml_model.dataset_id))
        self.validator.validate_minimum_rows(df)

        # Create a new run record
        run = MLModelRun(
            model_id=model_id,
            run_number=run_count + 1,
            status=MLModelStatus.TRAINING,
            hyperparameters=train_req.hyperparameters,
            started_at=pd.Timestamp.utcnow().to_pydatetime(),
        )
        self.session.add(run)
        self.session.flush()

        start_time = time.time()

        try:
            model_type = ml_model.model_type
            algorithm = ml_model.algorithm.value

            if model_type == MLModelType.REGRESSION:
                result = self._train_regression(df, train_req, model_id, algorithm)
            elif model_type == MLModelType.CLASSIFICATION:
                result = self._train_classification(df, train_req, model_id, algorithm)
            elif model_type == MLModelType.CLUSTERING:
                result = self._train_clustering(df, train_req, model_id, algorithm)
            else:
                raise HTTPException(
                    status_code=400, detail="Retrain not supported for forecasting models via this endpoint."
                )

            duration = time.time() - start_time

            ml_model.status = MLModelStatus.TRAINED
            ml_model.model_path = result.get("model_path")
            ml_model.training_duration = duration
            ml_model.evaluation_summary = result.get("metrics")
            ml_model.feature_importances = result.get("feature_importances")
            ml_model.model_version = f"1.{run_count}"

            run.status = MLModelStatus.TRAINED
            run.metrics = result.get("metrics")
            run.training_duration = duration
            run.completed_at = pd.Timestamp.utcnow().to_pydatetime()

            eval_result = MLEvaluationResult(
                model_id=model_id,
                run_id=str(run.id),
                metrics=result.get("metrics"),
                confusion_matrix=result.get("confusion_matrix"),
                classification_report=result.get("classification_report"),
                roc_curve_data=result.get("roc_curve_data"),
                residuals_data=result.get("residuals_data"),
                actual_vs_predicted=result.get("actual_vs_predicted"),
                cluster_stats=result.get("cluster_stats"),
                cluster_assignments=result.get("cluster_assignments"),
            )
            self.session.add(eval_result)
            self.session.commit()

            logger.info(
                "retraining_completed",
                model_id=model_id,
                run_number=run.run_number,
                duration=duration,
            )

            self.session.refresh(ml_model)
            return MLModelResponse.model_validate(ml_model)

        except HTTPException:
            raise
        except Exception as e:
            self.session.rollback()
            run.status = MLModelStatus.FAILED
            run.error_message = str(e)
            self.session.commit()
            logger.error("retraining_failed", model_id=model_id, error=str(e), exc_info=True)
            raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")
