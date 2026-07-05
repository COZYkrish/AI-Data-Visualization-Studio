"""
VisualizationService — Phase 5: Dashboard & Visualization Engine

Transforms raw DataFrame aggregations into chart-ready data payloads.
Each method maps to a specific chart type supported by the frontend renderer.
"""
import structlog
from typing import Dict, Any, List, Optional
import pandas as pd

from app.services.aggregation_service import AggregationService

logger = structlog.get_logger(__name__)


class VisualizationService:
    """
    Converts aggregation results into serializable chart data structures
    ready for consumption by the frontend Recharts components.
    """

    def __init__(self):
        self.aggregator = AggregationService()

    # -------------------------------------------------------------------------
    # Chart Data Builders
    # -------------------------------------------------------------------------

    def get_bar_chart_data(
        self,
        df: pd.DataFrame,
        x_col: str,
        y_col: Optional[str] = None,
        limit: int = 30,
    ) -> Dict[str, Any]:
        """Returns bar chart data: { data: [{label, value}], x_key, y_key }"""
        data = self.aggregator.group_by_count(df, x_col, y_col, limit=limit)
        return {
            "chart_type": "bar",
            "data": data,
            "x_key": "label",
            "y_key": "value",
            "x_label": x_col,
            "y_label": y_col or "Count",
        }

    def get_line_chart_data(
        self,
        df: pd.DataFrame,
        x_col: str,
        y_col: str,
        freq: str = "auto",
    ) -> Dict[str, Any]:
        """Returns line chart data for time series."""
        data = self.aggregator.time_series_data(df, x_col, y_col, freq)
        if not data:
            # Fallback: sorted scatter with no resampling
            sub = df[[x_col, y_col]].dropna().sort_values(x_col)
            data = sub.rename(columns={x_col: "date", y_col: "value"}).to_dict(orient="records")
        return {
            "chart_type": "line",
            "data": data,
            "x_key": "date",
            "y_key": "value",
            "x_label": x_col,
            "y_label": y_col,
        }

    def get_area_chart_data(
        self,
        df: pd.DataFrame,
        x_col: str,
        y_col: str,
    ) -> Dict[str, Any]:
        """Returns area chart data (same format as line chart)."""
        result = self.get_line_chart_data(df, x_col, y_col)
        result["chart_type"] = "area"
        return result

    def get_pie_chart_data(
        self,
        df: pd.DataFrame,
        x_col: str,
        limit: int = 10,
    ) -> Dict[str, Any]:
        """Returns pie/donut chart data."""
        data = self.aggregator.value_frequencies(df, x_col, limit=limit)
        return {
            "chart_type": "pie",
            "data": [{"name": r["label"], "value": r["count"]} for r in data],
            "name_key": "name",
            "value_key": "value",
            "x_label": x_col,
        }

    def get_donut_chart_data(
        self,
        df: pd.DataFrame,
        x_col: str,
        limit: int = 10,
    ) -> Dict[str, Any]:
        result = self.get_pie_chart_data(df, x_col, limit)
        result["chart_type"] = "donut"
        return result

    def get_scatter_data(
        self,
        df: pd.DataFrame,
        x_col: str,
        y_col: str,
        color_col: Optional[str] = None,
        sample_size: int = 500,
    ) -> Dict[str, Any]:
        """Returns scatter plot data."""
        data = self.aggregator.scatter_data(df, x_col, y_col, color_col, sample_size)
        return {
            "chart_type": "scatter",
            "data": data,
            "x_key": x_col,
            "y_key": y_col,
            "color_key": color_col,
            "x_label": x_col,
            "y_label": y_col,
        }

    def get_histogram_data(
        self,
        df: pd.DataFrame,
        column: str,
        bins: int = 20,
    ) -> Dict[str, Any]:
        """Returns histogram bin data."""
        data = self.aggregator.histogram_bins(df, column, bins)
        return {
            "chart_type": "histogram",
            "data": data,
            "x_key": "label",
            "y_key": "count",
            "x_label": column,
            "y_label": "Frequency",
        }

    def get_box_plot_data(
        self,
        df: pd.DataFrame,
        column: str,
    ) -> Dict[str, Any]:
        """Returns box plot statistics."""
        stats = self.aggregator.box_plot_stats(df, column)
        return {
            "chart_type": "box",
            "data": [stats] if stats else [],
            "column": column,
        }

    def get_heatmap_data(
        self,
        df: pd.DataFrame,
        columns: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Returns correlation heatmap data."""
        corr = self.aggregator.correlation_matrix(df, columns)
        return {
            "chart_type": "heatmap",
            **corr,
        }

    def get_treemap_data(
        self,
        df: pd.DataFrame,
        x_col: str,
        value_col: Optional[str] = None,
        limit: int = 40,
    ) -> Dict[str, Any]:
        """Returns hierarchical treemap data."""
        data = self.aggregator.group_by_count(df, x_col, value_col, limit=limit)
        return {
            "chart_type": "treemap",
            "data": [{"name": r["label"], "value": r["value"]} for r in data],
            "x_label": x_col,
        }

    def get_bubble_chart_data(
        self,
        df: pd.DataFrame,
        x_col: str,
        y_col: str,
        size_col: str,
        color_col: Optional[str] = None,
        sample_size: int = 300,
    ) -> Dict[str, Any]:
        """Returns bubble chart data."""
        cols = [x_col, y_col, size_col] + ([color_col] if color_col else [])
        valid_cols = [c for c in cols if c in df.columns]
        sub = df[valid_cols].dropna()
        if len(sub) > sample_size:
            sub = sub.sample(sample_size, random_state=42)
        return {
            "chart_type": "bubble",
            "data": sub.to_dict(orient="records"),
            "x_key": x_col,
            "y_key": y_col,
            "size_key": size_col,
            "color_key": color_col,
        }

    def get_radar_chart_data(
        self,
        df: pd.DataFrame,
        columns: List[str],
        group_col: Optional[str] = None,
        max_groups: int = 5,
    ) -> Dict[str, Any]:
        """Returns normalized radar chart data for multi-metric comparison."""
        valid_cols = [c for c in columns if c in df.columns and pd.api.types.is_numeric_dtype(df[c])]
        if not valid_cols:
            return {"chart_type": "radar", "data": [], "columns": []}

        if group_col and group_col in df.columns:
            groups = df[group_col].value_counts().head(max_groups).index.tolist()
            data = []
            for g in groups:
                sub = df[df[group_col] == g][valid_cols].mean()
                row = {"group": str(g)}
                for col in valid_cols:
                    row[col] = float(sub[col]) if not pd.isna(sub[col]) else 0.0
                data.append(row)
        else:
            means = df[valid_cols].mean()
            data = [{"group": "Overall", **{c: float(means[c]) for c in valid_cols}}]

        return {
            "chart_type": "radar",
            "data": data,
            "columns": valid_cols,
        }
