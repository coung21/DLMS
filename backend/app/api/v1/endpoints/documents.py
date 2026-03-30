from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Response, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies.auth import get_current_user_role, require_roles
from app.application.schemas.document import DocumentListResponse, DocumentResponse, DocumentUpdateRequest
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.document_repository_impl import DocumentRepositoryImpl
from app.infrastructure.services.storage.minio_storage_service import MinioStorageService
from app.application.use_cases.get_documents_use_case import GetDocumentsUseCase
from app.application.use_cases.manage_document_use_cases import DeleteDocumentUseCase, UpdateDocumentUseCase
from app.application.use_cases.upload_document_use_case import UploadDocumentUseCase
from app.domain.enums import UserRole

router = APIRouter(prefix="/documents", tags=["documents"])


def _ensure_document_access(document: DocumentResponse, current_user_id: UUID, current_user_role: UserRole) -> None:
    if current_user_role == UserRole.ADMIN:
        return

    if document.uploaded_by != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only manage documents you uploaded.",
        )


@router.get("", response_model=DocumentListResponse)
async def get_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: Optional[UUID] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user), # Optional: Add authentication if needed
):
    """
    Fetch a list of documents with pagination.
    """
    repository = DocumentRepositoryImpl(db)
    use_case = GetDocumentsUseCase(repository)
    return await use_case.execute(
        skip=skip,
        limit=limit,
        category_id=category_id,
        search=search,
        sort_by=sort_by,
    )


@router.get("/mine", response_model=DocumentListResponse)
async def get_my_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: Optional[UUID] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(require_roles(UserRole.ADMIN, UserRole.TEACHER)),
):
    repository = DocumentRepositoryImpl(db)
    use_case = GetDocumentsUseCase(repository)
    return await use_case.execute(
        skip=skip,
        limit=limit,
        category_id=category_id,
        search=search,
        sort_by=sort_by,
        uploaded_by=current_user_id,
    )


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {
    "pdf", "docx", "doc", "xlsx", "xls", "jpg", "jpeg", "png", "txt"
}


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


@router.patch("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    payload: DocumentUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(require_roles(UserRole.ADMIN, UserRole.TEACHER)),
    current_user_role: UserRole = Depends(get_current_user_role),
):
    repository = DocumentRepositoryImpl(db)
    existing_document = await repository.find_by_id(document_id)
    if not existing_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found",
        )

    _ensure_document_access(existing_document, current_user_id, current_user_role)

    use_case = UpdateDocumentUseCase(repository)
    try:
        return await use_case.execute(document_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(require_roles(UserRole.ADMIN, UserRole.TEACHER)),
    current_user_role: UserRole = Depends(get_current_user_role),
):
    repository = DocumentRepositoryImpl(db)
    existing_document = await repository.find_by_id(document_id)
    if not existing_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found",
        )

    _ensure_document_access(existing_document, current_user_id, current_user_role)

    storage_service = MinioStorageService()
    use_case = DeleteDocumentUseCase(repository, storage_service)
    try:
        await use_case.execute(document_id)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
