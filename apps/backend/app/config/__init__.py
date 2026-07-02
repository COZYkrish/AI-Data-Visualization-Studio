import os

env = os.getenv("ENV", "development").lower()

if env == "production":
  from app.config.production import settings
elif env == "testing":
  from app.config.testing import settings
else:
  from app.config.development import settings
