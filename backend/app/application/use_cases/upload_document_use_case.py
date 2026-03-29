import uuid
from typing import BinaryIO, Optional
from app.domain.entities.document import Document
from app.domain.enums import DocumentType, DocumentStatus
from app.domain.repositories.document_repository import DocumentRepository
from app.domain.services.storage_service import StorageService


class UploadDocumentUseCase:
    def __init__(
        self,
        document_repository: DocumentRepository,
        storage_service: StorageService,
    ):
        self._document_repository = document_repository
        self._storage_service = storage_service

    async def execute(
        self,
        file: BinaryIO,
        filename: str,
        title: str,
        description: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        uploaded_by: Optional[uuid.UUID] = None,
        content_type: str = "application/octet-stream",
    ) -> Document:
        # 1. Upload file to storage
        # Get file size before uploading
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)

        # Generate a unique path for the file to avoid collisions
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = await self._storage_service.upload_file(
            file, unique_filename, content_type
        )

        # 2. Determine file type from extension
        file_ext = filename.lower().split(".")[-1] if "." in filename else ""
        if file_ext == "pdf":
            file_type = DocumentType.PDF
        elif file_ext in ["doc", "docx"]:
            file_type = DocumentType.DOCX
        elif file_ext in ["xls", "xlsx"]:
            file_type = DocumentType.EXCEL
        elif file_ext == "txt":
            file_type = DocumentType.TEXT
        elif file_ext in ["jpg", "jpeg", "png"]:
            file_type = DocumentType.IMAGE
        else:
            file_type = DocumentType.OTHER

        # 3. Create document entity
        document = Document(
            id=uuid.uuid4(),
            title=title,
            description=description,
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            original_file_name=filename,
            status=DocumentStatus.AVAILABLE,
            uploaded_by=uploaded_by,
            category_id=category_id,
        )

        # 4. Save metadata to database
        return await self._document_repository.save(document)
