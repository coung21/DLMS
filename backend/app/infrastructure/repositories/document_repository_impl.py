"""SQLAlchemy implementation of DocumentRepository."""
from uuid import UUID
from typing import List, Dict, Any

from sqlalchemy import select, func, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.document import Document
from app.domain.enums import DocumentStatus, DocumentType
from app.domain.repositories.document_repository import IDocumentRepository
from app.infrastructure.database.models import DocumentModel


def _to_entity(model: DocumentModel) -> Document:
    return Document(
        id=model.id,
        title=model.title,
        description=model.description,
        file_path=model.file_path,
        file_type=DocumentType(model.file_type) if model.file_type else DocumentType.PDF,
        status=DocumentStatus(model.status) if model.status else DocumentStatus.PENDING,
        file_size=model.file_size,
        original_file_name=model.original_file_name,
        uploaded_by=model.uploaded_by,
        reviewed_by=model.reviewed_by,
        review_comment=model.review_comment,
        category_id=model.category_id,
        created_at=model.created_at,
        updated_at=model.updated_at or model.created_at,
    )


class DocumentRepositoryImpl(IDocumentRepository):
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def find_all(self, skip: int = 0, limit: int = 100, category_id: UUID | None = None, search: str | None = None, sort_by: str | None = None, status: str | None = None, uploaded_by: UUID | None = None) -> List[Document]:
        stmt = select(DocumentModel)

        if category_id:
            stmt = stmt.where(DocumentModel.category_id == category_id)

        if uploaded_by:
            stmt = stmt.where(DocumentModel.uploaded_by == uploaded_by)
        
        if status:
            stmt = stmt.where(DocumentModel.status == status)
        
        if uploaded_by:
            stmt = stmt.where(DocumentModel.uploaded_by == uploaded_by)
        
        if search:
            from app.infrastructure.database.models import CategoryModel
            search_term = f"%{search}%"
            stmt = stmt.outerjoin(CategoryModel, DocumentModel.category_id == CategoryModel.id).where(
                or_(
                    DocumentModel.title.ilike(search_term),
                    DocumentModel.description.ilike(search_term),
                    CategoryModel.name.ilike(search_term)
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
        status: str | None = None,
        uploaded_by: UUID | None = None,
    ) -> int:
        stmt = select(func.count()).select_from(DocumentModel)

        if category_id:
            stmt = stmt.where(DocumentModel.category_id == category_id)

        if status:
            stmt = stmt.where(DocumentModel.status == status)
        
        if uploaded_by:
            stmt = stmt.where(DocumentModel.uploaded_by == uploaded_by)
        
        if search:
            from app.infrastructure.database.models import CategoryModel
            search_term = f"%{search}%"
            stmt = stmt.outerjoin(CategoryModel, DocumentModel.category_id == CategoryModel.id).where(
                or_(
                    DocumentModel.title.ilike(search_term),
                    DocumentModel.description.ilike(search_term),
                    CategoryModel.name.ilike(search_term)
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

    async def get_by_id(self, document_id: UUID) -> Document | None:
        """Alias for find_by_id."""
        return await self.find_by_id(document_id)

    async def save(self, document: Document) -> Document:
        model = DocumentModel(
            id=document.id,
            title=document.title,
            description=document.description,
            file_path=document.file_path,
            file_type=document.file_type.value if document.file_type else None,
            file_size=document.file_size,
            original_file_name=document.original_file_name,
            status=document.status.value if document.status else DocumentStatus.PENDING.value,
            uploaded_by=document.uploaded_by,
            category_id=document.category_id,
        )
        self._db.add(model)
        await self._db.commit()
        await self._db.refresh(model)
        return _to_entity(model)

    async def update(self, document: Document) -> Document:
        """Update an existing document."""
        stmt = select(DocumentModel).where(DocumentModel.id == document.id)
        result = await self._db.execute(stmt)
        model = result.scalar_one_or_none()
        
        if not model:
            raise ValueError(f"Document not found: {document.id}")
        
        # Update fields
        model.title = document.title
        model.description = document.description
        model.file_path = document.file_path
        model.file_type = document.file_type.value if document.file_type else None
        model.file_size = document.file_size
        model.original_file_name = document.original_file_name
        model.status = document.status.value if document.status else DocumentStatus.PENDING.value
        model.uploaded_by = document.uploaded_by
        model.reviewed_by = document.reviewed_by
        model.review_comment = document.review_comment
        model.category_id = document.category_id
        model.updated_at = document.updated_at or func.now()
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

    async def get_pending_documents(
        self,
        skip: int = 0,
        limit: int = 10,
        search: str | None = None,
        sort_by: str | None = None,
    ) -> Dict[str, Any]:
        """Get documents pending review."""
        stmt = select(DocumentModel).where(DocumentModel.status == DocumentStatus.PENDING.value)

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

        # Get total count
        count_stmt = select(func.count()).select_from(DocumentModel).where(DocumentModel.status == DocumentStatus.PENDING.value)
        if search:
            search_term = f"%{search}%"
            count_stmt = count_stmt.where(
                or_(
                    DocumentModel.title.ilike(search_term),
                    DocumentModel.description.ilike(search_term)
                )
            )
        count_result = await self._db.execute(count_stmt)
        total = count_result.scalar() or 0

        # Get paginated results
        stmt = stmt.offset(skip).limit(limit)
        result = await self._db.execute(stmt)
        models = result.scalars().all()

        return {
            "items": [_to_entity(model) for model in models],
            "total": total,
            "skip": skip,
            "limit": limit,
        }
