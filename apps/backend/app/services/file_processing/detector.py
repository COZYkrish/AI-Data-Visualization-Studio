import pandas as pd
from typing import Dict

def detect_data_types(df: pd.DataFrame) -> Dict[str, str]:
    """
    Infers data types for all columns in the DataFrame.
    Categorizes into: Integer, Float, Boolean, Date/Datetime, Category, Text.
    """
    type_mapping = {}
    
    for col in df.columns:
        # Pandas auto-inferred type
        dtype = str(df[col].dtype)
        
        # Check for boolean
        if 'bool' in dtype:
            type_mapping[col] = 'boolean'
            continue
            
        # Check for numeric types
        if 'int' in dtype:
            # Check if it could be a categorical variable (e.g., small number of unique integers)
            if df[col].nunique() < 10 and len(df) > 100:
                type_mapping[col] = 'category'
            else:
                type_mapping[col] = 'integer'
            continue
            
        if 'float' in dtype:
            type_mapping[col] = 'float'
            continue
            
        if 'datetime' in dtype:
            type_mapping[col] = 'datetime'
            continue
            
        # For object types, try to infer more specific types
        if dtype == 'object' or dtype == 'string':
            # Check if it's a date string
            try:
                pd.to_datetime(df[col].dropna().head(10))
                type_mapping[col] = 'datetime'
                continue
            except (ValueError, TypeError):
                pass
                
            # Check for categorical (few unique strings relative to total size)
            num_unique = df[col].nunique()
            if num_unique > 0 and num_unique < 50 and (len(df) / num_unique) > 10:
                type_mapping[col] = 'category'
                continue
                
            # Fallback to text
            type_mapping[col] = 'text'
            
    return type_mapping
