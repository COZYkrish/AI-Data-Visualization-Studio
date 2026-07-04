from typing import Optional, Dict, Any, List
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
import enum
from app.database.session import Base
from app.models.project import generate_uuid

class UploadStatus(str, enum.Enum):
    UPLOADING = "uploading"
    UPLOADED = "uploaded"
    VALIDATING = "validating"
    PARSING = "parsing"
    CLEANING = "cleaning"
    ANALYZING = "analyzing"
    METADATA_GENERATION = "metadata_generation"
    READY = "ready"
    FAILED = "failed"
    ARCHIVED = "archived"

class JobStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. text/csv, application/json
    file_size: Mapped[int] = mapped_column(Integer, nullable=False) # in bytes
    
    row_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    column_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    upload_status: Mapped[UploadStatus] = mapped_column(Enum(UploadStatus), default=UploadStatus.UPLOADING)
    upload_progress: Mapped[int] = mapped_column(Integer, default=0) # percentage
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="datasets")
    metadata_rel = relationship("DatasetMetadata", back_populates="dataset", uselist=False, cascade="all, delete-orphan")
    jobs = relationship("ProcessingJob", back_populates="dataset", cascade="all, delete-orphan")


class DatasetMetadata(Base):
    __tablename__ = "dataset_metadata"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    dataset_id: Mapped[str] = mapped_column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), unique=True)
    
    memory_usage: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # in bytes
    missing_values: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True) # {"col_name": count}
    duplicate_rows: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    detected_columns: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True) # schema information
    detected_data_types: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True) # {"col_name": "float"}
    
    normalization_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    preprocessing_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    dataset = relationship("Dataset", back_populates="metadata_rel")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    dataset_id: Mapped[str] = mapped_column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"))
    
    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus), default=JobStatus.PENDING)
    
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    duration: Mapped[Optional[float]] = mapped_column(Float, nullable=True) # seconds
    
    error_message: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    dataset = relationship("Dataset", back_populates="jobs")
