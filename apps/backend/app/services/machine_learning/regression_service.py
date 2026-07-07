"""
Regression Service — Phase 7

Responsibility: Train and evaluate regression models.
Supported algorithms:
  - Linear Regression
  - Random Forest Regressor

Each train_* method:
  1. Accepts prepared (X_train, X_test, y_train, y_test)
  2. Trains the model
  3. Returns fitted model + feature importances (where available)
"""

from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression  # type: ignore[import-untyped]
from sklearn.ensemble import RandomForestRegressor  # type: ignore[import-untyped]

from app.services.machine_learning.utils import json_safe


class RegressionService:
    """Trains regression models and extracts feature importances."""

    # ------------------------------------------------------------------
    # Linear Regression
    # ------------------------------------------------------------------

    def train_linear_regression(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        hyperparameters: Optional[Dict[str, Any]] = None,
    ) -> Tuple[LinearRegression, Dict[str, float]]:
        """
        Train a LinearRegression model.

        Returns (fitted_model, feature_importances_dict).
        Feature importances for linear regression are the absolute
        values of the model coefficients (normalised).
        """
        params = hyperparameters or {}
        model = LinearRegression(
            fit_intercept=params.get("fit_intercept", True),
        )
        model.fit(X_train, y_train)

        # Feature importances → normalised absolute coefficients
        coefs = np.abs(model.coef_)
        total = coefs.sum() or 1.0
        importances = {
            col: float(coef / total)
            for col, coef in zip(X_train.columns, coefs)
        }
        return model, json_safe(dict(sorted(importances.items(), key=lambda x: -x[1])))

    # ------------------------------------------------------------------
    # Random Forest Regressor
    # ------------------------------------------------------------------

    def train_random_forest_regressor(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        hyperparameters: Optional[Dict[str, Any]] = None,
    ) -> Tuple[RandomForestRegressor, Dict[str, float]]:
        """
        Train a RandomForestRegressor.

        Returns (fitted_model, feature_importances_dict).
        """
        params = hyperparameters or {}
        model = RandomForestRegressor(
            n_estimators=int(params.get("n_estimators", 100)),
            max_depth=params.get("max_depth", None),
            min_samples_split=int(params.get("min_samples_split", 2)),
            random_state=int(params.get("random_state", 42)),
            n_jobs=-1,
        )
        model.fit(X_train, y_train)

        importances = {
            col: float(imp)
            for col, imp in zip(X_train.columns, model.feature_importances_)
        }
        return model, json_safe(dict(sorted(importances.items(), key=lambda x: -x[1])))
