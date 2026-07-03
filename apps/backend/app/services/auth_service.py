from sqlalchemy.orm import Session
from fastapi import Request
import hashlib
from datetime import datetime, timedelta
from typing import Tuple, Dict

from app.config import settings
from app.exceptions import APIException
from app.models.user import User
from app.models.session import UserSession
from app.schemas.auth import RegisterRequest, LoginRequest
from app.repositories.user_repository import UserRepository
from app.repositories.session_repository import SessionRepository
from app.repositories.token_repository import TokenRepository
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token, generate_secure_token
from app.services.email_service import EmailService

class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.session_repo = SessionRepository(db)
        self.token_repo = TokenRepository(db)

    def register_user(self, data: RegisterRequest) -> User:
        if self.user_repo.get_by_email(data.email):
            raise APIException(status_code=400, code="EMAIL_IN_USE", message="Email already registered")

        user_data = {
            "email": data.email,
            "password_hash": hash_password(data.password),
            "full_name": data.full_name
        }
        user = self.user_repo.create(user_data)
        
        # Create email verification token
        token_obj = self.token_repo.create_email_verification_token(user.id)
        EmailService.send_verification_email(user.email, token_obj.token)
        
        return user

    def login(self, data: LoginRequest, request: Request) -> Tuple[str, str, User]:
        user = self.user_repo.get_by_email(data.email)
        
        # Generic error message
        invalid_creds_error = APIException(status_code=401, code="INVALID_CREDENTIALS", message="Invalid email or password")
        
        if not user:
            raise invalid_creds_error
            
        if user.locked_until and user.locked_until > datetime.utcnow():
            raise APIException(status_code=403, code="ACCOUNT_LOCKED", message="Account is temporarily locked due to too many failed attempts")
            
        if not verify_password(data.password, user.password_hash):
            self.user_repo.increment_failed_attempts(user.id, settings.MAX_LOGIN_ATTEMPTS, settings.LOCKOUT_MINUTES)
            raise invalid_creds_error
            
        # Reset failed attempts on success
        self.user_repo.reset_failed_attempts(user.id)
        self.user_repo.set_last_login(user.id)
        
        # Issue tokens
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)
        refresh_token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        
        # Create session
        session_data = {
            "user_id": user.id,
            "refresh_token_hash": refresh_token_hash,
            "expires_at": datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            "ip_address": request.client.host if request and request.client else None,
            "user_agent": request.headers.get("user-agent")[:1000] if request else None
        }
        self.session_repo.create_session(session_data)
        
        return access_token, refresh_token, user

    def logout(self, refresh_token: str) -> None:
        if not refresh_token:
            return
            
        refresh_token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        session = self.session_repo.get_by_token_hash(refresh_token_hash)
        
        if session:
            self.session_repo.revoke_session(session.id)

    def refresh_tokens(self, refresh_token: str, request: Request) -> Tuple[str, str]:
        if not refresh_token:
            raise APIException(status_code=401, code="MISSING_TOKEN", message="Refresh token missing")
            
        # Validate JWT
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise APIException(status_code=401, code="INVALID_TOKEN", message="Invalid or expired refresh token")
            
        user_id = payload.get("sub")
        refresh_token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        
        session = self.session_repo.get_by_token_hash(refresh_token_hash)
        if not session or session.revoked_at or session.expires_at < datetime.utcnow():
            raise APIException(status_code=401, code="SESSION_EXPIRED", message="Session has expired or been revoked")
            
        user = self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise APIException(status_code=401, code="UNAUTHORIZED", message="User account inactive or missing")
            
        # Rotate tokens: Revoke old, issue new
        self.session_repo.revoke_session(session.id)
        
        access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)
        new_refresh_token_hash = hashlib.sha256(new_refresh_token.encode()).hexdigest()
        
        # New session
        session_data = {
            "user_id": user.id,
            "refresh_token_hash": new_refresh_token_hash,
            "expires_at": datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            "ip_address": request.client.host if request and request.client else session.ip_address,
            "user_agent": request.headers.get("user-agent")[:1000] if request else session.user_agent
        }
        self.session_repo.create_session(session_data)
        
        return access_token, new_refresh_token

    def verify_email(self, token_str: str) -> None:
        token = self.token_repo.get_email_token(token_str)
        if not token:
            raise APIException(status_code=400, code="INVALID_TOKEN", message="Invalid or expired verification token")
            
        self.user_repo.update(token.user_id, {"email_verified": True})
        self.token_repo.mark_email_token_used(token.id)

    def resend_verification(self, user_id: str) -> None:
        user = self.user_repo.get_by_id(user_id)
        if not user or user.email_verified:
            return
            
        token_obj = self.token_repo.create_email_verification_token(user_id)
        EmailService.send_verification_email(user.email, token_obj.token)

    def forgot_password(self, email: str) -> None:
        user = self.user_repo.get_by_email(email)
        # Always return success to prevent email enumeration
        if not user or not user.is_active:
            return
            
        # Invalidate old tokens
        self.token_repo.invalidate_all_reset_tokens_for_user(user.id)
        
        token_obj = self.token_repo.create_password_reset_token(user.id)
        EmailService.send_password_reset_email(user.email, token_obj.token)

    def reset_password(self, token_str: str, new_password: str) -> None:
        token = self.token_repo.get_reset_token(token_str)
        if not token:
            raise APIException(status_code=400, code="INVALID_TOKEN", message="Invalid or expired password reset token")
            
        hashed_password = hash_password(new_password)
        self.user_repo.update(token.user_id, {"password_hash": hashed_password})
        self.token_repo.mark_reset_token_used(token.id)
        
        # Optional: Revoke all existing sessions to force re-login everywhere
        self.session_repo.revoke_all_for_user(token.user_id)
