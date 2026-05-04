"""
Medication and medication log document models.
"""
from datetime import datetime, date, time, timezone
from typing import Optional, List
from beanie import Document
from pydantic import Field


class MedicationDocument(Document):
    user_id: str
    name: str
    dosage: str                        # e.g., "500mg"
    frequency: str                     # daily | twice_daily | weekly | as_needed
    times: List[str] = []              # ["08:00", "20:00"]
    start_date: date = Field(default_factory=date.today)
    end_date: Optional[date] = None
    instructions: Optional[str] = None # "Take with food"
    color: str = "#4F46E5"             # UI color tag
    is_active: bool = True
    reminder_enabled: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "medications"
        indexes = ["user_id", "is_active"]


class MedicationLogDocument(Document):
    user_id: str
    medication_id: str
    medication_name: str
    scheduled_time: datetime
    taken_at: Optional[datetime] = None
    status: str = "pending"            # pending | taken | skipped | missed
    notes: Optional[str] = None
    entry_date: date = Field(default_factory=date.today)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "medication_logs"
        indexes = ["user_id", "medication_id", "entry_date", "status"]
