from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from datetime import datetime, timedelta
from app.models.user import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def create(self, user_data: dict) -> User:
        db_user = User(**user_data)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, user_id: str, update_data: dict) -> Optional[User]:
        db_user = self.get_by_id(user_id)
        if not db_user:
            return None
            
        for key, value in update_data.items():
            setattr(db_user, key, value)
            
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def increment_failed_attempts(self, user_id: str, max_attempts: int, lockout_minutes: int) -> User:
        db_user = self.get_by_id(user_id)
        if db_user:
            db_user.failed_login_attempts += 1
            if db_user.failed_login_attempts >= max_attempts:
                db_user.locked_until = datetime.utcnow() + timedelta(minutes=lockout_minutes)
            self.db.commit()
            self.db.refresh(db_user)
        return db_user

    def reset_failed_attempts(self, user_id: str) -> None:
        db_user = self.get_by_id(user_id)
        if db_user and (db_user.failed_login_attempts > 0 or db_user.locked_until):
            db_user.failed_login_attempts = 0
            db_user.locked_until = None
            self.db.commit()

    def set_last_login(self, user_id: str) -> None:
        db_user = self.get_by_id(user_id)
        if db_user:
            db_user.last_login_at = datetime.utcnow()
            self.db.commit()
