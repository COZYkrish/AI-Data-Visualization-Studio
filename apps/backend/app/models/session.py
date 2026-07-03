from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base
from app.models.project import generate_uuid

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Store hash of refresh token instead of plain token
    refresh_token_hash = Column(String(255), unique=True, index=True, nullable=False)
    
    device_name = Column(String(255), nullable=True)
    browser = Column(String(255), nullable=True)
    operating_system = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(1000), nullable=True)
    
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
