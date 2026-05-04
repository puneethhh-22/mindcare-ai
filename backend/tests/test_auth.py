"""
Tests for authentication endpoints.
"""
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_register_success():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": "TestPass123",
                "full_name": "Test User",
            },
        )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_register_duplicate_email():
    async with AsyncClient(app=app, base_url="http://test") as client:
        payload = {
            "email": "dup@example.com",
            "username": "dupuser1",
            "password": "TestPass123",
        }
        await client.post("/api/v1/auth/register", json=payload)
        payload["username"] = "dupuser2"
        response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_invalid_credentials():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "nobody@example.com", "password": "wrongpass"},
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_profile_unauthenticated():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/auth/me")
    assert response.status_code == 403
