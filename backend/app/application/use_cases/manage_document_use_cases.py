from datetime import datetime
from uuid import UUID

from app.application.schemas.document import DocumentResponse, DocumentUpdateRequest
from app.domain.repositories.document_repository import DocumentRepository
from app.domain.services.storage_service import StorageService


def _to_response(document) -> DocumentResponse:
    return DocumentResponse(
        id=document.id,
        title=document.title,
        description=document.description,
        file_path=document.file_path,
        file_type=document.file_type,
        status=document.status,
        uploaded_by=document.uploaded_by,
        category_id=document.category_id,
        created_at=document.created_at,
        updated_at=document.updated_at,
    )


class UpdateDocumentUseCase:
    def __init__(self, repository: DocumentRepository):
        self._repository = repository

    async def execute(self, document_id: UUID, payload: DocumentUpdateRequest) -> DocumentResponse:
        document = await self._repository.find_by_id(document_id)
        if not document:
            raise ValueError(f"Document {document_id} not found")

        changed_fields = payload.model_fields_set

        if "title" in changed_fields:
            if payload.title is None:
                raise ValueError("Title is required")
            document.title = payload.title

        if "description" in changed_fields:
            document.description = payload.description or ""

        if "category_id" in changed_fields:
            document.category_id = payload.category_id

        document.updated_at = datetime.utcnow()
        updated = await self._repository.update(document)
        return _to_response(updated)


class DeleteDocumentUseCase:
    def __init__(self, repository: DocumentRepository, storage_service: StorageService):
        self._repository = repository
        self._storage_service = storage_service

    async def execute(self, document_id: UUID) -> None:
        document = await self._repository.find_by_id(document_id)
        if not document:
            raise ValueError(f"Document {document_id} not found")

        if document.file_path:
            was_deleted = await self._storage_service.delete_file(document.file_path)
            if not was_deleted:
                raise RuntimeError("Unable to remove document file from storage")

        await self._repository.delete(document_id)
