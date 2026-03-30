from app.application.schemas.document import DocumentResponse, DocumentListResponse
from app.domain.repositories.document_repository import IDocumentRepository


class GetDocumentsUseCase:
    def __init__(self, document_repo: IDocumentRepository) -> None:
        self._document_repo = document_repo

    async def execute(
        self,
        skip: int = 0,
        limit: int = 100,
        category_id=None,
        search=None,
        sort_by=None,
        uploaded_by=None,
    ) -> DocumentListResponse:
        documents = await self._document_repo.find_all(
            skip=skip,
            limit=limit,
            category_id=category_id,
            search=search,
            sort_by=sort_by,
            uploaded_by=uploaded_by,
        )
        total = await self._document_repo.count_all(
            category_id=category_id,
            search=search,
            uploaded_by=uploaded_by,
        )

        items = [
            DocumentResponse(
                id=doc.id,
                title=doc.title,
                description=doc.description,
                file_path=doc.file_path,
                file_type=doc.file_type,
                status=doc.status,
                uploaded_by=doc.uploaded_by,
                reviewed_by=doc.reviewed_by,
                review_comment=doc.review_comment,
                category_id=doc.category_id,
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
