import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app
from app.domain.enums import UserRole
from app.api.v1.dependencies.auth import require_roles

BASE = "/api/v1/documents"

from app.api.v1.dependencies.auth import get_current_user_id, oauth2_scheme

# Helper for mocking
async def mock_user_id():
    return uuid.uuid4()

async def mock_token():
    return "mock_token"

@pytest.mark.asyncio
async def test_teacher_can_upload_document():
    """POST /upload by a TEACHER -> 201 Created."""
    # Patch the actual role check logic within require_roles
    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode, \
         patch("app.api.v1.endpoints.documents.MinioStorageService.upload_file", new_callable=AsyncMock) as mock_storage_upload, \
         patch("app.api.v1.endpoints.documents.DocumentRepositoryImpl.save", new_callable=AsyncMock) as mock_db_save:
        
        # 1. Mock the token decode result to have teacher role
        mock_decode.return_value = {"role": "teacher", "sub": str(uuid.uuid4()), "type": "access"}
        
        # 2. Overrides to bypass OAuth2PasswordBearer which otherwise requires a real token
        app.dependency_overrides[oauth2_scheme] = lambda: "valid_mock_token"
        app.dependency_overrides[get_current_user_id] = lambda: uuid.uuid4()
        
        from app.domain.entities.document import Document
        from app.domain.enums import DocumentStatus, DocumentType
        from datetime import datetime
        
        mock_storage_upload.return_value = "teacher_upload.pdf"
        mock_db_save.return_value = Document(
            id=uuid.uuid4(),
            title="Teacher Syllabus",
            description="Course syllabus",
            file_path="teacher_upload.pdf",
            file_type=DocumentType.PDF,
            status=DocumentStatus.AVAILABLE,
            uploaded_by=uuid.uuid4(),
            category_id=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            files = {
                "file": ("syllabus.pdf", b"syllabus content", "application/pdf")
            }
            data = {
                "title": "Teacher Syllabus",
                "description": "Course syllabus"
            }
            resp = await client.post(f"{BASE}/upload", files=files, data=data)

    # Clean up overrides
    app.dependency_overrides.clear()

    assert resp.status_code == 201
    assert resp.json()["title"] == "Teacher Syllabus"


@pytest.mark.asyncio
async def test_student_cannot_upload_document():
    """POST /upload by a STUDENT -> 403 Forbidden."""
    # Override auth dependencies to bypass OAuth2 segment check
    app.dependency_overrides[oauth2_scheme] = lambda: "valid_student_token"
    app.dependency_overrides[get_current_user_id] = lambda: uuid.uuid4()

    # Mock the token to have student role
    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode:
        mock_decode.return_value = {"role": "student", "sub": str(uuid.uuid4()), "type": "access"}
    
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            files = {
                "file": ("student.pdf", b"student content", "application/pdf")
            }
            data = {"title": "Student File"}
            resp = await client.post(f"{BASE}/upload", files=files, data=data)

    app.dependency_overrides.clear()
    
    assert resp.status_code == 403
    assert resp.json()["detail"] == "Insufficient permissions"
