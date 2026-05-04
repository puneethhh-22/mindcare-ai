"""
Redis client for caching, session management, and rate limiting.
"""
import logging
from typing import Optional
import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
        logger.info("✅ Connected to Redis")
    return _redis


async def close_redis():
    global _redis
    if _redis:
        await _redis.close()
        logger.info("🔌 Disconnected from Redis")


async def cache_set(key: str, value: str, ttl: int = 300) -> None:
    r = await get_redis()
    await r.setex(key, ttl, value)


async def cache_get(key: str) -> Optional[str]:
    r = await get_redis()
    return await r.get(key)


async def cache_delete(key: str) -> None:
    r = await get_redis()
    await r.delete(key)


async def blacklist_token(token: str, ttl: int) -> None:
    """Add a JWT to the blacklist (for logout)."""
    r = await get_redis()
    await r.setex(f"blacklist:{token}", ttl, "1")


async def is_token_blacklisted(token: str) -> bool:
    r = await get_redis()
    return await r.exists(f"blacklist:{token}") == 1
