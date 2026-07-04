import pandas as pd
from typing import Dict, Any, List

def generate_preview(df: pd.DataFrame, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
    """Generates a paginated JSON-friendly preview of the dataset."""
    total_rows = len(df)
    columns = df.columns.tolist()
    
    # Handle pagination
    end_idx = min(offset + limit, total_rows)
    chunk = df.iloc[offset:end_idx]
    
    # Convert NaNs and pd.NA to None for JSON serialization
    chunk = chunk.replace({pd.NA: None})
    chunk = chunk.where(pd.notnull(chunk), None)
    
    # Convert datetime columns to string
    for col in chunk.select_dtypes(include=['datetime64']).columns:
        chunk[col] = chunk[col].astype(str)
        
    rows = chunk.to_dict(orient='records')
    
    return {
        "columns": columns,
        "rows": rows,
        "total_rows": total_rows,
        "limit": limit,
        "offset": offset
    }
