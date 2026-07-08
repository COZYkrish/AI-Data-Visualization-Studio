from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.project_history import ProjectHistory

class ProjectHistoryService:
    def record_history(self, db: Session, project_id: str, version: int, action: str, description: Optional[str] = None) -> ProjectHistory:
        history = ProjectHistory(
            project_id=project_id,
            version=version,
            action=action,
            description=description
        )
        db.add(history)
        db.commit()
        db.refresh(history)
        return history

    def get_project_history(self, db: Session, project_id: str) -> List[ProjectHistory]:
        return db.query(ProjectHistory).filter(ProjectHistory.project_id == project_id).order_by(ProjectHistory.created_at.desc()).all()

project_history_service = ProjectHistoryService()
