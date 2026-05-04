"""
Pytest configuration and shared fixtures.
Uses an in-memory MongoDB via mongomock for isolated tests.
"""
import asyncio
import pytest
from unittest.mock import AsyncMock, patch


@pytest.fixture(scope="session")
def event_loop():
    """Create a single event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
def mock_db(monkeypatch):
    """
    Mock database connections so unit tests don't need a real MongoDB/Redis.
    Integration tests should override this fixture.
    """
    with patch("app.core.database.connect_db", new_callable=AsyncMock), \
         patch("app.core.database.disconnect_db", new_callable=AsyncMock), \
         patch("app.core.redis_client.get_redis", new_callable=AsyncMock), \
         patch("app.core.redis_client.close_redis", new_callable=AsyncMock), \
         patch("app.core.redis_client.is_token_blacklisted", new_callable=AsyncMock, return_value=False):
        yield
