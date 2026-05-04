"""
Symptom Checker AI Agent.
Analyzes user-reported symptoms and provides urgency recommendations.
IMPORTANT: This is NOT a diagnostic tool. Always includes medical disclaimers.
"""
import json
import logging
from typing import Optional
from app.ai.llm_client import llm_client

logger = logging.getLogger(__name__)

DISCLAIMER = (
    "⚠️ MEDICAL DISCLAIMER: This information is for educational purposes only "
    "and does NOT constitute medical advice, diagnosis, or treatment. "
    "Always consult a qualified healthcare professional for medical concerns."
)

SYMPTOM_SYSTEM_PROMPT = """You are a medical information assistant for MindCare AI.

CRITICAL RULES:
1. You are NOT a doctor and CANNOT diagnose conditions
2. ALWAYS include the disclaimer that this is not medical advice
3. NEVER claim certainty about any condition
4. ALWAYS recommend consulting a healthcare professional
5. For emergency symptoms, ALWAYS recommend calling 911 immediately

Your task: Analyze reported symptoms and provide:
1. A list of POSSIBLE common conditions (not diagnoses) that may present with these symptoms
2. An urgency level: "home_care" | "doctor_consultation" | "urgent_care" | "emergency"
3. General self-care suggestions for home_care cases
4. Red flag symptoms to watch for
5. When to seek immediate emergency care

Urgency guidelines:
- home_care: Mild symptoms, common conditions (cold, minor headache, mild fatigue)
- doctor_consultation: Persistent symptoms, need professional evaluation (within 1-3 days)
- urgent_care: Significant symptoms needing prompt attention (within hours)
- emergency: Life-threatening symptoms (chest pain, difficulty breathing, stroke signs, severe bleeding)

Always respond in valid JSON format."""

SYMPTOM_RESPONSE_SCHEMA = {
    "possible_conditions": ["list of possible common conditions"],
    "urgency_level": "home_care | doctor_consultation | urgent_care | emergency",
    "urgency_explanation": "why this urgency level",
    "self_care_tips": ["list of self-care suggestions if applicable"],
    "red_flags": ["symptoms that would require immediate medical attention"],
    "when_to_call_911": "specific emergency scenarios",
    "disclaimer": DISCLAIMER,
}

# Emergency symptom keywords for immediate detection
EMERGENCY_KEYWORDS = {
    "chest pain", "heart attack", "can't breathe", "cannot breathe",
    "difficulty breathing", "stroke", "unconscious", "seizure",
    "severe bleeding", "overdose", "poisoning", "anaphylaxis",
    "allergic reaction", "choking", "not breathing",
}


def detect_emergency_symptoms(text: str) -> bool:
    """Quick check for emergency keywords before LLM call."""
    text_lower = text.lower()
    return any(kw in text_lower for kw in EMERGENCY_KEYWORDS)


async def analyze_symptoms(
    symptoms: str,
    patient_age: Optional[int] = None,
    patient_gender: Optional[str] = None,
    duration: Optional[str] = None,
    additional_context: Optional[str] = None,
) -> dict:
    """
    Analyze symptoms and return structured assessment.
    """
    # Fast-path emergency detection
    if detect_emergency_symptoms(symptoms):
        return {
            "possible_conditions": ["Potentially life-threatening condition"],
            "urgency_level": "emergency",
            "urgency_explanation": "Your symptoms may indicate a medical emergency.",
            "self_care_tips": [],
            "red_flags": ["The symptoms you described require immediate medical attention"],
            "when_to_call_911": "CALL 911 OR GO TO THE NEAREST EMERGENCY ROOM IMMEDIATELY",
            "disclaimer": DISCLAIMER,
            "emergency_alert": True,
        }

    # Build context for LLM
    context_parts = [f"Symptoms: {symptoms}"]
    if patient_age:
        context_parts.append(f"Patient age: {patient_age}")
    if patient_gender:
        context_parts.append(f"Patient gender: {patient_gender}")
    if duration:
        context_parts.append(f"Duration: {duration}")
    if additional_context:
        context_parts.append(f"Additional context: {additional_context}")

    user_message = "\n".join(context_parts)
    user_message += f"\n\nRespond ONLY with valid JSON matching this schema:\n{json.dumps(SYMPTOM_RESPONSE_SCHEMA, indent=2)}"

    messages = [
        {"role": "system", "content": SYMPTOM_SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    raw_response = await llm_client.chat(messages, temperature=0.3, max_tokens=1024)

    # Parse JSON response
    try:
        # Strip markdown code blocks if present
        clean = raw_response.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        result = json.loads(clean.strip())
        result["disclaimer"] = DISCLAIMER  # Always enforce disclaimer
        result["emergency_alert"] = result.get("urgency_level") == "emergency"
        return result
    except json.JSONDecodeError:
        logger.warning("Failed to parse symptom checker JSON response")
        return {
            "possible_conditions": ["Unable to analyze — please consult a doctor"],
            "urgency_level": "doctor_consultation",
            "urgency_explanation": "Please consult a healthcare professional for proper evaluation.",
            "self_care_tips": ["Rest and stay hydrated", "Monitor your symptoms"],
            "red_flags": ["Worsening symptoms", "High fever", "Difficulty breathing"],
            "when_to_call_911": "If symptoms become severe or life-threatening",
            "disclaimer": DISCLAIMER,
            "emergency_alert": False,
        }


async def answer_medical_faq(question: str) -> str:
    """Answer common medical FAQs with appropriate disclaimers."""
    system = """You are a medical information assistant. Answer health questions with:
1. Clear, accurate general health information
2. Always include that this is NOT medical advice
3. Recommend consulting a doctor for personal medical concerns
4. Keep answers concise and easy to understand
5. Use plain language, avoid excessive medical jargon"""

    messages = [
        {"role": "system", "content": system},
        {
            "role": "user",
            "content": f"{question}\n\n[Remember to include a brief disclaimer]",
        },
    ]
    return await llm_client.chat(messages, temperature=0.4, max_tokens=512)
