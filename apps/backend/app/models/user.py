from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base
from app.models.project import generate_uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(100), nullable=True)
    username = Column(String(50), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    bio = Column(String(500), nullable=True)
    timezone = Column(String(50), nullable=True, default="UTC")
    
    email_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    email_tokens = relationship("EmailVerificationToken", back_populates="user", cascade="all, delete-orphan")
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
