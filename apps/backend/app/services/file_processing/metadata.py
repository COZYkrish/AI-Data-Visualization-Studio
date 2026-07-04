from typing import Dict, Any

def compile_metadata(cleaning_stats: Dict[str, Any], data_types: Dict[str, str], memory_usage: int, columns: list) -> Dict[str, Any]:
    """Compiles all pipeline outputs into a structured metadata format for the database."""
    return {
        "memory_usage": memory_usage,
        "missing_values": cleaning_stats.get('missing_values', {}),
        "duplicate_rows": cleaning_stats.get('duplicate_rows', 0),
        "detected_columns": {col: data_types.get(col, 'text') for col in columns},
        "detected_data_types": data_types,
        "normalization_status": "none",
        "preprocessing_status": "completed"
    }
