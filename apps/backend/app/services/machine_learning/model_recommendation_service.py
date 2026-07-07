"""
Model Recommendation Service — Phase 7

Responsibility: Deterministic, rule-based engine that analyses dataset
characteristics and recommends suitable ML algorithms with explanations.
No LLMs, no probability models — pure heuristics.

Decision logic:
  1. Date + numeric column  → Forecasting (Prophet, ARIMA)
  2. Continuous numeric target → Regression (Linear Regression, Random Forest)
  3. Categorical / discrete target → Classification (Logistic, DT, RF)
  4. No target (or clustering intent) → Clustering (K-Means, DBSCAN)
"""

from typing import Any, Dict, List

import pandas as pd


class ModelRecommendationService:
    """Deterministic model recommender based on dataset characteristics."""

    def _has_datetime_column(self, df: pd.DataFrame) -> bool:
        """Return True if any column is parseable as datetime."""
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                return True
            if df[col].dtype == object:
                try:
                    sample = df[col].dropna().head(20)
                    parsed = pd.to_datetime(sample, errors="coerce")
                    if parsed.notna().sum() / len(sample) > 0.7:
                        return True
                except Exception:
                    pass
        return False

    def _target_type(self, df: pd.DataFrame, target: str) -> str:
        """Classify a target column as 'continuous', 'binary', or 'multiclass'."""
        col = df[target]
        n_unique = col.nunique()

        if col.dtype.kind in {"f", "i", "u"}:
            # Treat as classification if very few unique values
            if n_unique <= 2:
                return "binary"
            if n_unique <= 20 and n_unique / len(df) < 0.05:
                return "multiclass"
            return "continuous"
        else:
            if n_unique == 2:
                return "binary"
            return "multiclass"

    def recommend(
        self,
        df: pd.DataFrame,
        target_column: str | None = None,
    ) -> Dict[str, Any]:
        """
        Analyse the dataset and return a recommendation payload.

        Returns:
            {
              "recommendations": List[ModelRecommendation],
              "dataset_summary": {...},
            }
        """
        n_rows, n_cols = df.shape
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
        has_datetime = self._has_datetime_column(df)

        dataset_summary: Dict[str, Any] = {
            "n_rows": n_rows,
            "n_cols": n_cols,
            "n_numeric": len(numeric_cols),
            "n_categorical": len(categorical_cols),
            "has_datetime": has_datetime,
            "target_column": target_column,
        }

        recommendations: List[Dict[str, Any]] = []

        # ------------------------------------------------------------------
        # Rule 1: Forecasting — datetime + numeric
        # ------------------------------------------------------------------
        if has_datetime and len(numeric_cols) >= 1:
            recommendations.append({
                "algorithm": "prophet",
                "model_type": "forecasting",
                "reason": "Dataset contains a date/time column and numeric values — ideal for time-series forecasting with Prophet.",
                "confidence": "High",
                "suitable_for": ["trend analysis", "future prediction", "seasonality detection"],
            })
            recommendations.append({
                "algorithm": "arima",
                "model_type": "forecasting",
                "reason": "ARIMA is a classical alternative to Prophet, suitable for stationary time-series with clear trends.",
                "confidence": "Medium",
                "suitable_for": ["stationary time series", "short-horizon forecasting"],
            })

        # ------------------------------------------------------------------
        # Rule 2: Regression — continuous numeric target
        # ------------------------------------------------------------------
        if target_column and target_column in df.columns:
            ttype = self._target_type(df, target_column)

            if ttype == "continuous":
                recommendations.append({
                    "algorithm": "linear_regression",
                    "model_type": "regression",
                    "reason": f"Target '{target_column}' is continuous numeric. Linear Regression is a transparent baseline.",
                    "confidence": "High",
                    "suitable_for": ["linear relationships", "baseline modelling", "interpretability"],
                })
                recommendations.append({
                    "algorithm": "random_forest_regressor",
                    "model_type": "regression",
                    "reason": f"Random Forest Regressor handles non-linear relationships and is robust to outliers in '{target_column}'.",
                    "confidence": "High",
                    "suitable_for": ["non-linear relationships", "high-dimensional data", "feature importance"],
                })

            elif ttype in {"binary", "multiclass"}:
                label = "binary" if ttype == "binary" else "multi-class"
                recommendations.append({
                    "algorithm": "logistic_regression",
                    "model_type": "classification",
                    "reason": f"Target '{target_column}' is {label}. Logistic Regression is an interpretable probabilistic classifier.",
                    "confidence": "High",
                    "suitable_for": ["linearly separable classes", "probability estimation", "interpretability"],
                })
                recommendations.append({
                    "algorithm": "decision_tree_classifier",
                    "model_type": "classification",
                    "reason": "Decision Tree provides a transparent, rule-based model that is easy to explain.",
                    "confidence": "Medium",
                    "suitable_for": ["rule extraction", "non-linear boundaries", "explainability"],
                })
                recommendations.append({
                    "algorithm": "random_forest_classifier",
                    "model_type": "classification",
                    "reason": "Random Forest Classifier is an ensemble that reduces Decision Tree overfitting.",
                    "confidence": "High",
                    "suitable_for": ["high accuracy", "imbalanced classes", "feature importance"],
                })

        # ------------------------------------------------------------------
        # Rule 3: Clustering — no target
        # ------------------------------------------------------------------
        if not target_column and len(numeric_cols) >= 2:
            recommendations.append({
                "algorithm": "kmeans",
                "model_type": "clustering",
                "reason": "No target column detected. K-Means is the standard choice for discovering natural groupings.",
                "confidence": "High",
                "suitable_for": ["customer segmentation", "pattern discovery", "exploratory analysis"],
            })
            recommendations.append({
                "algorithm": "dbscan",
                "model_type": "clustering",
                "reason": "DBSCAN finds arbitrary-shaped clusters and identifies noise points without requiring k.",
                "confidence": "Medium",
                "suitable_for": ["noise detection", "irregular cluster shapes", "density-based grouping"],
            })

        # Deduplicate by algorithm
        seen = set()
        unique_recs: List[Dict[str, Any]] = []
        for r in recommendations:
            if r["algorithm"] not in seen:
                seen.add(r["algorithm"])
                unique_recs.append(r)

        return {
            "recommendations": unique_recs,
            "dataset_summary": dataset_summary,
        }
