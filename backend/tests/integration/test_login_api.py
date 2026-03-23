"""Integration tests for POST /api/v1/auth/login."""
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app

BASE = "/api/v1/auth"


@pytest.mark.asyncio
async def test_login_success():
    """POST /login with correct credentials -> 200, returns tokens."""
    # Register a user first
    payload = {
        "email": "loginuser@example.com",
        "password": "securepass123",
        "full_name": "Login User",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post(f"{BASE}/register", json=payload)
        
        # Now login
        resp = await client.post(f"{BASE}/login", json={
            "email": "loginuser@example.com",
            "password": "securepass123"
        })

    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password():
    """POST /login with wrong password -> 401 Unauthorized."""
    # Register a user first
    payload = {
        "email": "loginuser2@example.com",
        "password": "securepass123",
        "full_name": "Login User 2",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post(f"{BASE}/register", json=payload)
        
        # Now login with wrong password
        resp = await client.post(f"{BASE}/login", json={
            "email": "loginuser2@example.com",
            "password": "wrongpassword"
        })

    assert resp.status_code == 401
    assert "Email hoặc mật khẩu không đúng." in resp.json()["detail"]


@pytest.mark.asyncio
async def test_login_nonexistent_email():
    """POST /login with nonexistent email -> 401 Unauthorized."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(f"{BASE}/login", json={
            "email": "doesntexist@example.com",
            "password": "somepassword"
        })

    assert resp.status_code == 401
    assert "Email hoặc mật khẩu không đúng." in resp.json()["detail"]


@pytest.mark.asyncio
async def test_login_invalid_email_returns_422():
    """POST /login with invalid email format -> 422."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(f"{BASE}/login", json={
            "email": "not-an-email",
            "password": "somepassword"
        })

    assert resp.status_code == 422
