import json
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.report import Report, ExportJob, ExportFormat, ExportStatus

class ReportService:
    def create_report(self, db: Session, project_id: str, name: str, template_type: str, configuration: dict = None, description: str = None) -> Report:
        report = Report(
            project_id=project_id,
            name=name,
            template_type=template_type,
            configuration=configuration or {},
            description=description
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    def get_reports(self, db: Session, project_id: str) -> List[Report]:
        return db.query(Report).filter(Report.project_id == project_id).order_by(Report.created_at.desc()).all()

    def get_report(self, db: Session, report_id: str) -> Report:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return report

report_service = ReportService()
