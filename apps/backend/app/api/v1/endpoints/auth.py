from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.response import APIResponse
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse, 
    ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user
from app.middlewares.rate_limit import limiter
from app.config import settings

router = APIRouter()

@router.post("/register", response_model=APIResponse[UserResponse])
@limiter.limit("3/minute")
def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.register_user(data)
    
    return APIResponse[UserResponse](
        success=True,
        message="Registration successful. Please check your email to verify your account.",
        data=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=APIResponse[dict])
@limiter.limit("5/minute")
def login(request: Request, response: Response, data: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    access_token, refresh_token, user = auth_service.login(data, request)
    
    # Set HTTP-only cookie for refresh token
    response.set_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    return APIResponse[dict](
        success=True,
        message="Login successful",
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user).dict()
        }
    )

@router.post("/logout", response_model=APIResponse[None])
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get(settings.REFRESH_TOKEN_COOKIE_NAME)
    if refresh_token:
        auth_service = AuthService(db)
        auth_service.logout(refresh_token)
        
    response.delete_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax"
    )
    
    return APIResponse[None](
        success=True,
        message="Logged out successfully"
    )

@router.post("/refresh", response_model=APIResponse[TokenResponse])
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get(settings.REFRESH_TOKEN_COOKIE_NAME)
    
    auth_service = AuthService(db)
    access_token, new_refresh_token = auth_service.refresh_tokens(refresh_token, request)
    
    response.set_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        value=new_refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    return APIResponse[TokenResponse](
        success=True,
        message="Token refreshed successfully",
        data=TokenResponse(access_token=access_token, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    )

@router.get("/me", response_model=APIResponse[UserResponse])
def get_me(current_user = Depends(get_current_user)):
    return APIResponse[UserResponse](
        success=True,
        message="Current user profile retrieved",
        data=UserResponse.model_validate(current_user)
    )

@router.post("/verify-email", response_model=APIResponse[None])
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    auth_service.verify_email(data.token)
    
    return APIResponse[None](
        success=True,
        message="Email verified successfully"
    )

@router.post("/resend-verification", response_model=APIResponse[None])
@limiter.limit("3/10minutes")
def resend_verification(request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    auth_service.resend_verification(current_user.id)
    
    return APIResponse[None](
        success=True,
        message="Verification email sent if account exists and is unverified"
    )

@router.post("/forgot-password", response_model=APIResponse[None])
@limiter.limit("3/10minutes")
def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    auth_service.forgot_password(data.email)
    
    return APIResponse[None](
        success=True,
        message="If an account with that email exists, a password reset link has been sent."
    )

@router.post("/reset-password", response_model=APIResponse[None])
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    auth_service.reset_password(data.token, data.new_password)
    
    return APIResponse[None](
        success=True,
        message="Password has been reset successfully"
    )
