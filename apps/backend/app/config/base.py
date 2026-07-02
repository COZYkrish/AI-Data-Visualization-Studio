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

  @property
  def db_url(self) -> str:
    if self.DATABASE_URL:
      return self.DATABASE_URL
    return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

  class Config:
    env_file = ".env"
    case_sensitive = True
