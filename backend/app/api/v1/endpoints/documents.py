from uuid import UUID
from fastapi import APIRouter, Depends, Query, Path
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.document_repository_impl import DocumentRepositoryImpl
from app.infrastructure.services.storage.minio_service import MinioStorageService
from app.application.use_cases.get_documents_use_case import GetDocumentsUseCase
from app.application.use_cases.get_document_use_case import GetDocumentUseCase
from app.application.use_cases.preview_document_use_case import PreviewDocumentUseCase
from app.application.schemas.document import DocumentListResponse, DocumentResponse


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


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID = Path(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch details of a single document by its ID.
    """
    repository = DocumentRepositoryImpl(db)
    use_case = GetDocumentUseCase(repository)
    return await use_case.execute(document_id)


@router.get("/{document_id}/preview")
async def preview_document(
    document_id: UUID = Path(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Preview a document (redirects to a short-lived presigned URL if it's a file like PDF/Image).
    """
    repository = DocumentRepositoryImpl(db)
    storage_service = MinioStorageService()
    use_case = PreviewDocumentUseCase(repository, storage_service)
    
    url = await use_case.execute(document_id, expiration_minutes=15)
    return RedirectResponse(url=url, status_code=302)
