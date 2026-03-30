"""Use case for getting pending documents."""
from typing import Optional
from uuid import UUID
from app.domain.repositories.document_repository import IDocumentRepository


class GetPendingDocumentsUseCase:
    """Get list of documents pending review/approval."""

    def __init__(self, repository: IDocumentRepository):
        self.repository = repository

    async def execute(
        self,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
    ):
        """
        Get pending documents for admin review.
        
        Args:
            skip: Number of documents to skip
            limit: Maximum number of documents to return
            search: Optional search query for title/description
            sort_by: Optional field to sort by (e.g., "created_at")
        
        Returns:
            Dictionary with items, total, skip, limit
        """
        return await self.repository.get_pending_documents(
            skip=skip,
            limit=limit,
            search=search,
            sort_by=sort_by,
        )
