from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

class ProjectService:
    def get_projects(self, db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Project]:
        return db.query(Project).filter(Project.owner_id == user_id).offset(skip).limit(limit).all()

    def get_project(self, db: Session, project_id: str, user_id: str) -> Project:
        project = db.query(Project).filter(Project.id == project_id, Project.owner_id == user_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project

    def create_project(self, db: Session, project_in: ProjectCreate, user_id: str) -> Project:
        db_project = Project(
            name=project_in.name,
            description=project_in.description,
            owner_id=user_id,
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project

    def update_project(self, db: Session, project_id: str, project_in: ProjectUpdate, user_id: str) -> Project:
        db_project = self.get_project(db, project_id, user_id)
        
        update_data = project_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project, field, value)
            
        # Increment version on update if content changes (simplification)
        if any(f in update_data for f in ["dataset_references", "dashboard_layout", "filters", "charts"]):
            db_project.version += 1
            
        db.commit()
        db.refresh(db_project)
        return db_project

    def delete_project(self, db: Session, project_id: str, user_id: str) -> Project:
        db_project = self.get_project(db, project_id, user_id)
        db.delete(db_project)
        db.commit()
        return db_project

    def duplicate_project(self, db: Session, project_id: str, user_id: str) -> Project:
        original = self.get_project(db, project_id, user_id)
        new_project = Project(
            name=f"{original.name} (Copy)",
            description=original.description,
            owner_id=user_id,
            dataset_references=original.dataset_references,
            dashboard_layout=original.dashboard_layout,
            filters=original.filters,
            charts=original.charts,
            analytics_results=original.analytics_results,
            ml_models=original.ml_models,
            forecast_results=original.forecast_results,
            theme=original.theme,
        )
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
        return new_project

project_service = ProjectService()
