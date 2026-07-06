import pandas as pd
import numpy as np
from typing import Dict, Any
from app.schemas.analytics import DistributionResult
from scipy.stats import skew, kurtosis

class DistributionService:
    def __init__(self):
        pass

    def analyze(self, df: pd.DataFrame) -> DistributionResult:
        columns_data = {}
        
        for col in df.columns:
            series = df[col].dropna()
            if series.empty:
                continue
                
            is_numeric = pd.api.types.is_numeric_dtype(series)
            n = len(series)
            
            # Common stats
            missing_count = df[col].isna().sum()
            missing_percentage = (missing_count / len(df)) * 100
            unique_values = series.nunique()
            duplicate_percentage = 100 - ((unique_values / n) * 100) if n > 0 else 0
            
            if is_numeric:
                mean: Any = series.mean()
                median: Any = series.median()
                mode: Any = series.mode().iloc[0] if not series.mode().empty else None
                variance: Any = series.var()
                std_dev: Any = series.std()
                minimum: Any = series.min()
                maximum: Any = series.max()
                data_range: Any = maximum - minimum
                q1: Any = series.quantile(0.25)
                q2: Any = median
                q3: Any = series.quantile(0.75)
                
                # Skewness and Kurtosis
                skew_val = float(skew(series, nan_policy='omit')) if n > 2 else 0.0
                kurt_val = float(kurtosis(series, nan_policy='omit')) if n > 3 else 0.0
                
                classification = self._classify_numeric_distribution(skew_val, kurt_val, unique_values, n)
                
                columns_data[col] = {
                    "type": "numeric",
                    "mean": float(mean) if not pd.isna(mean) else None,
                    "median": float(median) if not pd.isna(median) else None,
                    "mode": float(mode) if not pd.isna(mode) else None,
                    "variance": float(variance) if not pd.isna(variance) else None,
                    "std_dev": float(std_dev) if not pd.isna(std_dev) else None,
                    "min": float(minimum) if not pd.isna(minimum) else None,
                    "max": float(maximum) if not pd.isna(maximum) else None,
                    "range": float(data_range) if not pd.isna(data_range) else None,
                    "q1": float(q1) if not pd.isna(q1) else None,
                    "q2": float(q2) if not pd.isna(q2) else None,
                    "q3": float(q3) if not pd.isna(q3) else None,
                    "skewness": skew_val,
                    "kurtosis": kurt_val,
                    "unique_values": int(unique_values),
                    "missing_percentage": float(missing_percentage),
                    "duplicate_percentage": float(duplicate_percentage),
                    "classification": classification
                }
            else:
                mode = series.mode().iloc[0] if not series.mode().empty else None
                classification = "Categorical"
                
                columns_data[col] = {
                    "type": "categorical",
                    "mode": str(mode) if mode is not None else None,
                    "unique_values": int(unique_values),
                    "missing_percentage": float(missing_percentage),
                    "duplicate_percentage": float(duplicate_percentage),
                    "classification": classification
                }
                
        return DistributionResult(columns=columns_data)

    def _classify_numeric_distribution(self, skew_val: float, kurt_val: float, unique_values: int, n: int) -> str:
        if unique_values < 10 or (unique_values / n) < 0.05:
            return "Categorical"
            
        if -0.5 <= skew_val <= 0.5:
            if abs(kurt_val - 3.0) < 1.0: # Close to 3 is normal in some definitions, scipy kurtosis is excess (so 0 is normal)
                pass # Actually scipy.stats.kurtosis calculates excess kurtosis (normal is 0) by default
            if abs(kurt_val) < 1.0:
                return "Normal"
            else:
                return "Symmetric (Non-Normal)"
        elif skew_val < -0.5:
            return "Left Skewed"
        elif skew_val > 0.5:
            return "Right Skewed"
            
        return "Unknown"
