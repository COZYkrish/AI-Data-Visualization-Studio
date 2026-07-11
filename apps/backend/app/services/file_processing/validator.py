import os
from fastapi import UploadFile, HTTPException

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_EXTENSIONS = {'.csv', '.json', '.xlsx', '.xls'}

# Browsers may send varying MIME types for the same format, so we rely
# primarily on extension and use MIME only as a secondary sanity check.
# This set is intentionally broad to avoid false rejections.
ALLOWED_MIME_TYPES = {
    # CSV variants
    'text/csv',
    'text/plain',
    'text/x-csv',
    'application/csv',
    'application/x-csv',
    # JSON variants
    'application/json',
    'text/json',
    # Excel variants
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/x-excel',
    'application/x-msexcel',
    # Generic fallback — browser may not know the type
    'application/octet-stream',
}

def validate_upload_file(file: UploadFile) -> None:
    """Validate uploaded file size, extension, and MIME type."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    # Extension is the primary gating check
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # MIME type as a secondary guard — skip if browser sends a generic type
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported MIME type '{content_type}' for file '{file.filename}'."
        )

    # File size check
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size == 0:
        raise HTTPException(status_code=400, detail="Dataset is empty.")

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the maximum upload size of {MAX_FILE_SIZE // (1024 * 1024)}MB."
        )
