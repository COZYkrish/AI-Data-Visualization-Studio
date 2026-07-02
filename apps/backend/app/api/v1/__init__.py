from fastapi import APIRouter
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.project import router as project_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="", tags=["System"])
api_router.include_router(project_router, prefix="/projects", tags=["Projects"])
