from app.application.schemas.document import DocumentResponse, DocumentListResponse
from app.domain.repositories.document_repository import DocumentRepository


class GetDocumentsUseCase:
    def __init__(self, document_repo: DocumentRepository) -> None:
        self._document_repo = document_repo

    async def execute(self, skip: int = 0, limit: int = 100, category_id=None, search=None, sort_by=None, file_type=None, created_from=None, created_to=None) -> DocumentListResponse:
        documents = await self._document_repo.find_all(skip=skip, limit=limit, category_id=category_id, search=search, sort_by=sort_by, file_type=file_type, created_from=created_from, created_to=created_to)
        total = await self._document_repo.count_all(category_id=category_id, search=search, file_type=file_type, created_from=created_from, created_to=created_to)

        items = [
            DocumentResponse(
                id=doc.id,
                title=doc.title,
                description=doc.description,
                file_path=doc.file_path,
                file_type=doc.file_type,
                status=doc.status,
                uploaded_by=doc.uploaded_by,
                category_id=doc.category_id,
                file_size=getattr(doc, 'file_size', 0),
                original_file_name=getattr(doc, 'original_file_name', None),
                created_at=doc.created_at,
                updated_at=doc.updated_at,
            )
            for doc in documents
        ]

        return DocumentListResponse(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
        )
