from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.response import APIResponse
from app.schemas.user import UserResponse, ProfileUpdateRequest, SessionResponse, AvatarResponse
from app.services.profile_service import ProfileService
from app.core.dependencies import get_current_active_user
from app.config import settings
import os
from fastapi.responses import FileResponse

router = APIRouter()

@router.get("", response_model=APIResponse[UserResponse])
def get_profile(current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    profile_service = ProfileService(db)
    user = profile_service.get_profile(current_user.id)
    
    return APIResponse[UserResponse](
        success=True,
        message="Profile retrieved",
        data=UserResponse.model_validate(user)
    )

@router.patch("", response_model=APIResponse[UserResponse])
def update_profile(data: ProfileUpdateRequest, current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    profile_service = ProfileService(db)
    user = profile_service.update_profile(current_user.id, data)
    
    return APIResponse[UserResponse](
        success=True,
        message="Profile updated successfully",
        data=UserResponse.model_validate(user)
    )

@router.post("/avatar", response_model=APIResponse[AvatarResponse])
async def upload_avatar(file: UploadFile = File(...), current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    profile_service = ProfileService(db)
    avatar_url = await profile_service.upload_avatar(current_user.id, file)
    
    return APIResponse[AvatarResponse](
        success=True,
        message="Avatar uploaded successfully",
        data=AvatarResponse(avatar_url=avatar_url)
    )

@router.delete("/avatar", response_model=APIResponse[None])
def delete_avatar(current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    profile_service = ProfileService(db)
    profile_service.delete_avatar(current_user.id)
    
    return APIResponse[None](
        success=True,
        message="Avatar deleted successfully"
    )

@router.get("/avatars/{filename}")
def get_avatar_image(filename: str):
    # This route serves the uploaded avatars directly
    filepath = os.path.join(settings.AVATAR_UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Avatar not found")
    return FileResponse(filepath)

@router.get("/sessions", response_model=APIResponse[List[SessionResponse]])
def get_sessions(current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    profile_service = ProfileService(db)
    sessions = profile_service.get_sessions(current_user.id)
    
    # Map to schema
    response_data = []
    for s in sessions:
        response_data.append(SessionResponse(
            id=str(s.id),
            device_name=str(s.device_name) if s.device_name else None,
            browser=str(s.browser) if s.browser else None,
            operating_system=str(s.operating_system) if s.operating_system else None,
            ip_address=str(s.ip_address) if s.ip_address else None,
            created_at=s.created_at,  # type: ignore
            last_active=s.created_at,  # type: ignore
            is_current=False # Ideally set this true if it matches current request, but requires request context
        ))
    
    return APIResponse[List[SessionResponse]](
        success=True,
        message="Active sessions retrieved",
        data=response_data
    )

@router.delete("/sessions/{session_id}", response_model=APIResponse[None])
def revoke_session(session_id: str, current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    profile_service = ProfileService(db)
    profile_service.revoke_session(current_user.id, session_id)
    
    return APIResponse[None](
        success=True,
        message="Session revoked successfully"
    )

@router.delete("/sessions", response_model=APIResponse[None])
def revoke_all_sessions(current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    profile_service = ProfileService(db)
    profile_service.revoke_all_sessions(current_user.id)
    
    return APIResponse[None](
        success=True,
        message="All sessions revoked successfully"
    )
