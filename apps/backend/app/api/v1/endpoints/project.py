from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse, 
    ProjectSnapshotCreate, ProjectSnapshotResponse, ProjectHistoryResponse
)
from app.schemas.response import APIResponse
from app.services.project.project_service import project_service
from app.services.project.project_history_service import project_history_service
from app.services.project.snapshot_service import snapshot_service
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=APIResponse[List[ProjectResponse]])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = project_service.get_projects(db, user_id=current_user.id, skip=skip, limit=limit)
    return APIResponse(success=True, data=projects)

@router.post("/", response_model=APIResponse[ProjectResponse])
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = project_service.create_project(db, project_in, current_user.id)
    project_history_service.record_history(db, project.id, project.version, "created", "Project created")
    return APIResponse(success=True, data=project)

@router.get("/{project_id}", response_model=APIResponse[ProjectResponse])
def read_project(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = project_service.get_project(db, project_id, current_user.id)
    return APIResponse(success=True, data=project)

@router.patch("/{project_id}", response_model=APIResponse[ProjectResponse])
def update_project(project_id: str, project_in: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = project_service.update_project(db, project_id, project_in, current_user.id)
    project_history_service.record_history(db, project.id, project.version, "updated", "Project updated")
    return APIResponse(success=True, data=project)

@router.delete("/{project_id}", response_model=APIResponse[ProjectResponse])
def delete_project(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = project_service.delete_project(db, project_id, current_user.id)
    return APIResponse(success=True, data=project)

@router.post("/{project_id}/duplicate", response_model=APIResponse[ProjectResponse])
def duplicate_project(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_project = project_service.duplicate_project(db, project_id, current_user.id)
    project_history_service.record_history(db, new_project.id, new_project.version, "duplicated", f"Duplicated from {project_id}")
    return APIResponse(success=True, data=new_project)

@router.post("/{project_id}/favorite", response_model=APIResponse[ProjectResponse])
def favorite_project(project_id: str, favorite: bool = True, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = project_service.update_project(db, project_id, ProjectUpdate(favorite=favorite), current_user.id)
    return APIResponse(success=True, data=project)

@router.post("/{project_id}/archive", response_model=APIResponse[ProjectResponse])
def archive_project(project_id: str, archive: bool = True, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = project_service.update_project(db, project_id, ProjectUpdate(archived=archive), current_user.id)
    return APIResponse(success=True, data=project)

@router.get("/{project_id}/history", response_model=APIResponse[List[ProjectHistoryResponse]])
def get_project_history(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify access
    project_service.get_project(db, project_id, current_user.id)
    history = project_history_service.get_project_history(db, project_id)
    return APIResponse(success=True, data=history)

@router.post("/{project_id}/snapshots", response_model=APIResponse[ProjectSnapshotResponse])
def create_snapshot(project_id: str, snapshot_in: ProjectSnapshotCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = project_service.get_project(db, project_id, current_user.id)
    snapshot = snapshot_service.create_snapshot(db, project, snapshot_in.name, snapshot_in.description)
    project_history_service.record_history(db, project.id, project.version, "snapshot_created", f"Snapshot '{snapshot_in.name}' created")
    return APIResponse(success=True, data=snapshot)

@router.get("/{project_id}/snapshots", response_model=APIResponse[List[ProjectSnapshotResponse]])
def list_snapshots(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project_service.get_project(db, project_id, current_user.id)
    snapshots = snapshot_service.get_snapshots(db, project_id)
    return APIResponse(success=True, data=snapshots)

@router.post("/{project_id}/snapshots/{snapshot_id}/restore", response_model=APIResponse[ProjectResponse])
def restore_snapshot(project_id: str, snapshot_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = project_service.get_project(db, project_id, current_user.id)
    restored_project = snapshot_service.restore_snapshot(db, snapshot_id, project)
    project_history_service.record_history(db, project.id, project.version, "snapshot_restored", f"Restored from snapshot {snapshot_id}")
    return APIResponse(success=True, data=restored_project)
