"""
Chat session and message document models.
"""
from datetime import datetime, timezone
from typing import Optional, List
from beanie import Document, Link
from pydantic import BaseModel, Field
from bson import ObjectId


class ChatMessageDocument(Document):
    session_id: str
    user_id: str
    role: str                          # "user" | "assistant" | "system"
    content: str
    message_type: str = "text"         # "text" | "crisis_alert" | "symptom_result"
    sentiment_score: Optional[float] = None   # -1.0 to 1.0
    sentiment_label: Optional[str] = None     # positive | neutral | negative
    crisis_detected: bool = False
    metadata: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "chat_messages"
        indexes = ["session_id", "user_id", "created_at"]


class ChatSessionDocument(Document):
    user_id: str
    title: str = "New Conversation"
    session_type: str = "general"      # general | mental_health | symptom_check
    message_count: int = 0
    is_active: bool = True
    summary: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "chat_sessions"
        indexes = ["user_id", "created_at"]
