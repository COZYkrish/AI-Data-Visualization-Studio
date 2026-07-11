import pandas as pd
import os
from fastapi import HTTPException
import chardet

def detect_encoding(file_path: str) -> str:
    """Detects file encoding using chardet on the first chunk."""
    with open(file_path, 'rb') as f:
        raw_data = f.read(100000)
    result = chardet.detect(raw_data)
    return result['encoding'] or 'utf-8'

def parse_csv(file_path: str) -> pd.DataFrame:
    try:
        encoding = detect_encoding(file_path)
        # Using python engine allows for better malformed row handling via on_bad_lines
        df = pd.read_csv(file_path, encoding=encoding, sep=None, engine='python', on_bad_lines='skip')
        return df
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

def parse_excel(file_path: str, filename: str = "") -> pd.DataFrame:
    try:
        ext = os.path.splitext(filename)[1].lower() if filename else os.path.splitext(file_path)[1].lower()
        # Legacy .xls format requires xlrd; modern .xlsx uses openpyxl
        if ext == '.xls':
            df = pd.read_excel(file_path, engine='xlrd')
        else:
            df = pd.read_excel(file_path, engine='openpyxl')
        return df
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse Excel file: {str(e)}")

def parse_json(file_path: str) -> pd.DataFrame:
    try:
        df = pd.read_json(file_path)
        return df
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse JSON file: {str(e)}")

def parse_file(file_path: str, file_type: str, filename: str) -> pd.DataFrame:
    """Entry point to parse a file into a Pandas DataFrame."""
    ext = os.path.splitext(filename)[1].lower()
    
    if ext == '.csv' or 'csv' in file_type:
        df = parse_csv(file_path)
    elif ext in {'.xlsx', '.xls'} or 'excel' in file_type or 'spreadsheetml' in file_type:
        df = parse_excel(file_path, filename)
    elif ext == '.json' or 'json' in file_type:
        df = parse_json(file_path)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format for parsing.")
        
    if df.empty:
        raise HTTPException(status_code=400, detail="Parsed dataset appears to be empty.")
        
    return df
