from datetime import datetime
from uuid import UUID
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.domain.enums import DocumentStatus, DocumentType


class DocumentResponse(BaseModel):
    id: UUID
    title: str
    description: str
    file_path: Optional[str] = None
    file_type: DocumentType
    status: DocumentStatus
    uploaded_by: Optional[UUID] = None
    category_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentListResponse(BaseModel):
    items: List[DocumentResponse]
    total: int
    skip: int
    limit: int
