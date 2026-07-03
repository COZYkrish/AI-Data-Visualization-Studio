from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from app.models.email_verification import EmailVerificationToken
from app.models.password_reset import PasswordResetToken
from app.core.security import generate_secure_token

class TokenRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_email_verification_token(self, user_id: str, expire_hours: int = 24) -> EmailVerificationToken:
        token_str = generate_secure_token()
        db_token = EmailVerificationToken(
            user_id=user_id,
            token=token_str,
            expires_at=datetime.utcnow() + timedelta(hours=expire_hours)
        )
        self.db.add(db_token)
        self.db.commit()
        self.db.refresh(db_token)
        return db_token

    def get_email_token(self, token_str: str) -> Optional[EmailVerificationToken]:
        return self.db.query(EmailVerificationToken).filter(
            EmailVerificationToken.token == token_str,
            EmailVerificationToken.used_at == None,
            EmailVerificationToken.expires_at > datetime.utcnow()
        ).first()

    def mark_email_token_used(self, token_id: str) -> None:
        db_token = self.db.query(EmailVerificationToken).filter(EmailVerificationToken.id == token_id).first()
        if db_token:
            db_token.used_at = datetime.utcnow()
            self.db.commit()

    def create_password_reset_token(self, user_id: str, expire_hours: int = 1) -> PasswordResetToken:
        token_str = generate_secure_token()
        db_token = PasswordResetToken(
            user_id=user_id,
            token=token_str,
            expires_at=datetime.utcnow() + timedelta(hours=expire_hours)
        )
        self.db.add(db_token)
        self.db.commit()
        self.db.refresh(db_token)
        return db_token

    def get_reset_token(self, token_str: str) -> Optional[PasswordResetToken]:
        return self.db.query(PasswordResetToken).filter(
            PasswordResetToken.token == token_str,
            PasswordResetToken.used_at == None,
            PasswordResetToken.expires_at > datetime.utcnow()
        ).first()

    def mark_reset_token_used(self, token_id: str) -> None:
        db_token = self.db.query(PasswordResetToken).filter(PasswordResetToken.id == token_id).first()
        if db_token:
            db_token.used_at = datetime.utcnow()
            self.db.commit()

    def invalidate_all_reset_tokens_for_user(self, user_id: str) -> None:
        self.db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user_id,
            PasswordResetToken.used_at == None
        ).update({"used_at": datetime.utcnow()})
        self.db.commit()
