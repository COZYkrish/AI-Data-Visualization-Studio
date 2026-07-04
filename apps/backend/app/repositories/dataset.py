from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.dataset import Dataset, DatasetMetadata, ProcessingJob, UploadStatus, JobStatus
from app.schemas.dataset import DatasetCreate, DatasetUpdate

class DatasetRepository:
    def __init__(self, session: Session):
        self.session = session

    # --- Dataset ---
    def create(self, user_id: str, obj_in: DatasetCreate) -> Dataset:
        db_obj = Dataset(
            user_id=user_id,
            original_filename=obj_in.original_filename,
            stored_filename=obj_in.stored_filename,
            file_type=obj_in.file_type,
            file_size=obj_in.file_size
        )
        self.session.add(db_obj)
        self.session.commit()
        self.session.refresh(db_obj)
        return db_obj

    def get_by_id(self, id: str) -> Optional[Dataset]:
        return self.session.execute(
            select(Dataset).where(Dataset.id == id)
        ).scalar_one_or_none()

    def get_by_user_id(self, user_id: str, skip: int = 0, limit: int = 20) -> Tuple[List[Dataset], int]:
        total = self.session.execute(
            select(func.count()).select_from(Dataset).where(Dataset.user_id == user_id)
        ).scalar_one()
        
        items = self.session.execute(
            select(Dataset)
            .where(Dataset.user_id == user_id)
            .order_by(Dataset.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).scalars().all()
        
        return list(items), total

    def update(self, db_obj: Dataset, obj_in: DatasetUpdate) -> Dataset:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        self.session.add(db_obj)
        self.session.commit()
        self.session.refresh(db_obj)
        return db_obj

    def delete(self, id: str) -> bool:
        db_obj = self.get_by_id(id)
        if db_obj:
            self.session.delete(db_obj)
            self.session.commit()
            return True
        return False
        
    # --- Metadata ---
    def create_metadata(self, dataset_id: str) -> DatasetMetadata:
        db_obj = DatasetMetadata(dataset_id=dataset_id)
        self.session.add(db_obj)
        self.session.commit()
        self.session.refresh(db_obj)
        return db_obj
        
    def update_metadata(self, db_obj: DatasetMetadata, update_data: dict) -> DatasetMetadata:
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        self.session.add(db_obj)
        self.session.commit()
        self.session.refresh(db_obj)
        return db_obj

    # --- Processing Jobs ---
    def create_job(self, dataset_id: str) -> ProcessingJob:
        db_obj = ProcessingJob(dataset_id=dataset_id, status=JobStatus.PENDING)
        self.session.add(db_obj)
        self.session.commit()
        self.session.refresh(db_obj)
        return db_obj
        
    def update_job(self, db_obj: ProcessingJob, update_data: dict) -> ProcessingJob:
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        self.session.add(db_obj)
        self.session.commit()
        self.session.refresh(db_obj)
        return db_obj
