"""
Input validation helpers for healthcare data.
"""
import re
from typing import Optional


def is_valid_time_format(time_str: str) -> bool:
    """Validate HH:MM 24-hour time format."""
    return bool(re.match(r"^([01]\d|2[0-3]):([0-5]\d)$", time_str))


def validate_medication_times(times: list[str]) -> list[str]:
    """Filter and return only valid time strings."""
    return [t for t in times if is_valid_time_format(t)]


def is_valid_mood_score(score: int) -> bool:
    return 1 <= score <= 10


def is_valid_sleep_quality(score: int) -> bool:
    return 1 <= score <= 5


def is_valid_water_amount(ml: float) -> bool:
    return 0 < ml <= 5000


def is_valid_weight(kg: float) -> bool:
    return 10 < kg < 500


def is_valid_height(cm: float) -> bool:
    return 50 < cm < 300


def sanitize_symptom_input(text: str) -> Optional[str]:
    """
    Basic sanitization for symptom descriptions.
    Returns None if input is too short or suspicious.
    """
    if not text or len(text.strip()) < 5:
        return None
    # Remove excessive whitespace
    cleaned = " ".join(text.split())
    return cleaned[:1000]
