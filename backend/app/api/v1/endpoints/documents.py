from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies.auth import get_current_user
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.document_repository_impl import DocumentRepositoryImpl
from app.application.use_cases.get_documents_use_case import GetDocumentsUseCase
from app.application.schemas.document import DocumentListResponse


router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=DocumentListResponse)
async def get_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user), # Optional: Add authentication if needed
):
    """
    Fetch a list of documents with pagination.
    """
    repository = DocumentRepositoryImpl(db)
    use_case = GetDocumentsUseCase(repository)
    return await use_case.execute(skip=skip, limit=limit)
