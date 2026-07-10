from fastapi import APIRouter
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.project import router as project_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.profile import router as profile_router
from app.api.v1.endpoints.dataset import router as dataset_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.ml import router as ml_router
from app.api.v1.endpoints.report import router as report_router
from app.api.v1.endpoints.premium import router as premium_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="", tags=["System"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile_router, prefix="/profile", tags=["Profile"])
api_router.include_router(project_router, prefix="/projects", tags=["Projects"])
api_router.include_router(dataset_router, prefix="/datasets", tags=["Datasets"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(ml_router, prefix="/ml", tags=["Machine Learning"])
api_router.include_router(report_router, prefix="/reports", tags=["Reports"])
api_router.include_router(premium_router, prefix="", tags=["Premium"])
