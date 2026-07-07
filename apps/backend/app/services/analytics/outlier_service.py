import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.schemas.analytics import OutlierResult
from scipy.stats import median_abs_deviation  # type: ignore

class OutlierService:
    def __init__(self):
        pass

    def analyze(self, df: pd.DataFrame) -> OutlierResult:
        numeric_cols = df.select_dtypes(include=[np.number]).columns  # type: ignore[call-overload]
        
        if len(numeric_cols) == 0:
            return OutlierResult(
                outlier_count=0,
                outlier_percentage=0.0,
                affected_columns=[],
                extreme_values={},
                data_quality_warnings=[]
            )

        total_rows = len(df)
        all_outlier_indices = set()
        affected_columns = []
        extreme_values_dict = {}
        data_quality_warnings = []

        for col in numeric_cols:
            series = df[col].dropna()
            if len(series) < 10:
                continue
                
            # Method 1: IQR
            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            outliers_iqr = series[(series < lower_bound) | (series > upper_bound)]
            
            # Method 2: Modified Z-Score (more robust for skewed distributions)
            # median = series.median()
            # mad = median_abs_deviation(series, scale='normal')
            # if mad != 0:
            #     mod_z_scores = 0.6745 * (series - median) / mad
            #     outliers_mz = series[np.abs(mod_z_scores) > 3.5]
            # else:
            #     outliers_mz = pd.Series(dtype=float)
            
            # Use IQR for now as primary indicator
            col_outliers = outliers_iqr
            
            if not col_outliers.empty:
                affected_columns.append(col)
                all_outlier_indices.update(col_outliers.index.tolist())
                
                # Sample top extreme values (e.g. 5 highest and 5 lowest outliers)
                sorted_outliers = col_outliers.sort_values()
                extreme_sample = []
                
                for idx, val in pd.concat([sorted_outliers.head(5), sorted_outliers.tail(5)]).drop_duplicates().items():
                    extreme_sample.append({
                        "index": int(idx),
                        "value": float(val),
                        "type": "Low" if val < lower_bound else "High"
                    })
                    
                extreme_values_dict[col] = extreme_sample
                
                col_outlier_pct = (len(col_outliers) / total_rows) * 100
                if col_outlier_pct > 5:
                    data_quality_warnings.append(f"Column '{col}' has {col_outlier_pct:.1f}% outliers, which may skew analysis.")
                    
        total_outlier_count = len(all_outlier_indices)
        total_outlier_percentage = (total_outlier_count / total_rows) * 100 if total_rows > 0 else 0.0

        return OutlierResult(
            outlier_count=total_outlier_count,
            outlier_percentage=float(total_outlier_percentage),
            affected_columns=affected_columns,
            extreme_values=extreme_values_dict,
            data_quality_warnings=data_quality_warnings
        )
