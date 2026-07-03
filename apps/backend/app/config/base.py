import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  APP_NAME: str = "AI Data Visualization Studio"
  API_V1_STR: str = "/api/v1"
  ENVIRONMENT: str = "development"
  
  # PostgreSQL Credentials
  POSTGRES_SERVER: str = "localhost"
  POSTGRES_PORT: str = "5432"
  POSTGRES_USER: str = "postgres"
  POSTGRES_PASSWORD: str = "postgres"
  POSTGRES_DB: str = "studio_db"
  DATABASE_URL: Optional[str] = None
  
  # JWT & Security Settings
  SECRET_KEY: str = "change-me-to-a-long-random-string"
  ALGORITHM: str = "HS256"
  ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
  REFRESH_TOKEN_EXPIRE_DAYS: int = 30
  REFRESH_TOKEN_COOKIE_NAME: str = "studio_refresh"
  MAX_LOGIN_ATTEMPTS: int = 5
  LOCKOUT_MINUTES: int = 15
  FRONTEND_URL: str = "http://localhost:5173"
  AVATAR_UPLOAD_DIR: str = "uploads/avatars"
  MAX_AVATAR_SIZE_BYTES: int = 5_000_000

  @property
  def db_url(self) -> str:
    if self.DATABASE_URL:
      return self.DATABASE_URL
    return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

  class Config:
    env_file = ".env"
    case_sensitive = True
