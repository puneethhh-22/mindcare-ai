"""
Medication reminder scheduler using APScheduler.
Runs background jobs to check upcoming medication times and send alerts.
"""
import logging
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.models.medication import MedicationDocument, MedicationLogDocument

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def check_medication_reminders():
    """
    Scan all active medications and create pending log entries
    for doses due in the next 30 minutes.
    Called every 15 minutes by the scheduler.
    """
    now = datetime.now(timezone.utc)
    window_end = now + timedelta(minutes=30)

    try:
        active_meds = await MedicationDocument.find(
            MedicationDocument.is_active == True,
            MedicationDocument.reminder_enabled == True,
        ).to_list()

        for med in active_meds:
            for time_str in med.times:
                try:
                    hour, minute = map(int, time_str.split(":"))
                    scheduled = now.replace(hour=hour, minute=minute, second=0, microsecond=0)

                    # If the time already passed today, skip
                    if scheduled < now:
                        continue

                    # If within the 30-minute window, create a pending log
                    if scheduled <= window_end:
                        existing = await MedicationLogDocument.find_one(
                            MedicationLogDocument.medication_id == str(med.id),
                            MedicationLogDocument.scheduled_time == scheduled,
                        )
                        if not existing:
                            log = MedicationLogDocument(
                                user_id=med.user_id,
                                medication_id=str(med.id),
                                medication_name=med.name,
                                scheduled_time=scheduled,
                                status="pending",
                            )
                            await log.insert()
                            logger.info(
                                "Created reminder log for %s at %s (user: %s)",
                                med.name, time_str, med.user_id,
                            )
                except (ValueError, AttributeError) as e:
                    logger.warning("Invalid time format '%s' for med %s: %s", time_str, med.id, e)

    except Exception as e:
        logger.error("Reminder scheduler error: %s", e)


async def mark_missed_medications():
    """
    Mark pending medication logs older than 2 hours as 'missed'.
    Called every hour.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=2)
    try:
        pending_logs = await MedicationLogDocument.find(
            MedicationLogDocument.status == "pending",
            MedicationLogDocument.scheduled_time < cutoff,
        ).to_list()

        for log in pending_logs:
            log.status = "missed"
            await log.save()

        if pending_logs:
            logger.info("Marked %d medication logs as missed", len(pending_logs))
    except Exception as e:
        logger.error("Mark missed medications error: %s", e)


def start_scheduler():
    """Start the background scheduler."""
    scheduler.add_job(
        check_medication_reminders,
        trigger=IntervalTrigger(minutes=15),
        id="medication_reminders",
        replace_existing=True,
    )
    scheduler.add_job(
        mark_missed_medications,
        trigger=IntervalTrigger(hours=1),
        id="mark_missed",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("✅ Reminder scheduler started")


def stop_scheduler():
    """Stop the background scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("🛑 Reminder scheduler stopped")
