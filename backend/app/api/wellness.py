"""
Wellness tracking endpoints: mood, water, sleep, activity, weight, summary.
"""
from datetime import datetime, date, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.core.dependencies import get_current_user
from app.models.user import UserDocument
from app.models.wellness import (
    MoodEntryDocument,
    WaterIntakeDocument,
    SleepEntryDocument,
    ActivityEntryDocument,
    WeightEntryDocument,
)
from app.ai.mental_health_agent import get_daily_checkin_response
from app.ai.wellness_advisor import generate_weekly_summary, predict_mood_trend, generate_wellness_tip

router = APIRouter(prefix="/wellness", tags=["Wellness"])


# ── Mood ──────────────────────────────────────────────────────────────────────
class MoodEntryRequest(BaseModel):
    mood_score: int = Field(ge=1, le=10)
    mood_label: str
    emotions: List[str] = []
    journal_text: Optional[str] = None
    triggers: List[str] = []
    activities: List[str] = []


class MoodEntryResponse(BaseModel):
    id: str
    mood_score: int
    mood_label: str
    emotions: List[str]
    journal_text: Optional[str]
    ai_response: Optional[str]
    entry_date: date
    created_at: datetime


@router.post("/mood", response_model=MoodEntryResponse, status_code=201)
async def log_mood(
    data: MoodEntryRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Log a mood check-in entry."""
    user_id = str(current_user.id)

    # Get AI response for the check-in
    ai_response = await get_daily_checkin_response(
        mood_score=data.mood_score,
        emotions=data.emotions,
        journal_text=data.journal_text or "",
    )

    entry = MoodEntryDocument(
        user_id=user_id,
        mood_score=data.mood_score,
        mood_label=data.mood_label,
        emotions=data.emotions,
        journal_text=data.journal_text,
        triggers=data.triggers,
        activities=data.activities,
        ai_response=ai_response,
    )
    await entry.insert()

    return MoodEntryResponse(
        id=str(entry.id),
        mood_score=entry.mood_score,
        mood_label=entry.mood_label,
        emotions=entry.emotions,
        journal_text=entry.journal_text,
        ai_response=entry.ai_response,
        entry_date=entry.entry_date,
        created_at=entry.created_at,
    )


@router.get("/mood", response_model=List[MoodEntryResponse])
async def get_mood_history(
    current_user: UserDocument = Depends(get_current_user),
    days: int = Query(default=7, le=90),
):
    """Get mood history for the past N days."""
    user_id = str(current_user.id)
    entries = await MoodEntryDocument.find(
        MoodEntryDocument.user_id == user_id
    ).sort(-MoodEntryDocument.created_at).limit(days).to_list()

    return [
        MoodEntryResponse(
            id=str(e.id), mood_score=e.mood_score, mood_label=e.mood_label,
            emotions=e.emotions, journal_text=e.journal_text,
            ai_response=e.ai_response, entry_date=e.entry_date,
            created_at=e.created_at,
        )
        for e in entries
    ]


@router.get("/mood/trend")
async def get_mood_trend(current_user: UserDocument = Depends(get_current_user)):
    """Get AI-powered mood trend prediction."""
    user_id = str(current_user.id)
    entries = await MoodEntryDocument.find(
        MoodEntryDocument.user_id == user_id
    ).sort(-MoodEntryDocument.created_at).limit(14).to_list()

    history = [{"mood_score": e.mood_score, "date": str(e.entry_date)} for e in entries]
    return await predict_mood_trend(history)


# ── Water Intake ──────────────────────────────────────────────────────────────
class WaterLogRequest(BaseModel):
    amount_ml: float = Field(gt=0, le=5000)


@router.post("/water", status_code=201)
async def log_water(
    data: WaterLogRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Log water intake."""
    entry = WaterIntakeDocument(user_id=str(current_user.id), amount_ml=data.amount_ml)
    await entry.insert()

    # Get today's total
    today = date.today()
    today_entries = await WaterIntakeDocument.find(
        WaterIntakeDocument.user_id == str(current_user.id),
        WaterIntakeDocument.entry_date == today,
    ).to_list()
    total_today = sum(e.amount_ml for e in today_entries)

    return {
        "logged_ml": data.amount_ml,
        "total_today_ml": total_today,
        "goal_ml": 2500,
        "percentage": min(round((total_today / 2500) * 100, 1), 100),
    }


@router.get("/water/today")
async def get_water_today(current_user: UserDocument = Depends(get_current_user)):
    """Get today's water intake summary."""
    today = date.today()
    entries = await WaterIntakeDocument.find(
        WaterIntakeDocument.user_id == str(current_user.id),
        WaterIntakeDocument.entry_date == today,
    ).to_list()
    total = sum(e.amount_ml for e in entries)
    return {"total_ml": total, "goal_ml": 2500, "percentage": min(round((total / 2500) * 100, 1), 100)}


# ── Sleep ─────────────────────────────────────────────────────────────────────
class SleepLogRequest(BaseModel):
    sleep_start: datetime
    sleep_end: datetime
    quality_score: int = Field(ge=1, le=5)
    notes: Optional[str] = None


@router.post("/sleep", status_code=201)
async def log_sleep(
    data: SleepLogRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Log a sleep entry."""
    duration = (data.sleep_end - data.sleep_start).total_seconds() / 3600
    entry = SleepEntryDocument(
        user_id=str(current_user.id),
        sleep_start=data.sleep_start,
        sleep_end=data.sleep_end,
        duration_hours=round(duration, 2),
        quality_score=data.quality_score,
        notes=data.notes,
    )
    await entry.insert()
    return {"duration_hours": entry.duration_hours, "quality_score": entry.quality_score}


# ── Activity ──────────────────────────────────────────────────────────────────
class ActivityLogRequest(BaseModel):
    activity_type: str
    steps: Optional[int] = None
    duration_minutes: Optional[int] = None
    calories_burned: Optional[float] = None
    distance_km: Optional[float] = None


@router.post("/activity", status_code=201)
async def log_activity(
    data: ActivityLogRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Log physical activity."""
    entry = ActivityEntryDocument(
        user_id=str(current_user.id),
        activity_type=data.activity_type,
        steps=data.steps,
        duration_minutes=data.duration_minutes,
        calories_burned=data.calories_burned,
        distance_km=data.distance_km,
    )
    await entry.insert()
    return {"message": "Activity logged", "id": str(entry.id)}


# ── Weight / BMI ──────────────────────────────────────────────────────────────
class WeightLogRequest(BaseModel):
    weight_kg: float = Field(gt=0, le=500)
    notes: Optional[str] = None


@router.post("/weight", status_code=201)
async def log_weight(
    data: WeightLogRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Log weight and calculate BMI if height is available."""
    bmi = None
    height = current_user.health_profile.height_cm
    if height and height > 0:
        height_m = height / 100
        bmi = round(data.weight_kg / (height_m ** 2), 1)

    entry = WeightEntryDocument(
        user_id=str(current_user.id),
        weight_kg=data.weight_kg,
        bmi=bmi,
        notes=data.notes,
    )
    await entry.insert()
    return {"weight_kg": data.weight_kg, "bmi": bmi}


# ── Weekly Summary ────────────────────────────────────────────────────────────
@router.get("/summary")
async def get_weekly_summary(current_user: UserDocument = Depends(get_current_user)):
    """Get AI-powered weekly wellness summary."""
    user_id = str(current_user.id)

    # Fetch last 7 days of data
    mood_entries = await MoodEntryDocument.find(
        MoodEntryDocument.user_id == user_id
    ).sort(-MoodEntryDocument.created_at).limit(7).to_list()

    sleep_entries = await SleepEntryDocument.find(
        SleepEntryDocument.user_id == user_id
    ).sort(-SleepEntryDocument.created_at).limit(7).to_list()

    water_entries = await WaterIntakeDocument.find(
        WaterIntakeDocument.user_id == user_id
    ).sort(-WaterIntakeDocument.created_at).limit(7).to_list()

    from app.models.medication import MedicationLogDocument
    med_logs = await MedicationLogDocument.find(
        MedicationLogDocument.user_id == user_id
    ).sort(-MedicationLogDocument.created_at).limit(50).to_list()

    # Calculate adherence
    taken = sum(1 for l in med_logs if l.status == "taken")
    adherence = (taken / len(med_logs) * 100) if med_logs else 100.0

    # Aggregate water by day
    from collections import defaultdict
    water_by_day: dict = defaultdict(float)
    for w in water_entries:
        water_by_day[str(w.entry_date)] += w.amount_ml
    daily_water = list(water_by_day.values())

    # Top emotions
    all_emotions: list = []
    for m in mood_entries:
        all_emotions.extend(m.emotions)
    from collections import Counter
    top_emotions = [e for e, _ in Counter(all_emotions).most_common(5)]

    summary = await generate_weekly_summary(
        mood_scores=[m.mood_score for m in mood_entries],
        sleep_data=[s.duration_hours for s in sleep_entries],
        water_data=daily_water,
        medication_adherence=adherence,
        top_emotions=top_emotions,
    )
    return summary


@router.get("/tip")
async def get_wellness_tip(current_user: UserDocument = Depends(get_current_user)):
    """Get a personalized daily wellness tip."""
    user_id = str(current_user.id)

    mood_entries = await MoodEntryDocument.find(
        MoodEntryDocument.user_id == user_id
    ).sort(-MoodEntryDocument.created_at).limit(7).to_list()

    sleep_entries = await SleepEntryDocument.find(
        SleepEntryDocument.user_id == user_id
    ).sort(-SleepEntryDocument.created_at).limit(7).to_list()

    mood_scores = [m.mood_score for m in mood_entries]
    avg_mood = sum(mood_scores) / len(mood_scores) if mood_scores else 5
    mood_trend = "stable"
    if avg_mood >= 7:
        mood_trend = "positive"
    elif avg_mood <= 4:
        mood_trend = "low"

    avg_sleep = None
    if sleep_entries:
        avg_sleep = sum(s.duration_hours for s in sleep_entries) / len(sleep_entries)

    tip = await generate_wellness_tip(mood_trend=mood_trend, sleep_avg=avg_sleep)
    return {"tip": tip}
