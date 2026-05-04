"""
Wellness Advisor AI – generates personalized wellness tips,
weekly summaries, and mood trend predictions.
"""
from typing import Optional
from app.ai.llm_client import llm_client


async def generate_wellness_tip(
    mood_trend: str,
    sleep_avg: Optional[float] = None,
    water_avg: Optional[float] = None,
    activity_level: Optional[str] = None,
) -> str:
    """Generate a personalized daily wellness tip based on user data."""
    context = f"User's recent mood trend: {mood_trend}"
    if sleep_avg:
        context += f"\nAverage sleep: {sleep_avg:.1f} hours/night"
    if water_avg:
        context += f"\nAverage water intake: {water_avg:.0f}ml/day"
    if activity_level:
        context += f"\nActivity level: {activity_level}"

    prompt = f"""{context}

Generate ONE specific, actionable wellness tip (2-3 sentences) personalized to this user's data.
Focus on the area that needs the most improvement. Be encouraging and practical."""

    messages = [
        {
            "role": "system",
            "content": "You are a wellness coach providing personalized health tips. Be concise, warm, and actionable.",
        },
        {"role": "user", "content": prompt},
    ]
    return await llm_client.chat(messages, temperature=0.8, max_tokens=150)


async def generate_weekly_summary(
    mood_scores: list[int],
    sleep_data: list[float],
    water_data: list[float],
    medication_adherence: float,
    top_emotions: list[str],
) -> dict:
    """Generate an AI-powered weekly health summary."""
    avg_mood = sum(mood_scores) / len(mood_scores) if mood_scores else 0
    avg_sleep = sum(sleep_data) / len(sleep_data) if sleep_data else 0
    avg_water = sum(water_data) / len(water_data) if water_data else 0

    prompt = f"""Generate a weekly wellness summary report for a user with these stats:
- Average mood score: {avg_mood:.1f}/10
- Mood trend: {_get_trend(mood_scores)}
- Average sleep: {avg_sleep:.1f} hours/night
- Average water intake: {avg_water:.0f}ml/day
- Medication adherence: {medication_adherence:.0f}%
- Most common emotions: {', '.join(top_emotions[:3]) if top_emotions else 'not tracked'}

Provide:
1. A brief overall assessment (2 sentences)
2. Top 2 achievements this week
3. Top 2 areas for improvement
4. One specific goal for next week

Keep it positive, encouraging, and actionable."""

    messages = [
        {
            "role": "system",
            "content": "You are a wellness coach creating weekly health summaries. Be encouraging and data-driven.",
        },
        {"role": "user", "content": prompt},
    ]

    summary_text = await llm_client.chat(messages, temperature=0.7, max_tokens=400)

    return {
        "summary_text": summary_text,
        "stats": {
            "avg_mood": round(avg_mood, 1),
            "avg_sleep": round(avg_sleep, 1),
            "avg_water_ml": round(avg_water),
            "medication_adherence_pct": round(medication_adherence, 1),
            "mood_trend": _get_trend(mood_scores),
        },
    }


def _get_trend(scores: list[int | float]) -> str:
    """Determine trend direction from a list of scores."""
    if len(scores) < 2:
        return "stable"
    first_half = scores[: len(scores) // 2]
    second_half = scores[len(scores) // 2 :]
    avg_first = sum(first_half) / len(first_half)
    avg_second = sum(second_half) / len(second_half)
    diff = avg_second - avg_first
    if diff > 0.5:
        return "improving"
    elif diff < -0.5:
        return "declining"
    return "stable"


async def predict_mood_trend(mood_history: list[dict]) -> dict:
    """Simple mood trend prediction based on recent history."""
    if len(mood_history) < 3:
        return {"prediction": "insufficient_data", "confidence": 0.0, "message": ""}

    scores = [entry["mood_score"] for entry in mood_history[-7:]]
    trend = _get_trend(scores)
    avg = sum(scores) / len(scores)

    messages_map = {
        "improving": f"Your mood has been improving! Keep up the great work. Average: {avg:.1f}/10",
        "declining": f"Your mood has been lower recently. Consider reaching out for support. Average: {avg:.1f}/10",
        "stable": f"Your mood has been consistent. Average: {avg:.1f}/10",
    }

    return {
        "prediction": trend,
        "confidence": 0.75,
        "average_score": round(avg, 1),
        "message": messages_map.get(trend, ""),
        "data_points": len(scores),
    }
