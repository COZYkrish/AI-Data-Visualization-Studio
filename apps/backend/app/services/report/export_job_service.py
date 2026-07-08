from typing import List
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException
from app.models.report import ExportJob, ExportFormat, ExportStatus

class ExportJobService:
    def create_job(self, db: Session, project_id: str, format: ExportFormat, report_id: str | None = None) -> ExportJob:
        job = ExportJob(
            project_id=project_id,
            report_id=report_id,
            format=format,
            status=ExportStatus.PENDING
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job

    def get_job(self, db: Session, job_id: str) -> ExportJob:
        job = db.query(ExportJob).filter(ExportJob.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Export job not found")
        return job

    def update_job_status(self, db: Session, job_id: str, status: ExportStatus, file_url: str | None = None, error_message: str | None = None) -> ExportJob:
        job = self.get_job(db, job_id)
        job.status = status
        
        if file_url:
            job.file_url = file_url
            
        if error_message:
            job.error_message = error_message
            
        if status in [ExportStatus.COMPLETED, ExportStatus.FAILED]:
            job.completed_at = datetime.utcnow()
            
        db.commit()
        db.refresh(job)
        return job

export_job_service = ExportJobService()
