"""
Model Persistence Service — Phase 7

Responsibility: Serialise trained scikit-learn (and compatible) models
to disk using joblib, and deserialise them for inference.
Also stores training metadata (preprocessors, feature list) alongside
the model so that inference-time transformations are reproducible.
"""

import os
from typing import Any, Dict, Optional

import structlog

from app.services.machine_learning.utils import model_file_path, ensure_models_dir

logger = structlog.get_logger(__name__)


class ModelPersistenceService:
    """Handles serialisation and deserialisation of trained ML models."""

    def save(self, model_id: str, payload: Dict[str, Any]) -> str:
        """
        Serialise the model payload dict to disk.

        The payload should contain at minimum:
          - "model": the fitted sklearn estimator
          - "feature_columns": list[str]
          - "scaler": optional fitted scaler
          - "target_encoder": optional fitted LabelEncoder
          - "encoding_map": optional dict

        Returns the file path where the model was saved.
        """
        import joblib  # type: ignore[import-untyped]

        ensure_models_dir()
        path = model_file_path(model_id)
        joblib.dump(payload, path)
        logger.info("model_saved", model_id=model_id, path=path)
        return path

    def load(self, model_id: str) -> Dict[str, Any]:
        """
        Load a serialised model payload from disk.

        Raises FileNotFoundError if the model does not exist.
        """
        import joblib  # type: ignore[import-untyped]

        path = model_file_path(model_id)
        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Model file not found for model_id='{model_id}'. "
                "The model may have been deleted or never trained successfully."
            )
        payload = joblib.load(path)
        logger.info("model_loaded", model_id=model_id)
        return payload  # type: ignore[return-value]

    def delete(self, model_id: str) -> bool:
        """Delete serialised model file from disk. Returns True if deleted."""
        path = model_file_path(model_id)
        if os.path.exists(path):
            os.remove(path)
            logger.info("model_deleted", model_id=model_id)
            return True
        return False

    def exists(self, model_id: str) -> bool:
        """Return True if a serialised model file exists for this ID."""
        return os.path.exists(model_file_path(model_id))
