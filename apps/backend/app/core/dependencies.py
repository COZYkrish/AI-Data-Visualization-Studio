from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import decode_token
from app.repositories.user_repository import UserRepository
from app.exceptions import APIException
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = APIException(
        status_code=401,
        code="UNAUTHORIZED",
        message="Could not validate credentials",
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
        
    user_id_raw = payload.get("sub")
    if user_id_raw is None or not isinstance(user_id_raw, str):
        raise credentials_exception
    user_id: str = user_id_raw
        
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    
    if user is None:
        raise credentials_exception
        
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise APIException(
            status_code=403,
            code="INACTIVE_USER",
            message="Inactive user account"
        )
    return current_user

def get_current_verified_user(current_user: User = Depends(get_current_active_user)) -> User:
    if not current_user.email_verified:
        raise APIException(
            status_code=403,
            code="UNVERIFIED_EMAIL",
            message="Email address must be verified to perform this action"
        )
    return current_user
