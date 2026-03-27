"""SQLAlchemy implementation of DocumentRepository."""
from uuid import UUID
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.document import Document
from app.domain.enums import DocumentStatus, DocumentType
from app.domain.repositories.document_repository import DocumentRepository
from app.infrastructure.database.models import DocumentModel


def _to_entity(model: DocumentModel) -> Document:
    return Document(
        id=model.id,
        title=model.title,
        description=model.description,
        file_path=model.file_path,
        file_type=DocumentType(model.file_type) if model.file_type else DocumentType.PDF,
        status=DocumentStatus.AVAILABLE, # Assuming available as there is no status in model yet
        uploaded_by=model.uploaded_by,
        category_id=model.category_id,
        created_at=model.created_at,
        updated_at=model.created_at, # No updated_at in model yet
    )


class DocumentRepositoryImpl(DocumentRepository):
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def find_all(self, skip: int = 0, limit: int = 100) -> List[Document]:
        result = await self._db.execute(
            select(DocumentModel).offset(skip).limit(limit)
        )
        models = result.scalars().all()
        return [_to_entity(model) for model in models]

    async def count_all(self) -> int:
        from sqlalchemy import func
        result = await self._db.execute(select(func.count()).select_from(DocumentModel))
        return result.scalar() or 0

    async def find_by_id(self, document_id: UUID) -> Document | None:
        result = await self._db.execute(
            select(DocumentModel).where(DocumentModel.id == document_id)
        )
        model = result.scalar_one_or_none()
        return _to_entity(model) if model else None
