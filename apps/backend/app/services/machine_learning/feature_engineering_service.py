"""
Feature Engineering Service — Phase 7

Responsibility: Analyse and transform feature sets beyond basic encoding.
Exposes utilities for:
  - Numeric feature selection
  - Date feature extraction
  - Variance-threshold filtering
  - Interaction feature creation
  - Polynomial feature preparation

Each method is designed to be called independently from the training
orchestrator, keeping the feature engineering step composable.
"""

from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.feature_selection import VarianceThreshold  # type: ignore[import-untyped]


class FeatureEngineeringService:
    """
    Stateless feature engineering utilities.
    All methods take a DataFrame and return a transformed copy + metadata.
    """

    # ------------------------------------------------------------------
    # Feature type identification
    # ------------------------------------------------------------------

    def identify_feature_types(self, df: pd.DataFrame) -> Dict[str, List[str]]:
        """
        Classify each column by type.
        Returns dict with keys: numeric, categorical, datetime, boolean.
        """
        numeric = df.select_dtypes(include="number").columns.tolist()
        categorical = df.select_dtypes(include=["object", "category"]).columns.tolist()
        boolean = df.select_dtypes(include="bool").columns.tolist()
        datetime_cols: List[str] = []

        for col in categorical:
            try:
                parsed = pd.to_datetime(df[col], infer_datetime_format=True, errors="coerce")
                if parsed.notna().sum() / len(df) > 0.8:
                    datetime_cols.append(col)
            except Exception:
                pass

        categorical = [c for c in categorical if c not in datetime_cols]
        return {
            "numeric": numeric,
            "categorical": categorical,
            "datetime": datetime_cols,
            "boolean": boolean,
        }

    # ------------------------------------------------------------------
    # Date feature extraction
    # ------------------------------------------------------------------

    def extract_date_features(
        self, df: pd.DataFrame, date_columns: List[str]
    ) -> Tuple[pd.DataFrame, List[str]]:
        """
        Extract year, month, day, weekday, quarter, is_weekend from date columns.
        Original date columns are dropped; new feature names are returned.
        """
        df = df.copy()
        new_features: List[str] = []

        for col in date_columns:
            if col not in df.columns:
                continue
            try:
                dt = pd.to_datetime(df[col], errors="coerce")
                df[f"{col}_year"] = dt.dt.year
                df[f"{col}_month"] = dt.dt.month
                df[f"{col}_day"] = dt.dt.day
                df[f"{col}_weekday"] = dt.dt.weekday
                df[f"{col}_quarter"] = dt.dt.quarter
                df[f"{col}_is_weekend"] = (dt.dt.weekday >= 5).astype(int)
                new_features.extend([
                    f"{col}_year", f"{col}_month", f"{col}_day",
                    f"{col}_weekday", f"{col}_quarter", f"{col}_is_weekend",
                ])
                df = df.drop(columns=[col])
            except Exception:
                pass

        return df, new_features

    # ------------------------------------------------------------------
    # Variance threshold
    # ------------------------------------------------------------------

    def apply_variance_threshold(
        self, df: pd.DataFrame, threshold: float = 0.0
    ) -> Tuple[pd.DataFrame, List[str]]:
        """
        Remove columns whose variance is <= threshold.
        Only operates on numeric columns.
        """
        numeric_df = df.select_dtypes(include="number")
        non_numeric_df = df.select_dtypes(exclude="number")

        if numeric_df.empty:
            return df, []

        selector = VarianceThreshold(threshold=threshold)
        selector.fit(numeric_df)
        kept_mask = selector.get_support()
        kept_cols = numeric_df.columns[kept_mask].tolist()
        removed_cols = numeric_df.columns[~kept_mask].tolist()

        result = pd.concat([numeric_df[kept_cols], non_numeric_df], axis=1)
        return result, removed_cols

    # ------------------------------------------------------------------
    # Interaction features
    # ------------------------------------------------------------------

    def create_interaction_features(
        self,
        df: pd.DataFrame,
        columns: List[str],
        max_pairs: int = 10,
    ) -> Tuple[pd.DataFrame, List[str]]:
        """
        Create pairwise product interaction features for the supplied
        numeric columns (up to *max_pairs* pairs to avoid explosion).
        """
        df = df.copy()
        numeric_cols = [c for c in columns if c in df.columns and df[c].dtype.kind in {"f", "i", "u"}]
        new_features: List[str] = []
        pairs_created = 0

        for i in range(len(numeric_cols)):
            for j in range(i + 1, len(numeric_cols)):
                if pairs_created >= max_pairs:
                    break
                col_a = numeric_cols[i]
                col_b = numeric_cols[j]
                new_col = f"{col_a}__x__{col_b}"
                df[new_col] = df[col_a] * df[col_b]
                new_features.append(new_col)
                pairs_created += 1

        return df, new_features

    # ------------------------------------------------------------------
    # Feature importance summary (descriptive, no model required)
    # ------------------------------------------------------------------

    def descriptive_feature_summary(
        self, df: pd.DataFrame, target: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Compute a lightweight descriptive summary for each feature:
        variance, cardinality, missing_pct, correlation_with_target.
        """
        summary: List[Dict[str, Any]] = []
        for col in df.columns:
            if col == target:
                continue
            entry: Dict[str, Any] = {
                "column": col,
                "dtype": str(df[col].dtype),
                "missing_pct": round(df[col].isnull().mean() * 100, 2),
                "cardinality": int(df[col].nunique()),
            }
            if df[col].dtype.kind in {"f", "i", "u"}:
                entry["variance"] = round(float(df[col].var()), 4)
                if target and target in df.columns and df[target].dtype.kind in {"f", "i", "u"}:
                    try:
                        entry["corr_with_target"] = round(float(df[col].corr(df[target])), 4)
                    except Exception:
                        entry["corr_with_target"] = None
            summary.append(entry)
        return summary
