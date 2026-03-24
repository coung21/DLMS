"""Document repository interface."""
from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from app.domain.entities.document import Document


class DocumentRepository(ABC):
    """Interface for document repository."""

    @abstractmethod
    async def find_all(self, skip: int = 0, limit: int = 100) -> List[Document]:
        """Fetch all documents with pagination."""
        pass

    @abstractmethod
    async def find_by_id(self, document_id: UUID) -> Document | None:
        """Fetch a document by ID."""
        pass
