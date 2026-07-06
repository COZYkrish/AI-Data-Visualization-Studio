import pandas as pd
from typing import Dict, Any, List
from app.schemas.analytics import FeatureImportanceResult, FeatureImportanceItem
from app.schemas.analytics import CorrelationResult, DistributionResult

class FeatureImportanceService:
    def __init__(self):
        pass

    def analyze(self, df: pd.DataFrame, correlation_result: CorrelationResult, distribution_result: DistributionResult) -> FeatureImportanceResult:
        features = []
        total_rows = len(df)
        
        if total_rows == 0:
            return FeatureImportanceResult(ranked_features=[])

        # Get correlation counts per feature (how many strong correlations it has)
        strong_corr_counts = {}
        for corr in correlation_result.strong_correlations:
            col1 = corr["col1"]
            col2 = corr["col2"]
            strong_corr_counts[col1] = strong_corr_counts.get(col1, 0) + 1
            strong_corr_counts[col2] = strong_corr_counts.get(col2, 0) + 1

        for col_name, stats in distribution_result.columns.items():
            # 1. Missing Value Penalty
            missing_pct = stats.get("missing_percentage", 0.0)
            missing_penalty = min(100.0, missing_pct * 1.5) # Penalty maxes out
            
            # 2. Information Density
            # Ratio of non-null, non-duplicate values
            unique_values = stats.get("unique_values", 0)
            valid_rows = total_rows * (1 - missing_pct / 100)
            density = (unique_values / valid_rows * 100) if valid_rows > 0 else 0
            
            # 3. Cardinality Score
            if unique_values == 1:
                cardinality_score = 0 # Constant column, no info
            elif unique_values == valid_rows and valid_rows > 10:
                cardinality_score = 10 # ID column likely, low analytic value
            else:
                cardinality_score = min(100.0, (unique_values / min(valid_rows, 1000)) * 100)
                
            # 4. Variance Score (for numeric)
            variance_score = 0.0
            if stats.get("type") == "numeric":
                # A heuristic to normalize variance
                mean = stats.get("mean", 0)
                std_dev = stats.get("std_dev", 0)
                if mean and std_dev and mean != 0:
                    cv = abs(std_dev / mean) # Coefficient of variation
                    variance_score = min(100.0, cv * 50)
                elif std_dev and std_dev > 0:
                    variance_score = 50.0

            # 5. Correlation Score
            corr_count = strong_corr_counts.get(col_name, 0)
            correlation_score = min(100.0, corr_count * 10.0)

            # Overall Importance Score calculation
            # Weights can be adjusted based on domain
            base_score = 50.0
            score = base_score + (variance_score * 0.3) + (correlation_score * 0.4) + (cardinality_score * 0.2) + (density * 0.1) - missing_penalty
            
            # Bound score between 0 and 100
            overall_score = max(0.0, min(100.0, score))

            features.append(
                FeatureImportanceItem(
                    column=col_name,
                    overall_importance_score=float(overall_score),
                    variance_score=float(variance_score),
                    correlation_score=float(correlation_score),
                    missing_value_penalty=float(missing_penalty),
                    cardinality_score=float(cardinality_score),
                    information_density=float(density)
                )
            )

        # Rank features
        features.sort(key=lambda x: x.overall_importance_score, reverse=True)

        return FeatureImportanceResult(ranked_features=features)
