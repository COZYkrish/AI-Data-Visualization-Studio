import pandas as pd
import numpy as np
from typing import Dict, Any, List, cast
from app.schemas.analytics import TrendResult

class TrendService:
    def __init__(self):
        pass

    def analyze(self, df: pd.DataFrame) -> TrendResult:
        # Identify date/datetime columns
        date_cols = []
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                date_cols.append(col)
            elif df[col].dtype == 'object':
                try:
                    # Attempt to convert a sample to see if it's a date
                    sample = df[col].dropna().head(10)
                    if not sample.empty:
                        pd.to_datetime(sample)
                        # If successful, we can consider it a date col. For safety in production we might not want to cast the whole column here if it fails
                        date_cols.append(col)
                except (ValueError, TypeError):
                    pass

        if not date_cols:
            return TrendResult(
                increasing_trends=[],
                decreasing_trends=[],
                rolling_averages={},
                seasonality_indicators={}
            )

        increasing_trends = []
        decreasing_trends = []
        rolling_averages = {}

        # Use the first valid date column as the primary time axis for trends
        time_col = date_cols[0]
        
        # Ensure it's datetime
        if not pd.api.types.is_datetime64_any_dtype(df[time_col]):
            df_time = pd.to_datetime(df[time_col], errors='coerce')
        else:
            df_time = df[time_col]
            
        df_temp = df.copy()
        df_temp[time_col] = df_time
        df_temp = df_temp.dropna(subset=[time_col]).sort_values(by=time_col)
        
        if df_temp.empty:
            return TrendResult(
                increasing_trends=[],
                decreasing_trends=[],
                rolling_averages={},
                seasonality_indicators={}
            )

        numeric_cols = df_temp.select_dtypes(include=['number']).columns

        for col in numeric_cols:
            if col == time_col:
                continue
                
            # Aggregate by month (or suitable period)
            # To keep it simple, we use a monthly resample or rolling average on the sorted data
            series = df_temp.set_index(time_col)[col].dropna()
            
            if len(series) < 5:
                continue
                
            # Calculate a simple 7-period rolling average
            rolling_avg = series.rolling(window=min(7, len(series)//2)).mean().dropna()
            
            # Subsample for output to avoid huge JSONs (e.g. keep max 50 points)
            step = max(1, len(rolling_avg) // 50)
            sampled_rolling = rolling_avg.iloc[::step]
            
            rolling_averages[col] = {
                "dates": sampled_rolling.index.astype(str).tolist(),
                "values": sampled_rolling.values.tolist()
            }
            
            # Simple trend detection using linear regression slope (polyfit)
            # Convert dates to ordinal for regression
            x = series.index.map(pd.Timestamp.toordinal)
            y = series.values
            
            if len(x) > 1:
                slope, _ = np.polyfit(np.array(x, dtype=float), np.array(y, dtype=float), 1)
                
                # Normalize slope to a percentage growth over the whole period
                period_days = max(1, x.max() - x.min())
                start_val = float(np.mean(np.array(y, dtype=float))) # approximation
                
                if start_val != 0:
                    total_growth_pct = (slope * period_days / start_val) * 100
                else:
                    total_growth_pct = 0
                    
                trend_item = {
                    "column": col,
                    "time_column": time_col,
                    "growth_percentage": float(total_growth_pct),
                    "slope": float(slope)
                }
                
                if total_growth_pct > 5:
                    increasing_trends.append(trend_item)
                elif total_growth_pct < -5:
                    decreasing_trends.append(trend_item)

        # Sort trends by magnitude
        increasing_trends.sort(key=lambda x: cast(float, x["growth_percentage"]), reverse=True)
        decreasing_trends.sort(key=lambda x: cast(float, x["growth_percentage"]))

        return TrendResult(
            increasing_trends=increasing_trends,
            decreasing_trends=decreasing_trends,
            rolling_averages=rolling_averages,
            seasonality_indicators={} # To be expanded with proper decomposition if needed
        )
