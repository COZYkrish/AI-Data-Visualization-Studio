"""
Prediction Service — Phase 7

Responsibility: Apply a trained model to new input data to generate
predictions, probability estimates, and feature contributions.
Supports single observation and batch prediction.

The service:
  1. Loads the serialised model payload from disk
  2. Applies the saved preprocessors (scaler, encoders)
  3. Runs model.predict / predict_proba
  4. Returns a structured prediction result
"""

from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
import structlog

from app.services.machine_learning.model_persistence_service import ModelPersistenceService
from app.services.machine_learning.utils import json_safe

logger = structlog.get_logger(__name__)


class PredictionService:
    """Applies saved models to new observations."""

    def __init__(self) -> None:
        self.persistence = ModelPersistenceService()

    # ------------------------------------------------------------------
    # Internal: transform input using saved preprocessors
    # ------------------------------------------------------------------

    def _transform_input(
        self, input_df: pd.DataFrame, payload: Dict[str, Any]
    ) -> pd.DataFrame:
        """
        Apply the same preprocessing pipeline used during training:
          1. Align columns to training feature set
          2. Handle missing values (fill with 0 / "Unknown")
          3. Apply saved scaler
        """
        feature_cols: List[str] = payload.get("feature_columns", [])
        scaler = payload.get("scaler")

        # Add missing columns with default values
        for col in feature_cols:
            if col not in input_df.columns:
                input_df[col] = 0

        # Keep only training features in correct order
        input_df = input_df[feature_cols].copy()

        # Fill any NaN
        input_df = input_df.fillna(0)

        # Apply scaler
        if scaler is not None:
            scaled = scaler.transform(input_df)
            input_df = pd.DataFrame(scaled, columns=feature_cols)

        return input_df

    # ------------------------------------------------------------------
    # Single prediction
    # ------------------------------------------------------------------

    def predict_single(
        self, model_id: str, input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Predict a single observation.

        Returns:
          predicted_value        — the model output (regression value / class label)
          prediction_confidence  — probability for the predicted class (classification only)
          feature_contributions  — for linear models: signed weighted contributions
        """
        payload = self.persistence.load(model_id)
        model = payload["model"]
        feature_cols: List[str] = payload.get("feature_columns", [])

        input_df = pd.DataFrame([input_data])
        input_df = self._transform_input(input_df, payload)

        result: Dict[str, Any] = {"model_id": model_id}

        # Predict
        pred = model.predict(input_df)
        raw_pred = pred[0]

        # Decode target label if classification with LabelEncoder
        target_encoder = payload.get("target_encoder")
        if target_encoder is not None:
            try:
                label = target_encoder.inverse_transform([int(raw_pred)])[0]
                result["predicted_value"] = {"label": str(label), "encoded": int(raw_pred)}
            except Exception:
                result["predicted_value"] = {"value": json_safe(raw_pred)}
        else:
            result["predicted_value"] = {"value": json_safe(raw_pred)}

        # Probability confidence (classification)
        confidence: Optional[float] = None
        if hasattr(model, "predict_proba"):
            try:
                proba = model.predict_proba(input_df)[0]
                confidence = float(np.max(proba))
                result["class_probabilities"] = json_safe(
                    {str(cls): float(p) for cls, p in zip(model.classes_, proba)}
                )
            except Exception:
                pass
        result["prediction_confidence"] = confidence

        # Feature contributions (linear models only)
        feature_contributions: Optional[Dict[str, float]] = None
        if hasattr(model, "coef_"):
            try:
                coefs = np.array(model.coef_).flatten()
                x_vals = input_df.values[0]
                contributions = {
                    col: float(coef * val)
                    for col, coef, val in zip(feature_cols, coefs[:len(feature_cols)], x_vals)
                }
                feature_contributions = json_safe(contributions)
            except Exception:
                pass
        result["feature_contributions"] = feature_contributions

        logger.info(
            "prediction_generated",
            model_id=model_id,
            prediction_type="single",
        )
        return result

    # ------------------------------------------------------------------
    # Batch prediction
    # ------------------------------------------------------------------

    def predict_batch(
        self, model_id: str, input_records: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Predict a batch of observations.

        Returns a list of prediction dicts, one per row.
        """
        payload = self.persistence.load(model_id)
        model = payload["model"]
        feature_cols: List[str] = payload.get("feature_columns", [])
        target_encoder = payload.get("target_encoder")

        input_df = pd.DataFrame(input_records)
        input_df = self._transform_input(input_df, payload)

        preds = model.predict(input_df)

        probas: Optional[np.ndarray] = None
        if hasattr(model, "predict_proba"):
            try:
                probas = model.predict_proba(input_df)
            except Exception:
                pass

        results: List[Dict[str, Any]] = []
        for i, raw_pred in enumerate(preds):
            entry: Dict[str, Any] = {"row_index": i}

            if target_encoder is not None:
                try:
                    label = target_encoder.inverse_transform([int(raw_pred)])[0]
                    entry["predicted_value"] = {"label": str(label), "encoded": int(raw_pred)}
                except Exception:
                    entry["predicted_value"] = {"value": json_safe(raw_pred)}
            else:
                entry["predicted_value"] = {"value": json_safe(raw_pred)}

            if probas is not None:
                entry["confidence"] = float(np.max(probas[i]))

            results.append(entry)

        logger.info(
            "prediction_generated",
            model_id=model_id,
            prediction_type="batch",
            n_records=len(input_records),
        )
        return json_safe(results)
