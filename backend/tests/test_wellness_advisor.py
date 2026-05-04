"""
Tests for wellness advisor utilities (no LLM calls).
"""
import pytest
from app.ai.wellness_advisor import _get_trend


def test_trend_improving():
    scores = [3, 4, 4, 6, 7, 8]
    assert _get_trend(scores) == "improving"


def test_trend_declining():
    scores = [8, 7, 6, 4, 3, 3]
    assert _get_trend(scores) == "declining"


def test_trend_stable():
    scores = [5, 5, 6, 5, 5, 6]
    assert _get_trend(scores) == "stable"


def test_trend_insufficient_data():
    assert _get_trend([5]) == "stable"
    assert _get_trend([]) == "stable"
