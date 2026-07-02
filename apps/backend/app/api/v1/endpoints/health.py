from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from app.database.session import get_db
from app.schemas.response import APIResponse

router = APIRouter()

@router.get("/live", response_model=APIResponse[str])
def liveness():
  """Liveness check to verify FastAPI process is running."""
  return APIResponse[str](
    success=True,
    message="Service is live.",
    data="OK"
  )

@router.get("/ready", response_model=APIResponse[str])
def readiness(db: Session = Depends(get_db)):
  """Readiness check to verify external dependencies (e.g. database)."""
  try:
    # Execute a simple query to verify database connection pool is operational
    db.execute(text("SELECT 1"))
    return APIResponse[str](
      success=True,
      message="Service is ready.",
      data="OK"
    )
  except Exception as e:
    from app.exceptions import APIException
    raise APIException(
      status_code=503,
      code="DATABASE_UNAVAILABLE",
      message="Database connectivity check failed.",
      details=[str(e)]
    )

@router.get("/health", response_model=APIResponse[dict])
def health_check(db: Session = Depends(get_db)):
  """General health summary."""
  db_ok = True
  try:
    db.execute(text("SELECT 1"))
  except Exception:
    db_ok = False

  return APIResponse[dict](
    success=True,
    message="System health status.",
    data={
      "status": "healthy" if db_ok else "degraded",
      "database": "connected" if db_ok else "disconnected",
      "version": "1.0.0"
    }
  )
