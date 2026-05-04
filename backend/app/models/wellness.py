"""
Wellness tracking document models: mood, water, sleep, activity, weight.
"""
from datetime import datetime, date, timezone
from typing import Optional, List
from beanie import Document
from pydantic import Field


class MoodEntryDocument(Document):
    user_id: str
    mood_score: int                    # 1-10 scale
    mood_label: str                    # great | good | okay | low | terrible
    emotions: List[str] = []           # anxious, happy, sad, stressed, calm, etc.
    journal_text: Optional[str] = None
    triggers: List[str] = []
    activities: List[str] = []
    ai_response: Optional[str] = None
    entry_date: date = Field(default_factory=date.today)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "mood_entries"
        indexes = ["user_id", "entry_date"]


class WaterIntakeDocument(Document):
    user_id: str
    amount_ml: float
    entry_date: date = Field(default_factory=date.today)
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "water_intake"
        indexes = ["user_id", "entry_date"]


class SleepEntryDocument(Document):
    user_id: str
    sleep_start: datetime
    sleep_end: datetime
    duration_hours: float
    quality_score: int                 # 1-5
    notes: Optional[str] = None
    entry_date: date = Field(default_factory=date.today)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "sleep_entries"
        indexes = ["user_id", "entry_date"]


class ActivityEntryDocument(Document):
    user_id: str
    activity_type: str                 # walking | running | cycling | yoga | etc.
    steps: Optional[int] = None
    duration_minutes: Optional[int] = None
    calories_burned: Optional[float] = None
    distance_km: Optional[float] = None
    entry_date: date = Field(default_factory=date.today)
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "activity_entries"
        indexes = ["user_id", "entry_date"]


class WeightEntryDocument(Document):
    user_id: str
    weight_kg: float
    bmi: Optional[float] = None
    body_fat_percent: Optional[float] = None
    notes: Optional[str] = None
    entry_date: date = Field(default_factory=date.today)
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "weight_entries"
        indexes = ["user_id", "entry_date"]
