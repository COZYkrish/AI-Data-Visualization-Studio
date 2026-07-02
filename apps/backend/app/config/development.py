from app.config.base import Settings

class DevSettings(Settings):
  ENVIRONMENT: str = "development"
  LOG_LEVEL: str = "DEBUG"

settings = DevSettings()
