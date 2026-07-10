"""
Premium Models — Phase 9: Premium Features & User Experience

Defines persistent data models for user preferences, notifications,
activity logs, saved keyboard shortcuts, and dashboard suggestions.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Integer, Float,
    DateTime, Text, ForeignKey, JSON, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.session import Base


# ─── UserPreference ──────────────────────────────────────────────────────────

class UserPreference(Base):
    """Stores all user-level preferences: theme, accessibility, formats, etc."""
    __tablename__ = "user_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Theme & Appearance
    theme = Column(String(32), nullable=False, default="system")           # light | dark | system | high-contrast
    accent_color = Column(String(32), nullable=False, default="violet")    # preset name
    compact_mode = Column(Boolean, nullable=False, default=False)
    large_font = Column(Boolean, nullable=False, default=False)

    # Accessibility
    reduced_motion = Column(Boolean, nullable=False, default=False)
    high_contrast = Column(Boolean, nullable=False, default=False)
    focus_visible = Column(Boolean, nullable=False, default=True)
    color_blind_mode = Column(String(32), nullable=True)                   # none | deuteranopia | protanopia | tritanopia

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


# ─── Notification ─────────────────────────────────────────────────────────────

class NotificationType:
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


class PersistentNotification(Base):
    """Persistent notification records tied to a user."""
    __tablename__ = "persistent_notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    type = Column(String(16), nullable=False, default="info")       # info | success | warning | error
    title = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    action_label = Column(String(64), nullable=True)                # e.g. "View Report"
    action_url = Column(String(512), nullable=True)                 # internal path
    entity_type = Column(String(64), nullable=True)                 # dataset | project | report | model
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

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    action = Column(String(64), nullable=False)         # dataset_uploaded | project_created | chart_exported …
    entity_type = Column(String(64), nullable=True)     # dataset | project | report | model | forecast
    entity_id = Column(String(64), nullable=True)
    entity_name = Column(String(256), nullable=True)

    status = Column(String(32), nullable=False, default="success")  # success | failed | pending
    description = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", backref="activity_logs")


# ─── SavedShortcut ────────────────────────────────────────────────────────────

class SavedShortcut(Base):
    """User-customized keyboard shortcut overrides."""
    __tablename__ = "saved_shortcuts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    action_id = Column(String(64), nullable=False)          # e.g. "open_command_palette"
    label = Column(String(128), nullable=False)
    default_keys = Column(JSON, nullable=False)             # ["mod", "k"]
    custom_keys = Column(JSON, nullable=True)               # user override
    category = Column(String(64), nullable=False, default="navigation")
    enabled = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", backref="shortcuts")


# ─── DashboardSuggestion ──────────────────────────────────────────────────────

class DashboardSuggestion(Base):
    """
    Deterministic AI-style dashboard suggestions generated per user per dataset.
    Regenerated on dataset change or explicit refresh.
    """
    __tablename__ = "dashboard_suggestions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    dataset_id = Column(String(64), nullable=True, index=True)

    suggestion_type = Column(String(64), nullable=False)    # chart | filter | kpi | ml | forecast | correlation
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    why = Column(Text, nullable=False)                      # Explainability: why this is recommended
    priority = Column(Integer, nullable=False, default=5)   # 1-10, higher = more relevant
    config = Column(JSON, nullable=True)                    # chart_type, columns, filters …

    dismissed = Column(Boolean, nullable=False, default=False)
    applied = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", backref="suggestions")
