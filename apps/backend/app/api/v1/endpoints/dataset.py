from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.session import get_db
from app.schemas.response import APIResponse
from app.schemas.dataset import (
    DatasetResponse, 
    PaginatedDatasetResponse, 
    DatasetSummaryResponse, 
    DatasetPreviewResponse
)
from app.services.dataset_service import DatasetService
from app.core.dependencies import get_current_active_user

router = APIRouter()

@router.post("/upload", response_model=APIResponse[Dict[str, Any]])
async def upload_dataset(
    file: UploadFile = File(...),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Uploads and processes a new dataset."""
    dataset_service = DatasetService(db)
    # Using await since process_upload is marked async
    result = await dataset_service.process_upload(current_user.id, file)
    
    return APIResponse[Dict[str, Any]](
        success=True,
        message="Dataset uploaded successfully",
        data=result
    )

@router.get("", response_model=APIResponse[PaginatedDatasetResponse])
def get_datasets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieves paginated list of datasets for the current user."""
    dataset_service = DatasetService(db)
    items, total = dataset_service.repository.get_by_user_id(current_user.id, skip, limit)
    
    response_data = PaginatedDatasetResponse(
        items=[DatasetResponse.model_validate(item) for item in items],
        total=total,
        page=(skip // limit) + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )
    
    return APIResponse[PaginatedDatasetResponse](
        success=True,
        message="Datasets retrieved successfully",
        data=response_data
    )

@router.get("/{dataset_id}", response_model=APIResponse[DatasetResponse])
def get_dataset(
    dataset_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieves details for a specific dataset."""
    dataset_service = DatasetService(db)
    dataset = dataset_service.repository.get_by_id(dataset_id)
    
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    return APIResponse[DatasetResponse](
        success=True,
        message="Dataset details retrieved",
        data=DatasetResponse.model_validate(dataset)
    )

@router.delete("/{dataset_id}", response_model=APIResponse[None])
def delete_dataset(
    dataset_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deletes a dataset and its associated file."""
    dataset_service = DatasetService(db)
    dataset = dataset_service.repository.get_by_id(dataset_id)
    
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    import os
    from app.services.dataset_service import UPLOAD_DIR
    
    stored_filepath = os.path.join(UPLOAD_DIR, dataset.stored_filename)
    if os.path.exists(stored_filepath):
        os.remove(stored_filepath)
        
    dataset_service.repository.delete(dataset_id)
    
    return APIResponse[None](
        success=True,
        message="Dataset deleted successfully"
    )

@router.get("/{dataset_id}/preview", response_model=APIResponse[DatasetPreviewResponse])
def get_dataset_preview(
    dataset_id: str,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieves a paginated preview of the dataset rows."""
    dataset_service = DatasetService(db)
    dataset = dataset_service.repository.get_by_id(dataset_id)
    
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    preview_data = dataset_service.get_preview(dataset_id, limit, offset)
    preview_data['dataset_id'] = dataset_id
    
    return APIResponse[DatasetPreviewResponse](
        success=True,
        message="Dataset preview retrieved",
        data=DatasetPreviewResponse(**preview_data)
    )

@router.get("/{dataset_id}/summary", response_model=APIResponse[DatasetSummaryResponse])
def get_dataset_summary(
    dataset_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieves dataset details and comprehensive statistical summary."""
    dataset_service = DatasetService(db)
    dataset = dataset_service.repository.get_by_id(dataset_id)
    
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    summary_data = dataset_service.get_summary(dataset_id)
    
    response_data = DatasetSummaryResponse(
        dataset=DatasetResponse.model_validate(summary_data['dataset']),
        statistics=summary_data['statistics']
    )
    
    return APIResponse[DatasetSummaryResponse](
        success=True,
        message="Dataset summary retrieved",
        data=response_data
    )
