from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="The name of the project")
    description: Optional[str] = Field(None, max_length=255, description="Brief summary of project objectives")
    status: Optional[str] = Field("active")
    favorite: Optional[bool] = Field(False)
    archived: Optional[bool] = Field(False)

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    status: Optional[str] = None
    favorite: Optional[bool] = None
    archived: Optional[bool] = None
    dataset_references: Optional[List[Dict[str, Any]]] = None
    dashboard_layout: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None
    charts: Optional[List[Dict[str, Any]]] = None
    analytics_results: Optional[Dict[str, Any]] = None
    ml_models: Optional[Dict[str, Any]] = None
    forecast_results: Optional[Dict[str, Any]] = None
    theme: Optional[Dict[str, Any]] = None

class ProjectResponse(ProjectBase):
    id: str
    owner_id: str
    version: int
    dataset_references: Optional[List[Dict[str, Any]]] = None
    dashboard_layout: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None
    charts: Optional[List[Dict[str, Any]]] = None
    analytics_results: Optional[Dict[str, Any]] = None
    ml_models: Optional[Dict[str, Any]] = None
    forecast_results: Optional[Dict[str, Any]] = None
    theme: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    last_opened_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProjectSnapshotBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)

class ProjectSnapshotCreate(ProjectSnapshotBase):
    pass

class ProjectSnapshotResponse(ProjectSnapshotBase):
    id: str
    project_id: str
    version: int
    created_at: datetime
    
    class Config:
        from_attributes = True
        
class ProjectHistoryResponse(BaseModel):
    id: str
    project_id: str
    version: int
    action: str
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
