from datetime import datetime
import uuid
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.api.v1.dependencies.auth import get_current_user_id, oauth2_scheme
from app.domain.entities.document import Document
from app.domain.enums import DocumentStatus, DocumentType
from app.main import app

BASE = "/api/v1/documents"


def make_document(*, uploaded_by: uuid.UUID, title: str = "Lecture Notes") -> Document:
    return Document(
        id=uuid.uuid4(),
        title=title,
        description="Course material",
        file_path="lecture-notes.pdf",
        file_type=DocumentType.PDF,
        status=DocumentStatus.PENDING,
        uploaded_by=uploaded_by,
        category_id=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.mark.asyncio
async def test_teacher_can_list_their_uploaded_documents():
    teacher_id = uuid.uuid4()
    document = make_document(uploaded_by=teacher_id)

    app.dependency_overrides[oauth2_scheme] = lambda: "valid_teacher_token"
    app.dependency_overrides[get_current_user_id] = lambda: teacher_id

    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode, patch(
        "app.api.v1.endpoints.documents.DocumentRepositoryImpl.find_all",
        new_callable=AsyncMock,
    ) as mock_find_all, patch(
        "app.api.v1.endpoints.documents.DocumentRepositoryImpl.count_all",
        new_callable=AsyncMock,
    ) as mock_count_all:
        mock_decode.return_value = {"role": "teacher", "sub": str(teacher_id), "type": "access"}
        mock_find_all.return_value = [document]
        mock_count_all.return_value = 1

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(f"{BASE}/mine")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["uploaded_by"] == str(teacher_id)


@pytest.mark.asyncio
async def test_teacher_can_update_their_own_document():
    teacher_id = uuid.uuid4()
    document_id = uuid.uuid4()
    existing_document = make_document(uploaded_by=teacher_id)
    existing_document.id = document_id

    updated_document = make_document(uploaded_by=teacher_id, title="Updated Lecture Notes")
    updated_document.id = document_id
    updated_document.description = "Revised course material"

    app.dependency_overrides[oauth2_scheme] = lambda: "valid_teacher_token"
    app.dependency_overrides[get_current_user_id] = lambda: teacher_id

    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode, patch(
        "app.api.v1.endpoints.documents.DocumentRepositoryImpl.find_by_id",
        new_callable=AsyncMock,
    ) as mock_find_by_id, patch(
        "app.api.v1.endpoints.documents.DocumentRepositoryImpl.update",
        new_callable=AsyncMock,
    ) as mock_update:
        mock_decode.return_value = {"role": "teacher", "sub": str(teacher_id), "type": "access"}
        mock_find_by_id.side_effect = [existing_document, existing_document]
        mock_update.return_value = updated_document

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.patch(
                f"{BASE}/{document_id}",
                json={
                    "title": "Updated Lecture Notes",
                    "description": "Revised course material",
                },
            )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["title"] == "Updated Lecture Notes"
    assert response.json()["description"] == "Revised course material"


@pytest.mark.asyncio
async def test_teacher_cannot_delete_other_teachers_document():
    teacher_id = uuid.uuid4()
    other_teacher_document = make_document(uploaded_by=uuid.uuid4())

    app.dependency_overrides[oauth2_scheme] = lambda: "valid_teacher_token"
    app.dependency_overrides[get_current_user_id] = lambda: teacher_id

    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode, patch(
        "app.api.v1.endpoints.documents.DocumentRepositoryImpl.find_by_id",
        new_callable=AsyncMock,
    ) as mock_find_by_id:
        mock_decode.return_value = {"role": "teacher", "sub": str(teacher_id), "type": "access"}
        mock_find_by_id.return_value = other_teacher_document

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.delete(f"{BASE}/{other_teacher_document.id}")

    app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json()["detail"] == "You can only manage documents you uploaded."


@pytest.mark.asyncio
async def test_teacher_can_delete_their_own_document():
    teacher_id = uuid.uuid4()
    document = make_document(uploaded_by=teacher_id)

    app.dependency_overrides[oauth2_scheme] = lambda: "valid_teacher_token"
    app.dependency_overrides[get_current_user_id] = lambda: teacher_id

    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode, patch(
        "app.api.v1.endpoints.documents.DocumentRepositoryImpl.find_by_id",
        new_callable=AsyncMock,
    ) as mock_find_by_id, patch(
        "app.api.v1.endpoints.documents.MinioStorageService.delete_file",
        new_callable=AsyncMock,
    ) as mock_delete_file, patch(
        "app.api.v1.endpoints.documents.DocumentRepositoryImpl.delete",
        new_callable=AsyncMock,
    ) as mock_delete:
        mock_decode.return_value = {"role": "teacher", "sub": str(teacher_id), "type": "access"}
        mock_find_by_id.side_effect = [document, document]
        mock_delete_file.return_value = True
        mock_delete.return_value = None

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.delete(f"{BASE}/{document.id}")

    app.dependency_overrides.clear()

    assert response.status_code == 204
@pytest.mark.asyncio
async def test_teacher_can_get_preview_url():
    teacher_id = uuid.uuid4()
    document = make_document(uploaded_by=teacher_id)
    document.status = DocumentStatus.APPROVED

    app.dependency_overrides[oauth2_scheme] = lambda: "valid_teacher_token"
    app.dependency_overrides[get_current_user_id] = lambda: teacher_id

    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode, patch(
        "app.api.v1.endpoints.documents.DocumentRepositoryImpl.find_by_id",
        new_callable=AsyncMock,
    ) as mock_find_by_id, patch(
        "app.api.v1.endpoints.documents.MinioStorageService.get_presigned_url",
        new_callable=AsyncMock,
    ) as mock_get_url:
        mock_decode.return_value = {"role": "teacher", "sub": str(teacher_id), "type": "access"}
        mock_find_by_id.return_value = document
        mock_get_url.return_value = "http://minio:9000/presigned-url"

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(f"{BASE}/{document.id}/preview")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["url"] == "http://minio:9000/presigned-url"


@pytest.mark.asyncio
async def test_teacher_can_get_download_url():
    teacher_id = uuid.uuid4()
    document = make_document(uploaded_by=teacher_id)
    document.status = DocumentStatus.APPROVED

    app.dependency_overrides[oauth2_scheme] = lambda: "valid_teacher_token"
    app.dependency_overrides[get_current_user_id] = lambda: teacher_id

    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode, patch(
        "app.api.v1.endpoints.documents.DocumentRepositoryImpl.find_by_id",
        new_callable=AsyncMock,
    ) as mock_find_by_id, patch(
        "app.api.v1.endpoints.documents.MinioStorageService.get_presigned_url",
        new_callable=AsyncMock,
    ) as mock_get_url:
        mock_decode.return_value = {"role": "teacher", "sub": str(teacher_id), "type": "access"}
        mock_find_by_id.return_value = document
        mock_get_url.return_value = "http://minio:9000/download-url"

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(f"{BASE}/{document.id}/download")

        # Verify that get_presigned_url was called with the filename
        mock_get_url.assert_called_once()
        args, kwargs = mock_get_url.call_args
        assert kwargs["filename"] == (document.original_file_name or document.title)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["url"] == "http://minio:9000/download-url"
