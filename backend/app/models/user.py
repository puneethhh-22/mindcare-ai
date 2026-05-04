"""
User document model (MongoDB via Beanie ODM).
"""
from datetime import datetime, timezone
from typing import Optional, List
from beanie import Document, Indexed
from pydantic import BaseModel, Field


class HealthProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None          # male | female | non-binary | prefer_not_to_say
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    blood_type: Optional[str] = None
    allergies: List[str] = []
    chronic_conditions: List[str] = []
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class NotificationPreferences(BaseModel):
    medication_reminders: bool = True
    daily_checkin: bool = True
    wellness_tips: bool = True
    email_notifications: bool = False
    push_notifications: bool = True


class UserDocument(Document):
    email: Indexed(str, unique=True)  # type: ignore[valid-type]
    username: Indexed(str, unique=True)    # type: ignore[valid-type]
    hashed_password: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    health_profile: HealthProfile = Field(default_factory=HealthProfile)
    notification_prefs: NotificationPreferences = Field(
        default_factory=NotificationPreferences
    )
    timezone: str = "UTC"
    language: str = "en"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None

    class Settings:
        name = "users"
        indexes = ["email", "username"]

    def update_timestamp(self):
        self.updated_at = datetime.now(timezone.utc)
