"""
ChartRecommendationService — Phase 5: Dashboard & Visualization Engine

Deterministic (rule-based) engine that maps dataset column types and
cardinalities to the most appropriate chart types. No AI/ML involved.
"""
from typing import Dict, Any, List, Optional
import structlog

logger = structlog.get_logger(__name__)

# Chart type constants
CHART_BAR = "bar"
CHART_LINE = "line"
CHART_AREA = "area"
CHART_PIE = "pie"
CHART_DONUT = "donut"
CHART_SCATTER = "scatter"
CHART_HISTOGRAM = "histogram"
CHART_BOX = "box"
CHART_HEATMAP = "heatmap"
CHART_TREEMAP = "treemap"
CHART_BUBBLE = "bubble"
CHART_RADAR = "radar"

# Cardinality thresholds
LOW_CARDINALITY = 8
MEDIUM_CARDINALITY = 20
HIGH_CARDINALITY = 50


class ChartRecommendationService:
    """
    Provides deterministic chart recommendations based on column data types
    and dataset characteristics. Each recommendation includes the chart type,
    axis mappings, a human-readable reason, and a priority score.
    """

    def recommend(
        self,
        data_types: Dict[str, str],
        column_stats: Dict[str, Any],
        row_count: int,
        column_count: int,
    ) -> List[Dict[str, Any]]:
        """
        Main entry point. Returns a prioritized list of chart recommendations
        for the given dataset.
        """
        logger.info(
            "chart_recommendations_requested",
            column_count=column_count,
            row_count=row_count,
        )

        recommendations: List[Dict[str, Any]] = []

        numeric_cols = [c for c, t in data_types.items() if t == "numeric"]
        categorical_cols = [c for c, t in data_types.items() if t == "categorical"]
        date_cols = [c for c, t in data_types.items() if t == "datetime"]
        boolean_cols = [c for c, t in data_types.items() if t == "boolean"]

        # --- Rule 1: Numeric column → Histogram ---
        for col in numeric_cols:
            recommendations.append(
                self._make(
                    chart_type=CHART_HISTOGRAM,
                    title=f"Distribution of {col}",
                    x=col,
                    reason=f"Numeric column '{col}' → histogram shows value distribution",
                    priority=80,
                    config={"bins": 20},
                )
            )

        # --- Rule 2: Date + Numeric → Line Chart ---
        for date_col in date_cols:
            for num_col in numeric_cols[:3]:  # Limit to first 3 numeric
                recommendations.append(
                    self._make(
                        chart_type=CHART_LINE,
                        title=f"{num_col} over {date_col}",
                        x=date_col,
                        y=num_col,
                        reason=f"Date '{date_col}' + numeric '{num_col}' → time series line chart",
                        priority=95,
                    )
                )
                # Also recommend area chart for cumulative context
                recommendations.append(
                    self._make(
                        chart_type=CHART_AREA,
                        title=f"{num_col} area over {date_col}",
                        x=date_col,
                        y=num_col,
                        reason=f"Date + numeric → area chart for cumulative trend",
                        priority=70,
                    )
                )

        # --- Rule 3: Category + Numeric → Bar Chart ---
        for cat_col in categorical_cols:
            cardinality = column_stats.get(cat_col, {}).get("unique_values", 0)
            for num_col in numeric_cols[:2]:
                if cardinality <= HIGH_CARDINALITY:
                    recommendations.append(
                        self._make(
                            chart_type=CHART_BAR,
                            title=f"{num_col} by {cat_col}",
                            x=cat_col,
                            y=num_col,
                            reason=f"Category '{cat_col}' + numeric '{num_col}' → grouped bar chart",
                            priority=90,
                        )
                    )

        # --- Rule 4: Low-cardinality category → Pie / Donut ---
        for cat_col in categorical_cols:
            cardinality = column_stats.get(cat_col, {}).get("unique_values", 0)
            if 2 <= cardinality <= LOW_CARDINALITY:
                recommendations.append(
                    self._make(
                        chart_type=CHART_PIE,
                        title=f"Share by {cat_col}",
                        x=cat_col,
                        reason=f"Low-cardinality category '{cat_col}' → pie chart for proportions",
                        priority=85,
                    )
                )
                recommendations.append(
                    self._make(
                        chart_type=CHART_DONUT,
                        title=f"{cat_col} breakdown",
                        x=cat_col,
                        reason=f"Low-cardinality category '{cat_col}' → donut for cleaner aesthetics",
                        priority=75,
                    )
                )

        # --- Rule 5: High-cardinality category → Treemap ---
        for cat_col in categorical_cols:
            cardinality = column_stats.get(cat_col, {}).get("unique_values", 0)
            if cardinality > MEDIUM_CARDINALITY:
                recommendations.append(
                    self._make(
                        chart_type=CHART_TREEMAP,
                        title=f"{cat_col} treemap",
                        x=cat_col,
                        reason=f"High-cardinality category '{cat_col}' → treemap for many categories",
                        priority=72,
                    )
                )

        # --- Rule 6: Two Numeric Columns → Scatter Plot ---
        if len(numeric_cols) >= 2:
            x_col, y_col = numeric_cols[0], numeric_cols[1]
            recommendations.append(
                self._make(
                    chart_type=CHART_SCATTER,
                    title=f"{x_col} vs {y_col}",
                    x=x_col,
                    y=y_col,
                    reason=f"Two numeric columns → scatter plot to reveal correlation",
                    priority=88,
                )
            )
            # Bubble with third numeric dimension
            if len(numeric_cols) >= 3:
                size_col = numeric_cols[2]
                recommendations.append(
                    self._make(
                        chart_type=CHART_BUBBLE,
                        title=f"{x_col} vs {y_col} (sized by {size_col})",
                        x=x_col,
                        y=y_col,
                        reason=f"Three numeric columns → bubble chart adds size dimension",
                        priority=65,
                        config={"size": size_col},
                    )
                )

        # --- Rule 7: Many Numeric Columns → Correlation Heatmap ---
        if len(numeric_cols) >= 3:
            recommendations.append(
                self._make(
                    chart_type=CHART_HEATMAP,
                    title="Correlation Heatmap",
                    reason=f"{len(numeric_cols)} numeric columns → heatmap to show pairwise correlations",
                    priority=82,
                    config={"columns": numeric_cols[:10]},
                )
            )

        # --- Rule 8: Multiple Numeric Columns → Radar Chart ---
        if 3 <= len(numeric_cols) <= 10 and categorical_cols:
            recommendations.append(
                self._make(
                    chart_type=CHART_RADAR,
                    title="Multi-metric Radar",
                    reason=f"Multiple numeric columns → radar chart for profile comparison",
                    priority=60,
                    config={"columns": numeric_cols[:6]},
                )
            )

        # --- Rule 9: Numeric Column → Box Plot ---
        for col in numeric_cols[:4]:
            recommendations.append(
                self._make(
                    chart_type=CHART_BOX,
                    title=f"Box plot: {col}",
                    x=col,
                    reason=f"Numeric column '{col}' → box plot shows outliers and spread",
                    priority=68,
                )
            )

        # Sort by priority (highest first), deduplicate by (type, x, y)
        seen = set()
        unique_recs = []
        for rec in sorted(recommendations, key=lambda r: r["priority"], reverse=True):
            key = (rec["chart_type"], rec.get("x"), rec.get("y"))
            if key not in seen:
                seen.add(key)
                unique_recs.append(rec)

        logger.info(
            "chart_recommendations_generated",
            count=len(unique_recs),
        )
        return unique_recs[:20]  # Return top 20

    # -------------------------------------------------------------------------
    # Helper
    # -------------------------------------------------------------------------

    def _make(
        self,
        chart_type: str,
        title: str,
        reason: str,
        priority: int,
        x: Optional[str] = None,
        y: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        return {
            "chart_type": chart_type,
            "title": title,
            "x": x,
            "y": y,
            "reason": reason,
            "priority": priority,
            "config": config or {},
        }
