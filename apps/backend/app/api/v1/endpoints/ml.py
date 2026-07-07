"""
Machine Learning API Endpoints — Phase 7

REST API for the ML workspace:

  GET    /api/v1/ml/recommend/{dataset_id}  — model recommendations
  GET    /api/v1/ml/models                  — list user's saved models
  GET    /api/v1/ml/models/{id}             — model details
  POST   /api/v1/ml/train                   — train a model
  POST   /api/v1/ml/forecast                — train a forecasting model
  POST   /api/v1/ml/predict                 — run prediction
  GET    /api/v1/ml/evaluation/{id}         — evaluation result for a model
  GET    /api/v1/ml/history                 — all training runs for user
  POST   /api/v1/ml/models/{id}/retrain     — retrain a model
  DELETE /api/v1/ml/models/{id}             — delete a model
  GET    /api/v1/ml/models/{id}/forecast    — get forecast data for a model
"""

import os
from typing import Any, Dict, List

import structlog
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.database.session import get_db
from app.models.machine_learning import (
    MLEvaluationResult,
    MLForecast,
    MLModel,
    MLModelRun,
    MLModelStatus,
)
from app.schemas.machine_learning import (
    EvaluationResultResponse,
    ForecastRequest,
    ForecastResponse,
    MLModelDetailResponse,
    MLModelResponse,
    ModelRecommendationResponse,
    ModelRunResponse,
    PredictRequest,
    PredictionResponse,
    RetrainRequest,
    TrainRequest,
)
from app.schemas.response import APIResponse
from app.services.machine_learning.model_recommendation_service import ModelRecommendationService
from app.services.machine_learning.model_training_service import ModelTrainingService
from app.services.machine_learning.prediction_service import PredictionService
from app.services.file_processing.parser import parse_file
from app.services.file_processing.cleaner import clean_dataset
from app.models.dataset import Dataset

router = APIRouter()
logger = structlog.get_logger(__name__)

UPLOAD_DIR = "uploads"


# ---------------------------------------------------------------------------
# Helper: load dataset df
# ---------------------------------------------------------------------------

def _load_df(dataset_id: str, db: Session):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    filepath = os.path.join(UPLOAD_DIR, str(dataset.stored_filename))
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Dataset file missing from storage")
    df = parse_file(filepath, str(dataset.file_type), str(dataset.original_filename))
    df, _ = clean_dataset(df)
    return df


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

@router.get("/recommend/{dataset_id}", response_model=APIResponse[ModelRecommendationResponse])
def get_recommendations(
    dataset_id: str,
    target_column: str = None,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Deterministic model recommendations for a given dataset."""
    df = _load_df(dataset_id, db)
    svc = ModelRecommendationService()
    result = svc.recommend(df, target_column)
    response = ModelRecommendationResponse(
        dataset_id=dataset_id,
        recommendations=result["recommendations"],
        dataset_summary=result["dataset_summary"],
    )
    return APIResponse[ModelRecommendationResponse](
        success=True,
        message="Model recommendations generated",
        data=response,
    )


# ---------------------------------------------------------------------------
# Model Management
# ---------------------------------------------------------------------------

@router.get("/models", response_model=APIResponse[List[MLModelResponse]])
def list_models(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List all ML models saved by the current user."""
    models = (
        db.query(MLModel)
        .filter(MLModel.user_id == current_user.id)
        .order_by(MLModel.created_at.desc())
        .all()
    )
    return APIResponse[List[MLModelResponse]](
        success=True,
        message=f"{len(models)} model(s) found",
        data=[MLModelResponse.model_validate(m) for m in models],
    )


@router.get("/models/{model_id}", response_model=APIResponse[MLModelDetailResponse])
def get_model(
    model_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Retrieve full details for a model including runs and evaluation."""
    model = db.query(MLModel).filter(
        MLModel.id == model_id, MLModel.user_id == current_user.id
    ).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    runs = db.query(MLModelRun).filter(MLModelRun.model_id == model_id).all()
    eval_results = db.query(MLEvaluationResult).filter(
        MLEvaluationResult.model_id == model_id
    ).all()

    data = MLModelDetailResponse.model_validate(model)
    data.runs = [ModelRunResponse.model_validate(r) for r in runs]
    data.evaluation_results = [EvaluationResultResponse.model_validate(e) for e in eval_results]

    return APIResponse[MLModelDetailResponse](
        success=True,
        message="Model details retrieved",
        data=data,
    )


@router.delete("/models/{model_id}", response_model=APIResponse[None])
def delete_model(
    model_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Delete a model and its serialised file."""
    from app.services.machine_learning.model_persistence_service import ModelPersistenceService

    model = db.query(MLModel).filter(
        MLModel.id == model_id, MLModel.user_id == current_user.id
    ).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    ModelPersistenceService().delete(model_id)
    db.delete(model)
    db.commit()

    logger.info("model_deleted", model_id=model_id, user_id=current_user.id)
    return APIResponse[None](success=True, message="Model deleted successfully")


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

@router.post("/train", response_model=APIResponse[MLModelResponse])
def train_model(
    request: TrainRequest,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Train a machine learning model.
    Dispatches to regression, classification, or clustering pipeline.
    Use /forecast for time-series forecasting models.
    """
    svc = ModelTrainingService(db, str(current_user.id))
    result = svc.train(request)
    return APIResponse[MLModelResponse](
        success=True,
        message=f"Model '{request.model_name}' trained successfully",
        data=result,
    )


@router.post("/forecast", response_model=APIResponse[MLModelResponse])
def train_forecast(
    request: ForecastRequest,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Train a time-series forecasting model (Prophet or ARIMA)."""
    svc = ModelTrainingService(db, str(current_user.id))
    result = svc.train_forecast(request)
    return APIResponse[MLModelResponse](
        success=True,
        message=f"Forecast model '{request.model_name}' trained successfully",
        data=result,
    )


@router.post("/models/{model_id}/retrain", response_model=APIResponse[MLModelResponse])
def retrain_model(
    model_id: str,
    request: RetrainRequest,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Retrain an existing model, optionally with updated hyperparameters."""
    svc = ModelTrainingService(db, str(current_user.id))
    result = svc.retrain(
        model_id,
        hyperparameters=request.hyperparameters,
        test_size=request.test_size,
        random_state=request.random_state,
    )
    return APIResponse[MLModelResponse](
        success=True,
        message="Model retrained successfully",
        data=result,
    )


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------

@router.post("/predict", response_model=APIResponse[Dict[str, Any]])
def predict(
    request: PredictRequest,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Run a single prediction against a saved model."""
    # Verify model ownership
    model = db.query(MLModel).filter(
        MLModel.id == request.model_id, MLModel.user_id == current_user.id
    ).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    if model.status != MLModelStatus.TRAINED:
        raise HTTPException(status_code=400, detail="Model is not in TRAINED state")

    svc = PredictionService()
    result = svc.predict_single(request.model_id, request.input_data)

    # Persist prediction record
    from app.models.machine_learning import MLPrediction, PredictionType
    pred_record = MLPrediction(
        model_id=request.model_id,
        user_id=str(current_user.id),
        prediction_type=PredictionType.SINGLE,
        input_data=request.input_data,
        predicted_value=result.get("predicted_value"),
        prediction_confidence=result.get("prediction_confidence"),
        feature_contributions=result.get("feature_contributions"),
    )
    db.add(pred_record)
    db.commit()

    return APIResponse[Dict[str, Any]](
        success=True,
        message="Prediction generated",
        data=result,
    )


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------

@router.get("/evaluation/{model_id}", response_model=APIResponse[List[EvaluationResultResponse]])
def get_evaluation(
    model_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Retrieve all evaluation results for a model."""
    model = db.query(MLModel).filter(
        MLModel.id == model_id, MLModel.user_id == current_user.id
    ).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    results = db.query(MLEvaluationResult).filter(
        MLEvaluationResult.model_id == model_id
    ).order_by(MLEvaluationResult.created_at.desc()).all()

    return APIResponse[List[EvaluationResultResponse]](
        success=True,
        message=f"{len(results)} evaluation result(s) found",
        data=[EvaluationResultResponse.model_validate(r) for r in results],
    )


# ---------------------------------------------------------------------------
# Training history
# ---------------------------------------------------------------------------

@router.get("/history", response_model=APIResponse[List[MLModelResponse]])
def get_history(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get all ML models created by the current user (training history)."""
    models = (
        db.query(MLModel)
        .filter(MLModel.user_id == current_user.id)
        .order_by(MLModel.created_at.desc())
        .limit(50)
        .all()
    )
    return APIResponse[List[MLModelResponse]](
        success=True,
        message="Training history retrieved",
        data=[MLModelResponse.model_validate(m) for m in models],
    )


# ---------------------------------------------------------------------------
# Forecast retrieval
# ---------------------------------------------------------------------------

@router.get("/models/{model_id}/forecast", response_model=APIResponse[ForecastResponse])
def get_forecast(
    model_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Retrieve the most recent forecast output for a forecasting model."""
    model = db.query(MLModel).filter(
        MLModel.id == model_id, MLModel.user_id == current_user.id
    ).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    forecast = (
        db.query(MLForecast)
        .filter(MLForecast.model_id == model_id)
        .order_by(MLForecast.created_at.desc())
        .first()
    )
    if not forecast:
        raise HTTPException(status_code=404, detail="No forecast data found for this model")

    return APIResponse[ForecastResponse](
        success=True,
        message="Forecast data retrieved",
        data=ForecastResponse.model_validate(forecast),
    )
