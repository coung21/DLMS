import pytest
from httpx import AsyncClient, ASGITransport
from uuid import uuid4
from app.main import app

BASE = "/api/v1/documents"

@pytest.mark.asyncio
async def test_filter_documents_by_category():
    cat_id = str(uuid4())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(f"{BASE}?category_id={cat_id}")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 0

@pytest.mark.asyncio
async def test_filter_documents_by_file_type():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(f"{BASE}?file_type=pdf")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["file_type"] == "pdf"

@pytest.mark.asyncio
async def test_search_documents():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(f"{BASE}?search=test")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data

@pytest.mark.asyncio
async def test_sort_documents():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(f"{BASE}?sort_by=title_asc")
    assert response.status_code == 200
    data = response.json()
    if len(data["items"]) > 1:
        titles = [item["title"] for item in data["items"]]
        # In-memory sort for comparison
        expected = sorted(titles)
        assert titles == expected
