from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.report import (
    ReportCreate, ReportResponse, 
    ExportJobCreate, ExportJobResponse
)
from app.schemas.response import APIResponse
from app.services.report.report_service import report_service
from app.services.report.report_builder import report_builder
from app.services.report.export_job_service import export_job_service
from app.services.project.project_service import project_service
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.report import ExportStatus

router = APIRouter()

@router.post("/", response_model=APIResponse[ReportResponse])
def generate_report(project_id: str, report_in: ReportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify project access
    project_service.get_project(db, project_id, current_user.id)
    
    report = report_service.create_report(
        db=db,
        project_id=project_id,
        name=report_in.name,
        template_type=report_in.template_type,
        configuration=report_in.configuration,
        description=report_in.description
    )
    return APIResponse(success=True, data=report)

@router.get("/project/{project_id}", response_model=APIResponse[List[ReportResponse]])
def list_reports(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify project access
    project_service.get_project(db, project_id, current_user.id)
    reports = report_service.get_reports(db, project_id)
    return APIResponse(success=True, data=reports)

@router.post("/project/{project_id}/export", response_model=APIResponse[ExportJobResponse])
def request_export(project_id: str, export_in: ExportJobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = project_service.get_project(db, project_id, current_user.id)
    
    report = None
    if export_in.report_id:
        report = report_service.get_report(db, export_in.report_id)
        if report.project_id != project_id:
            raise HTTPException(status_code=400, detail="Report does not belong to this project")
            
    job = export_job_service.create_job(db, project_id, export_in.format, export_in.report_id)
    
    # Synchronously generate for this phase (as per instructions)
    # In a full production system this would be a background task
    try:
        export_job_service.update_job_status(db, job.id, ExportStatus.PROCESSING)
        filepath = report_builder.build_export(project, report, export_in.format)
        
        # We would typically upload to S3 and return a URL. 
        # Here we return the local path or a download endpoint.
        # For demonstration, we just use the filepath.
        file_url = f"/api/v1/downloads/{filepath.split('/')[-1]}"
        if '\\' in filepath: # handle windows paths
             file_url = f"/api/v1/downloads/{filepath.split('\\')[-1]}"
        
        job = export_job_service.update_job_status(db, job.id, ExportStatus.COMPLETED, file_url=file_url)
    except Exception as e:
        job = export_job_service.update_job_status(db, job.id, ExportStatus.FAILED, error_message=str(e))
        
    return APIResponse(success=True, data=job)

@router.get("/export/{job_id}", response_model=APIResponse[ExportJobResponse])
def get_export_status(job_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = export_job_service.get_job(db, job_id)
    # verify user owns project
    project_service.get_project(db, job.project_id, current_user.id)
    return APIResponse(success=True, data=job)
