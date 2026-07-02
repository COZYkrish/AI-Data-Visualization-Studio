from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.schemas.response import APIResponse, APIError, APIErrorDetail

class APIException(Exception):
  def __init__(self, status_code: int, code: str, message: str, details: list = None):
    self.status_code = status_code
    self.code = code
    self.message = message
    self.details = details or []

def setup_exception_handlers(app: FastAPI):
  # Custom API exceptions
  @app.exception_handler(APIException)
  async def api_exception_handler(request: Request, exc: APIException):
    response_content = APIResponse(
      success=False,
      message=exc.message,
      error=APIError(
        code=exc.code,
        details=[APIErrorDetail(issue=d) if isinstance(d, str) else APIErrorDetail(**d) for d in exc.details]
      )
    )
    return JSONResponse(
      status_code=exc.status_code,
      content=response_content.dict()
    )

  # Pydantic request validation exceptions
  @app.exception_handler(RequestValidationError)
  async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = []
    for err in exc.errors():
      field_path = " -> ".join(str(p) for p in err["loc"])
      details.append(APIErrorDetail(field=field_path, issue=err["msg"]))
      
    response_content = APIResponse(
      success=False,
      message="Validation Error",
      error=APIError(
        code="VALIDATION_ERROR",
        details=details
      )
    )
    return JSONResponse(
      status_code=422,
      content=response_content.dict()
    )

  # Global unhandled exceptions
  @app.exception_handler(Exception)
  async def global_exception_handler(request: Request, exc: Exception):
    response_content = APIResponse(
      success=False,
      message="An internal server error occurred",
      error=APIError(
        code="INTERNAL_SERVER_ERROR",
        details=[APIErrorDetail(issue=str(exc))]
      )
    )
    return JSONResponse(
      status_code=500,
      content=response_content.dict()
    )
