from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.responses import JSONResponse

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)

def setup_rate_limiting(app: FastAPI):
    app.state.limiter = limiter
    
    # Custom rate limit exception handler matching our APIResponse format
    @app.exception_handler(RateLimitExceeded)
    async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
        from app.schemas.response import APIResponse, APIError, APIErrorDetail
        response = APIResponse(
            success=False,
            message="Too many requests",
            error=APIError(
                code="RATE_LIMIT_EXCEEDED",
                details=[APIErrorDetail(issue=f"Rate limit exceeded: {exc.detail}")]
            )
        )
        return JSONResponse(
            status_code=429,
            content=response.dict()
        )
