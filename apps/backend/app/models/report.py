from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
import enum
from app.database.session import Base
from app.models.project import generate_uuid

# Use JSONB for PostgreSQL, fallback to JSON for SQLite (during testing)
JSONType = JSON().with_variant(JSONB, "postgresql")

class ExportFormat(str, enum.Enum):
    PDF = "pdf"
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"

class ExportStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    template_type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g., "Executive Summary", "Full Report"
    
    # Store selected sections, layout configs
    configuration: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="reports")
    export_jobs = relationship("ExportJob", back_populates="report", cascade="all, delete-orphan")

class ExportJob(Base):
    __tablename__ = "export_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    report_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=True, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    format: Mapped[ExportFormat] = mapped_column(Enum(ExportFormat), nullable=False)
    status: Mapped[ExportStatus] = mapped_column(Enum(ExportStatus), default=ExportStatus.PENDING)
    
    file_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    report = relationship("Report", back_populates="export_jobs")
