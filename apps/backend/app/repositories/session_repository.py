from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.session import UserSession

class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_session(self, session_data: dict) -> UserSession:
        db_session = UserSession(**session_data)
        self.db.add(db_session)
        self.db.commit()
        self.db.refresh(db_session)
        return db_session

    def get_by_token_hash(self, token_hash: str) -> Optional[UserSession]:
        return self.db.query(UserSession).filter(
            UserSession.refresh_token_hash == token_hash
        ).first()

    def get_active_sessions_for_user(self, user_id: str) -> List[UserSession]:
        return self.db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.revoked_at == None,
            UserSession.expires_at > datetime.utcnow()
        ).all()

    def revoke_session(self, session_id: str) -> bool:
        db_session = self.db.query(UserSession).filter(UserSession.id == session_id).first()
        if db_session and not db_session.revoked_at:
            db_session.revoked_at = datetime.utcnow()
            self.db.commit()
            return True
        return False

    def revoke_all_for_user(self, user_id: str, except_session_id: Optional[str] = None) -> None:
        query = self.db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.revoked_at == None
        )
        if except_session_id:
            query = query.filter(UserSession.id != except_session_id)
            
        sessions = query.all()
        for session in sessions:
            session.revoked_at = datetime.utcnow()
            
        self.db.commit()

    def cleanup_expired(self) -> int:
        deleted = self.db.query(UserSession).filter(
            UserSession.expires_at < datetime.utcnow()
        ).delete()
        self.db.commit()
        return deleted
