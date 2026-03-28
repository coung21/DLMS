import io
import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.application.use_cases.upload_document_use_case import UploadDocumentUseCase
from app.domain.entities.document import Document
from app.domain.enums import DocumentType


@pytest.mark.asyncio
async def test_upload_document_use_case_success():
    # Arrange
    mock_repo = MagicMock()
    mock_repo.save = AsyncMock(side_effect=lambda d: d)
    
    mock_storage = MagicMock()
    mock_storage.upload_file = AsyncMock(return_value="test_path.pdf")
    
    use_case = UploadDocumentUseCase(mock_repo, mock_storage)
    
    file_content = b"test content"
    file = io.BytesIO(file_content)
    filename = "test.pdf"
    title = "Test Document"
    
    # Act
    result = await use_case.execute(
        file=file,
        filename=filename,
        title=title,
        content_type="application/pdf"
    )
    
    # Assert
    assert isinstance(result, Document)
    assert result.title == title
    assert result.file_path == "test_path.pdf"
    assert result.file_type == DocumentType.PDF
    mock_storage.upload_file.assert_called_once()
    mock_repo.save.assert_called_once()


@pytest.mark.asyncio
async def test_upload_document_use_case_docx_success():
    # Arrange
    mock_repo = MagicMock()
    mock_repo.save = AsyncMock(side_effect=lambda d: d)
    mock_storage = MagicMock()
    mock_storage.upload_file = AsyncMock(return_value="test_path.docx")
    
    use_case = UploadDocumentUseCase(mock_repo, mock_storage)
    
    # Act
    result = await use_case.execute(
        file=io.BytesIO(b"content"),
        filename="test.docx",
        title="Test Word"
    )
    
    # Assert
    assert result.file_type == DocumentType.DOCX
