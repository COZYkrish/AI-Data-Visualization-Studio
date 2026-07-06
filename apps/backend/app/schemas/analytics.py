from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Common Sub-Schemas
class Insight(BaseModel):
    id: str
    title: str
    description: str
    severity: str # "Info", "Warning", "Critical"
    confidence: str # "High", "Medium", "Low"
    category: str # "Correlation", "Distribution", "Trend", "Outlier", "Data Quality"
    affected_columns: List[str] = []
    recommendation: Optional[str] = None

class FeatureImportanceItem(BaseModel):
    column: str
    overall_importance_score: float
    variance_score: float
    correlation_score: float
    missing_value_penalty: float
    cardinality_score: float
    information_density: float

# Main Analytics Payload Schemas
class CorrelationResult(BaseModel):
    pearson_matrix: Dict[str, Dict[str, float]]
    spearman_matrix: Dict[str, Dict[str, float]]
    covariance_matrix: Dict[str, Dict[str, float]]
    strong_correlations: List[Dict[str, Any]] # e.g. [{"col1": "A", "col2": "B", "score": 0.95, "type": "Pearson"}]

class DistributionResult(BaseModel):
    columns: Dict[str, Dict[str, Any]] # e.g. "Age": {"mean": 30, "median": 29, "classification": "Normal", ...}

class TrendResult(BaseModel):
    increasing_trends: List[Dict[str, Any]]
    decreasing_trends: List[Dict[str, Any]]
    rolling_averages: Dict[str, Dict[str, Any]]
    seasonality_indicators: Optional[Dict[str, Any]] = None

class OutlierResult(BaseModel):
    outlier_count: int
    outlier_percentage: float
    affected_columns: List[str]
    extreme_values: Dict[str, List[Dict[str, Any]]] # column -> list of extreme values/details
    data_quality_warnings: List[str]

class FeatureImportanceResult(BaseModel):
    ranked_features: List[FeatureImportanceItem]

class ExecutiveSummary(BaseModel):
    dataset_quality_score: int # 0-100
    readiness_score: int # 0-100
    completeness: float # percentage
    strongest_findings: List[Insight]
    weakest_areas: List[Insight]
    potential_risks: List[Insight]
    executive_summary_text: str

# Response Schema for API
class AnalyticsResultResponse(BaseModel):
    id: str
    dataset_id: str
    analysis_version: Optional[str] = None
    
    correlation_data: Optional[CorrelationResult] = None
    distribution_data: Optional[DistributionResult] = None
    trend_data: Optional[TrendResult] = None
    outlier_data: Optional[OutlierResult] = None
    feature_importance: Optional[FeatureImportanceResult] = None
    insights: Optional[List[Insight]] = None
    executive_summary: Optional[ExecutiveSummary] = None
    
    processing_duration: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
