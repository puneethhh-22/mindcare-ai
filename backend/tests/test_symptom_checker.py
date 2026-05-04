"""
Tests for symptom checker utilities (no LLM calls).
"""
import pytest
from app.ai.symptom_checker import detect_emergency_symptoms


def test_emergency_chest_pain():
    assert detect_emergency_symptoms("I have severe chest pain") is True


def test_emergency_breathing():
    assert detect_emergency_symptoms("I can't breathe properly") is True


def test_emergency_stroke():
    assert detect_emergency_symptoms("I think I'm having a stroke") is True


def test_non_emergency():
    assert detect_emergency_symptoms("I have a mild headache") is False
    assert detect_emergency_symptoms("My throat is a bit sore") is False


def test_emergency_overdose():
    assert detect_emergency_symptoms("I think I took an overdose") is True
