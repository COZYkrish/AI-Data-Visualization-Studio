"""
Preference Service — Phase 9: Premium Features

Manages user preferences: theme, accessibility, locale, notification flags.
Each user gets a default record on first access.
"""
from __future__ import annotations

from typing import Any, Dict, Optional, cast
from sqlalchemy.orm import Session
import structlog

from app.models.premium import UserPreference
from app.schemas.premium import PreferenceUpdate

logger = structlog.get_logger(__name__)

# Default preference values
_DEFAULTS: Dict[str, Any] = {
    "theme": "system",
    "accent_color": "violet",
    "compact_mode": False,
    "large_font": False,
    "reduced_motion": False,
    "high_contrast": False,
    "focus_visible": True,
    "color_blind_mode": None,
    "timezone": "UTC",
    "date_format": "MMM d, yyyy",
    "number_format": "1,234.56",
    "language": "en",
    "default_chart_type": None,
    "default_dataset_id": None,
    "notification_preferences": {
        "analysis_completed": True,
        "model_trained": True,
        "forecast_completed": True,
        "report_generated": True,
        "export_finished": True,
        "errors": True,
        "warnings": True,
    },
}


class PreferenceService:
    def get_or_create(self, db: Session, user_id: str) -> UserPreference:
        """Returns the user's preference record, creating one with defaults if absent."""
        pref = db.query(UserPreference).filter(UserPreference.user_id == str(user_id)).first()
        if not pref:
            pref = UserPreference(user_id=str(user_id), **{k: v for k, v in _DEFAULTS.items()})
            db.add(pref)
            db.commit()
            db.refresh(pref)
            logger.info("preference_created", user_id=str(user_id))
        return pref

    def update(self, db: Session, user_id: str, update: PreferenceUpdate) -> UserPreference:
        """Applies a partial update to the user's preferences."""
        pref = self.get_or_create(db, user_id)
        update_data = update.model_dump(exclude_none=True)

        # Merge notification_preferences if provided (partial update)
        if "notification_preferences" in update_data:
            current_prefs = cast(Dict[str, Any], pref.notification_preferences) or {}
            merged = dict(current_prefs)
            merged.update(update_data["notification_preferences"])
            update_data["notification_preferences"] = merged

        for field, value in update_data.items():
            setattr(pref, field, value)

        pref.version += 1  # type: ignore[assignment]
        db.commit()
        db.refresh(pref)
        logger.info(
            "preference_updated",
            user_id=str(user_id),
            fields=list(update_data.keys()),
            version=pref.version,
        )
        return pref


preference_service = PreferenceService()
