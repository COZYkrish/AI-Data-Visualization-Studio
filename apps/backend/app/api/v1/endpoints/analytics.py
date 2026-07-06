from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsResultResponse,
    CorrelationResult,
    DistributionResult,
    TrendResult,
    OutlierResult,
    Insight,
    ExecutiveSummary
)
from app.services.analytics.orchestrator import AnalyticsService

router = APIRouter()

def get_analytics_service(db: Session = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(session=db)

@router.get("/{dataset_id}", response_model=AnalyticsResultResponse)
def get_analytics(
    dataset_id: str = Path(..., title="The ID of the dataset to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get the full analytics payload for a dataset."""
    return service.get_analytics(dataset_id=dataset_id, force_refresh=False)

@router.post("/{dataset_id}/refresh", response_model=AnalyticsResultResponse)
def refresh_analytics(
    dataset_id: str = Path(..., title="The ID of the dataset to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Force recompute the analytics payload for a dataset."""
    return service.get_analytics(dataset_id=dataset_id, force_refresh=True)

@router.get("/{dataset_id}/correlation", response_model=CorrelationResult)
def get_correlation(
    dataset_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get correlation data only."""
    result = service.get_analytics(dataset_id=dataset_id, force_refresh=False)
    if not result.correlation_data:
        raise HTTPException(status_code=404, detail="Correlation data not available")
    return result.correlation_data

@router.get("/{dataset_id}/distribution", response_model=DistributionResult)
def get_distribution(
    dataset_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get distribution data only."""
    result = service.get_analytics(dataset_id=dataset_id, force_refresh=False)
    if not result.distribution_data:
        raise HTTPException(status_code=404, detail="Distribution data not available")
    return result.distribution_data

@router.get("/{dataset_id}/trends", response_model=TrendResult)
def get_trends(
    dataset_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get trend data only."""
    result = service.get_analytics(dataset_id=dataset_id, force_refresh=False)
    if not result.trend_data:
        raise HTTPException(status_code=404, detail="Trend data not available")
    return result.trend_data

@router.get("/{dataset_id}/outliers", response_model=OutlierResult)
def get_outliers(
    dataset_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get outlier data only."""
    result = service.get_analytics(dataset_id=dataset_id, force_refresh=False)
    if not result.outlier_data:
        raise HTTPException(status_code=404, detail="Outlier data not available")
    return result.outlier_data

@router.get("/{dataset_id}/insights", response_model=List[Insight])
def get_insights(
    dataset_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get generated insights only."""
    result = service.get_analytics(dataset_id=dataset_id, force_refresh=False)
    if result.insights is None:
        raise HTTPException(status_code=404, detail="Insights not available")
    return result.insights

@router.get("/{dataset_id}/summary", response_model=ExecutiveSummary)
def get_summary(
    dataset_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get executive summary only."""
    result = service.get_analytics(dataset_id=dataset_id, force_refresh=False)
    if not result.executive_summary:
        raise HTTPException(status_code=404, detail="Summary not available")
    return result.executive_summary
