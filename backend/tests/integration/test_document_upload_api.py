import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
from datetime import datetime, timezone
from app.main import app
from app.api.v1.dependencies.auth import get_current_user_id, oauth2_scheme

BASE = "/api/v1/documents"

def setup_auth_mock():
    app.dependency_overrides[oauth2_scheme] = lambda: "mock_token"
    app.dependency_overrides[get_current_user_id] = lambda: uuid.uuid4()

def cleanup_auth_mock():
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_upload_document_success():
    """POST /upload with valid file -> 201 Created."""
    setup_auth_mock()
    # Mock role decode to be admin for general success test
    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode, \
         patch("app.api.v1.endpoints.documents.MinioStorageService.upload_file", new_callable=AsyncMock) as mock_upload, \
         patch("app.api.v1.endpoints.documents.DocumentRepositoryImpl.save", new_callable=AsyncMock) as mock_save:
        
        from app.domain.entities.document import Document
        from app.domain.enums import DocumentStatus, DocumentType

        mock_decode.return_value = {"role": "admin", "sub": str(uuid.uuid4()), "type": "access"}
        mock_upload.return_value = "mock_file_path.pdf"
        
        now = datetime.now(timezone.utc)
        mock_save.return_value = Document(
            id=uuid.uuid4(),
            title="Integration Test PDF",
            description="This is a test document",
            file_path="mock_file_path.pdf",
            file_type=DocumentType.PDF,
            status=DocumentStatus.PENDING,
            uploaded_by=uuid.uuid4(),
            category_id=None,
            created_at=now,
            updated_at=now
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

    cleanup_auth_mock()
    assert resp.status_code == 201
    result = resp.json()
    assert result["title"] == "Integration Test PDF"
    mock_upload.assert_called_once()


@pytest.mark.asyncio
async def test_upload_document_too_large():
    """POST /upload with file > 10MB -> 413 Payload Too Large."""
    setup_auth_mock()
    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode:
        mock_decode.return_value = {"role": "admin", "sub": str(uuid.uuid4()), "type": "access"}
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            large_content = b"a" * (11 * 1024 * 1024)  # 11MB
            files = {"file": ("large.pdf", large_content, "application/pdf")}
            data = {"title": "Large File"}
            resp = await client.post(f"{BASE}/upload", files=files, data=data)

    cleanup_auth_mock()
    assert resp.status_code == 413
    assert "File too large" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_upload_document_invalid_extension():
    """POST /upload with invalid extension -> 400 Bad Request."""
    setup_auth_mock()
    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode:
        mock_decode.return_value = {"role": "admin", "sub": str(uuid.uuid4()), "type": "access"}
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            files = {"file": ("test.exe", b"binary content", "application/x-msdownload")}
            data = {"title": "Invalid File"}
            resp = await client.post(f"{BASE}/upload", files=files, data=data)

    cleanup_auth_mock()
    assert resp.status_code == 400
    assert "is not allowed" in resp.json()["detail"]
