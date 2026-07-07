"""
Machine Learning Pydantic Schemas — Phase 7

Provides request/response schemas for:
  - Training requests (regression, classification, clustering, forecasting)
  - Evaluation results
  - Predictions
  - Forecasts
  - Model management
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

# ---------------------------------------------------------------------------
# Enums (mirrors SQLAlchemy enums)
# ---------------------------------------------------------------------------


class MLModelTypeEnum(str):
    REGRESSION = "regression"
    CLASSIFICATION = "classification"
    CLUSTERING = "clustering"
    FORECASTING = "forecasting"


# ---------------------------------------------------------------------------
# Hyper-parameter schemas (typed, optional — sensible defaults applied
#  in services)
# ---------------------------------------------------------------------------


class LinearRegressionParams(BaseModel):
    fit_intercept: bool = True


class RandomForestRegressorParams(BaseModel):
    n_estimators: int = Field(100, ge=10, le=1000)
    max_depth: Optional[int] = Field(None)
    min_samples_split: int = Field(2, ge=2)
    random_state: int = 42


class LogisticRegressionParams(BaseModel):
    max_iter: int = Field(1000, ge=100, le=10000)
    C: float = Field(1.0, gt=0)
    solver: str = "lbfgs"
    random_state: int = 42


class DecisionTreeClassifierParams(BaseModel):
    max_depth: Optional[int] = None
    min_samples_split: int = Field(2, ge=2)
    criterion: str = "gini"
    random_state: int = 42


class RandomForestClassifierParams(BaseModel):
    n_estimators: int = Field(100, ge=10, le=1000)
    max_depth: Optional[int] = None
    criterion: str = "gini"
    random_state: int = 42


class KMeansParams(BaseModel):
    n_clusters: int = Field(3, ge=2, le=20)
    max_iter: int = Field(300, ge=50)
    random_state: int = 42


class DBSCANParams(BaseModel):
    eps: float = Field(0.5, gt=0)
    min_samples: int = Field(5, ge=1)


class ProphetParams(BaseModel):
    yearly_seasonality: bool = True
    weekly_seasonality: bool = True
    daily_seasonality: bool = False
    seasonality_mode: str = "additive"
    changepoint_prior_scale: float = Field(0.05, gt=0)


class ARIMAParams(BaseModel):
    p: int = Field(1, ge=0, le=10)
    d: int = Field(1, ge=0, le=3)
    q: int = Field(1, ge=0, le=10)


# ---------------------------------------------------------------------------
# Training request schemas
# ---------------------------------------------------------------------------


class TrainRequest(BaseModel):
    """Generic training request body."""

    dataset_id: str
    model_name: str
    algorithm: str  # MLAlgorithm enum value
    target_column: Optional[str] = None
    feature_columns: Optional[List[str]] = None
    test_size: float = Field(0.2, gt=0.05, lt=0.5)
    random_state: int = 42
    hyperparameters: Optional[Dict[str, Any]] = None


class ForecastRequest(BaseModel):
    """Request body for forecasting endpoint."""

    dataset_id: str
    model_name: str
    algorithm: str  # "prophet" | "arima"
    date_column: str
    value_column: str
    horizon: int = Field(30, ge=1, le=365)
    hyperparameters: Optional[Dict[str, Any]] = None


class PredictRequest(BaseModel):
    """Single or batch prediction request."""

    model_id: str
    input_data: Dict[str, Any]  # {column_name: value} for single; list for batch


class RetrainRequest(BaseModel):
    """Retrain an existing model, optionally with updated params."""

    hyperparameters: Optional[Dict[str, Any]] = None
    test_size: float = Field(0.2, gt=0.05, lt=0.5)
    random_state: int = 42


# ---------------------------------------------------------------------------
# Evaluation result sub-schemas
# ---------------------------------------------------------------------------


class RegressionMetrics(BaseModel):
    mae: float
    mse: float
    rmse: float
    r2: float
    mape: Optional[float] = None


class ClassificationMetrics(BaseModel):
    accuracy: float
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1: Optional[float] = None
    roc_auc: Optional[float] = None


class ClusteringMetrics(BaseModel):
    silhouette_score: Optional[float] = None
    davies_bouldin_index: Optional[float] = None
    inertia: Optional[float] = None
    n_clusters: int
    cluster_distribution: Dict[str, int]


class ForecastMetrics(BaseModel):
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mape: Optional[float] = None


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class ModelRunResponse(BaseModel):
    id: str
    model_id: str
    run_number: int
    status: str
    metrics: Optional[Dict[str, Any]] = None
    training_duration: Optional[float] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvaluationResultResponse(BaseModel):
    id: str
    model_id: str
    metrics: Optional[Dict[str, Any]] = None
    confusion_matrix: Optional[List[Any]] = None
    classification_report: Optional[Dict[str, Any]] = None
    roc_curve_data: Optional[Dict[str, Any]] = None
    residuals_data: Optional[List[Any]] = None
    actual_vs_predicted: Optional[List[Any]] = None
    cluster_stats: Optional[Dict[str, Any]] = None
    cluster_assignments: Optional[List[Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PredictionResponse(BaseModel):
    id: str
    model_id: str
    prediction_type: str
    input_data: Optional[Dict[str, Any]] = None
    predicted_value: Optional[Dict[str, Any]] = None
    prediction_confidence: Optional[float] = None
    feature_contributions: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ForecastResponse(BaseModel):
    id: str
    model_id: str
    date_column: str
    value_column: str
    horizon: int
    forecast_data: Optional[List[Any]] = None
    trend_data: Optional[List[Any]] = None
    seasonality_data: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MLModelResponse(BaseModel):
    id: str
    user_id: str
    dataset_id: str
    name: str
    description: Optional[str] = None
    model_type: str
    algorithm: str
    status: str
    model_version: str
    hyperparameters: Optional[Dict[str, Any]] = None
    feature_columns: Optional[List[str]] = None
    target_column: Optional[str] = None
    test_size: float
    random_state: int
    evaluation_summary: Optional[Dict[str, Any]] = None
    feature_importances: Optional[Dict[str, Any]] = None
    training_duration: Optional[float] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MLModelDetailResponse(MLModelResponse):
    runs: List[ModelRunResponse] = []
    evaluation_results: List[EvaluationResultResponse] = []


class ModelRecommendation(BaseModel):
    algorithm: str
    model_type: str
    reason: str
    confidence: str  # "High" | "Medium" | "Low"
    suitable_for: List[str]


class ModelRecommendationResponse(BaseModel):
    dataset_id: str
    recommendations: List[ModelRecommendation]
    dataset_summary: Dict[str, Any]
