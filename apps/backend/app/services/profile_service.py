from sqlalchemy.orm import Session
from fastapi import UploadFile
import os
import uuid
from PIL import Image
from typing import List, Optional

from app.config import settings
from app.exceptions import APIException
from app.models.user import User
from app.models.session import UserSession
from app.schemas.user import ProfileUpdateRequest
from app.repositories.user_repository import UserRepository
from app.repositories.session_repository import SessionRepository

class ProfileService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.session_repo = SessionRepository(db)

    def get_profile(self, user_id: str) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise APIException(status_code=404, code="USER_NOT_FOUND", message="User not found")
        return user

    def update_profile(self, user_id: str, data: ProfileUpdateRequest) -> User:
        update_data = {k: v for k, v in data.dict(exclude_unset=True).items()}
        
        # Check username uniqueness if updating
        if "username" in update_data and update_data["username"]:
            existing = self.user_repo.get_by_username(update_data["username"])
            if existing and existing.id != user_id:
                raise APIException(status_code=400, code="USERNAME_TAKEN", message="Username is already taken")

        user = self.user_repo.update(user_id, update_data)
        if not user:
            raise APIException(status_code=404, code="USER_NOT_FOUND", message="User not found")
            
        return user

    async def upload_avatar(self, user_id: str, file: UploadFile) -> str:
        # Validate size (Phase 3: read file length)
        content = await file.read()
        if len(content) > settings.MAX_AVATAR_SIZE_BYTES:
            raise APIException(status_code=400, code="FILE_TOO_LARGE", message="Avatar exceeds maximum allowed size (5MB)")
            
        # Validate image and convert
        import io
        try:
            image = Image.open(io.BytesIO(content))
            image.verify()  # verify it's an image
        except Exception:
            raise APIException(status_code=400, code="INVALID_IMAGE", message="Uploaded file is not a valid image")

        # Resize and save
        os.makedirs(settings.AVATAR_UPLOAD_DIR, exist_ok=True)
        filename = f"{user_id}_{uuid.uuid4().hex[:8]}.webp"
        filepath = os.path.join(settings.AVATAR_UPLOAD_DIR, filename)
        
        try:
            # Reopen for actual processing (verify closes the file)
            image = Image.open(io.BytesIO(content))
            
            # Crop to square
            min_dim = min(image.size)
            left = (image.width - min_dim) / 2
            top = (image.height - min_dim) / 2
            image = image.crop((left, top, left + min_dim, top + min_dim))
            
            # Resize
            image = image.resize((256, 256), Image.Resampling.LANCZOS)
            image.save(filepath, format="WEBP", quality=85)
        except Exception as e:
            raise APIException(status_code=500, code="UPLOAD_FAILED", message="Failed to process avatar", details=[str(e)])

        # URL path (in a real app, you'd serve this statically or via S3)
        avatar_url = f"/api/v1/profile/avatars/{filename}"
        
        # Delete old avatar if exists
        user = self.user_repo.get_by_id(user_id)
        if user and user.avatar_url and user.avatar_url.startswith("/api/v1/profile/avatars/"):
            old_filename = user.avatar_url.split("/")[-1]
            old_filepath = os.path.join(settings.AVATAR_UPLOAD_DIR, old_filename)
            if os.path.exists(old_filepath):
                try:
                    os.remove(old_filepath)
                except Exception:
                    pass

        self.user_repo.update(user_id, {"avatar_url": avatar_url})
        return avatar_url

    def delete_avatar(self, user_id: str) -> None:
        user = self.user_repo.get_by_id(user_id)
        if user and user.avatar_url:
            if user.avatar_url.startswith("/api/v1/profile/avatars/"):
                filename = user.avatar_url.split("/")[-1]
                filepath = os.path.join(settings.AVATAR_UPLOAD_DIR, filename)
                if os.path.exists(filepath):
                    try:
                        os.remove(filepath)
                    except Exception:
                        pass
            self.user_repo.update(user_id, {"avatar_url": None})

    def get_sessions(self, user_id: str) -> List[UserSession]:
        return self.session_repo.get_active_sessions_for_user(user_id)

    def revoke_session(self, user_id: str, session_id: str) -> None:
        session = self.session_repo.db.query(UserSession).filter(UserSession.id == session_id).first()
        if not session or session.user_id != user_id:
            raise APIException(status_code=404, code="SESSION_NOT_FOUND", message="Session not found")
        
        self.session_repo.revoke_session(session_id)

    def revoke_all_sessions(self, user_id: str, except_session_id: Optional[str] = None) -> None:
        self.session_repo.revoke_all_for_user(user_id, except_session_id)
