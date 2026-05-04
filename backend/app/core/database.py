"""
MongoDB async connection using Motor + Beanie ODM.
"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings

logger = logging.getLogger(__name__)

# Global client reference
_client: AsyncIOMotorClient | None = None


async def connect_db():
    """Initialize MongoDB connection and Beanie ODM."""
    global _client
    # Import all document models here for Beanie initialization
    from app.models.user import UserDocument
    from app.models.chat import ChatSessionDocument, ChatMessageDocument
    from app.models.wellness import (
        MoodEntryDocument,
        WaterIntakeDocument,
        SleepEntryDocument,
        ActivityEntryDocument,
        WeightEntryDocument,
    )
    from app.models.medication import MedicationDocument, MedicationLogDocument

    _client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = _client[settings.MONGODB_DB_NAME]

    await init_beanie(
        database=db,
        document_models=[
            UserDocument,
            ChatSessionDocument,
            ChatMessageDocument,
            MoodEntryDocument,
            WaterIntakeDocument,
            SleepEntryDocument,
            ActivityEntryDocument,
            WeightEntryDocument,
            MedicationDocument,
            MedicationLogDocument,
        ],
    )
    logger.info("✅ Connected to MongoDB: %s", settings.MONGODB_DB_NAME)


async def disconnect_db():
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        logger.info("🔌 Disconnected from MongoDB")


def get_db():
    """Return the database instance."""
    if _client is None:
        raise RuntimeError("Database not initialized. Call connect_db() first.")
    return _client[settings.MONGODB_DB_NAME]
