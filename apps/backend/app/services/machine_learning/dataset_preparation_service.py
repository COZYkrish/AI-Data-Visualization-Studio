"""
Dataset Preparation Service — Phase 7

Responsibility: Transform a raw pandas DataFrame into a clean, encoded,
scaled, and split dataset ready for ML training. Each preparation step
is a separate public method so other services can call them independently.

Steps implemented:
  1. Missing value handling (median for numeric, mode for categorical)
  2. Categorical encoding (label / one-hot)
  3. Feature scaling (StandardScaler / MinMaxScaler)
  4. Constant & duplicate feature removal
  5. Train/test split with random state management
"""

from typing import Dict, List, Optional, Tuple, Any

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split  # type: ignore[import-untyped]
from sklearn.preprocessing import (  # type: ignore[import-untyped]
    LabelEncoder,
    OneHotEncoder,
    StandardScaler,
    MinMaxScaler,
)

from app.services.machine_learning.utils import json_safe


class DatasetPreparationService:
    """
    Prepares a DataFrame for ML model training.

    All transformations are stateless relative to the DataFrame parameter;
    fitted transformers are returned so callers can persist them for
    inference-time transformation.
    """

    # ------------------------------------------------------------------
    # Missing value handling
    # ------------------------------------------------------------------

    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Fill missing values:
          - Numeric columns  → median
          - Categorical/object columns → mode (most frequent value)
          - Remaining NaN rows → dropped as a fallback
        """
        df = df.copy()
        for col in df.columns:
            if df[col].isnull().any():
                if df[col].dtype.kind in {"f", "i", "u"}:
                    df[col] = df[col].fillna(df[col].median())
                else:
                    mode_val = df[col].mode()
                    fill_val = mode_val.iloc[0] if not mode_val.empty else "Unknown"
                    df[col] = df[col].fillna(fill_val)
        # Drop any remaining NaN rows (edge cases)
        df = df.dropna()
        return df

    # ------------------------------------------------------------------
    # Categorical encoding
    # ------------------------------------------------------------------

    def label_encode(
        self, df: pd.DataFrame, columns: List[str]
    ) -> Tuple[pd.DataFrame, Dict[str, LabelEncoder]]:
        """Apply LabelEncoder to the supplied columns. Returns df + encoders."""
        df = df.copy()
        encoders: Dict[str, LabelEncoder] = {}
        for col in columns:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                encoders[col] = le
        return df, encoders

    def one_hot_encode(
        self, df: pd.DataFrame, columns: List[str], max_categories: int = 20
    ) -> Tuple[pd.DataFrame, List[str]]:
        """
        Apply one-hot encoding.  Columns with more than *max_categories*
        unique values fall back to label encoding to avoid dimension explosion.
        Returns the transformed DataFrame and the new list of feature column names.
        """
        df = df.copy()
        cols_to_ohe = []
        cols_to_label = []

        for col in columns:
            if col in df.columns:
                if df[col].nunique() <= max_categories:
                    cols_to_ohe.append(col)
                else:
                    cols_to_label.append(col)

        if cols_to_label:
            df, _ = self.label_encode(df, cols_to_label)

        if cols_to_ohe:
            df = pd.get_dummies(df, columns=cols_to_ohe, drop_first=True)

        return df, list(df.columns)

    # ------------------------------------------------------------------
    # Feature scaling
    # ------------------------------------------------------------------

    def standardize(
        self, X: pd.DataFrame
    ) -> Tuple[pd.DataFrame, StandardScaler]:
        """Fit StandardScaler on X; returns scaled DataFrame + fitted scaler."""
        scaler = StandardScaler()
        X_scaled = pd.DataFrame(
            scaler.fit_transform(X), columns=X.columns, index=X.index
        )
        return X_scaled, scaler

    def normalize(
        self, X: pd.DataFrame
    ) -> Tuple[pd.DataFrame, MinMaxScaler]:
        """Fit MinMaxScaler on X; returns normalized DataFrame + fitted scaler."""
        scaler = MinMaxScaler()
        X_scaled = pd.DataFrame(
            scaler.fit_transform(X), columns=X.columns, index=X.index
        )
        return X_scaled, scaler

    # ------------------------------------------------------------------
    # Feature cleaning
    # ------------------------------------------------------------------

    def remove_constant_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """Drop columns with zero variance (constant values)."""
        constant_cols = [col for col in df.columns if df[col].nunique() <= 1]
        return df.drop(columns=constant_cols), constant_cols

    def remove_duplicate_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """Drop duplicate columns (same content, different name)."""
        df_T = df.T
        duplicate_mask = df_T.duplicated()
        duplicate_cols = list(df_T[duplicate_mask].index)
        return df.drop(columns=duplicate_cols), duplicate_cols

    # ------------------------------------------------------------------
    # Train / test split
    # ------------------------------------------------------------------

    def split(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        test_size: float = 0.2,
        random_state: int = 42,
        stratify: Optional[pd.Series] = None,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
        """Split X, y into (X_train, X_test, y_train, y_test)."""
        return train_test_split(  # type: ignore[return-value]
            X, y, test_size=test_size, random_state=random_state, stratify=stratify
        )

    # ------------------------------------------------------------------
    # Full preparation pipeline
    # ------------------------------------------------------------------

    def prepare(
        self,
        df: pd.DataFrame,
        target_column: str,
        feature_columns: Optional[List[str]] = None,
        test_size: float = 0.2,
        random_state: int = 42,
        scale: bool = True,
        stratify: bool = False,
    ) -> Dict[str, Any]:
        """
        End-to-end preparation pipeline.

        Returns a dict with keys:
          X_train, X_test, y_train, y_test,
          scaler, feature_columns, encoding_map, warnings
        """
        warnings: List[str] = []

        # 1. Missing values
        df = self.handle_missing_values(df)

        # 2. Select features
        all_columns = list(df.columns)
        if feature_columns:
            selected = [c for c in feature_columns if c in all_columns]
        else:
            selected = [c for c in all_columns if c != target_column]

        X = df[selected].copy()
        y = df[target_column].copy()

        # 3. Identify categorical columns in feature set
        cat_cols = X.select_dtypes(include=["object", "category"]).columns.tolist()

        # 4. Encode categoricals
        encoding_map: Dict[str, Any] = {}
        if cat_cols:
            X, new_cols = self.one_hot_encode(X, cat_cols)
            encoding_map["one_hot_encoded"] = cat_cols
            warnings.append(f"Categorical columns encoded: {cat_cols}")

        # 5. Remove constant / duplicate features
        X, dropped_const = self.remove_constant_features(X)
        if dropped_const:
            warnings.append(f"Removed constant columns: {dropped_const}")

        X, dropped_dup = self.remove_duplicate_features(X)
        if dropped_dup:
            warnings.append(f"Removed duplicate columns: {dropped_dup}")

        final_features = list(X.columns)

        # 6. Scale numeric features
        scaler: Optional[StandardScaler] = None
        if scale and not X.empty:
            X, scaler = self.standardize(X)

        # 7. Encode target if classification (object dtype)
        target_encoder: Optional[LabelEncoder] = None
        if y.dtype == object or str(y.dtype) == "category":
            le = LabelEncoder()
            y = pd.Series(le.fit_transform(y.astype(str)), index=y.index)
            target_encoder = le
            encoding_map["target_encoder"] = le

        # 8. Stratified split only for classification
        stratify_series = y if stratify and y.nunique() <= 20 else None
        try:
            X_train, X_test, y_train, y_test = self.split(
                X, y, test_size=test_size, random_state=random_state,
                stratify=stratify_series
            )
        except ValueError:
            # Stratification failed (e.g. very few samples per class)
            X_train, X_test, y_train, y_test = self.split(
                X, y, test_size=test_size, random_state=random_state
            )

        return {
            "X_train": X_train,
            "X_test": X_test,
            "y_train": y_train,
            "y_test": y_test,
            "scaler": scaler,
            "target_encoder": target_encoder,
            "feature_columns": final_features,
            "encoding_map": json_safe(encoding_map),
            "warnings": warnings,
        }
