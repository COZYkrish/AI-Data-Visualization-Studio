import uuid
from typing import List, Dict, Any
from app.schemas.analytics import Insight
from app.schemas.analytics import (
    CorrelationResult, DistributionResult, 
    TrendResult, OutlierResult, FeatureImportanceResult
)

class InsightEngine:
    def __init__(self):
        self.insights: List[Insight] = []
        
    def generate(self, 
                 correlation: CorrelationResult,
                 distribution: DistributionResult,
                 trend: TrendResult,
                 outliers: OutlierResult,
                 features: FeatureImportanceResult) -> List[Insight]:
                 
        self.insights = []
        
        self._generate_correlation_insights(correlation)
        self._generate_distribution_insights(distribution)
        self._generate_trend_insights(trend)
        self._generate_outlier_insights(outliers)
        self._generate_data_quality_insights(distribution)
        
        # Deduplicate and Sort
        return self._post_process_insights()

    def _add_insight(self, title: str, description: str, severity: str, confidence: str, category: str, affected_columns: List[str], recommendation: str = None):
        insight = Insight(
            id=str(uuid.uuid4()),
            title=title,
            description=description,
            severity=severity,
            confidence=confidence,
            category=category,
            affected_columns=affected_columns,
            recommendation=recommendation
        )
        self.insights.append(insight)

    def _generate_correlation_insights(self, correlation: CorrelationResult):
        for corr in correlation.strong_correlations:
            if corr["strength"] == "Very Strong":
                title = f"Very Strong {corr['direction']} Correlation"
                desc = f"{corr['col1']} and {corr['col2']} have a very strong {corr['direction'].lower()} correlation ({corr['score']:.2f})."
                self._add_insight(
                    title=title,
                    description=desc,
                    severity="Info",
                    confidence="High",
                    category="Correlation",
                    affected_columns=[corr["col1"], corr["col2"]],
                    recommendation="These variables move closely together. Consider using one to predict the other, or removing one if reducing dimensionality."
                )

    def _generate_distribution_insights(self, distribution: DistributionResult):
        for col, stats in distribution.columns.items():
            classification = stats.get("classification")
            
            if classification == "Normal":
                self._add_insight(
                    title="Normal Distribution",
                    description=f"The '{col}' column is approximately normally distributed.",
                    severity="Info",
                    confidence="High",
                    category="Distribution",
                    affected_columns=[col],
                    recommendation="Suitable for parametric statistical tests."
                )
            elif classification == "Left Skewed":
                self._add_insight(
                    title="Left Skewed Distribution",
                    description=f"The '{col}' column is left skewed (most values are concentrated on the right).",
                    severity="Info",
                    confidence="Medium",
                    category="Distribution",
                    affected_columns=[col],
                    recommendation="Consider a power transformation if using in linear models."
                )
            elif classification == "Right Skewed":
                self._add_insight(
                    title="Right Skewed Distribution",
                    description=f"The '{col}' column is right skewed (long tail on the right).",
                    severity="Info",
                    confidence="Medium",
                    category="Distribution",
                    affected_columns=[col],
                    recommendation="Consider a log transformation if using in linear models."
                )

    def _generate_trend_insights(self, trend: TrendResult):
        for t in trend.increasing_trends:
            self._add_insight(
                title="Increasing Trend",
                description=f"'{t['column']}' shows a consistent increasing trend ({t['growth_percentage']:.1f}% growth) over time.",
                severity="Info",
                confidence="High",
                category="Trend",
                affected_columns=[t['column'], t['time_column']]
            )
            
        for t in trend.decreasing_trends:
            self._add_insight(
                title="Decreasing Trend",
                description=f"'{t['column']}' shows a decreasing trend ({t['growth_percentage']:.1f}% decline) over time.",
                severity="Warning",
                confidence="High",
                category="Trend",
                affected_columns=[t['column'], t['time_column']]
            )

    def _generate_outlier_insights(self, outliers: OutlierResult):
        if outliers.outlier_percentage > 5:
            self._add_insight(
                title="High Outlier Ratio",
                description=f"The dataset contains a high percentage of outliers ({outliers.outlier_percentage:.1f}%).",
                severity="Warning",
                confidence="High",
                category="Outlier",
                affected_columns=outliers.affected_columns,
                recommendation="Investigate if outliers are errors or valid extreme cases before analysis."
            )
            
        for col, values in outliers.extreme_values.items():
            if len(values) > 0:
                self._add_insight(
                    title="Extreme Values Detected",
                    description=f"Column '{col}' contains significant extreme values (e.g. {values[0]['value']:.2f}).",
                    severity="Warning",
                    confidence="High",
                    category="Outlier",
                    affected_columns=[col],
                    recommendation="Consider robust scaling or capping (winsorization) for this column."
                )

    def _generate_data_quality_insights(self, distribution: DistributionResult):
        for col, stats in distribution.columns.items():
            missing = stats.get("missing_percentage", 0.0)
            if missing > 50:
                self._add_insight(
                    title="Severe Missing Data",
                    description=f"Column '{col}' is missing {missing:.1f}% of its values.",
                    severity="Critical",
                    confidence="High",
                    category="Data Quality",
                    affected_columns=[col],
                    recommendation="Consider dropping this column from predictive modeling."
                )
            elif missing > 10:
                self._add_insight(
                    title="Missing Data",
                    description=f"Column '{col}' is missing {missing:.1f}% of its values.",
                    severity="Warning",
                    confidence="High",
                    category="Data Quality",
                    affected_columns=[col],
                    recommendation="Consider imputation strategies."
                )
                
            unique_vals = stats.get("unique_values", 0)
            if unique_vals == 1:
                self._add_insight(
                    title="Zero Variance",
                    description=f"Column '{col}' has only one unique value.",
                    severity="Warning",
                    confidence="High",
                    category="Data Quality",
                    affected_columns=[col],
                    recommendation="This column provides no informational value and can be safely removed."
                )

    def _post_process_insights(self) -> List[Insight]:
        # Sort by severity (Critical -> Warning -> Info) and then confidence
        severity_map = {"Critical": 0, "Warning": 1, "Info": 2}
        confidence_map = {"High": 0, "Medium": 1, "Low": 2}
        
        sorted_insights = sorted(
            self.insights, 
            key=lambda x: (severity_map.get(x.severity, 3), confidence_map.get(x.confidence, 3))
        )
        
        # Limit to top N insights if necessary, or just return all
        return sorted_insights[:50]
