import os
from fastapi import UploadFile, HTTPException

MAX_FILE_SIZE = 50 * 1024 * 1024 # 50 MB
ALLOWED_EXTENSIONS = {'.csv', '.json', '.xlsx', '.xls'}
ALLOWED_MIME_TYPES = {
    'text/csv',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

def validate_upload_file(file: UploadFile) -> None:
    """Validate uploaded file size, extension, and MIME type."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")
        
    # Check extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
        
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported MIME type.")
        
    # Check file size (requires seeking)
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    
    if size == 0:
        raise HTTPException(status_code=400, detail="Dataset is empty.")
        
    if size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File exceeds the maximum upload size of {MAX_FILE_SIZE // (1024*1024)}MB.")
