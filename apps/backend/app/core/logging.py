import logging
import sys
import json
from datetime import datetime
from app.config import settings

class JSONFormatter(logging.Formatter):
  def format(self, record):
    log_record = {
      "timestamp": datetime.utcnow().isoformat() + "Z",
      "level": record.levelname,
      "message": record.getMessage(),
      "logger": record.name,
    }
    # Injected middleware logs (RequestId, Path, Latency)
    if hasattr(record, "request_id"):
      log_record["request_id"] = record.request_id
    if hasattr(record, "method"):
      log_record["method"] = record.method
    if hasattr(record, "path"):
      log_record["path"] = record.path
    if hasattr(record, "status_code"):
      log_record["status_code"] = record.status_code
    if hasattr(record, "duration_ms"):
      log_record["duration_ms"] = record.duration_ms

    return json.dumps(log_record)

def setup_logging():
  logger = logging.getLogger()
  logger.setLevel(settings.LOG_LEVEL)

  # Clear existing handlers
  logger.handlers = []

  handler = logging.StreamHandler(sys.stdout)
  if settings.ENVIRONMENT == "production":
    handler.setFormatter(JSONFormatter())
  else:
    # Standard pretty output for development
    formatter = logging.Formatter(
      "[%(asctime)s] %(levelname)s in %(name)s: %(message)s"
    )
    handler.setFormatter(formatter)

  logger.addHandler(handler)
  return logger
