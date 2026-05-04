"""
Symptom Checker API endpoints.
"""
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.dependencies import get_current_user
from app.models.user import UserDocument
from app.ai.symptom_checker import analyze_symptoms, answer_medical_faq

router = APIRouter(prefix="/symptoms", tags=["Symptom Checker"])


class SymptomAnalysisRequest(BaseModel):
    symptoms: str = Field(min_length=5, max_length=1000)
    duration: Optional[str] = None          # "2 days", "1 week"
    additional_context: Optional[str] = None
    use_profile_data: bool = True           # Use age/gender from health profile


class FAQRequest(BaseModel):
    question: str = Field(min_length=5, max_length=500)


@router.post("/analyze")
async def analyze_user_symptoms(
    data: SymptomAnalysisRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """
    Analyze user-reported symptoms and provide urgency recommendations.
    
    ⚠️ NOT a medical diagnosis. Always consult a healthcare professional.
    """
    age = None
    gender = None

    if data.use_profile_data and current_user.health_profile:
        age = current_user.health_profile.age
        gender = current_user.health_profile.gender

    result = await analyze_symptoms(
        symptoms=data.symptoms,
        patient_age=age,
        patient_gender=gender,
        duration=data.duration,
        additional_context=data.additional_context,
    )
    return result


@router.post("/faq")
async def medical_faq(
    data: FAQRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Answer common medical FAQs with appropriate disclaimers."""
    answer = await answer_medical_faq(data.question)
    return {
        "question": data.question,
        "answer": answer,
        "disclaimer": (
            "⚠️ This information is for educational purposes only and does not "
            "constitute medical advice. Consult a qualified healthcare professional "
            "for personal medical concerns."
        ),
    }
