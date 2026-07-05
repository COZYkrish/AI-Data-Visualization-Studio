"""
Dashboard Pydantic schemas — Phase 5: Dashboard & Visualization Engine
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


# ─── KPI ──────────────────────────────────────────────────────────────────────

class KPICard(BaseModel):
    key: str
    label: str
    value: Any
    unit: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    meta: Optional[str] = None


# ─── Statistics ───────────────────────────────────────────────────────────────

class DatasetStatisticsResponse(BaseModel):
    dataset_id: str
    row_count: int
    column_count: int
    columns: List[str]
    data_types: Dict[str, str]
    global_stats: Optional[Dict[str, Any]] = None
    column_stats: Optional[Dict[str, Any]] = None


# ─── Chart Recommendation ─────────────────────────────────────────────────────

class ChartRecommendation(BaseModel):
    chart_type: str
    title: str
    x: Optional[str] = None
    y: Optional[str] = None
    reason: str
    priority: int
    config: Optional[Dict[str, Any]] = None


# ─── Chart Data Request ───────────────────────────────────────────────────────

class ChartDataRequest(BaseModel):
    dataset_id: str
    chart_type: str
    x: Optional[str] = None
    y: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


# ─── Filter Request ───────────────────────────────────────────────────────────

class FilterCondition(BaseModel):
    column: str
    operator: str  # equals, not_equals, contains, greater_than, less_than, between, in, is_null, is_not_null
    value: Optional[Any] = None


class DashboardQueryRequest(BaseModel):
    dataset_id: str
    filters: List[FilterCondition] = Field(default_factory=list)
    sort_by: Optional[str] = None
    sort_order: str = "asc"
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=200)
    search: Optional[str] = None


class DashboardQueryResponse(BaseModel):
    dataset_id: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    total_rows: int
    page: int
    page_size: int
    total_pages: int
    applied_filters: int
    query_time_ms: float


# ─── Dashboard Overview ───────────────────────────────────────────────────────

class RecentDatasetItem(BaseModel):
    id: str
    name: str
    status: str
    rows: Optional[int] = None
    columns: Optional[int] = None
    created_at: str


class DashboardOverviewResponse(BaseModel):
    total_datasets: int
    ready_datasets: int
    total_rows_processed: int
    total_storage_bytes: int
    recent_datasets: List[RecentDatasetItem]
