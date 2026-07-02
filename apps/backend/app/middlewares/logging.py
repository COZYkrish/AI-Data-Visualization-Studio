import time
import uuid
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("app.middleware.logging")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
  async def dispatch(self, request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    duration = (time.time() - start_time) * 1000  # Duration in milliseconds
    
    # Log request details
    extra = {
      "request_id": request_id,
      "method": request.method,
      "path": request.url.path,
      "status_code": response.status_code,
      "duration_ms": round(duration, 2)
    }
    
    logger.info(
      f"HTTP {request.method} {request.url.path} finished with status {response.status_code} in {extra['duration_ms']}ms",
      extra=extra
    )
    
    # Expose Request ID in response headers
    response.headers["X-Request-ID"] = request_id
    return response
