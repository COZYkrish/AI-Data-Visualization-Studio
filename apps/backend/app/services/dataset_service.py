import os
import uuid
import shutil
import asyncio
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
import structlog
from typing import Dict, Any

from app.models.dataset import UploadStatus, JobStatus
from app.repositories.dataset import DatasetRepository
from app.schemas.dataset import DatasetCreate, DatasetUpdate
from app.services.file_processing.validator import validate_upload_file
from app.services.file_processing.parser import parse_file
from app.services.file_processing.cleaner import clean_dataset
from app.services.file_processing.detector import detect_data_types
from app.services.file_processing.statistics import generate_statistics
from app.services.file_processing.metadata import compile_metadata
from app.services.file_processing.preview import generate_preview

logger = structlog.get_logger(__name__)

UPLOAD_DIR = "uploads"

class DatasetService:
    def __init__(self, session: Session):
        self.session = session
        self.repository = DatasetRepository(session)
        
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)

    async def process_upload(self, user_id: str, file: UploadFile) -> Dict[str, Any]:
        """Orchestrates the entire upload and processing pipeline synchronously."""
        logger.info("dataset_upload_started", user_id=user_id, filename=file.filename)
        
        # 1. Validation
        validate_upload_file(file)
        
        # 2. Temporary Storage
        file_ext = os.path.splitext(file.filename)[1].lower()
        unique_id = str(uuid.uuid4())
        stored_filename = f"{unique_id}{file_ext}"
        stored_filepath = os.path.join(UPLOAD_DIR, stored_filename)
        
        file.file.seek(0)
        with open(stored_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(stored_filepath)
        
        # 3. Create initial DB records
        dataset_create = DatasetCreate(
            original_filename=file.filename,
            stored_filename=stored_filename,
            file_type=file.content_type,
            file_size=file_size,
            user_id=user_id
        )
        dataset = self.repository.create(user_id, dataset_create)
        metadata_record = self.repository.create_metadata(dataset.id)
        job = self.repository.create_job(dataset.id)
        
        try:
            # Update status
            self.repository.update(dataset, DatasetUpdate(upload_status=UploadStatus.PARSING, upload_progress=10))
            self.repository.update_job(job, {"status": JobStatus.IN_PROGRESS})
            
            # 4. Parsing
            df = parse_file(stored_filepath, file.content_type, file.filename)
            
            self.repository.update(dataset, DatasetUpdate(upload_status=UploadStatus.CLEANING, upload_progress=30))
            
            # 5. Cleaning
            df, cleaning_stats = clean_dataset(df)
            
            self.repository.update(dataset, DatasetUpdate(upload_status=UploadStatus.ANALYZING, upload_progress=60))
            
            # 6. Type Detection & Statistics
            data_types = detect_data_types(df)
            statistics = generate_statistics(df, data_types)
            
            self.repository.update(dataset, DatasetUpdate(upload_status=UploadStatus.METADATA_GENERATION, upload_progress=80))
            
            # 7. Metadata Generation
            metadata_dict = compile_metadata(
                cleaning_stats=cleaning_stats,
                data_types=data_types,
                memory_usage=statistics['global']['memory_usage_bytes'],
                columns=df.columns.tolist()
            )
            self.repository.update_metadata(metadata_record, metadata_dict)
            
            # Finalize
            self.repository.update(dataset, DatasetUpdate(
                row_count=len(df),
                column_count=len(df.columns),
                upload_status=UploadStatus.READY,
                upload_progress=100
            ))
            
            self.repository.update_job(job, {"status": JobStatus.COMPLETED})
            
            logger.info("dataset_upload_completed", dataset_id=dataset.id, user_id=user_id)
            
            return {
                "dataset_id": dataset.id,
                "message": "Dataset uploaded and processed successfully."
            }
            
        except Exception as e:
            logger.error("dataset_upload_failed", dataset_id=dataset.id, user_id=user_id, error=str(e))
            self.repository.update(dataset, DatasetUpdate(upload_status=UploadStatus.FAILED))
            self.repository.update_job(job, {"status": JobStatus.FAILED, "error_message": str(e)})
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

    def get_preview(self, dataset_id: str, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
        """Returns a paginated preview of the dataset."""
        dataset = self.repository.get_by_id(dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        stored_filepath = os.path.join(UPLOAD_DIR, dataset.stored_filename)
        if not os.path.exists(stored_filepath):
            raise HTTPException(status_code=404, detail="Dataset file missing from storage")
            
        df = parse_file(stored_filepath, dataset.file_type, dataset.original_filename)
        # Apply cleaning to ensure consistency with DB metadata
        df, _ = clean_dataset(df)
        
        return generate_preview(df, limit, offset)

    def get_summary(self, dataset_id: str) -> Dict[str, Any]:
        """Returns dataset details and statistics."""
        dataset = self.repository.get_by_id(dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        stored_filepath = os.path.join(UPLOAD_DIR, dataset.stored_filename)
        if not os.path.exists(stored_filepath):
            raise HTTPException(status_code=404, detail="Dataset file missing from storage")
            
        df = parse_file(stored_filepath, dataset.file_type, dataset.original_filename)
        df, _ = clean_dataset(df)
        data_types = detect_data_types(df)
        stats = generate_statistics(df, data_types)
        
        return {
            "dataset": dataset,
            "statistics": stats
        }
