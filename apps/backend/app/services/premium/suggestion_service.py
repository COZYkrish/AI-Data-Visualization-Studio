"""
Suggestion Service — Phase 9: Premium Features

A deterministic, rule-based dashboard suggestion engine.
Analyzes dataset column types & statistics to produce explainable recommendations.
Every suggestion includes a 'why' field explaining the reasoning.
No random suggestions — all rules are deterministic.
"""
from __future__ import annotations

import json
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
import structlog

from app.models.premium import DashboardSuggestion
from app.models.dataset import Dataset, DatasetMetadata

logger = structlog.get_logger(__name__)


# ─── Rule Definitions ────────────────────────────────────────────────────────

def _has_type(col_types: Dict[str, str], dtype: str) -> bool:
    return any(v == dtype for v in col_types.values())


def _cols_of_type(col_types: Dict[str, str], dtype: str) -> List[str]:
    return [col for col, t in col_types.items() if t == dtype]


def _apply_rules(
    col_types: Dict[str, str],
    stats: Optional[Dict[str, Any]],
    row_count: int,
    col_count: int,
) -> List[Dict[str, Any]]:
    """Evaluate all rules deterministically and return suggestion specs."""
    suggestions: List[Dict[str, Any]] = []

    numeric_cols = _cols_of_type(col_types, "numeric")
    categorical_cols = _cols_of_type(col_types, "categorical")
    date_cols = _cols_of_type(col_types, "datetime")

    # ── Rule 1: Date + Numeric → Line Chart (trend) ──────────────────────────
    if date_cols and numeric_cols:
        suggestions.append({
            "suggestion_type": "chart",
            "title": f"Visualize {numeric_cols[0]} over time",
            "description": f"Plot {numeric_cols[0]} against {date_cols[0]} as a time-series line chart.",
            "why": f"A date column ({date_cols[0]}) and a numeric column ({numeric_cols[0]}) were detected. Line charts are ideal for showing trends and changes over time.",
            "priority": 9,
            "config": {"chart_type": "line", "x": date_cols[0], "y": numeric_cols[0]},
        })

    # ── Rule 2: Categorical + Numeric → Bar Chart ─────────────────────────────
    if categorical_cols and numeric_cols:
        suggestions.append({
            "suggestion_type": "chart",
            "title": f"Compare {numeric_cols[0]} by {categorical_cols[0]}",
            "description": f"Group data by {categorical_cols[0]} and plot {numeric_cols[0]} as a bar chart.",
            "why": f"A categorical column ({categorical_cols[0]}) and a numeric column ({numeric_cols[0]}) were detected. Bar charts excel at comparing values across distinct categories.",
            "priority": 8,
            "config": {"chart_type": "bar", "x": categorical_cols[0], "y": numeric_cols[0], "aggregation": "sum"},
        })

    # ── Rule 3: Low-cardinality Categorical → Pie Chart ───────────────────────
    if categorical_cols and stats:
        for cat_col in categorical_cols:
            cardinality = stats.get(cat_col, {}).get("unique_count", 999)
            if isinstance(cardinality, (int, float)) and cardinality <= 8:
                suggestions.append({
                    "suggestion_type": "chart",
                    "title": f"Proportion breakdown of {cat_col}",
                    "description": f"Show how {cat_col} values are distributed as a pie chart.",
                    "why": f"The column '{cat_col}' has only {int(cardinality)} unique values — a pie chart clearly shows the proportion of each category.",
                    "priority": 7,
                    "config": {"chart_type": "pie", "category": cat_col, "value": numeric_cols[0] if numeric_cols else None},
                })
                break

    # ── Rule 4: Two+ Numerics → Scatter Plot (correlation) ───────────────────
    if len(numeric_cols) >= 2:
        corr = None
        if stats:
            corr = stats.get("correlations", {}).get(f"{numeric_cols[0]}__{numeric_cols[1]}")
        if corr is not None and abs(float(corr)) > 0.5:
            strength = "strong" if abs(float(corr)) > 0.7 else "moderate"
            direction = "positive" if float(corr) > 0 else "negative"
            suggestions.append({
                "suggestion_type": "chart",
                "title": f"Correlation: {numeric_cols[0]} vs {numeric_cols[1]}",
                "description": f"Explore the {strength} {direction} correlation between these columns.",
                "why": f"A Pearson correlation of {corr:.2f} was detected between '{numeric_cols[0]}' and '{numeric_cols[1]}'. Scatter plots reveal patterns invisible in aggregate views.",
                "priority": 8,
                "config": {"chart_type": "scatter", "x": numeric_cols[0], "y": numeric_cols[1]},
            })
        else:
            suggestions.append({
                "suggestion_type": "chart",
                "title": f"Explore relationship: {numeric_cols[0]} vs {numeric_cols[1]}",
                "description": "A scatter plot can reveal correlations between two numeric dimensions.",
                "why": f"Two numeric columns ({numeric_cols[0]}, {numeric_cols[1]}) are present. Scatter plots help identify correlations, clusters, and outliers.",
                "priority": 5,
                "config": {"chart_type": "scatter", "x": numeric_cols[0], "y": numeric_cols[1]},
            })

    # ── Rule 5: High-variance numeric → Box Plot ──────────────────────────────
    if numeric_cols and stats:
        for num_col in numeric_cols:
            std = stats.get(num_col, {}).get("std")
            mean = stats.get(num_col, {}).get("mean")
            if std and mean and mean != 0 and (float(std) / abs(float(mean))) > 0.5:
                suggestions.append({
                    "suggestion_type": "chart",
                    "title": f"Distribution of {num_col}",
                    "description": f"Show the statistical distribution of {num_col} including outliers.",
                    "why": f"High variance detected in '{num_col}' (CV={float(std)/abs(float(mean)):.1f}). Box plots highlight outliers, median, and quartile spread.",
                    "priority": 6,
                    "config": {"chart_type": "box", "y": num_col},
                })
                break

    # ── Rule 6: Large dataset → ML Opportunity ────────────────────────────────
    if row_count >= 500 and len(numeric_cols) >= 2:
        suggestions.append({
            "suggestion_type": "ml",
            "title": "Machine Learning opportunity detected",
            "description": f"This dataset has {row_count:,} rows and {len(numeric_cols)} numeric columns — a good candidate for regression or classification.",
            "why": f"Datasets with ≥500 rows and multiple numeric features are well-suited for supervised learning. Navigate to the ML Workspace to train a model.",
            "priority": 7,
            "config": {"target_candidates": numeric_cols[:3], "feature_candidates": numeric_cols},
        })

    # ── Rule 7: Date column → Forecast Opportunity ────────────────────────────
    if date_cols and numeric_cols and row_count >= 30:
        suggestions.append({
            "suggestion_type": "forecast",
            "title": f"Forecast {numeric_cols[0]} with Prophet",
            "description": f"Use the forecasting engine to predict future values of {numeric_cols[0]}.",
            "why": f"A time-indexed numeric series ({date_cols[0]} + {numeric_cols[0]}) with {row_count} observations is sufficient for Prophet forecasting.",
            "priority": 6,
            "config": {"date_col": date_cols[0], "target_col": numeric_cols[0]},
        })

    # ── Rule 8: KPI — Top-level summary cards ────────────────────────────────
    if numeric_cols:
        suggestions.append({
            "suggestion_type": "kpi",
            "title": "Add KPI summary cards",
            "description": f"Add {min(4, len(numeric_cols))} KPI cards to your dashboard header showing totals and averages.",
            "why": f"KPI cards provide instant at-a-glance insight. {len(numeric_cols)} numeric columns were detected — auto-generating summary statistics.",
            "priority": 5,
            "config": {"columns": numeric_cols[:4], "metrics": ["sum", "avg", "min", "max"]},
        })

    # Sort by priority descending
    suggestions.sort(key=lambda s: s["priority"], reverse=True)
    return suggestions


class SuggestionService:
    def generate_for_dataset(
        self,
        db: Session,
        user_id: str,
        dataset_id: str,
    ) -> List[DashboardSuggestion]:
        """
        Generates fresh deterministic suggestions for the given dataset.
        Clears previous suggestions for this user+dataset first.
        """
        # Clear existing non-dismissed suggestions
        db.query(DashboardSuggestion).filter(
            DashboardSuggestion.user_id == str(user_id),
            DashboardSuggestion.dataset_id == dataset_id,
            DashboardSuggestion.dismissed == False,  # noqa: E712
        ).delete()
        db.commit()

        # Fetch dataset metadata
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        metadata = db.query(DatasetMetadata).filter(DatasetMetadata.dataset_id == dataset_id).first()

        col_types: Dict[str, str] = {}
        stats: Optional[Dict[str, Any]] = None
        row_count = 0
        col_count = 0

        if dataset:
            row_count = dataset.row_count or 0
            col_count = dataset.column_count or 0

        if metadata:
            raw = metadata.column_metadata or {}
            for col_name, col_info in raw.items():
                inferred = col_info.get("dtype", "")
                if inferred in ("int64", "float64", "int32", "float32"):
                    col_types[col_name] = "numeric"
                elif inferred in ("datetime64[ns]", "datetime64"):
                    col_types[col_name] = "datetime"
                elif inferred in ("object", "category", "bool"):
                    col_types[col_name] = "categorical"
                else:
                    col_types[col_name] = "other"

            stats_raw = metadata.summary_statistics or {}
            if stats_raw:
                stats = stats_raw

        rule_results = _apply_rules(col_types, stats, row_count, col_count)

        created = []
        for spec in rule_results:
            sug = DashboardSuggestion(
                user_id=str(user_id),
                dataset_id=dataset_id,
                suggestion_type=spec["suggestion_type"],
                title=spec["title"],
                description=spec["description"],
                why=spec["why"],
                priority=spec["priority"],
                config=spec["config"],
            )
            db.add(sug)
            created.append(sug)

        db.commit()
        for s in created:
            db.refresh(s)

        logger.info(
            "suggestions_generated",
            user_id=str(user_id),
            dataset_id=dataset_id,
            count=len(created),
        )
        return created

    def list_for_user(
        self,
        db: Session,
        user_id: str,
        dataset_id: Optional[str] = None,
        include_dismissed: bool = False,
        limit: int = 20,
    ) -> List[DashboardSuggestion]:
        q = db.query(DashboardSuggestion).filter(
            DashboardSuggestion.user_id == str(user_id)
        )
        if dataset_id:
            q = q.filter(DashboardSuggestion.dataset_id == dataset_id)
        if not include_dismissed:
            q = q.filter(DashboardSuggestion.dismissed == False)  # noqa: E712
        return q.order_by(DashboardSuggestion.priority.desc()).limit(limit).all()

    def dismiss(self, db: Session, suggestion_id: str, user_id: str) -> Optional[DashboardSuggestion]:
        sug = db.query(DashboardSuggestion).filter(
            DashboardSuggestion.id == suggestion_id,
            DashboardSuggestion.user_id == str(user_id),
        ).first()
        if sug:
            sug.dismissed = True
            db.commit()
            db.refresh(sug)
            logger.info("suggestion_dismissed", suggestion_id=suggestion_id, user_id=str(user_id))
        return sug

    def mark_applied(self, db: Session, suggestion_id: str, user_id: str) -> Optional[DashboardSuggestion]:
        sug = db.query(DashboardSuggestion).filter(
            DashboardSuggestion.id == suggestion_id,
            DashboardSuggestion.user_id == str(user_id),
        ).first()
        if sug:
            sug.applied = True
            db.commit()
            db.refresh(sug)
        return sug


suggestion_service = SuggestionService()
