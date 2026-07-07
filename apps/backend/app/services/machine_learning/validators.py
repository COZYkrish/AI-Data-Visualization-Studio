"""
ML Validators — Phase 7

Responsibility: Pre-flight validation of datasets, features and targets
before any ML pipeline step runs. Raises FastAPI HTTPException with
clear, user-friendly messages on validation failure.
"""

from typing import List, Optional
import pandas as pd
from fastapi import HTTPException


class DatasetValidator:
    """Validates dataset suitability before ML pipeline execution."""

    MIN_ROWS: int = 10

    def validate_minimum_rows(self, df: pd.DataFrame) -> None:
        if len(df) < self.MIN_ROWS:
            raise HTTPException(
                status_code=400,
                detail=f"Dataset has only {len(df)} rows. At least {self.MIN_ROWS} rows are required for training.",
            )

    def validate_target_column(
        self, df: pd.DataFrame, target: str, allowed_types: Optional[List[str]] = None
    ) -> None:
        """Validate target column existence and optionally its dtype group."""
        if target not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Target column '{target}' not found in dataset. Available columns: {list(df.columns)}",
            )
        if allowed_types:
            col_kind = df[target].dtype.kind  # 'f' float, 'i' int, 'O' object …
            numeric_kinds = {"f", "i", "u"}
            categorical_kinds = {"O", "S", "U", "b"}
            if "numeric" in allowed_types and col_kind not in numeric_kinds:
                raise HTTPException(
                    status_code=400,
                    detail=f"Target column '{target}' must be numeric for regression. Got dtype '{df[target].dtype}'.",
                )
            if "categorical" in allowed_types and col_kind not in categorical_kinds | numeric_kinds:
                raise HTTPException(
                    status_code=400,
                    detail=f"Target column '{target}' is not suitable for classification.",
                )

    def validate_feature_columns(
        self, df: pd.DataFrame, features: List[str], target: Optional[str] = None
    ) -> None:
        missing = [c for c in features if c not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Feature column(s) not found in dataset: {missing}",
            )
        if target and target in features:
            raise HTTPException(
                status_code=400,
                detail=f"Target column '{target}' must not be included in feature columns (data leakage).",
            )

    def validate_numeric_features_exist(self, df: pd.DataFrame) -> None:
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        if not numeric_cols:
            raise HTTPException(
                status_code=400,
                detail="Dataset must contain at least one numeric column for ML training.",
            )

    def validate_date_column(self, df: pd.DataFrame, date_col: str) -> None:
        if date_col not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Date column '{date_col}' not found in dataset.",
            )
        try:
            pd.to_datetime(df[date_col])
        except Exception:
            raise HTTPException(
                status_code=400,
                detail=f"Column '{date_col}' could not be parsed as a date.",
            )

    def validate_sufficient_classes(
        self, df: pd.DataFrame, target: str, min_classes: int = 2
    ) -> None:
        n_classes = df[target].nunique()
        if n_classes < min_classes:
            raise HTTPException(
                status_code=400,
                detail=f"Target column '{target}' has only {n_classes} unique class(es). At least {min_classes} classes are required for classification.",
            )

    def detect_data_leakage(
        self, df: pd.DataFrame, features: List[str], target: str
    ) -> List[str]:
        """Return list of features with near-perfect correlation to target (potential leakage)."""
        warnings: List[str] = []
        numeric_df = df[features].select_dtypes(include="number")
        if target in df.columns and df[target].dtype.kind in {"f", "i", "u"}:
            for col in numeric_df.columns:
                try:
                    corr = abs(numeric_df[col].corr(df[target]))
                    if corr > 0.98:
                        warnings.append(
                            f"Column '{col}' has near-perfect correlation ({corr:.3f}) with target — possible data leakage."
                        )
                except Exception:
                    pass
        return warnings
