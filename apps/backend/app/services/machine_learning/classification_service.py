"""
Classification Service — Phase 7

Responsibility: Train and evaluate classification models.
Supported algorithms:
  - Logistic Regression
  - Decision Tree Classifier
  - Random Forest Classifier

Each train_* method accepts prepared (X_train, y_train) and returns
(fitted_model, feature_importances_dict).
"""

from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression  # type: ignore[import-untyped]
from sklearn.tree import DecisionTreeClassifier  # type: ignore[import-untyped]
from sklearn.ensemble import RandomForestClassifier  # type: ignore[import-untyped]

from app.services.machine_learning.utils import json_safe


class ClassificationService:
    """Trains classification models and extracts feature importances."""

    # ------------------------------------------------------------------
    # Logistic Regression
    # ------------------------------------------------------------------

    def train_logistic_regression(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        hyperparameters: Optional[Dict[str, Any]] = None,
    ) -> Tuple[LogisticRegression, Dict[str, float]]:
        """
        Train a LogisticRegression classifier.

        Feature importances are the absolute values of the log-odds
        coefficients averaged across classes (multi-class safe).
        """
        params = hyperparameters or {}
        n_classes = y_train.nunique()

        model = LogisticRegression(
            max_iter=int(params.get("max_iter", 1000)),
            C=float(params.get("C", 1.0)),
            solver=params.get("solver", "lbfgs"),
            multi_class="auto",
            random_state=int(params.get("random_state", 42)),
            n_jobs=-1,
        )
        model.fit(X_train, y_train)

        # Coefficients: shape (n_classes, n_features) or (1, n_features)
        coefs = np.abs(model.coef_)
        mean_coefs = coefs.mean(axis=0)
        total = mean_coefs.sum() or 1.0
        importances = {
            col: float(v / total)
            for col, v in zip(X_train.columns, mean_coefs)
        }
        return model, json_safe(dict(sorted(importances.items(), key=lambda x: -x[1])))

    # ------------------------------------------------------------------
    # Decision Tree Classifier
    # ------------------------------------------------------------------

    def train_decision_tree(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        hyperparameters: Optional[Dict[str, Any]] = None,
    ) -> Tuple[DecisionTreeClassifier, Dict[str, float]]:
        params = hyperparameters or {}
        model = DecisionTreeClassifier(
            max_depth=params.get("max_depth", None),
            min_samples_split=int(params.get("min_samples_split", 2)),
            criterion=params.get("criterion", "gini"),
            random_state=int(params.get("random_state", 42)),
        )
        model.fit(X_train, y_train)
        importances = {
            col: float(imp)
            for col, imp in zip(X_train.columns, model.feature_importances_)
        }
        return model, json_safe(dict(sorted(importances.items(), key=lambda x: -x[1])))

    # ------------------------------------------------------------------
    # Random Forest Classifier
    # ------------------------------------------------------------------

    def train_random_forest_classifier(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        hyperparameters: Optional[Dict[str, Any]] = None,
    ) -> Tuple[RandomForestClassifier, Dict[str, float]]:
        params = hyperparameters or {}
        model = RandomForestClassifier(
            n_estimators=int(params.get("n_estimators", 100)),
            max_depth=params.get("max_depth", None),
            criterion=params.get("criterion", "gini"),
            random_state=int(params.get("random_state", 42)),
            n_jobs=-1,
        )
        model.fit(X_train, y_train)
        importances = {
            col: float(imp)
            for col, imp in zip(X_train.columns, model.feature_importances_)
        }
        return model, json_safe(dict(sorted(importances.items(), key=lambda x: -x[1])))
