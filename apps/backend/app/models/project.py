import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.database.session import Base

def generate_uuid():
  return str(uuid.uuid4())

class Project(Base):
  __tablename__ = "projects"

  id = Column(String(36), primary_key=True, default=generate_uuid)
  name = Column(String(100), nullable=False, index=True)
  description = Column(String(255), nullable=True)
  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
