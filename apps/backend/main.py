import uvicorn
from app.core.app import create_app

app = create_app()

if __name__ == "__main__":
  # Run app. Uvicorn picks up settings from config/environment variables.
  uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
