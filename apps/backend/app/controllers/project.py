from sqlalchemy.orm import Session
from typing import List
from app.services.project import project_service
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.response import APIResponse
from app.exceptions import APIException

class ProjectController:
  def get_project(self, db: Session, project_id: str) -> APIResponse[ProjectResponse]:
    proj = project_service.get_project(db, project_id)
    if not proj:
      raise APIException(status_code=404, code="NOT_FOUND", message=f"Project with ID '{project_id}' not found.")
    return APIResponse[ProjectResponse](
      success=True,
      message="Project retrieved successfully.",
      data=ProjectResponse.from_orm(proj)
    )

  def list_projects(self, db: Session, skip: int = 0, limit: int = 100) -> APIResponse[List[ProjectResponse]]:
    projs = project_service.list_projects(db, skip=skip, limit=limit)
    data = [ProjectResponse.from_orm(p) for p in projs]
    return APIResponse[List[ProjectResponse]](
      success=True,
      message="Projects list retrieved successfully.",
      data=data,
      metadata={"total": len(data)}
    )

  def create_project(self, db: Session, project_in: ProjectCreate) -> APIResponse[ProjectResponse]:
    try:
      proj = project_service.create_project(db, project_in)
      return APIResponse[ProjectResponse](
        success=True,
        message="Project created successfully.",
        data=ProjectResponse.from_orm(proj)
      )
    except ValueError as e:
      raise APIException(status_code=400, code="BAD_REQUEST", message=str(e))

  def update_project(self, db: Session, project_id: str, project_in: ProjectUpdate) -> APIResponse[ProjectResponse]:
    proj = project_service.update_project(db, project_id, project_in)
    if not proj:
      raise APIException(status_code=404, code="NOT_FOUND", message=f"Project with ID '{project_id}' not found.")
    return APIResponse[ProjectResponse](
      success=True,
      message="Project updated successfully.",
      data=ProjectResponse.from_orm(proj)
    )

  def delete_project(self, db: Session, project_id: str) -> APIResponse[ProjectResponse]:
    proj = project_service.delete_project(db, project_id)
    if not proj:
      raise APIException(status_code=404, code="NOT_FOUND", message=f"Project with ID '{project_id}' not found.")
    return APIResponse[ProjectResponse](
      success=True,
      message="Project deleted successfully.",
      data=ProjectResponse.from_orm(proj)
    )

project_controller = ProjectController()
