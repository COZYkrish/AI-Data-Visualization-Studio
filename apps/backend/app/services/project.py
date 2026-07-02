from sqlalchemy.orm import Session
from typing import List, Optional
from app.repositories.project import project_repository
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.models.project import Project

class ProjectService:
  def get_project(self, db: Session, project_id: str) -> Optional[Project]:
    return project_repository.get(db, project_id)

  def list_projects(self, db: Session, skip: int = 0, limit: int = 100) -> List[Project]:
    return project_repository.list(db, skip=skip, limit=limit)

  def create_project(self, db: Session, project_in: ProjectCreate) -> Project:
    # Business logic check: name uniqueness
    existing = project_repository.get_by_name(db, name=project_in.name)
    if existing:
      raise ValueError(f"A project with the name '{project_in.name}' already exists.")
    
    return project_repository.create(db, project_in.dict())

  def update_project(self, db: Session, project_id: str, project_in: ProjectUpdate) -> Optional[Project]:
    db_project = project_repository.get(db, project_id)
    if not db_project:
      return None
    return project_repository.update(db, db_project, project_in.dict(exclude_unset=True))

  def delete_project(self, db: Session, project_id: str) -> Optional[Project]:
    return project_repository.delete(db, project_id)

project_service = ProjectService()
