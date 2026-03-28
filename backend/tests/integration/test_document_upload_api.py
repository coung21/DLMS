import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app
from app.infrastructure.services.storage.minio_storage_service import MinioStorageService

BASE = "/api/v1/documents"


@pytest.mark.asyncio
async def test_upload_document_success():
    """POST /upload with valid file -> 201 Created."""
    # Mock MinioStorageService.upload_file
    with patch("app.api.v1.endpoints.documents.MinioStorageService.upload_file", new_callable=AsyncMock) as mock_upload, \
         patch("app.api.v1.endpoints.documents.DocumentRepositoryImpl.save", new_callable=AsyncMock) as mock_save:
        
        from app.domain.entities.document import Document
        from app.domain.enums import DocumentStatus, DocumentType
        from datetime import datetime
        import uuid

        mock_upload.return_value = "mock_file_path.pdf"
        mock_save.return_value = Document(
            id=uuid.uuid4(),
            title="Integration Test PDF",
            description="This is a test document",
            file_path="mock_file_path.pdf",
            file_type=DocumentType.PDF,
            status=DocumentStatus.AVAILABLE,
            uploaded_by=None,
            category_id=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            files = {
                "file": ("test.pdf", b"pdf content", "application/pdf")
            }
            data = {
                "title": "Integration Test PDF",
                "description": "This is a test document"
            }
            resp = await client.post(f"{BASE}/upload", files=files, data=data)

    assert resp.status_code == 201
    result = resp.json()
    assert result["title"] == "Integration Test PDF"
    assert result["file_type"] == "pdf"
    mock_upload.assert_called_once()


@pytest.mark.asyncio
async def test_upload_document_too_large():
    """POST /upload with file > 10MB -> 413 Payload Too Large."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create a large "file"
        large_content = b"a" * (11 * 1024 * 1024)  # 11MB
        files = {
            "file": ("large.pdf", large_content, "application/pdf")
        }
        data = {"title": "Large File"}
        resp = await client.post(f"{BASE}/upload", files=files, data=data)

    assert resp.status_code == 413
    assert "File too large" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_upload_document_invalid_extension():
    """POST /upload with invalid extension -> 400 Bad Request."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        files = {
            "file": ("test.exe", b"binary content", "application/x-msdownload")
        }
        data = {"title": "Invalid File"}
        resp = await client.post(f"{BASE}/upload", files=files, data=data)

    assert resp.status_code == 400
    assert "is not allowed" in resp.json()["detail"]
