"""
ML Utils — Phase 7

Responsibility: Shared helper functions used across all ML services.
Covers file-path resolution, model directory initialisation,
and JSON-safe type conversion for ML outputs.
"""

import os
import math
from typing import Any

# Root directory for serialised models
MODELS_DIR = os.path.join("uploads", "models")


def ensure_models_dir() -> None:
    """Create the models storage directory if it does not exist."""
    os.makedirs(MODELS_DIR, exist_ok=True)


def model_file_path(model_id: str) -> str:
    """Return the absolute-safe relative path for a joblib model file."""
    ensure_models_dir()
    return os.path.join(MODELS_DIR, f"{model_id}.joblib")


def json_safe(value: Any) -> Any:
    """
    Recursively convert NumPy / pandas scalar types to native Python types
    so that Pydantic / JSON serialisation never fails.
    """
    import numpy as np  # type: ignore[import-untyped]

    if isinstance(value, dict):
        return {k: json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_safe(v) for v in value]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        v = float(value)
        return None if math.isnan(v) or math.isinf(v) else v
    if isinstance(value, np.ndarray):
        return json_safe(value.tolist())
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    return value
