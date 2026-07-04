import pandas as pd
from typing import Dict, Any
import numpy as np

def generate_statistics(df: pd.DataFrame, data_types: Dict[str, str]) -> Dict[str, Any]:
    """Generates comprehensive statistics for all columns."""
    stats = {
        'global': {
            'row_count': len(df),
            'column_count': len(df.columns),
            'memory_usage_bytes': int(df.memory_usage(deep=True).sum())
        },
        'columns': {}
    }
    
    for col in df.columns:
        col_type = data_types.get(col, 'text')
        col_stats = {'type': col_type}
        
        # Numeric statistics
        if col_type in ['integer', 'float']:
            desc = df[col].describe()
            col_stats.update({
                'min': float(desc.get('min', 0)) if not pd.isna(desc.get('min')) else None,
                'max': float(desc.get('max', 0)) if not pd.isna(desc.get('max')) else None,
                'mean': float(desc.get('mean', 0)) if not pd.isna(desc.get('mean')) else None,
                'median': float(df[col].median()) if not pd.isna(df[col].median()) else None,
                'std': float(desc.get('std', 0)) if not pd.isna(desc.get('std')) else None,
                'q25': float(desc.get('25%', 0)) if not pd.isna(desc.get('25%')) else None,
                'q75': float(desc.get('75%', 0)) if not pd.isna(desc.get('75%')) else None,
            })
            
            # Outlier detection using IQR
            if col_stats['q25'] is not None and col_stats['q75'] is not None:
                iqr = col_stats['q75'] - col_stats['q25']
                lower_bound = col_stats['q25'] - 1.5 * iqr
                upper_bound = col_stats['q75'] + 1.5 * iqr
                outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)][col].count()
                col_stats['outlier_count'] = int(outliers)
                
        # Categorical / Text statistics
        elif col_type in ['category', 'text', 'boolean']:
            col_stats['unique_values'] = int(df[col].nunique())
            mode_series = df[col].mode()
            if not mode_series.empty:
                col_stats['mode'] = str(mode_series.iloc[0])
            
            # For category, get frequency of top 5
            if col_type == 'category':
                top_freq = df[col].value_counts().head(5).to_dict()
                col_stats['frequencies'] = {str(k): int(v) for k, v in top_freq.items()}
                
        stats['columns'][col] = col_stats
        
    return stats
