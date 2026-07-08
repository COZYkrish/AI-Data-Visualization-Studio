from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.report import ExportFormat, ExportStatus

class ReportBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    template_type: str = Field(..., max_length=50)
    configuration: Optional[Dict[str, Any]] = None

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: str
    project_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ExportJobCreate(BaseModel):
    format: ExportFormat
    report_id: Optional[str] = None

class ExportJobResponse(BaseModel):
    id: str
    project_id: str
    report_id: Optional[str] = None
    format: ExportFormat
    status: ExportStatus
    file_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
