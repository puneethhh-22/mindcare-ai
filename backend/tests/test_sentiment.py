"""
Tests for sentiment analysis and crisis detection (no DB/LLM needed).
"""
import pytest
from app.ai.sentiment_analyzer import analyze_sentiment, detect_crisis, get_mood_from_score


def test_positive_sentiment():
    score, label = analyze_sentiment("I feel amazing and so happy today!")
    assert label == "positive"
    assert score > 0


def test_negative_sentiment():
    score, label = analyze_sentiment("I feel terrible and hopeless about everything.")
    assert label == "negative"
    assert score < 0


def test_neutral_sentiment():
    score, label = analyze_sentiment("I went to the store today.")
    assert label == "neutral"


def test_crisis_detection_positive():
    is_crisis, is_distress = detect_crisis("I want to kill myself")
    assert is_crisis is True


def test_crisis_detection_negative():
    is_crisis, is_distress = detect_crisis("I had a great day at work!")
    assert is_crisis is False
    assert is_distress is False


def test_distress_detection():
    is_crisis, is_distress = detect_crisis("I feel so depressed and overwhelmed")
    assert is_distress is True


def test_mood_from_score():
    assert get_mood_from_score(0.8) == "great"
    assert get_mood_from_score(0.2) == "good"
    assert get_mood_from_score(0.0) == "okay"
    assert get_mood_from_score(-0.3) == "low"
    assert get_mood_from_score(-0.8) == "terrible"
