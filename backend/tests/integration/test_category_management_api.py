import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
from datetime import datetime, timezone
from app.main import app
from app.api.v1.dependencies.auth import get_current_user_id, oauth2_scheme
from app.domain.entities.category import Category

BASE = "/api/v1/categories"

def setup_auth_mock(user_id=None, role="admin"):
    uid = user_id or uuid.uuid4()
    app.dependency_overrides[oauth2_scheme] = lambda: "mock_token"
    app.dependency_overrides[get_current_user_id] = lambda: uid
    return uid

def cleanup_auth_mock():
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_categories_success():
    """GET /categories -> 200 OK."""
    with patch("app.infrastructure.repositories.category_repository.CategoryRepository.list_all", new_callable=AsyncMock) as mock_list, \
         patch("app.infrastructure.repositories.category_repository.CategoryRepository.count_all", new_callable=AsyncMock) as mock_count:
        
        mock_cats = [
            Category(id=uuid.uuid4(), name="Test Cat", description="Desc", created_at=datetime.now(timezone.utc))
        ]
        mock_list.return_value = mock_cats
        mock_count.return_value = 1
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get(BASE)
            
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
    assert resp.json()["items"][0]["name"] == "Test Cat"

@pytest.mark.asyncio
async def test_create_category_admin_success():
    """POST /categories as Admin -> 201 Created."""
    setup_auth_mock(role="admin")
    
    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode, \
         patch("app.infrastructure.repositories.category_repository.CategoryRepository.get_by_name", new_callable=AsyncMock) as mock_get_name, \
         patch("app.infrastructure.repositories.category_repository.CategoryRepository.create", new_callable=AsyncMock) as mock_create:
        
        mock_decode.return_value = {"role": "admin", "sub": str(uuid.uuid4()), "type": "access"}
        mock_get_name.return_value = None
        
        new_cat = Category(id=uuid.uuid4(), name="New Cat", description="New Desc", created_at=datetime.now(timezone.utc))
        mock_create.return_value = new_cat
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post(BASE, json={"name": "New Cat", "description": "New Desc"})
            
    cleanup_auth_mock()
    assert resp.status_code == 201
    assert resp.json()["name"] == "New Cat"

@pytest.mark.asyncio
async def test_create_category_non_admin_forbidden():
    """POST /categories as Student -> 403 Forbidden."""
    setup_auth_mock(role="student")
    
    with patch("app.api.v1.dependencies.auth.decode_token") as mock_decode:
        mock_decode.return_value = {"role": "student", "sub": str(uuid.uuid4()), "type": "access"}
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post(BASE, json={"name": "Fail Cat"})
            
    cleanup_auth_mock()
    assert resp.status_code == 403
