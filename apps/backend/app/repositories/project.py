from sqlalchemy.orm import Session
from typing import List, Optional
from app.repositories.base import BaseRepository
from app.models.project import Project

class ProjectRepository(BaseRepository[Project]):
  def __init__(self):
    super().__init__(Project)

  def get_by_name(self, db: Session, name: str) -> Optional[Project]:
    return db.query(self.model).filter(self.model.name == name).first()

project_repository = ProjectRepository()
