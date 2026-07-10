"""
Premium Models — Phase 9: Premium Features & User Experience

Defines persistent data models for user preferences, notifications,
activity logs, saved keyboard shortcuts, and dashboard suggestions.

Note: FKs reference users.id which is String(36) in the existing schema.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Integer,
    DateTime, Text, ForeignKey, JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.session import Base


def _new_id() -> str:
    return str(uuid.uuid4())


# ─── UserPreference ───────────────────────────────────────────────────────────

class UserPreference(Base):
    """Stores all user-level preferences: theme, accessibility, formats, etc."""
    __tablename__ = "user_preferences"

    id = Column(String(36), primary_key=True, default=_new_id)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Theme & Appearance
    theme = Column(String(32), nullable=False, default="system")
    accent_color = Column(String(32), nullable=False, default="violet")
    compact_mode = Column(Boolean, nullable=False, default=False)
    large_font = Column(Boolean, nullable=False, default=False)

    # Accessibility
    reduced_motion = Column(Boolean, nullable=False, default=False)
    high_contrast = Column(Boolean, nullable=False, default=False)
    focus_visible = Column(Boolean, nullable=False, default=True)
    color_blind_mode = Column(String(32), nullable=True)

    # Locale & Format
    timezone = Column(String(64), nullable=False, default="UTC")
    date_format = Column(String(32), nullable=False, default="MMM d, yyyy")
    number_format = Column(String(16), nullable=False, default="1,234.56")
    language = Column(String(16), nullable=False, default="en")

    # Defaults
    default_chart_type = Column(String(32), nullable=True)
    default_dataset_id = Column(String(64), nullable=True)

    # Notification prefs (JSON: { analysis: bool, ml: bool, export: bool, ... })
    notification_preferences = Column(JSON, nullable=False, default=lambda: {
        "analysis_completed": True,
        "model_trained": True,
        "forecast_completed": True,
        "report_generated": True,
        "export_finished": True,
        "errors": True,
        "warnings": True,
    })

    # Misc
    metadata_ = Column("metadata", JSON, nullable=True)
    version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", backref="preference", uselist=False)


# ─── PersistentNotification ───────────────────────────────────────────────────

class PersistentNotification(Base):
    """Persistent notification records tied to a user."""
    __tablename__ = "persistent_notifications"

    id = Column(String(36), primary_key=True, default=_new_id)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    type = Column(String(16), nullable=False, default="info")
    title = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    action_label = Column(String(64), nullable=True)
    action_url = Column(String(512), nullable=True)
    entity_type = Column(String(64), nullable=True)
    entity_id = Column(String(64), nullable=True)

    read = Column(Boolean, nullable=False, default=False)
    dismissed = Column(Boolean, nullable=False, default=False)

    metadata_ = Column("metadata", JSON, nullable=True)
    version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", backref="notifications_persistent")


# ─── ActivityLog ──────────────────────────────────────────────────────────────

class ActivityLog(Base):
    """Audit trail of meaningful user actions throughout the application."""
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=_new_id)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    action = Column(String(64), nullable=False)
    entity_type = Column(String(64), nullable=True)
    entity_id = Column(String(64), nullable=True)
    entity_name = Column(String(256), nullable=True)

    status = Column(String(32), nullable=False, default="success")
    description = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", backref="activity_logs")


# ─── SavedShortcut ────────────────────────────────────────────────────────────

class SavedShortcut(Base):
    """User-customized keyboard shortcut overrides."""
    __tablename__ = "saved_shortcuts"

    id = Column(String(36), primary_key=True, default=_new_id)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    action_id = Column(String(64), nullable=False)
    label = Column(String(128), nullable=False)
    default_keys = Column(JSON, nullable=False)
    custom_keys = Column(JSON, nullable=True)
    category = Column(String(64), nullable=False, default="navigation")
    enabled = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", backref="shortcuts")


# ─── DashboardSuggestion ──────────────────────────────────────────────────────

class DashboardSuggestion(Base):
    """Deterministic AI-style dashboard suggestions generated per user per dataset."""
    __tablename__ = "dashboard_suggestions"

    id = Column(String(36), primary_key=True, default=_new_id)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    dataset_id = Column(String(64), nullable=True, index=True)

    suggestion_type = Column(String(64), nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    why = Column(Text, nullable=False)
    priority = Column(Integer, nullable=False, default=5)
    config = Column(JSON, nullable=True)

    dismissed = Column(Boolean, nullable=False, default=False)
    applied = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", backref="suggestions")
