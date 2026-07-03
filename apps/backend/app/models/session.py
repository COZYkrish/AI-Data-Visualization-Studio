from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from app.database.session import Base
from app.models.project import generate_uuid

class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Store hash of refresh token instead of plain token
    refresh_token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    
    device_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    browser: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    operating_system: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
