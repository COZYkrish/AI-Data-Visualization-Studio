"""
DashboardService — Phase 5: Dashboard & Visualization Engine

Orchestrates KPI generation, chart data retrieval, filter application,
and query execution for the dashboard endpoints.
"""
import os
import time
import structlog
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.dataset import DatasetRepository
from app.services.aggregation_service import AggregationService
from app.services.visualization_service import VisualizationService
from app.services.chart_recommendation_service import ChartRecommendationService
from app.services.file_processing.parser import parse_file
from app.services.file_processing.cleaner import clean_dataset
from app.services.file_processing.detector import detect_data_types
from app.services.file_processing.statistics import generate_statistics

logger = structlog.get_logger(__name__)

UPLOAD_DIR = "uploads"


class DashboardService:
    """
    Single-responsibility orchestrator for all dashboard operations.
    Delegates heavy lifting to the specialized services.
    """

    def __init__(self, session: Session):
        self.session = session
        self.repository = DatasetRepository(session)
        self.aggregator = AggregationService()
        self.visualizer = VisualizationService()
        self.recommender = ChartRecommendationService()

    # -------------------------------------------------------------------------
    # Data Loading
    # -------------------------------------------------------------------------

    def _load_dataset(self, dataset_id: str, user_id: str) -> tuple:
        """Validates ownership and loads the DataFrame. Returns (dataset, df)."""
        dataset = self.repository.get_by_id(dataset_id)
        if not dataset or dataset.user_id != user_id:
            raise HTTPException(status_code=404, detail="Dataset not found")

        filepath = os.path.join(UPLOAD_DIR, dataset.stored_filename)
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Dataset file missing from storage")

        df = parse_file(filepath, dataset.file_type, dataset.original_filename)
        df, _ = clean_dataset(df)
        return dataset, df

    # -------------------------------------------------------------------------
    # KPI Engine
    # -------------------------------------------------------------------------

    def get_kpis(self, dataset_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Automatically generates KPI cards for a dataset."""
        start = time.perf_counter()
        dataset, df = self._load_dataset(dataset_id, user_id)
        data_types = detect_data_types(df)
        stats = generate_statistics(df, data_types)

        numeric_cols = [c for c, t in data_types.items() if t == "numeric"]
        categorical_cols = [c for c, t in data_types.items() if t == "categorical"]
        date_cols = [c for c, t in data_types.items() if t == "datetime"]

        total_missing = sum(
            int(v) for v in stats.get("global", {}).get("missing_values_per_column", {}).values()
        )
        total_cells = len(df) * len(df.columns)
        missing_pct = round((total_missing / total_cells * 100) if total_cells > 0 else 0, 1)
        data_quality = max(0, round(100 - missing_pct - (stats.get("global", {}).get("duplicate_rows", 0) / max(len(df), 1) * 10), 1))
        memory_kb = round(stats.get("global", {}).get("memory_usage_bytes", 0) / 1024, 1)

        kpis = [
            {"key": "total_rows", "label": "Total Rows", "value": len(df), "unit": "rows", "icon": "rows", "color": "blue"},
            {"key": "total_columns", "label": "Total Columns", "value": len(df.columns), "unit": "cols", "icon": "columns", "color": "violet"},
            {"key": "numeric_columns", "label": "Numeric Columns", "value": len(numeric_cols), "unit": "cols", "icon": "hash", "color": "emerald"},
            {"key": "categorical_columns", "label": "Categorical Columns", "value": len(categorical_cols), "unit": "cols", "icon": "tag", "color": "amber"},
            {"key": "date_columns", "label": "Date Columns", "value": len(date_cols), "unit": "cols", "icon": "calendar", "color": "cyan"},
            {"key": "missing_values", "label": "Missing Values", "value": total_missing, "unit": "cells", "icon": "alert", "color": "red", "meta": f"{missing_pct}%"},
            {"key": "duplicate_rows", "label": "Duplicate Rows", "value": stats.get("global", {}).get("duplicate_rows", 0), "unit": "rows", "icon": "copy", "color": "orange"},
            {"key": "memory_usage", "label": "Memory Usage", "value": memory_kb, "unit": "KB", "icon": "cpu", "color": "slate"},
            {"key": "data_quality_score", "label": "Data Quality", "value": data_quality, "unit": "/100", "icon": "shield", "color": "green"},
        ]

        elapsed = round((time.perf_counter() - start) * 1000, 1)
        logger.info("kpis_generated", dataset_id=dataset_id, user_id=user_id, elapsed_ms=elapsed)
        return kpis

    # -------------------------------------------------------------------------
    # Dataset Statistics
    # -------------------------------------------------------------------------

    def get_statistics(self, dataset_id: str, user_id: str) -> Dict[str, Any]:
        """Returns comprehensive column-level statistics for a dataset."""
        dataset, df = self._load_dataset(dataset_id, user_id)
        data_types = detect_data_types(df)
        stats = generate_statistics(df, data_types)

        column_stats: Dict[str, Any] = {}
        for col in df.columns:
            col_stat: Dict[str, Any] = {
                "dtype": str(df[col].dtype),
                "inferred_type": data_types.get(col, "unknown"),
                "null_count": int(df[col].isnull().sum()),
                "unique_values": int(df[col].nunique()),
                "null_percentage": round(df[col].isnull().mean() * 100, 2),
            }
            if data_types.get(col) == "numeric":
                col_stat.update({
                    "min": self._safe_float(df[col].min()),
                    "max": self._safe_float(df[col].max()),
                    "mean": self._safe_float(df[col].mean()),
                    "median": self._safe_float(df[col].median()),
                    "std": self._safe_float(df[col].std()),
                    "q1": self._safe_float(df[col].quantile(0.25)),
                    "q3": self._safe_float(df[col].quantile(0.75)),
                })
            elif data_types.get(col) == "categorical":
                top_vals = df[col].value_counts().head(5)
                col_stat["top_values"] = [
                    {"value": str(k), "count": int(v)} for k, v in top_vals.items()
                ]
            column_stats[col] = col_stat

        logger.info("statistics_generated", dataset_id=dataset_id, user_id=user_id)
        return {
            "dataset_id": dataset_id,
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": list(df.columns),
            "data_types": data_types,
            "global_stats": stats.get("global", {}),
            "column_stats": column_stats,
        }

    # -------------------------------------------------------------------------
    # Chart Recommendations
    # -------------------------------------------------------------------------

    def get_recommendations(self, dataset_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Returns deterministic chart recommendations for the dataset."""
        dataset, df = self._load_dataset(dataset_id, user_id)
        data_types = detect_data_types(df)
        stats = self.get_statistics(dataset_id, user_id)
        column_stats = stats["column_stats"]
        return self.recommender.recommend(data_types, column_stats, len(df), len(df.columns))

    # -------------------------------------------------------------------------
    # Chart Data
    # -------------------------------------------------------------------------

    def get_chart_data(
        self,
        dataset_id: str,
        user_id: str,
        chart_type: str,
        x: Optional[str] = None,
        y: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generates chart data for a given chart type and column mapping.
        Dispatches to the appropriate VisualizationService method.
        """
        start = time.perf_counter()
        _, df = self._load_dataset(dataset_id, user_id)
        cfg = config or {}

        result: Dict[str, Any]
        if chart_type == "bar":
            result = self.visualizer.get_bar_chart_data(df, x, y)
        elif chart_type == "line":
            result = self.visualizer.get_line_chart_data(df, x, y)
        elif chart_type == "area":
            result = self.visualizer.get_area_chart_data(df, x, y)
        elif chart_type in ("pie", "donut"):
            result = self.visualizer.get_pie_chart_data(df, x)
            result["chart_type"] = chart_type
        elif chart_type == "scatter":
            result = self.visualizer.get_scatter_data(df, x, y, cfg.get("color"))
        elif chart_type == "histogram":
            result = self.visualizer.get_histogram_data(df, x, cfg.get("bins", 20))
        elif chart_type == "box":
            result = self.visualizer.get_box_plot_data(df, x)
        elif chart_type == "heatmap":
            result = self.visualizer.get_heatmap_data(df, cfg.get("columns"))
        elif chart_type == "treemap":
            result = self.visualizer.get_treemap_data(df, x, y)
        elif chart_type == "bubble":
            result = self.visualizer.get_bubble_chart_data(df, x, y, cfg.get("size", y), cfg.get("color"))
        elif chart_type == "radar":
            result = self.visualizer.get_radar_chart_data(df, cfg.get("columns", []), cfg.get("group"))
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported chart type: {chart_type}")

        elapsed = round((time.perf_counter() - start) * 1000, 1)
        logger.info(
            "chart_data_generated",
            dataset_id=dataset_id,
            user_id=user_id,
            chart_type=chart_type,
            elapsed_ms=elapsed,
        )
        return result

    # -------------------------------------------------------------------------
    # Filtered Query
    # -------------------------------------------------------------------------

    def run_filtered_query(
        self,
        dataset_id: str,
        user_id: str,
        filters: List[Dict[str, Any]],
        sort_by: Optional[str] = None,
        sort_order: str = "asc",
        page: int = 1,
        page_size: int = 50,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Applies filters, sorting, and pagination to a dataset and returns
        the result as a paginated table response.
        """
        start = time.perf_counter()
        _, df = self._load_dataset(dataset_id, user_id)
        original_count = len(df)

        # Global text search
        if search:
            mask = df.astype(str).apply(lambda col: col.str.contains(search, case=False, na=False)).any(axis=1)
            df = df[mask]

        # Apply filters
        for f in filters:
            col = f.get("column")
            op = f.get("operator")
            val = f.get("value")
            if col not in df.columns:
                continue
            try:
                if op == "equals":
                    df = df[df[col].astype(str) == str(val)]
                elif op == "not_equals":
                    df = df[df[col].astype(str) != str(val)]
                elif op == "contains":
                    df = df[df[col].astype(str).str.contains(str(val), case=False, na=False)]
                elif op == "not_contains":
                    df = df[~df[col].astype(str).str.contains(str(val), case=False, na=False)]
                elif op == "greater_than":
                    df = df[pd.to_numeric(df[col], errors="coerce") > float(val)]
                elif op == "less_than":
                    df = df[pd.to_numeric(df[col], errors="coerce") < float(val)]
                elif op == "between":
                    lo, hi = float(val[0]), float(val[1])
                    df = df[(pd.to_numeric(df[col], errors="coerce") >= lo) & (pd.to_numeric(df[col], errors="coerce") <= hi)]
                elif op == "in":
                    df = df[df[col].astype(str).isin([str(v) for v in val])]
                elif op == "is_null":
                    df = df[df[col].isnull()]
                elif op == "is_not_null":
                    df = df[df[col].notnull()]
            except Exception as e:
                logger.warning("filter_application_failed", column=col, op=op, error=str(e))

        # Sorting
        if sort_by and sort_by in df.columns:
            df = df.sort_values(sort_by, ascending=(sort_order == "asc"))

        filtered_count = len(df)
        total_pages = max(1, (filtered_count + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        page_df = df.iloc[offset: offset + page_size]

        # Serialize safely
        rows = []
        for rec in page_df.to_dict(orient="records"):
            serialized = {}
            for k, v in rec.items():
                if v is None or (isinstance(v, float) and np.isnan(v)):
                    serialized[k] = None
                elif hasattr(v, "item"):
                    serialized[k] = v.item()
                else:
                    serialized[k] = v
            rows.append(serialized)

        elapsed = round((time.perf_counter() - start) * 1000, 1)
        logger.info(
            "dashboard_query_executed",
            dataset_id=dataset_id,
            user_id=user_id,
            original_count=original_count,
            filtered_count=filtered_count,
            elapsed_ms=elapsed,
        )

        return {
            "dataset_id": dataset_id,
            "columns": list(df.columns),
            "rows": rows,
            "total_rows": filtered_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "applied_filters": len(filters),
            "query_time_ms": elapsed,
        }

    # -------------------------------------------------------------------------
    # Dashboard Overview
    # -------------------------------------------------------------------------

    def get_dashboard_overview(self, user_id: str) -> Dict[str, Any]:
        """Returns high-level dashboard metrics for the home page."""
        items, total = self.repository.get_by_user_id(user_id, skip=0, limit=100)
        ready_datasets = [d for d in items if d.upload_status.value == "ready"]
        total_rows = sum(d.row_count or 0 for d in ready_datasets)
        total_size = sum(d.file_size or 0 for d in ready_datasets)

        recent = sorted(items, key=lambda d: d.created_at, reverse=True)[:5]

        return {
            "total_datasets": total,
            "ready_datasets": len(ready_datasets),
            "total_rows_processed": total_rows,
            "total_storage_bytes": total_size,
            "recent_datasets": [
                {
                    "id": d.id,
                    "name": d.original_filename,
                    "status": d.upload_status.value,
                    "rows": d.row_count,
                    "columns": d.column_count,
                    "created_at": d.created_at.isoformat(),
                }
                for d in recent
            ],
        }

    # -------------------------------------------------------------------------
    # Helpers
    # -------------------------------------------------------------------------

    def _safe_float(self, val: Any) -> Optional[float]:
        try:
            v = float(val)
            return None if np.isnan(v) or np.isinf(v) else round(v, 4)
        except Exception:
            return None
