"""Unit tests for AuthUseCase.register without touching the database."""
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from app.application.schemas import RegisterRequest, UserResponse
from app.application.use_cases.auth_use_case import AuthUseCase
from app.core.exceptions import DuplicateEntityError
from app.domain.entities.user import User
from app.domain.enums import UserRole, UserStatus


def make_user(**kwargs) -> User:
    defaults = dict(
        id=uuid4(),
        email="test@example.com",
        hashed_password="$2b$hashed",
        full_name="Test User",
        role=UserRole.STUDENT,
        status=UserStatus.ACTIVE,
        created_at=datetime.utcnow(),
    )
    return User(**{**defaults, **kwargs})


@pytest.fixture
def mock_repo():
    repo = MagicMock()
    repo.get_by_email = AsyncMock(return_value=None)
    repo.create = AsyncMock(side_effect=lambda user: user)
    return repo


@pytest.fixture
def use_case(mock_repo):
    return AuthUseCase(user_repo=mock_repo)


@pytest.mark.asyncio
async def test_register_success(use_case, mock_repo):
    payload = RegisterRequest(
        email="newuser@example.com",
        password="securepass123",
        full_name="New User",
    )

    result = await use_case.register(payload)

    assert isinstance(result, UserResponse)
    assert result.email == "newuser@example.com"
    assert result.full_name == "New User"
    assert result.role == UserRole.STUDENT
    assert result.status == UserStatus.ACTIVE
    mock_repo.create.assert_awaited_once()


@pytest.mark.asyncio
async def test_register_password_is_hashed(use_case, mock_repo):
    payload = RegisterRequest(
        email="user@example.com",
        password="securepass123",
        full_name="User",
    )

    await use_case.register(payload)

    created_user: User = mock_repo.create.call_args[0][0]
    assert created_user.hashed_password != "securepass123"
    assert created_user.hashed_password.startswith("$2b$")


@pytest.mark.asyncio
async def test_register_teacher_role_is_preserved(use_case, mock_repo):
    payload = RegisterRequest(
        email="teacher@example.com",
        password="securepass123",
        full_name="Teacher User",
        role=UserRole.TEACHER,
    )

    result = await use_case.register(payload)

    created_user: User = mock_repo.create.call_args[0][0]
    assert created_user.role == UserRole.TEACHER
    assert result.role == UserRole.TEACHER


@pytest.mark.asyncio
async def test_register_duplicate_email_raises(use_case, mock_repo):
    existing = make_user(email="existing@example.com")
    mock_repo.get_by_email = AsyncMock(return_value=existing)

    payload = RegisterRequest(
        email="existing@example.com",
        password="securepass123",
        full_name="Someone",
    )

    with pytest.raises(DuplicateEntityError) as exc_info:
        await use_case.register(payload)

    assert "existing@example.com" in exc_info.value.message
    mock_repo.create.assert_not_awaited()
