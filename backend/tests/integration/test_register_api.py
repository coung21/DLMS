"""Integration tests cho POST /api/v1/auth/register – dùng DB thật."""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app


BASE = "/api/v1/auth"


import uuid

@pytest.mark.asyncio
async def test_register_success():
    """POST /register → 201, trả về user info."""
    test_email = f"newuser_{uuid.uuid4().hex[:8]}@example.com"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(f"{BASE}/register", json={
            "email": test_email,
            "password": "securepass123",
            "full_name": "New User",
        })

    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == test_email
    assert data["full_name"] == "New User"
    assert "id" in data
    assert "hashed_password" not in data   # không leak password


@pytest.mark.asyncio
async def test_register_duplicate_email_returns_409():
    """POST /register lần 2 cùng email → 409 Conflict."""
    test_email = f"dupuser_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": test_email,
        "password": "securepass123",
        "full_name": "Dup User",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post(f"{BASE}/register", json=payload)
        resp = await client.post(f"{BASE}/register", json=payload)

    assert resp.status_code == 409
    assert test_email in resp.json()["detail"]


@pytest.mark.asyncio
async def test_register_missing_field_returns_422():
    """POST /register thiếu full_name → 422 Unprocessable Entity."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(f"{BASE}/register", json={
            "email": "user@example.com",
            "password": "securepass123",
            # full_name bị thiếu
        })

    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_register_short_password_returns_422():
    """POST /register password < 8 ký tự → 422."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(f"{BASE}/register", json={
            "email": "user2@example.com",
            "password": "short",
            "full_name": "User Two",
        })

    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_email_returns_422():
    """POST /register email không hợp lệ → 422."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(f"{BASE}/register", json={
            "email": "not-an-email",
            "password": "securepass123",
            "full_name": "User Three",
        })

    assert resp.status_code == 422
