from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.controllers.project import project_controller
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.response import APIResponse

router = APIRouter()

@router.get("/", response_model=APIResponse[List[ProjectResponse]])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
  return project_controller.list_projects(db, skip=skip, limit=limit)

@router.post("/", response_model=APIResponse[ProjectResponse])
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
  return project_controller.create_project(db, project_in)

@router.get("/{project_id}", response_model=APIResponse[ProjectResponse])
def read_project(project_id: str, db: Session = Depends(get_db)):
  return project_controller.get_project(db, project_id)

@router.put("/{project_id}", response_model=APIResponse[ProjectResponse])
def update_project(project_id: str, project_in: ProjectUpdate, db: Session = Depends(get_db)):
  return project_controller.update_project(db, project_id, project_in)

@router.delete("/{project_id}", response_model=APIResponse[ProjectResponse])
def delete_project(project_id: str, db: Session = Depends(get_db)):
  return project_controller.delete_project(db, project_id)
