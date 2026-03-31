"""Use case for reviewing documents."""
from uuid import UUID
from app.domain.entities.document import Document
from app.domain.enums import DocumentStatus
from app.domain.repositories.document_repository import IDocumentRepository


class ReviewDocumentUseCase:
    """Review (approve/reject) a document."""

    def __init__(self, repository: IDocumentRepository):
        self.repository = repository

    async def execute(
        self,
        document_id: UUID,
        status: DocumentStatus,
        review_comment: str | None = None,
        reviewed_by: UUID | None = None,
    ) -> Document:
        """
        Review a document (approve or reject it).
        
        Args:
            document_id: ID of document to review
            status: New status (approved or rejected)
            review_comment: Optional reason for rejection or approval
            reviewed_by: User ID of the reviewer (admin)
        
        Returns:
            Updated document entity
        
        Raises:
            ValueError: If document not found or invalid status
        """
        # Validate status
        if status not in [DocumentStatus.APPROVED, DocumentStatus.REJECTED]:
            raise ValueError(f"Invalid review status: {status}. Must be approved or rejected.")
        
        # Get document
        document = await self.repository.get_by_id(document_id)
        if not document:
            raise ValueError(f"Document not found: {document_id}")
        
        # Check if document is pending
        if document.status != DocumentStatus.PENDING:
            raise ValueError(f"Document is not pending review (current status: {document.status})")
        
        # Update document
        document.status = status
        document.reviewed_by = reviewed_by
        document.review_comment = review_comment
        
        # Save changes
        updated_document = await self.repository.update(document)
        return updated_document
