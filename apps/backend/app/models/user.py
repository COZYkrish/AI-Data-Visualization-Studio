from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from app.database.session import Base
from app.models.project import generate_uuid

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    full_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    username: Mapped[Optional[str]] = mapped_column(String(50), unique=True, index=True, nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    timezone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="UTC")
    
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    email_tokens = relationship("EmailVerificationToken", back_populates="user", cascade="all, delete-orphan")
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
