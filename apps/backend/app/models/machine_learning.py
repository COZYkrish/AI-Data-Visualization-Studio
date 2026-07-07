"""
Machine Learning SQLAlchemy Models — Phase 7

Tables:
    ml_models          — Saved trained models with metadata
    ml_model_runs      — Individual training run records per model
    ml_predictions     — Individual / batch prediction records
    ml_forecasts       — Time-series forecast records
    ml_evaluation_results — Detailed evaluation metric snapshots
"""

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    String,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    Enum,
    JSON,
    Text,
    Boolean,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.database.session import Base
from app.models.project import generate_uuid


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------


class MLModelType(str, enum.Enum):
    REGRESSION = "regression"
    CLASSIFICATION = "classification"
    CLUSTERING = "clustering"
    FORECASTING = "forecasting"


class MLAlgorithm(str, enum.Enum):
    # Regression
    LINEAR_REGRESSION = "linear_regression"
    RANDOM_FOREST_REGRESSOR = "random_forest_regressor"
    # Classification
    LOGISTIC_REGRESSION = "logistic_regression"
    DECISION_TREE_CLASSIFIER = "decision_tree_classifier"
    RANDOM_FOREST_CLASSIFIER = "random_forest_classifier"
    # Clustering
    KMEANS = "kmeans"
    DBSCAN = "dbscan"
    # Forecasting
    PROPHET = "prophet"
    ARIMA = "arima"


class MLModelStatus(str, enum.Enum):
    TRAINING = "training"
    TRAINED = "trained"
    FAILED = "failed"
    ARCHIVED = "archived"


class PredictionType(str, enum.Enum):
    SINGLE = "single"
    BATCH = "batch"


# ---------------------------------------------------------------------------
# MLModel — persisted trained model
# ---------------------------------------------------------------------------


class MLModel(Base):
    """
    Represents a fully-trained ML model.

    Stores serialised model path, configuration, evaluation summary,
    feature list, target column and training provenance.
    """

    __tablename__ = "ml_models"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    dataset_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("datasets.id", ondelete="CASCADE"), index=True
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    model_type: Mapped[MLModelType] = mapped_column(
        Enum(MLModelType), nullable=False, index=True
    )
    algorithm: Mapped[MLAlgorithm] = mapped_column(
        Enum(MLAlgorithm), nullable=False
    )
    status: Mapped[MLModelStatus] = mapped_column(
        Enum(MLModelStatus), default=MLModelStatus.TRAINING
    )

    # Serialised model storage (relative path inside uploads/models/)
    model_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    model_version: Mapped[str] = mapped_column(String(50), default="1.0.0")

    # Training configuration supplied by the user (JSON)
    hyperparameters: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    feature_columns: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    target_column: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Dataset split settings
    test_size: Mapped[float] = mapped_column(Float, default=0.2)
    random_state: Mapped[int] = mapped_column(Integer, default=42)

    # High-level evaluation snapshot (detailed metrics in EvaluationResult)
    evaluation_summary: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Feature importances (where applicable)
    feature_importances: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Training provenance
    training_duration: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    dataset_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user = relationship("User")
    dataset = relationship("Dataset")
    runs = relationship(
        "MLModelRun", back_populates="model", cascade="all, delete-orphan"
    )
    predictions = relationship(
        "MLPrediction", back_populates="model", cascade="all, delete-orphan"
    )
    forecasts = relationship(
        "MLForecast", back_populates="model", cascade="all, delete-orphan"
    )
    evaluation_results = relationship(
        "MLEvaluationResult", back_populates="model", cascade="all, delete-orphan"
    )


# ---------------------------------------------------------------------------
# MLModelRun — individual training attempt
# ---------------------------------------------------------------------------


class MLModelRun(Base):
    """
    Records each training run for a model.
    Supports retraining history and version tracking.
    """

    __tablename__ = "ml_model_runs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("ml_models.id", ondelete="CASCADE"), index=True
    )

    run_number: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[MLModelStatus] = mapped_column(
        Enum(MLModelStatus), default=MLModelStatus.TRAINING
    )

    hyperparameters: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    feature_importances: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    training_duration: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    model = relationship("MLModel", back_populates="runs")


# ---------------------------------------------------------------------------
# MLPrediction — stored prediction records
# ---------------------------------------------------------------------------


class MLPrediction(Base):
    """
    Stores individual and batch prediction requests and their results.
    """

    __tablename__ = "ml_predictions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("ml_models.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    prediction_type: Mapped[PredictionType] = mapped_column(
        Enum(PredictionType), default=PredictionType.SINGLE
    )

    # Input features sent by the user (JSON)
    input_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Model output
    predicted_value: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    prediction_confidence: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )
    feature_contributions: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    model = relationship("MLModel", back_populates="predictions")
    user = relationship("User")


# ---------------------------------------------------------------------------
# MLForecast — time-series forecast records
# ---------------------------------------------------------------------------


class MLForecast(Base):
    """
    Stores the output of a forecasting run (Prophet / ARIMA).
    Includes forecast values, confidence intervals, and decomposition.
    """

    __tablename__ = "ml_forecasts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("ml_models.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    date_column: Mapped[str] = mapped_column(String(255), nullable=False)
    value_column: Mapped[str] = mapped_column(String(255), nullable=False)
    horizon: Mapped[int] = mapped_column(Integer, nullable=False)  # forecast periods

    # Forecast payload (list of {ds, yhat, yhat_lower, yhat_upper})
    forecast_data: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    # Trend / seasonality decomposition
    trend_data: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    seasonality_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Evaluation metrics on holdout set (if applicable)
    metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    model = relationship("MLModel", back_populates="forecasts")
    user = relationship("User")


# ---------------------------------------------------------------------------
# MLEvaluationResult — detailed evaluation snapshot per run
# ---------------------------------------------------------------------------


class MLEvaluationResult(Base):
    """
    Captures a full evaluation snapshot for a model run:
    metrics, confusion matrix, ROC data, residuals, cluster stats, etc.
    """

    __tablename__ = "ml_evaluation_results"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("ml_models.id", ondelete="CASCADE"), index=True
    )
    run_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("ml_model_runs.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Scalar metrics (MAE, RMSE, R², Accuracy, F1, Silhouette, …)
    metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Classification-specific
    confusion_matrix: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    classification_report: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    roc_curve_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Regression-specific
    residuals_data: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    actual_vs_predicted: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    # Clustering-specific
    cluster_stats: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    cluster_assignments: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    model = relationship("MLModel", back_populates="evaluation_results")
    run = relationship("MLModelRun")
