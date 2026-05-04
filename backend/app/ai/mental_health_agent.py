"""
Mental Health Support Agent.
Provides CBT-inspired responses, coping strategies, and crisis detection.
"""
from app.ai.llm_client import llm_client
from app.ai.sentiment_analyzer import detect_crisis, analyze_sentiment

SYSTEM_PROMPT = """You are MindCare AI, a compassionate and empathetic mental health support assistant.

IMPORTANT DISCLAIMERS (always keep in mind):
- You are NOT a licensed therapist or medical professional
- You do NOT provide diagnoses or prescribe treatments
- For emergencies, always direct users to call 988 (Suicide & Crisis Lifeline) or 911

Your role:
- Provide emotional support, active listening, and validation
- Offer evidence-based coping strategies (CBT techniques, mindfulness, grounding)
- Suggest breathing exercises, journaling prompts, and relaxation techniques
- Help users identify thought patterns and reframe negative thinking
- Encourage professional help when appropriate

Communication style:
- Warm, non-judgmental, and empathetic
- Use "I" statements and reflective listening
- Ask open-ended questions to encourage expression
- Validate feelings before offering suggestions
- Keep responses concise (3-5 sentences) unless more detail is needed

CBT Techniques to use when appropriate:
- Thought challenging: "What evidence supports/contradicts this thought?"
- Behavioral activation: Suggest small, achievable activities
- Grounding (5-4-3-2-1): Name 5 things you see, 4 you hear, etc.
- Box breathing: Inhale 4s, hold 4s, exhale 4s, hold 4s
- Journaling prompts for self-reflection

Always end with a supportive closing or a gentle question."""

CRISIS_RESPONSE = """I'm really concerned about what you've shared, and I want you to know you're not alone.

🆘 **Please reach out for immediate support:**
- **988 Suicide & Crisis Lifeline**: Call or text **988** (US)
- **Crisis Text Line**: Text HOME to **741741**
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/
- **Emergency Services**: Call **911** (or your local emergency number)

You matter, and there are people who want to help you right now. Please reach out to one of these resources immediately.

I'm here to listen, but these trained crisis counselors can provide the immediate support you deserve. 💙"""


async def get_mental_health_response(
    user_message: str,
    conversation_history: list[dict],
    user_name: str = "there",
) -> dict:
    """
    Generate a mental health support response.
    Returns dict with response text, crisis flag, and sentiment data.
    """
    # Crisis detection (always check first)
    is_crisis, is_distress = detect_crisis(user_message)
    sentiment_score, sentiment_label = analyze_sentiment(user_message)

    if is_crisis:
        return {
            "response": CRISIS_RESPONSE,
            "crisis_detected": True,
            "is_distress": True,
            "sentiment_score": sentiment_score,
            "sentiment_label": "negative",
            "message_type": "crisis_alert",
        }

    # Build conversation context
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add recent history (last 10 messages for context)
    for msg in conversation_history[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    # Add current message
    messages.append({"role": "user", "content": user_message})

    # Add distress context if detected
    if is_distress:
        messages[-1]["content"] += (
            "\n[System note: User appears to be in emotional distress. "
            "Be extra empathetic and gently suggest professional support.]"
        )

    response_text = await llm_client.chat(messages, temperature=0.75, max_tokens=512)

    return {
        "response": response_text,
        "crisis_detected": False,
        "is_distress": is_distress,
        "sentiment_score": sentiment_score,
        "sentiment_label": sentiment_label,
        "message_type": "text",
    }


async def get_daily_checkin_response(mood_score: int, emotions: list[str], journal_text: str) -> str:
    """Generate a personalized response to a daily mood check-in."""
    prompt = f"""The user completed their daily mood check-in:
- Mood score: {mood_score}/10
- Emotions: {', '.join(emotions) if emotions else 'not specified'}
- Journal entry: {journal_text or 'none'}

Provide a warm, personalized response (3-4 sentences) that:
1. Acknowledges their current emotional state
2. Validates their feelings
3. Offers one specific, actionable coping tip based on their mood
4. Ends with encouragement"""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]
    return await llm_client.chat(messages, temperature=0.8, max_tokens=256)
