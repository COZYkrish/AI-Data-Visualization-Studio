from fastapi import APIRouter
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.project import router as project_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.profile import router as profile_router
from app.api.v1.endpoints.dataset import router as dataset_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="", tags=["System"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile_router, prefix="/profile", tags=["Profile"])
api_router.include_router(project_router, prefix="/projects", tags=["Projects"])
api_router.include_router(dataset_router, prefix="/datasets", tags=["Datasets"])
