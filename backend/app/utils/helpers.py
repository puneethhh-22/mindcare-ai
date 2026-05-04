"""
General utility helpers used across the application.
"""
import re
import hashlib
from datetime import datetime, date, timezone
from typing import Any


def sanitize_text(text: str, max_length: int = 2000) -> str:
    """Strip dangerous characters and truncate text."""
    # Remove null bytes and control characters (except newlines/tabs)
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    return cleaned[:max_length].strip()


def calculate_bmi(weight_kg: float, height_cm: float) -> float | None:
    """Calculate BMI from weight (kg) and height (cm)."""
    if height_cm <= 0 or weight_kg <= 0:
        return None
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 1)


def bmi_category(bmi: float) -> str:
    """Return WHO BMI category label."""
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25.0:
        return "Normal weight"
    elif bmi < 30.0:
        return "Overweight"
    else:
        return "Obese"


def mask_email(email: str) -> str:
    """Mask email for safe logging: user@example.com → u***@example.com"""
    parts = email.split("@")
    if len(parts) != 2:
        return "***"
    local = parts[0]
    masked_local = local[0] + "***" if len(local) > 1 else "***"
    return f"{masked_local}@{parts[1]}"


def date_to_str(d: date) -> str:
    return d.isoformat()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def paginate(items: list[Any], page: int, page_size: int) -> dict:
    """Simple in-memory pagination helper."""
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    return {
        "items": items[start:end],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }
