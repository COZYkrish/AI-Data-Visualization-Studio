from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.logging import setup_logging
from app.middlewares.logging import RequestLoggingMiddleware
from app.exceptions import setup_exception_handlers
from app.api.v1 import api_router

def create_app() -> FastAPI:
  # Initialize structured logging
  setup_logging()

  app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
  )

  # Configure CORS
  app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  # Register custom middleware
  app.add_middleware(RequestLoggingMiddleware)

  # Register global exception handlers
  setup_exception_handlers(app)

  # Register api routes under version prefix
  app.include_router(api_router, prefix=settings.API_V1_STR)

  return app
