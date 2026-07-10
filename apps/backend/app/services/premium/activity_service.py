"""
Activity Service — Phase 9: Premium Features

Records and queries meaningful user actions throughout the application.
Every meaningful event (upload, train, export, settings change) should
be recorded here to build the activity timeline.
"""
from __future__ import annotations

from typing import List, Optional
from sqlalchemy.orm import Session
import structlog

from app.models.premium import ActivityLog
from app.schemas.premium import ActivityLogCreate

logger = structlog.get_logger(__name__)

# Canonical action constants — use these for consistency
ACTIONS = {
    "dataset_uploaded": "dataset_uploaded",
    "dataset_deleted": "dataset_deleted",
    "project_created": "project_created",
    "project_updated": "project_updated",
    "project_deleted": "project_deleted",
    "project_duplicated": "project_duplicated",
    "dashboard_edited": "dashboard_edited",
    "chart_exported": "chart_exported",
    "report_generated": "report_generated",
    "export_requested": "export_requested",
    "model_trained": "model_trained",
    "forecast_generated": "forecast_generated",
    "settings_changed": "settings_changed",
    "theme_changed": "theme_changed",
    "profile_updated": "profile_updated",
    "shortcut_modified": "shortcut_modified",
    "nlq_query": "nlq_query",
    "suggestion_applied": "suggestion_applied",
    "suggestion_dismissed": "suggestion_dismissed",
    "notification_read": "notification_read",
}


class ActivityService:
    def record(
        self,
        db: Session,
        user_id: str,
        data: ActivityLogCreate,
    ) -> ActivityLog:
        """Persists an activity log entry."""
        log = ActivityLog(
            user_id=str(user_id),
            action=data.action,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            entity_name=data.entity_name,
            status=data.status,
            description=data.description,
            metadata_=data.metadata,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        logger.info(
            "activity_recorded",
            user_id=str(user_id),
            action=data.action,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            status=data.status,
        )
        return log

    def list_for_user(
        self,
        db: Session,
        user_id: str,
        action_filter: Optional[str] = None,
        entity_type_filter: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ActivityLog]:
        q = db.query(ActivityLog).filter(ActivityLog.user_id == str(user_id))
        if action_filter:
            q = q.filter(ActivityLog.action == action_filter)
        if entity_type_filter:
            q = q.filter(ActivityLog.entity_type == entity_type_filter)
        return q.order_by(ActivityLog.created_at.desc()).offset(offset).limit(limit).all()

    def get(self, db: Session, log_id: str, user_id: str) -> Optional[ActivityLog]:
        return (
            db.query(ActivityLog)
            .filter(ActivityLog.id == log_id, ActivityLog.user_id == str(user_id))
            .first()
        )


activity_service = ActivityService()
