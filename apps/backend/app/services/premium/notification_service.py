"""
Notification Service — Phase 9: Premium Features

Creates, lists, marks-as-read, and dismisses persistent notifications.
Architecture is prepared for future WebSocket push integration via a
stub NotificationBroadcaster interface.
"""
from __future__ import annotations

from typing import List, Optional
from sqlalchemy.orm import Session
import structlog

from app.models.premium import PersistentNotification
from app.schemas.premium import NotificationCreate, NotificationUpdate

logger = structlog.get_logger(__name__)


class NotificationBroadcaster:
    """
    Stub WebSocket broadcaster — prepared for future distributed push.
    Currently a no-op; replace with real WS manager in a future phase.
    """
    def broadcast(self, user_id: str, notification: PersistentNotification) -> None:
        # Future: await ws_manager.send_to_user(user_id, payload)
        pass


_broadcaster = NotificationBroadcaster()


class NotificationService:
    def create(
        self,
        db: Session,
        user_id: str,
        data: NotificationCreate,
    ) -> PersistentNotification:
        """Creates a notification and optionally broadcasts via WebSocket stub."""
        notif = PersistentNotification(
            user_id=str(user_id),
            type=data.type,
            title=data.title,
            message=data.message,
            action_label=data.action_label,
            action_url=data.action_url,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            metadata_=data.metadata,
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        _broadcaster.broadcast(str(user_id), notif)
        logger.info(
            "notification_created",
            user_id=str(user_id),
            notification_id=str(notif.id),
            type=notif.type,
            title=notif.title,
        )
        return notif

    def list_for_user(
        self,
        db: Session,
        user_id: str,
        include_dismissed: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> List[PersistentNotification]:
        q = db.query(PersistentNotification).filter(
            PersistentNotification.user_id == str(user_id)
        )
        if not include_dismissed:
            q = q.filter(PersistentNotification.dismissed == False)  # noqa: E712
        return q.order_by(PersistentNotification.created_at.desc()).offset(offset).limit(limit).all()

    def unread_count(self, db: Session, user_id: str) -> int:
        return (
            db.query(PersistentNotification)
            .filter(
                PersistentNotification.user_id == str(user_id),
                PersistentNotification.read == False,  # noqa: E712
                PersistentNotification.dismissed == False,  # noqa: E712
            )
            .count()
        )

    def get(self, db: Session, notification_id: str, user_id: str) -> Optional[PersistentNotification]:
        return (
            db.query(PersistentNotification)
            .filter(
                PersistentNotification.id == notification_id,
                PersistentNotification.user_id == str(user_id),
            )
            .first()
        )

    def update(
        self,
        db: Session,
        notification_id: str,
        user_id: str,
        data: NotificationUpdate,
    ) -> Optional[PersistentNotification]:
        notif = self.get(db, notification_id, user_id)
        if not notif:
            return None
        if data.read is not None:
            notif.read = data.read
        if data.dismissed is not None:
            notif.dismissed = data.dismissed
        db.commit()
        db.refresh(notif)
        logger.info(
            "notification_updated",
            notification_id=str(notif.id),
            user_id=str(user_id),
            read=notif.read,
            dismissed=notif.dismissed,
        )
        return notif

    def mark_all_read(self, db: Session, user_id: str) -> int:
        count = (
            db.query(PersistentNotification)
            .filter(
                PersistentNotification.user_id == str(user_id),
                PersistentNotification.read == False,  # noqa: E712
            )
            .update({"read": True})
        )
        db.commit()
        logger.info("notifications_mark_all_read", user_id=str(user_id), count=count)
        return count

    def delete(self, db: Session, notification_id: str, user_id: str) -> bool:
        notif = self.get(db, notification_id, user_id)
        if not notif:
            return False
        db.delete(notif)
        db.commit()
        return True


notification_service = NotificationService()
