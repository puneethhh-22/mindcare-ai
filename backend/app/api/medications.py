"""
Medication management and adherence tracking endpoints.
"""
from datetime import datetime, date, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field

from app.core.dependencies import get_current_user
from app.models.user import UserDocument
from app.models.medication import MedicationDocument, MedicationLogDocument

router = APIRouter(prefix="/medications", tags=["Medications"])


# ── Schemas ───────────────────────────────────────────────────────────────────
class MedicationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    dosage: str = Field(min_length=1, max_length=50)
    frequency: str                     # daily | twice_daily | weekly | as_needed
    times: List[str] = []              # ["08:00", "20:00"]
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    instructions: Optional[str] = None
    color: str = "#4F46E5"
    reminder_enabled: bool = True


class MedicationResponse(BaseModel):
    id: str
    name: str
    dosage: str
    frequency: str
    times: List[str]
    start_date: date
    end_date: Optional[date]
    instructions: Optional[str]
    color: str
    is_active: bool
    reminder_enabled: bool


class LogMedicationRequest(BaseModel):
    medication_id: str
    status: str                        # taken | skipped
    notes: Optional[str] = None
    taken_at: Optional[datetime] = None


class AdherenceStats(BaseModel):
    medication_id: str
    medication_name: str
    total_scheduled: int
    taken: int
    skipped: int
    missed: int
    adherence_percentage: float


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.get("", response_model=List[MedicationResponse])
async def list_medications(
    current_user: UserDocument = Depends(get_current_user),
    active_only: bool = True,
):
    """List all medications for the current user."""
    user_id = str(current_user.id)
    query = MedicationDocument.find(MedicationDocument.user_id == user_id)
    if active_only:
        query = query.find(MedicationDocument.is_active == True)
    meds = await query.to_list()

    return [
        MedicationResponse(
            id=str(m.id),
            name=m.name,
            dosage=m.dosage,
            frequency=m.frequency,
            times=m.times,
            start_date=m.start_date,
            end_date=m.end_date,
            instructions=m.instructions,
            color=m.color,
            is_active=m.is_active,
            reminder_enabled=m.reminder_enabled,
        )
        for m in meds
    ]


@router.post("", response_model=MedicationResponse, status_code=201)
async def add_medication(
    data: MedicationCreate,
    current_user: UserDocument = Depends(get_current_user),
):
    """Add a new medication."""
    user_id = str(current_user.id)
    med = MedicationDocument(
        user_id=user_id,
        name=data.name,
        dosage=data.dosage,
        frequency=data.frequency,
        times=data.times,
        start_date=data.start_date or date.today(),
        end_date=data.end_date,
        instructions=data.instructions,
        color=data.color,
        reminder_enabled=data.reminder_enabled,
    )
    await med.insert()

    return MedicationResponse(
        id=str(med.id),
        name=med.name,
        dosage=med.dosage,
        frequency=med.frequency,
        times=med.times,
        start_date=med.start_date,
        end_date=med.end_date,
        instructions=med.instructions,
        color=med.color,
        is_active=med.is_active,
        reminder_enabled=med.reminder_enabled,
    )


@router.put("/{medication_id}", response_model=MedicationResponse)
async def update_medication(
    medication_id: str,
    data: MedicationCreate,
    current_user: UserDocument = Depends(get_current_user),
):
    """Update an existing medication."""
    user_id = str(current_user.id)
    med = await MedicationDocument.get(medication_id)
    if not med or med.user_id != user_id:
        raise HTTPException(status_code=404, detail="Medication not found")

    med.name = data.name
    med.dosage = data.dosage
    med.frequency = data.frequency
    med.times = data.times
    med.end_date = data.end_date
    med.instructions = data.instructions
    med.color = data.color
    med.reminder_enabled = data.reminder_enabled
    med.updated_at = datetime.now(timezone.utc)
    await med.save()

    return MedicationResponse(
        id=str(med.id), name=med.name, dosage=med.dosage,
        frequency=med.frequency, times=med.times, start_date=med.start_date,
        end_date=med.end_date, instructions=med.instructions,
        color=med.color, is_active=med.is_active, reminder_enabled=med.reminder_enabled,
    )


@router.delete("/{medication_id}")
async def delete_medication(
    medication_id: str,
    current_user: UserDocument = Depends(get_current_user),
):
    """Deactivate a medication (soft delete)."""
    user_id = str(current_user.id)
    med = await MedicationDocument.get(medication_id)
    if not med or med.user_id != user_id:
        raise HTTPException(status_code=404, detail="Medication not found")

    med.is_active = False
    med.updated_at = datetime.now(timezone.utc)
    await med.save()
    return {"message": "Medication deactivated"}


@router.post("/log")
async def log_medication_taken(
    data: LogMedicationRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Log medication as taken or skipped."""
    user_id = str(current_user.id)
    med = await MedicationDocument.get(data.medication_id)
    if not med or med.user_id != user_id:
        raise HTTPException(status_code=404, detail="Medication not found")

    log = MedicationLogDocument(
        user_id=user_id,
        medication_id=data.medication_id,
        medication_name=med.name,
        scheduled_time=datetime.now(timezone.utc),
        taken_at=data.taken_at or datetime.now(timezone.utc),
        status=data.status,
        notes=data.notes,
    )
    await log.insert()
    return {"message": f"Medication logged as {data.status}", "log_id": str(log.id)}


@router.get("/adherence", response_model=List[AdherenceStats])
async def get_adherence_stats(
    current_user: UserDocument = Depends(get_current_user),
    days: int = Query(default=7, le=30),
):
    """Get medication adherence statistics for the past N days."""
    user_id = str(current_user.id)
    meds = await MedicationDocument.find(
        MedicationDocument.user_id == user_id,
        MedicationDocument.is_active == True,
    ).to_list()

    stats = []
    for med in meds:
        logs = await MedicationLogDocument.find(
            MedicationLogDocument.user_id == user_id,
            MedicationLogDocument.medication_id == str(med.id),
        ).to_list()

        taken = sum(1 for l in logs if l.status == "taken")
        skipped = sum(1 for l in logs if l.status == "skipped")
        missed = sum(1 for l in logs if l.status == "missed")
        total = len(logs) or 1

        stats.append(AdherenceStats(
            medication_id=str(med.id),
            medication_name=med.name,
            total_scheduled=total,
            taken=taken,
            skipped=skipped,
            missed=missed,
            adherence_percentage=round((taken / total) * 100, 1),
        ))

    return stats
