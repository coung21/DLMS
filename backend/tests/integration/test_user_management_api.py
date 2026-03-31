import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
from datetime import datetime, timezone
from app.main import app
from app.api.v1.dependencies.auth import get_current_user_id, oauth2_scheme
from app.domain.entities.user import User
from app.domain.enums import UserRole, UserStatus

BASE = "/api/v1/users"

def setup_auth_mock(user_id=None, role="admin"):
    uid = user_id or uuid.uuid4()
    app.dependency_overrides[oauth2_scheme] = lambda: "mock_token"
    app.dependency_overrides[get_current_user_id] = lambda: uid
    return uid

def cleanup_auth_mock():
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_users_admin_success():
    """GET /users as Admin -> 200 OK."""
    setup_auth_mock(role="admin")
    
    # Mock decode_token to return admin role
    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode, \
         patch("app.infrastructure.repositories.user_repository.UserRepository.list_all", new_callable=AsyncMock) as mock_list, \
         patch("app.infrastructure.repositories.user_repository.UserRepository.count_all", new_callable=AsyncMock) as mock_count:
        
        mock_decode.return_value = {"role": "admin", "sub": str(uuid.uuid4()), "type": "access"}
        
        mock_users = [
            User(
                id=uuid.uuid4(),
                email="user1@example.com",
                hashed_password="hashed",
                full_name="User One",
                role=UserRole.STUDENT,
                status=UserStatus.ACTIVE,
                created_at=datetime.now(timezone.utc)
            )
        ]
        mock_list.return_value = mock_users
        mock_count.return_value = 1
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get(BASE)
            
    cleanup_auth_mock()
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["email"] == "user1@example.com"

@pytest.mark.asyncio
async def test_list_users_non_admin_forbidden():
    """GET /users as Student -> 403 Forbidden."""
    setup_auth_mock(role="student")
    
    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode:
        # decode_token returns student role
        mock_decode.return_value = {"role": "student", "sub": str(uuid.uuid4()), "type": "access"}
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get(BASE)
            
    cleanup_auth_mock()
    assert resp.status_code == 403

@pytest.mark.asyncio
async def test_update_user_role_success():
    """PATCH /users/{id} as Admin -> 200 OK."""
    setup_auth_mock(role="admin")
    target_user_id = uuid.uuid4()
    
    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode, \
         patch("app.infrastructure.repositories.user_repository.UserRepository.get_by_id", new_callable=AsyncMock) as mock_get, \
         patch("app.infrastructure.repositories.user_repository.UserRepository.update", new_callable=AsyncMock) as mock_update:
        
        mock_decode.return_value = {"role": "admin", "sub": str(uuid.uuid4()), "type": "access"}
        
        existing_user = User(
            id=target_user_id,
            email="to_update@example.com",
            hashed_password="hashed",
            full_name="To Update",
            role=UserRole.STUDENT,
            status=UserStatus.ACTIVE,
            created_at=datetime.now(timezone.utc)
        )
        mock_get.return_value = existing_user
        
        # Mock update to return user with new role
        updated_user = User(
            id=target_user_id,
            email="to_update@example.com",
            hashed_password="hashed",
            full_name="To Update",
            role=UserRole.TEACHER,
            status=UserStatus.ACTIVE,
            created_at=existing_user.created_at
        )
        mock_update.return_value = updated_user
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.patch(f"{BASE}/{target_user_id}", json={"role": "teacher"})
            
    cleanup_auth_mock()
    assert resp.status_code == 200
    assert resp.json()["role"] == "teacher"
