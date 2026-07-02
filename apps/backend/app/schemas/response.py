from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel

T = TypeVar("T")

class APIErrorDetail(BaseModel):
  field: Optional[str] = None
  issue: str

class APIError(BaseModel):
  code: str
  details: Optional[List[APIErrorDetail]] = None

class APIResponse(BaseModel, Generic[T]):
  success: bool
  message: str
  data: Optional[T] = None
  error: Optional[APIError] = None
  metadata: Optional[dict] = None
