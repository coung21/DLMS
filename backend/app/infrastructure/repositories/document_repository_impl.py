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
        status=DocumentStatus.AVAILABLE,
        uploaded_by=model.uploaded_by,
        category_id=model.category_id,
        created_at=model.created_at,
        updated_at=model.updated_at or model.created_at,
    )


class DocumentRepositoryImpl(DocumentRepository):
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def find_all(
        self,
        skip: int = 0,
        limit: int = 100,
        category_id: UUID | None = None,
        search: str | None = None,
        sort_by: str | None = None,
        uploaded_by: UUID | None = None,
    ) -> List[Document]:
        from sqlalchemy import or_, desc, asc
        stmt = select(DocumentModel)

        if category_id:
            stmt = stmt.where(DocumentModel.category_id == category_id)

        if uploaded_by:
            stmt = stmt.where(DocumentModel.uploaded_by == uploaded_by)
        
        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    DocumentModel.title.ilike(search_term),
                    DocumentModel.description.ilike(search_term)
                )
            )

        if sort_by:
            if sort_by == "created_at_desc":
                stmt = stmt.order_by(desc(DocumentModel.created_at))
            elif sort_by == "created_at_asc":
                stmt = stmt.order_by(asc(DocumentModel.created_at))
            elif sort_by == "title_asc":
                stmt = stmt.order_by(asc(DocumentModel.title))
            elif sort_by == "title_desc":
                stmt = stmt.order_by(desc(DocumentModel.title))
            else:
                stmt = stmt.order_by(desc(DocumentModel.created_at))
        else:
            stmt = stmt.order_by(desc(DocumentModel.created_at))

        stmt = stmt.offset(skip).limit(limit)

        result = await self._db.execute(stmt)
        models = result.scalars().all()
        return [_to_entity(model) for model in models]

    async def count_all(
        self,
        category_id: UUID | None = None,
        search: str | None = None,
        uploaded_by: UUID | None = None,
    ) -> int:
        from sqlalchemy import func, or_
        stmt = select(func.count()).select_from(DocumentModel)

        if category_id:
            stmt = stmt.where(DocumentModel.category_id == category_id)

        if uploaded_by:
            stmt = stmt.where(DocumentModel.uploaded_by == uploaded_by)
        
        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    DocumentModel.title.ilike(search_term),
                    DocumentModel.description.ilike(search_term)
                )
            )

        result = await self._db.execute(stmt)
        return result.scalar() or 0

    async def find_by_id(self, document_id: UUID) -> Document | None:
        result = await self._db.execute(
            select(DocumentModel).where(DocumentModel.id == document_id)
        )
        model = result.scalar_one_or_none()
        return _to_entity(model) if model else None

    async def save(self, document: Document) -> Document:
        model = DocumentModel(
            id=document.id,
            title=document.title,
            description=document.description,
            file_path=document.file_path,
            file_type=document.file_type.value if document.file_type else None,
            file_size=document.file_size,
            original_file_name=document.original_file_name,
            uploaded_by=document.uploaded_by,
            category_id=document.category_id,
        )
        self._db.add(model)
        await self._db.commit()
        await self._db.refresh(model)
        return _to_entity(model)

    async def update(self, document: Document) -> Document:
        result = await self._db.execute(
            select(DocumentModel).where(DocumentModel.id == document.id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"Document {document.id} not found")

        model.title = document.title
        model.description = document.description
        model.category_id = document.category_id
        model.updated_at = document.updated_at

        await self._db.commit()
        await self._db.refresh(model)
        return _to_entity(model)

    async def delete(self, document_id: UUID) -> None:
        result = await self._db.execute(
            select(DocumentModel).where(DocumentModel.id == document_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"Document {document_id} not found")

        await self._db.delete(model)
        await self._db.commit()
