"""Document repository interface."""
from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from app.domain.entities.document import Document


class DocumentRepository(ABC):
    """Interface for document repository."""

    @abstractmethod
    async def find_all(
        self,
        skip: int = 0,
        limit: int = 100,
        category_id: UUID | None = None,
        search: str | None = None,
        sort_by: str | None = None,
        uploaded_by: UUID | None = None,
    ) -> List[Document]:
        """Fetch all documents with pagination and optional filtering/sorting."""
        pass

    @abstractmethod
    async def count_all(
        self,
        category_id: UUID | None = None,
        search: str | None = None,
        uploaded_by: UUID | None = None,
    ) -> int:
        """Count total documents."""
        pass

    @abstractmethod
    async def find_by_id(self, document_id: UUID) -> Document | None:
        """Fetch a document by ID."""
        pass

    @abstractmethod
    async def save(self, document: Document) -> Document:
        """Save a new document."""
        pass

    @abstractmethod
    async def update(self, document: Document) -> Document:
        """Update an existing document."""
        pass

    @abstractmethod
    async def delete(self, document_id: UUID) -> None:
        """Delete a document by ID."""
        pass
