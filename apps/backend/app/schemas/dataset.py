from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.models.dataset import UploadStatus, JobStatus

# Base schema
class DatasetBase(BaseModel):
    original_filename: str
    file_size: int

# Schema for creating a dataset record
class DatasetCreate(DatasetBase):
    user_id: str
    stored_filename: str
    file_type: str

class DatasetUpdate(BaseModel):
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    upload_status: Optional[UploadStatus] = None
    upload_progress: Optional[int] = None

# Metadata Schemas
class DatasetMetadataBase(BaseModel):
    memory_usage: Optional[int] = None
    missing_values: Optional[Dict[str, int]] = None
    duplicate_rows: Optional[int] = None
    detected_columns: Optional[Dict[str, Any]] = None
    detected_data_types: Optional[Dict[str, str]] = None
    normalization_status: Optional[str] = None
    preprocessing_status: Optional[str] = None

class DatasetMetadataResponse(DatasetMetadataBase):
    id: str
    dataset_id: str
    model_config = ConfigDict(from_attributes=True)

# Job Schemas
class ProcessingJobBase(BaseModel):
    status: JobStatus
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration: Optional[float] = None

class ProcessingJobResponse(ProcessingJobBase):
    id: str
    dataset_id: str
    model_config = ConfigDict(from_attributes=True)

# Main Dataset Response
class DatasetResponse(DatasetBase):
    id: str
    user_id: str
    stored_filename: str
    file_type: str
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    upload_status: UploadStatus
    upload_progress: int
    created_at: datetime
    updated_at: datetime
    
    metadata: Optional[DatasetMetadataResponse] = None
    jobs: List[ProcessingJobResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Pagination Schemas
class PaginatedDatasetResponse(BaseModel):
    items: List[DatasetResponse]
    total: int
    page: int
    size: int
    pages: int

# Schema for summary response
class DatasetSummaryResponse(BaseModel):
    dataset: DatasetResponse
    statistics: Optional[Dict[str, Any]] = None

# Schema for preview response
class DatasetPreviewResponse(BaseModel):
    dataset_id: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    total_rows: int
    limit: int
    offset: int
