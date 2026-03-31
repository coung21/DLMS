from uuid import UUID

from app.domain.repositories.document_repository import DocumentRepository
from app.application.interfaces.storage import IStorageService
from app.core.exceptions import EntityNotFoundError, DocumentUnavailableError


class PreviewDocumentUseCase:
    def __init__(self, repository: DocumentRepository, storage_service: IStorageService):
        self.repository = repository
        self.storage_service = storage_service

    async def execute(self, document_id: UUID, expiration_minutes: int = 15) -> str:
        document = await self.repository.find_by_id(document_id)
        if not document:
            raise EntityNotFoundError(f"Document with id {document_id} not found")
        
        if not document.file_path:
            raise DocumentUnavailableError(f"Document with id {document_id} has no file attached")
            
        return await self.storage_service.get_presigned_url(
            document.file_path, expiration_minutes
        )
