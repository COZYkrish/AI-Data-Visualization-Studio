"""
AggregationService — Phase 5: Dashboard & Visualization Engine

Provides reusable aggregation utilities for computing statistical summaries
from Pandas DataFrames. Each method has a single responsibility.
"""
import os
import structlog
from typing import Dict, Any, List, Optional, cast
import pandas as pd
import numpy as np

from app.services.file_processing.parser import parse_file
from app.services.file_processing.cleaner import clean_dataset
from app.services.file_processing.detector import detect_data_types

logger = structlog.get_logger(__name__)

UPLOAD_DIR = "uploads"


class AggregationService:
    """Responsible for all data aggregation operations on a loaded DataFrame."""

    def load_dataframe(self, stored_filename: str, file_type: str, original_filename: str) -> pd.DataFrame:
        """Loads and cleans a DataFrame from the stored file."""
        filepath = os.path.join(UPLOAD_DIR, stored_filename)
        df = parse_file(filepath, file_type, original_filename)
        df, _ = clean_dataset(df)
        return df

    # -------------------------------------------------------------------------
    # Core Aggregation Operations
    # -------------------------------------------------------------------------

    def count(self, df: pd.DataFrame, column: Optional[str] = None) -> Any:
        """Returns total row count or non-null count of a specific column."""
        if column:
            return int(df[column].count())
        return int(len(df))

    def sum(self, df: pd.DataFrame, column: str) -> Optional[float]:
        """Returns sum of a numeric column."""
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            return None
        return float(df[column].sum())

    def average(self, df: pd.DataFrame, column: str) -> Optional[float]:
        """Returns mean of a numeric column."""
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            return None
        val = df[column].mean()
        return float(val) if not np.isnan(val) else None

    def minimum(self, df: pd.DataFrame, column: str) -> Optional[float]:
        """Returns minimum value of a numeric column."""
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            return None
        return float(df[column].min())

    def maximum(self, df: pd.DataFrame, column: str) -> Optional[float]:
        """Returns maximum value of a numeric column."""
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            return None
        return float(df[column].max())

    def median(self, df: pd.DataFrame, column: str) -> Optional[float]:
        """Returns median of a numeric column."""
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            return None
        val = df[column].median()
        return float(val) if not np.isnan(val) else None

    def mode(self, df: pd.DataFrame, column: str) -> Optional[Any]:
        """Returns the most frequent value in a column."""
        if column not in df.columns:
            return None
        modes = df[column].mode()
        if len(modes) == 0:
            return None
        val = modes.iloc[0]
        return val.item() if hasattr(val, "item") else val

    def variance(self, df: pd.DataFrame, column: str) -> Optional[float]:
        """Returns variance of a numeric column."""
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            return None
        val = df[column].var()
        return float(val) if not np.isnan(val) else None

    def std_deviation(self, df: pd.DataFrame, column: str) -> Optional[float]:
        """Returns standard deviation of a numeric column."""
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            return None
        val = df[column].std()
        return float(val) if not np.isnan(val) else None

    def percentile(self, df: pd.DataFrame, column: str, q: float) -> Optional[float]:
        """Returns the q-th percentile (0-100) of a numeric column."""
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            return None
        val = df[column].quantile(q / 100)
        return float(val) if not np.isnan(val) else None

    # -------------------------------------------------------------------------
    # Grouping & Distribution Operations
    # -------------------------------------------------------------------------

    def group_by_count(
        self,
        df: pd.DataFrame,
        group_col: str,
        value_col: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Groups by a column and counts occurrences, or aggregates a value column."""
        if group_col not in df.columns:
            return []

        if value_col and value_col in df.columns and pd.api.types.is_numeric_dtype(df[value_col]):
            grouped = df.groupby(group_col)[value_col].sum().reset_index()
            grouped.columns = ["label", "value"]
        else:
            grouped = df[group_col].value_counts().reset_index()
            grouped.columns = ["label", "value"]

        grouped = grouped.head(limit)
        return cast(List[Dict[str, Any]], grouped.to_dict(orient="records"))

    def value_frequencies(self, df: pd.DataFrame, column: str, limit: int = 30) -> List[Dict[str, Any]]:
        """Returns frequency distribution for a categorical column."""
        if column not in df.columns:
            return []
        freq = df[column].value_counts(normalize=False).head(limit).reset_index()
        freq.columns = ["label", "count"]
        freq["percentage"] = (freq["count"] / len(df) * 100).round(2)
        return cast(List[Dict[str, Any]], freq.to_dict(orient="records"))

    def histogram_bins(
        self, df: pd.DataFrame, column: str, bins: int = 20
    ) -> List[Dict[str, Any]]:
        """Returns histogram bin data for a numeric column."""
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            return []
        series = df[column].dropna()
        counts, edges = np.histogram(series, bins=bins)
        result = []
        for i in range(len(counts)):
            result.append({
                "bin_start": round(float(edges[i]), 4),
                "bin_end": round(float(edges[i + 1]), 4),
                "count": int(counts[i]),
                "label": f"{edges[i]:.2f}–{edges[i+1]:.2f}",
            })
        return result

    def scatter_data(
        self,
        df: pd.DataFrame,
        x_col: str,
        y_col: str,
        color_col: Optional[str] = None,
        sample_size: int = 500,
    ) -> List[Dict[str, Any]]:
        """Returns sampled scatter plot data."""
        if x_col not in df.columns or y_col not in df.columns:
            return []
        numeric_cols = [x_col, y_col]
        sub = df[numeric_cols + ([color_col] if color_col and color_col in df.columns else [])].dropna()
        if len(sub) > sample_size:
            sub = sub.sample(sample_size, random_state=42)
        records = sub.to_dict(orient="records")
        return [{str(k): (v.item() if hasattr(v, "item") else v) for k, v in r.items()} for r in records]

    def time_series_data(
        self,
        df: pd.DataFrame,
        date_col: str,
        value_col: str,
        freq: str = "auto",
    ) -> List[Dict[str, Any]]:
        """Resamples a date + numeric column for time series charts."""
        if date_col not in df.columns or value_col not in df.columns:
            return []
        try:
            sub = df[[date_col, value_col]].copy()
            sub[date_col] = pd.to_datetime(sub[date_col], errors="coerce")
            sub = sub.dropna().set_index(date_col).sort_index()

            # Auto-determine frequency
            if freq == "auto":
                span = (sub.index.max() - sub.index.min()).days
                if span > 730:
                    freq = "ME"
                elif span > 90:
                    freq = "W"
                else:
                    freq = "D"

            resampled = sub[value_col].resample(freq).mean().dropna().reset_index()
            resampled.columns = ["date", "value"]
            resampled["date"] = resampled["date"].dt.strftime("%Y-%m-%d")
            return cast(List[Dict[str, Any]], resampled.to_dict(orient="records"))
        except Exception as e:
            logger.warning("time_series_aggregation_failed", error=str(e))
            return []

    def correlation_matrix(self, df: pd.DataFrame, columns: Optional[List[str]] = None) -> Dict[str, Any]:
        """Computes pairwise correlation matrix for numeric columns."""
        numeric_df = df.select_dtypes(include=[np.number])
        if columns:
            valid = [c for c in columns if c in numeric_df.columns]
            numeric_df = numeric_df[valid]

        if numeric_df.empty or len(numeric_df.columns) < 2:
            return {"columns": [], "matrix": []}

        corr = numeric_df.corr().round(3)
        col_names = corr.columns.tolist()
        matrix = corr.values.tolist()
        # Replace NaN with None for JSON serialization
        matrix = [[None if (v is not None and np.isnan(v)) else v for v in row] for row in matrix]
        return {"columns": col_names, "matrix": matrix}

    def box_plot_stats(self, df: pd.DataFrame, column: str) -> Optional[Dict[str, Any]]:
        """Returns five-number summary for box plot."""
        if column not in df.columns or not pd.api.types.is_numeric_dtype(df[column]):
            return None
        series = df[column].dropna()
        q1 = float(series.quantile(0.25))
        q3 = float(series.quantile(0.75))
        iqr = q3 - q1
        whisker_low = float(series[series >= q1 - 1.5 * iqr].min())
        whisker_high = float(series[series <= q3 + 1.5 * iqr].max())
        return {
            "min": float(series.min()),
            "q1": q1,
            "median": float(series.median()),
            "mean": float(series.mean()),
            "q3": q3,
            "max": float(series.max()),
            "whisker_low": whisker_low,
            "whisker_high": whisker_high,
            "outliers": [
                float(v) for v in series[(series < whisker_low) | (series > whisker_high)]
            ][:100],
        }

    # -------------------------------------------------------------------------
    # Date Aggregation
    # -------------------------------------------------------------------------

    def extract_date_parts(self, df: pd.DataFrame, date_col: str) -> Optional[pd.DataFrame]:
        """Adds year, month, weekday columns from a date column."""
        if date_col not in df.columns:
            return None
        try:
            df = df.copy()
            df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
            df[f"{date_col}_year"] = df[date_col].dt.year
            df[f"{date_col}_month"] = df[date_col].dt.month
            df[f"{date_col}_weekday"] = df[date_col].dt.day_name()
            return df
        except Exception:
            return df
