import os
import time
import structlog
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.dataset import Dataset
from app.models.analytics import AnalyticsResult
from app.schemas.analytics import AnalyticsResultResponse
from app.services.file_processing.parser import parse_file
from app.services.file_processing.cleaner import clean_dataset

from app.services.analytics.correlation_service import CorrelationService
from app.services.analytics.distribution_service import DistributionService
from app.services.analytics.trend_service import TrendService
from app.services.analytics.outlier_service import OutlierService
from app.services.analytics.feature_importance_service import FeatureImportanceService
from app.services.analytics.insight_engine import InsightEngine
from app.services.analytics.summary_service import SummaryService

logger = structlog.get_logger(__name__)
UPLOAD_DIR = "uploads"
CURRENT_ANALYSIS_VERSION = "1.0.0"

class AnalyticsService:
    def __init__(self, session: Session):
        self.session = session
        self.correlation_service = CorrelationService()
        self.distribution_service = DistributionService()
        self.trend_service = TrendService()
        self.outlier_service = OutlierService()
        self.feature_importance_service = FeatureImportanceService()
        self.insight_engine = InsightEngine()
        self.summary_service = SummaryService()

    def get_analytics(self, dataset_id: str, force_refresh: bool = False) -> AnalyticsResultResponse:
        logger.info("analytics_requested", dataset_id=dataset_id, force_refresh=force_refresh)
        
        # 1. Fetch Dataset
        dataset = self.session.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # 2. Check Cache
        existing_result = self.session.query(AnalyticsResult).filter(AnalyticsResult.dataset_id == dataset_id).first()
        
        if existing_result and not force_refresh and existing_result.analysis_version == CURRENT_ANALYSIS_VERSION:
            logger.info("analytics_cache_hit", dataset_id=dataset_id)
            return AnalyticsResultResponse.model_validate(existing_result)

        logger.info("analytics_cache_miss_or_refresh", dataset_id=dataset_id)
        
        # 3. Load Data
        stored_filepath = os.path.join(UPLOAD_DIR, dataset.stored_filename)
        if not os.path.exists(stored_filepath):
            raise HTTPException(status_code=404, detail="Dataset file missing from storage")
            
        try:
            df = parse_file(stored_filepath, dataset.file_type, dataset.original_filename)
            df, _ = clean_dataset(df)
        except Exception as e:
            logger.error("analytics_data_load_failed", dataset_id=dataset_id, error=str(e))
            raise HTTPException(status_code=400, detail=f"Failed to load dataset: {str(e)}")

        start_time = time.time()
        
        try:
            # 4. Execute Pipeline
            logger.info("analytics_pipeline_started", dataset_id=dataset_id)
            
            # Correlation
            correlation_result = self.correlation_service.analyze(df)
            
            # Distribution
            distribution_result = self.distribution_service.analyze(df)
            
            # Trend
            trend_result = self.trend_service.analyze(df)
            
            # Outliers
            outliers_result = self.outlier_service.analyze(df)
            
            # Feature Importance
            feature_importance_result = self.feature_importance_service.analyze(df, correlation_result, distribution_result)
            
            # Insights
            insights_result = self.insight_engine.generate(
                correlation_result, distribution_result, trend_result, outliers_result, feature_importance_result
            )
            
            # Executive Summary
            summary_result = self.summary_service.generate(
                distribution_result, outliers_result, insights_result, len(df)
            )
            
            duration = time.time() - start_time
            logger.info("analytics_pipeline_completed", dataset_id=dataset_id, duration=duration)
            
            # 5. Persist Results
            if not existing_result:
                existing_result = AnalyticsResult(dataset_id=dataset_id)
                self.session.add(existing_result)
                
            existing_result.analysis_version = CURRENT_ANALYSIS_VERSION
            existing_result.correlation_data = correlation_result.model_dump()
            existing_result.distribution_data = distribution_result.model_dump()
            existing_result.trend_data = trend_result.model_dump()
            existing_result.outlier_data = outliers_result.model_dump()
            existing_result.feature_importance = feature_importance_result.model_dump()
            existing_result.insights = [i.model_dump() for i in insights_result]
            existing_result.executive_summary = summary_result.model_dump()
            existing_result.processing_duration = duration
            
            self.session.commit()
            self.session.refresh(existing_result)
            
            return AnalyticsResultResponse.model_validate(existing_result)
            
        except Exception as e:
            self.session.rollback()
            logger.error("analytics_pipeline_failed", dataset_id=dataset_id, error=str(e), exc_info=True)
            raise HTTPException(status_code=500, detail=f"Analytics pipeline failed: {str(e)}")
