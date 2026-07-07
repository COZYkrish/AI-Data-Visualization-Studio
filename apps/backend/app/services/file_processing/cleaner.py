import pandas as pd
from typing import Dict, Any, Tuple
import re

def standardize_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """Standardizes column names: lowercase, replace spaces with underscores, remove special chars."""
    def clean_name(name):
        name = str(name).strip().lower()
        name = re.sub(r'[\s\-]+', '_', name)
        name = re.sub(r'[^\w_]', '', name)
        return name
    
    df.columns = [clean_name(col) for col in df.columns]
    return df

def clean_whitespace(df: pd.DataFrame) -> pd.DataFrame:
    """Strips leading/trailing whitespace from string columns."""
    str_cols = df.select_dtypes(include=['object', 'string']).columns
    for col in str_cols:
        df[col] = df[col].apply(lambda x: x.strip() if isinstance(x, str) else x)
    return df

def detect_missing_values(df: pd.DataFrame) -> Dict[str, int]:
    """Detects missing values per column (Null, NaN, None, empty strings)."""
    # Replace empty strings or whitespace-only strings with NaN for counting
    temp_df = df.replace(r'^\s*$', pd.NA, regex=True)
    missing = temp_df.isna().sum()
    return {str(k): int(v) for k, v in missing[missing > 0].items()}

def handle_missing_values(df: pd.DataFrame, strategy: str = "keep") -> pd.DataFrame:
    """Configurable handling of missing values. Currently defaults to 'keep'."""
    # Replace empty strings with NaN first
    df = df.replace(r'^\s*$', pd.NA, regex=True)
    
    if strategy == "drop_rows":
        df = df.dropna()
    elif strategy == "drop_cols":
        df = df.dropna(axis=1)
    # Further strategies (fill_mean, fill_median) can be added here
    
    return df

def clean_dataset(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Runs the complete cleaning pipeline and returns cleaned DF and cleaning stats."""
    stats: Dict[str, Any] = {}
    
    # 1. Standardize columns
    df = standardize_column_names(df)
    
    # 2. Whitespace cleanup
    df = clean_whitespace(df)
    
    # 3. Duplicate detection
    duplicates_count = int(df.duplicated().sum())
    stats['duplicate_rows'] = duplicates_count
    
    # 4. Missing value detection
    missing_values = detect_missing_values(df)
    stats['missing_values'] = missing_values
    
    # 5. Missing value handling (Default: keep)
    df = handle_missing_values(df, strategy="keep")
    
    return df, stats
