from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional

from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.document_repository_impl import DocumentRepositoryImpl
from app.infrastructure.services.storage.minio_storage_service import MinioStorageService
from app.application.use_cases.get_documents_use_case import GetDocumentsUseCase
from app.application.use_cases.upload_document_use_case import UploadDocumentUseCase
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


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {
    "pdf", "docx", "doc", "xlsx", "xls", "jpg", "jpeg", "png", "txt"
}


from app.domain.enums import UserRole
from app.api.v1.dependencies.auth import require_roles


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category_id: Optional[UUID] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(require_roles(UserRole.ADMIN, UserRole.TEACHER)),
):
    """
    Upload a document and save its metadata.
    """
    # 1. Validate file extension
    file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension {file_ext} is not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. Validate file size
    # file.size is available in FastAPI >= 0.99.0 for UploadFile
    # Otherwise we can read a bit or use SpooledTemporaryFile properties
    try:
        content = await file.read(MAX_FILE_SIZE + 1)
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024)}MB"
            )
        await file.seek(0)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error validating file size"
        )

    # 3. Process upload using use case
    repository = DocumentRepositoryImpl(db)
    storage_service = MinioStorageService()
    use_case = UploadDocumentUseCase(repository, storage_service)

    # Note: We pass the SpooledTemporaryFile from UploadFile.file
    return await use_case.execute(
        file=file.file,
        filename=file.filename,
        title=title,
        description=description,
        category_id=category_id,
        content_type=file.content_type,
        uploaded_by=current_user_id,
    )
