from app.config.base import Settings

class TestSettings(Settings):
  ENVIRONMENT: str = "testing"
  POSTGRES_DB: str = "studio_test_db"
  LOG_LEVEL: str = "WARNING"

settings = TestSettings()
