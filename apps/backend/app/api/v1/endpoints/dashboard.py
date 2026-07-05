"""
Dashboard API Endpoints — Phase 5: Dashboard & Visualization Engine

Provides REST endpoints for dashboard overview, KPIs, chart data,
chart recommendations, statistics, filtered queries, and chart export.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Any, Optional, Dict

from app.database.session import get_db
from app.schemas.response import APIResponse
from app.schemas.dashboard import (
    KPICard,
    DatasetStatisticsResponse,
    ChartRecommendation,
    ChartDataRequest,
    DashboardQueryRequest,
    DashboardQueryResponse,
    DashboardOverviewResponse,
    RecentDatasetItem,
)
from app.services.dashboard_service import DashboardService
from app.core.dependencies import get_current_active_user
import structlog

logger = structlog.get_logger(__name__)

router = APIRouter()


# ─── Dashboard Overview ───────────────────────────────────────────────────────

@router.get("", response_model=APIResponse[DashboardOverviewResponse])
def get_dashboard_overview(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Returns high-level metrics for the dashboard home page."""
    service = DashboardService(db)
    overview = service.get_dashboard_overview(current_user.id)
    return APIResponse[DashboardOverviewResponse](
        success=True,
        message="Dashboard overview retrieved",
        data=DashboardOverviewResponse(
            total_datasets=overview["total_datasets"],
            ready_datasets=overview["ready_datasets"],
            total_rows_processed=overview["total_rows_processed"],
            total_storage_bytes=overview["total_storage_bytes"],
            recent_datasets=[RecentDatasetItem(**d) for d in overview["recent_datasets"]],
        ),
    )


# ─── KPIs ─────────────────────────────────────────────────────────────────────

@router.get("/kpis", response_model=APIResponse[List[KPICard]])
def get_kpis(
    dataset_id: str = Query(..., description="The dataset to compute KPIs for"),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Automatically generates KPI cards for the selected dataset."""
    service = DashboardService(db)
    kpis = service.get_kpis(dataset_id, current_user.id)
    return APIResponse[List[KPICard]](
        success=True,
        message="KPIs generated",
        data=[KPICard(**k) for k in kpis],
    )


# ─── Statistics ───────────────────────────────────────────────────────────────

@router.get("/datasets/{dataset_id}/statistics", response_model=APIResponse[DatasetStatisticsResponse])
def get_dataset_statistics(
    dataset_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Returns comprehensive column-level statistics for a dataset."""
    service = DashboardService(db)
    stats = service.get_statistics(dataset_id, current_user.id)
    return APIResponse[DatasetStatisticsResponse](
        success=True,
        message="Dataset statistics retrieved",
        data=DatasetStatisticsResponse(**stats),
    )


# ─── Chart Recommendations ────────────────────────────────────────────────────

@router.get("/recommendations", response_model=APIResponse[List[ChartRecommendation]])
def get_chart_recommendations(
    dataset_id: str = Query(..., description="The dataset to generate recommendations for"),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Returns deterministic chart recommendations based on dataset column types."""
    service = DashboardService(db)
    recs = service.get_recommendations(dataset_id, current_user.id)
    return APIResponse[List[ChartRecommendation]](
        success=True,
        message="Chart recommendations generated",
        data=[ChartRecommendation(**r) for r in recs],
    )


# ─── Chart Data ───────────────────────────────────────────────────────────────

@router.post("/charts", response_model=APIResponse[Dict[str, Any]])
def get_chart_data(
    body: ChartDataRequest,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Generates chart-ready data for a given chart type and column mapping."""
    service = DashboardService(db)
    data = service.get_chart_data(
        dataset_id=body.dataset_id,
        user_id=current_user.id,
        chart_type=body.chart_type,
        x=body.x,
        y=body.y,
        config=body.config,
    )
    return APIResponse[Dict[str, Any]](
        success=True,
        message="Chart data generated",
        data=data,
    )


# ─── Filtered Query ───────────────────────────────────────────────────────────

@router.post("/query", response_model=APIResponse[DashboardQueryResponse])
def run_dashboard_query(
    body: DashboardQueryRequest,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Applies filters, sorting, and pagination to a dataset and
    returns the paginated result set.
    """
    service = DashboardService(db)
    result = service.run_filtered_query(
        dataset_id=body.dataset_id,
        user_id=current_user.id,
        filters=[f.model_dump() for f in body.filters],
        sort_by=body.sort_by,
        sort_order=body.sort_order,
        page=body.page,
        page_size=body.page_size,
        search=body.search,
    )
    return APIResponse[DashboardQueryResponse](
        success=True,
        message="Query executed successfully",
        data=DashboardQueryResponse(**result),
    )


# ─── Chart Export (client-side preferred, server-side stub) ───────────────────

@router.post("/export-chart", response_model=APIResponse[Dict[str, Any]])
def export_chart(
    body: ChartDataRequest,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Returns the chart data payload optimized for client-side export.
    The frontend handles the actual PNG/SVG rendering via Recharts.
    """
    service = DashboardService(db)
    data = service.get_chart_data(
        dataset_id=body.dataset_id,
        user_id=current_user.id,
        chart_type=body.chart_type,
        x=body.x,
        y=body.y,
        config=body.config,
    )
    logger.info(
        "chart_export_requested",
        dataset_id=body.dataset_id,
        user_id=current_user.id,
        chart_type=body.chart_type,
    )
    return APIResponse[Dict[str, Any]](
        success=True,
        message="Chart data ready for export",
        data=data,
    )
