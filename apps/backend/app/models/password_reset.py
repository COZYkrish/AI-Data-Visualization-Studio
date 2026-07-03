from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base
from app.models.project import generate_uuid

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    token = Column(String(255), unique=True, index=True, nullable=False)
    
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reset_tokens")
