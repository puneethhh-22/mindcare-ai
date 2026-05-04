"""
Sentiment analysis for mental health detection.
Uses VADER (rule-based, fast) with optional HuggingFace transformer upgrade.
"""
import logging
from typing import Tuple
from functools import lru_cache

logger = logging.getLogger(__name__)


# ── Crisis / Self-harm keyword detection ─────────────────────────────────────
CRISIS_KEYWORDS = {
    "suicide", "suicidal", "kill myself", "end my life", "want to die",
    "self harm", "self-harm", "cutting myself", "hurt myself", "no reason to live",
    "can't go on", "cannot go on", "give up on life", "overdose", "jump off",
    "hang myself", "worthless", "hopeless", "nobody cares", "better off dead",
}

DISTRESS_KEYWORDS = {
    "depressed", "depression", "anxiety", "panic attack", "breakdown",
    "can't cope", "overwhelmed", "exhausted", "burnout", "hopeless",
    "lonely", "isolated", "crying", "numb", "empty", "lost",
}


def detect_crisis(text: str) -> Tuple[bool, bool]:
    """
    Returns (is_crisis, is_distress) based on keyword matching.
    is_crisis: immediate danger keywords detected
    is_distress: significant emotional distress detected
    """
    text_lower = text.lower()
    is_crisis = any(kw in text_lower for kw in CRISIS_KEYWORDS)
    is_distress = any(kw in text_lower for kw in DISTRESS_KEYWORDS)
    return is_crisis, is_distress


@lru_cache(maxsize=1)
def _load_vader():
    """Load VADER sentiment analyzer (cached)."""
    try:
        from nltk.sentiment.vader import SentimentIntensityAnalyzer
        import nltk
        try:
            nltk.data.find("sentiment/vader_lexicon.zip")
        except LookupError:
            nltk.download("vader_lexicon", quiet=True)
        return SentimentIntensityAnalyzer()
    except Exception as e:
        logger.warning("VADER not available: %s", e)
        return None


def analyze_sentiment(text: str) -> Tuple[float, str]:
    """
    Analyze sentiment of text.
    Returns (score, label) where score is -1.0 to 1.0.
    Labels: positive | neutral | negative
    """
    sia = _load_vader()
    if sia is None:
        return 0.0, "neutral"

    scores = sia.polarity_scores(text)
    compound = scores["compound"]

    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"

    return round(compound, 4), label


def get_mood_from_score(score: float) -> str:
    """Map sentiment score to mood label."""
    if score >= 0.5:
        return "great"
    elif score >= 0.1:
        return "good"
    elif score >= -0.1:
        return "okay"
    elif score >= -0.5:
        return "low"
    else:
        return "terrible"
