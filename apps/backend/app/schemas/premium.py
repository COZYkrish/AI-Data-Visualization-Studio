"""
Premium Pydantic Schemas — Phase 9: Premium Features & User Experience

Defines request/response schemas for preferences, notifications,
activity logs, NLQ, suggestions, and shortcuts.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
import uuid


# ─── UserPreference ───────────────────────────────────────────────────────────

class PreferenceResponse(BaseModel):
    id: str
    user_id: str
    theme: str
    accent_color: str
    compact_mode: bool
    large_font: bool
    reduced_motion: bool
    high_contrast: bool
    focus_visible: bool
    color_blind_mode: Optional[str]
    timezone: str
    date_format: str
    number_format: str
    language: str
    default_chart_type: Optional[str]
    default_dataset_id: Optional[str]
    notification_preferences: Dict[str, bool]
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PreferenceUpdate(BaseModel):
    theme: Optional[str] = None
    accent_color: Optional[str] = None
    compact_mode: Optional[bool] = None
    large_font: Optional[bool] = None
    reduced_motion: Optional[bool] = None
    high_contrast: Optional[bool] = None
    focus_visible: Optional[bool] = None
    color_blind_mode: Optional[str] = None
    timezone: Optional[str] = None
    date_format: Optional[str] = None
    number_format: Optional[str] = None
    language: Optional[str] = None
    default_chart_type: Optional[str] = None
    default_dataset_id: Optional[str] = None
    notification_preferences: Optional[Dict[str, bool]] = None


# ─── Notification ─────────────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    action_label: Optional[str]
    action_url: Optional[str]
    entity_type: Optional[str]
    entity_id: Optional[str]
    read: bool
    dismissed: bool
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    type: str = "info"
    title: str
    message: str
    action_label: Optional[str] = None
    action_url: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class NotificationUpdate(BaseModel):
    read: Optional[bool] = None
    dismissed: Optional[bool] = None


# ─── ActivityLog ──────────────────────────────────────────────────────────────

class ActivityLogResponse(BaseModel):
    id: str
    user_id: str
    action: str
    entity_type: Optional[str]
    entity_id: Optional[str]
    entity_name: Optional[str]
    status: str
    description: Optional[str]
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityLogCreate(BaseModel):
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    entity_name: Optional[str] = None
    status: str = "success"
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


# ─── NLQ ──────────────────────────────────────────────────────────────────────

class NLQRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=512)
    dataset_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class NLQColumnRef(BaseModel):
    column: str
    dtype: Optional[str] = None


class NLQOperation(BaseModel):
    intent: str                         # show_by | top_n | average | filter_date | compare | sum | count
    x_column: Optional[str] = None
    y_column: Optional[str] = None
    group_by: Optional[str] = None
    filter_column: Optional[str] = None
    filter_value: Optional[Any] = None
    filter_operator: Optional[str] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"
    limit: Optional[int] = None
    aggregation: Optional[str] = None  # sum | avg | count | min | max
    chart_type: Optional[str] = None   # bar | line | pie | scatter | area
    compare_values: Optional[List[Any]] = None


class NLQResult(BaseModel):
    success: bool
    intent: Optional[str] = None
    operation: Optional[NLQOperation] = None
    chart_type: Optional[str] = None
    explanation: Optional[str] = None  # human-readable explanation of what was parsed
    fallback_suggestions: Optional[List[str]] = None
    raw_query: str


class NLQResponse(BaseModel):
    result: NLQResult
    processing_time_ms: float


# ─── Suggestions ──────────────────────────────────────────────────────────────

class SuggestionResponse(BaseModel):
    id: str
    user_id: str
    dataset_id: Optional[str]
    suggestion_type: str
    title: str
    description: str
    why: str
    priority: int
    config: Optional[Dict[str, Any]]
    dismissed: bool
    applied: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SuggestionDismiss(BaseModel):
    dismissed: bool = True


# ─── Shortcuts ────────────────────────────────────────────────────────────────

class ShortcutResponse(BaseModel):
    id: str
    user_id: str
    action_id: str
    label: str
    default_keys: List[str]
    custom_keys: Optional[List[str]]
    category: str
    enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ShortcutUpdate(BaseModel):
    custom_keys: Optional[List[str]] = None
    enabled: Optional[bool] = None
