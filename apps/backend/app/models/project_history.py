from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from app.database.session import Base
from app.models.project import generate_uuid

# Use JSONB for PostgreSQL, fallback to JSON for SQLite (during testing)
JSONType = JSON().with_variant(JSONB, "postgresql")

class ProjectHistory(Base):
    __tablename__ = "project_histories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Store what changed or a summary
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="history")


class ProjectSnapshot(Base):
    __tablename__ = "project_snapshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # The complete state of the project at this point
    dataset_references: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSONType, nullable=True)
    dashboard_layout: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    filters: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    charts: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSONType, nullable=True)
    analytics_results: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    ml_models: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    forecast_results: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    theme: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="snapshots")
