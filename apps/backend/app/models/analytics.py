from typing import Optional, Dict, Any, List
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from app.database.session import Base
from app.models.project import generate_uuid

class AnalyticsResult(Base):
    __tablename__ = "analytics_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    dataset_id: Mapped[str] = mapped_column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), unique=True, index=True)
    analysis_version: Mapped[str] = mapped_column(String(50), nullable=True) # E.g., '1.0.0'

    # Analytical payloads stored as JSON
    correlation_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    distribution_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    trend_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    outlier_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    feature_importance: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    insights: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    executive_summary: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    processing_duration: Mapped[Optional[float]] = mapped_column(Float, nullable=True) # Duration in seconds
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to dataset
    # Dataset model already has backref defined if we add it, but it's safer to just let SQLAlchemy handle it
    # We will just define the relationship here.
    dataset = relationship("Dataset")
