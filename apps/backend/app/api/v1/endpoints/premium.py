"""
Premium API Endpoints — Phase 9: Premium Features & User Experience

REST endpoints for:
  - User Preferences
  - Persistent Notifications
  - Activity Logs
  - NLQ (Natural Language Query)
  - Dashboard Suggestions
  - Keyboard Shortcuts
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
import structlog

from app.database.session import get_db
from app.core.dependencies import get_current_active_user
from app.schemas.response import APIResponse
from app.schemas.premium import (
    PreferenceResponse, PreferenceUpdate,
    NotificationResponse, NotificationCreate, NotificationUpdate,
    ActivityLogResponse, ActivityLogCreate,
    NLQRequest, NLQResponse,
    SuggestionResponse, SuggestionDismiss,
    ShortcutResponse, ShortcutUpdate,
)
from app.services.premium.preference_service import preference_service
from app.services.premium.notification_service import notification_service
from app.services.premium.activity_service import activity_service
from app.services.premium.nlq_service import nlq_service
from app.services.premium.suggestion_service import suggestion_service
from app.services.premium.shortcut_service import shortcut_service

logger = structlog.get_logger(__name__)

router = APIRouter()


# ─── Preferences ─────────────────────────────────────────────────────────────

@router.get("/preferences", response_model=APIResponse[PreferenceResponse], tags=["Premium"])
def get_preferences(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Returns the current user's preferences, creating defaults if none exist."""
    pref = preference_service.get_or_create(db, str(current_user.id))
    return APIResponse(success=True, message="Preferences retrieved", data=pref)


@router.patch("/preferences", response_model=APIResponse[PreferenceResponse], tags=["Premium"])
def update_preferences(
    update: PreferenceUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Partially updates the user's preferences."""
    pref = preference_service.update(db, str(current_user.id), update)
    # Record activity
    activity_service.record(db, str(current_user.id), ActivityLogCreate(
        action="settings_changed",
        entity_type="preference",
        description=f"Preferences updated: {', '.join(k for k in update.model_dump(exclude_none=True).keys())}",
    ))
    logger.info("preference_updated_via_api", user_id=str(current_user.id))
    return APIResponse(success=True, message="Preferences updated", data=pref)


# ─── Notifications ────────────────────────────────────────────────────────────

@router.get("/notifications", response_model=APIResponse[List[NotificationResponse]], tags=["Premium"])
def list_notifications(
    include_dismissed: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Lists the user's notifications with unread count in metadata."""
    notifs = notification_service.list_for_user(
        db, str(current_user.id), include_dismissed, limit, offset
    )
    unread = notification_service.unread_count(db, str(current_user.id))
    return APIResponse(
        success=True,
        message="Notifications retrieved",
        data=notifs,
        metadata={"unread_count": unread, "total": len(notifs)},
    )


@router.post("/notifications", response_model=APIResponse[NotificationResponse], tags=["Premium"])
def create_notification(
    data: NotificationCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Creates a new notification for the current user (used by backend services)."""
    notif = notification_service.create(db, str(current_user.id), data)
    return APIResponse(success=True, message="Notification created", data=notif)


@router.patch("/notifications/{notification_id}", response_model=APIResponse[NotificationResponse], tags=["Premium"])
def update_notification(
    notification_id: str,
    data: NotificationUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Marks a notification as read or dismissed."""
    notif = notification_service.update(db, notification_id, str(current_user.id), data)
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    if data.read:
        activity_service.record(db, str(current_user.id), ActivityLogCreate(
            action="notification_read",
            entity_type="notification",
            entity_id=notification_id,
        ))
    return APIResponse(success=True, message="Notification updated", data=notif)


@router.post("/notifications/mark-all-read", response_model=APIResponse[dict], tags=["Premium"])
def mark_all_read(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Marks all unread notifications as read."""
    count = notification_service.mark_all_read(db, str(current_user.id))
    return APIResponse(success=True, message=f"{count} notifications marked as read", data={"marked": count})


@router.delete("/notifications/{notification_id}", response_model=APIResponse[dict], tags=["Premium"])
def delete_notification(
    notification_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Permanently deletes a notification."""
    deleted = notification_service.delete(db, notification_id, str(current_user.id))
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return APIResponse(success=True, message="Notification deleted", data={"deleted": True})


# ─── Activity Log ─────────────────────────────────────────────────────────────

@router.get("/activity", response_model=APIResponse[List[ActivityLogResponse]], tags=["Premium"])
def list_activity(
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Returns the user's activity log, optionally filtered by action or entity type."""
    logs = activity_service.list_for_user(
        db, str(current_user.id), action, entity_type, limit, offset
    )
    return APIResponse(success=True, message="Activity retrieved", data=logs, metadata={"total": len(logs)})


@router.post("/activity", response_model=APIResponse[ActivityLogResponse], tags=["Premium"])
def record_activity(
    data: ActivityLogCreate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Records a client-side activity event (e.g. chart exported, dashboard edited)."""
    log = activity_service.record(db, str(current_user.id), data)
    return APIResponse(success=True, message="Activity recorded", data=log)


# ─── NLQ ──────────────────────────────────────────────────────────────────────

@router.post("/nlq/query", response_model=APIResponse[NLQResponse], tags=["Premium"])
def nlq_query(
    body: NLQRequest,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Parses a natural language query into a structured dashboard operation.
    Rule-based engine — no external LLM required.
    """
    result = nlq_service.parse(body)
    # Record activity
    activity_service.record(db, str(current_user.id), ActivityLogCreate(
        action="nlq_query",
        entity_type="dataset",
        entity_id=body.dataset_id,
        description=f"NLQ: {body.query}",
        metadata={"success": result.result.success, "intent": result.result.intent},
    ))
    logger.info(
        "nlq_query_api",
        user_id=str(current_user.id),
        query=body.query,
        success=result.result.success,
        intent=result.result.intent,
        dataset_id=body.dataset_id,
    )
    return APIResponse(success=True, message="Query parsed", data=result)


# ─── Suggestions ──────────────────────────────────────────────────────────────

@router.get("/suggestions", response_model=APIResponse[List[SuggestionResponse]], tags=["Premium"])
def list_suggestions(
    dataset_id: Optional[str] = Query(None),
    include_dismissed: bool = Query(False),
    limit: int = Query(20, ge=1, le=50),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Returns AI-style dashboard suggestions for the current user."""
    suggestions = suggestion_service.list_for_user(
        db, str(current_user.id), dataset_id, include_dismissed, limit
    )
    return APIResponse(success=True, message="Suggestions retrieved", data=suggestions, metadata={"total": len(suggestions)})


@router.post("/suggestions/generate", response_model=APIResponse[List[SuggestionResponse]], tags=["Premium"])
def generate_suggestions(
    dataset_id: str = Query(...),
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Regenerates deterministic suggestions for the specified dataset."""
    suggestions = suggestion_service.generate_for_dataset(db, str(current_user.id), dataset_id)
    logger.info("suggestions_generated_api", user_id=str(current_user.id), dataset_id=dataset_id, count=len(suggestions))
    return APIResponse(success=True, message=f"{len(suggestions)} suggestions generated", data=suggestions)


@router.patch("/suggestions/{suggestion_id}/dismiss", response_model=APIResponse[SuggestionResponse], tags=["Premium"])
def dismiss_suggestion(
    suggestion_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Dismisses a suggestion so it no longer appears in the panel."""
    sug = suggestion_service.dismiss(db, suggestion_id, str(current_user.id))
    if not sug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suggestion not found")
    activity_service.record(db, str(current_user.id), ActivityLogCreate(
        action="suggestion_dismissed",
        entity_type="suggestion",
        entity_id=suggestion_id,
    ))
    return APIResponse(success=True, message="Suggestion dismissed", data=sug)


@router.patch("/suggestions/{suggestion_id}/apply", response_model=APIResponse[SuggestionResponse], tags=["Premium"])
def apply_suggestion(
    suggestion_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Marks a suggestion as applied (called when user acts on it)."""
    sug = suggestion_service.mark_applied(db, suggestion_id, str(current_user.id))
    if not sug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suggestion not found")
    activity_service.record(db, str(current_user.id), ActivityLogCreate(
        action="suggestion_applied",
        entity_type="suggestion",
        entity_id=suggestion_id,
        description=sug.title,
    ))
    return APIResponse(success=True, message="Suggestion applied", data=sug)


# ─── Shortcuts ────────────────────────────────────────────────────────────────

@router.get("/shortcuts", response_model=APIResponse[List[ShortcutResponse]], tags=["Premium"])
def list_shortcuts(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Returns the user's complete keyboard shortcut set, seeding defaults if needed."""
    shortcuts = shortcut_service.get_or_create_defaults(db, str(current_user.id))
    return APIResponse(success=True, message="Shortcuts retrieved", data=shortcuts)


@router.patch("/shortcuts/{action_id}", response_model=APIResponse[ShortcutResponse], tags=["Premium"])
def update_shortcut(
    action_id: str,
    update: ShortcutUpdate,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Updates a specific shortcut's key binding or enabled state. Returns 409 on key conflict."""
    sc = shortcut_service.update(db, str(current_user.id), action_id, update)
    if sc is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Key binding conflicts with an existing shortcut",
        )
    activity_service.record(db, str(current_user.id), ActivityLogCreate(
        action="shortcut_modified",
        entity_type="shortcut",
        entity_id=action_id,
        description=f"Shortcut '{action_id}' updated",
    ))
    return APIResponse(success=True, message="Shortcut updated", data=sc)


@router.post("/shortcuts/{action_id}/reset", response_model=APIResponse[ShortcutResponse], tags=["Premium"])
def reset_shortcut(
    action_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Resets a shortcut to its default key binding."""
    sc = shortcut_service.reset(db, str(current_user.id), action_id)
    if not sc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shortcut not found")
    return APIResponse(success=True, message="Shortcut reset to default", data=sc)
