from uuid import UUID
from app.domain.repositories.document_repository import DocumentRepository
from app.application.schemas.document import DocumentResponse
from app.core.exceptions import EntityNotFoundError


class GetDocumentUseCase:
    def __init__(self, repository: DocumentRepository):
        self.repository = repository

    async def execute(self, document_id: UUID) -> DocumentResponse:
        document = await self.repository.find_by_id(document_id)
        if not document:
            raise EntityNotFoundError(f"Document with id {document_id} not found")
        
        return DocumentResponse.model_validate(document)
