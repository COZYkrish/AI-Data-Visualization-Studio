from app.config.base import Settings

class ProdSettings(Settings):
  ENVIRONMENT: str = "production"
  LOG_LEVEL: str = "INFO"

settings = ProdSettings()
