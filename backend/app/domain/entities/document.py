"""Domain entities for the Digital Library Management System."""
from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4

from app.domain.enums import DocumentStatus, DocumentType


@dataclass
class Document:
    """Represents a document in the library system."""

    id: UUID = field(default_factory=uuid4)
    title: str = ""
    description: str = ""
    file_path: str | None = None
    file_type: DocumentType = DocumentType.PDF
    file_size: int = 0
    original_file_name: str | None = None
    status: DocumentStatus = DocumentStatus.AVAILABLE
    uploaded_by: UUID | None = None
    category_id: UUID | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
