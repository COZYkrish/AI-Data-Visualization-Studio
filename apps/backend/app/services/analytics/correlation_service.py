import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from app.schemas.analytics import CorrelationResult

class CorrelationService:
    def __init__(self):
        pass

    def analyze(self, df: pd.DataFrame) -> CorrelationResult:
        # Filter for numeric columns only
        numeric_df = df.select_dtypes(include=[np.number])
        
        if numeric_df.empty or numeric_df.shape[1] < 2:
            return CorrelationResult(
                pearson_matrix={},
                spearman_matrix={},
                covariance_matrix={},
                strong_correlations=[]
            )

        # Calculate matrices
        # Fill NA temporarily for correlation calculation if needed, but corr() handles it pairwise usually
        pearson_matrix = numeric_df.corr(method='pearson').fillna(0).to_dict()
        spearman_matrix = numeric_df.corr(method='spearman').fillna(0).to_dict()
        covariance_matrix = numeric_df.cov().fillna(0).to_dict()

        # Find strong correlations
        strong_correlations = self._extract_strong_correlations(pearson_matrix, method="Pearson")
        strong_correlations.extend(self._extract_strong_correlations(spearman_matrix, method="Spearman"))
        
        # Deduplicate strong correlations (keep the one with max absolute score)
        deduped_correlations = self._deduplicate_correlations(strong_correlations)

        return CorrelationResult(
            pearson_matrix=pearson_matrix,
            spearman_matrix=spearman_matrix,
            covariance_matrix=covariance_matrix,
            strong_correlations=deduped_correlations
        )

    def _extract_strong_correlations(self, matrix: Dict[str, Dict[str, float]], method: str) -> List[Dict[str, Any]]:
        strong_corrs = []
        columns = list(matrix.keys())
        
        for i in range(len(columns)):
            for j in range(i + 1, len(columns)):
                col1 = columns[i]
                col2 = columns[j]
                score = matrix[col1][col2]
                
                abs_score = abs(score)
                strength = None
                
                if abs_score >= 0.90:
                    strength = "Very Strong"
                elif abs_score >= 0.70:
                    strength = "Strong"
                
                if strength:
                    strong_corrs.append({
                        "col1": col1,
                        "col2": col2,
                        "score": score,
                        "method": method,
                        "strength": strength,
                        "direction": "Positive" if score > 0 else "Negative"
                    })
                    
        return strong_corrs
        
    def _deduplicate_correlations(self, correlations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Map pair tuple (sorted) to max score correlation
        best_corrs = {}
        for c in correlations:
            pair = tuple(sorted([c["col1"], c["col2"]]))
            if pair not in best_corrs or abs(c["score"]) > abs(best_corrs[pair]["score"]):
                best_corrs[pair] = c
                
        # Sort by absolute score descending
        result = list(best_corrs.values())
        result.sort(key=lambda x: abs(x["score"]), reverse=True)
        return result
