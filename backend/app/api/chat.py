"""
Chat API endpoints – mental health support and general wellness chat.
"""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field

from app.core.dependencies import get_current_user
from app.models.user import UserDocument
from app.models.chat import ChatSessionDocument, ChatMessageDocument
from app.ai.mental_health_agent import get_mental_health_response, get_daily_checkin_response
from app.ai.sentiment_analyzer import analyze_sentiment

router = APIRouter(prefix="/chat", tags=["Chat"])


# ── Schemas ───────────────────────────────────────────────────────────────────
class SendMessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: Optional[str] = None
    session_type: str = "mental_health"  # mental_health | general


class MessageResponse(BaseModel):
    session_id: str
    message_id: str
    response: str
    crisis_detected: bool
    sentiment_score: float
    sentiment_label: str
    message_type: str
    timestamp: datetime


class ChatHistoryItem(BaseModel):
    id: str
    role: str
    content: str
    sentiment_score: Optional[float]
    crisis_detected: bool
    created_at: datetime


class SessionListItem(BaseModel):
    id: str
    title: str
    session_type: str
    message_count: int
    updated_at: datetime


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("/message", response_model=MessageResponse)
async def send_message(
    data: SendMessageRequest,
    current_user: UserDocument = Depends(get_current_user),
):
    """Send a message to the AI chatbot and receive a response."""
    user_id = str(current_user.id)

    # Get or create session
    session = None
    if data.session_id:
        session = await ChatSessionDocument.get(data.session_id)
        if not session or session.user_id != user_id:
            raise HTTPException(status_code=404, detail="Session not found")
    
    if not session:
        session = ChatSessionDocument(
            user_id=user_id,
            session_type=data.session_type,
            title=data.message[:50] + "..." if len(data.message) > 50 else data.message,
        )
        await session.insert()

    # Fetch recent conversation history
    history_docs = await ChatMessageDocument.find(
        ChatMessageDocument.session_id == str(session.id)
    ).sort(-ChatMessageDocument.created_at).limit(20).to_list()

    history = [
        {"role": doc.role, "content": doc.content}
        for doc in reversed(history_docs)
    ]

    # Save user message
    user_msg = ChatMessageDocument(
        session_id=str(session.id),
        user_id=user_id,
        role="user",
        content=data.message,
    )
    await user_msg.insert()

    # Get AI response
    ai_result = await get_mental_health_response(
        user_message=data.message,
        conversation_history=history,
        user_name=current_user.full_name or current_user.username,
    )

    # Save assistant message
    assistant_msg = ChatMessageDocument(
        session_id=str(session.id),
        user_id=user_id,
        role="assistant",
        content=ai_result["response"],
        sentiment_score=ai_result["sentiment_score"],
        sentiment_label=ai_result["sentiment_label"],
        crisis_detected=ai_result["crisis_detected"],
        message_type=ai_result["message_type"],
    )
    await assistant_msg.insert()

    # Update session
    session.message_count += 2
    session.updated_at = datetime.now(timezone.utc)
    await session.save()

    return MessageResponse(
        session_id=str(session.id),
        message_id=str(assistant_msg.id),
        response=ai_result["response"],
        crisis_detected=ai_result["crisis_detected"],
        sentiment_score=ai_result["sentiment_score"],
        sentiment_label=ai_result["sentiment_label"],
        message_type=ai_result["message_type"],
        timestamp=assistant_msg.created_at,
    )


@router.get("/sessions", response_model=list[SessionListItem])
async def list_sessions(
    current_user: UserDocument = Depends(get_current_user),
    limit: int = Query(default=20, le=50),
):
    """List all chat sessions for the current user."""
    user_id = str(current_user.id)
    sessions = await ChatSessionDocument.find(
        ChatSessionDocument.user_id == user_id,
        ChatSessionDocument.is_active == True,
    ).sort(-ChatSessionDocument.updated_at).limit(limit).to_list()

    return [
        SessionListItem(
            id=str(s.id),
            title=s.title,
            session_type=s.session_type,
            message_count=s.message_count,
            updated_at=s.updated_at,
        )
        for s in sessions
    ]


@router.get("/sessions/{session_id}/history", response_model=list[ChatHistoryItem])
async def get_chat_history(
    session_id: str,
    current_user: UserDocument = Depends(get_current_user),
    limit: int = Query(default=50, le=100),
):
    """Get message history for a specific chat session."""
    user_id = str(current_user.id)
    session = await ChatSessionDocument.get(session_id)
    if not session or session.user_id != user_id:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await ChatMessageDocument.find(
        ChatMessageDocument.session_id == session_id
    ).sort(ChatMessageDocument.created_at).limit(limit).to_list()

    return [
        ChatHistoryItem(
            id=str(m.id),
            role=m.role,
            content=m.content,
            sentiment_score=m.sentiment_score,
            crisis_detected=m.crisis_detected,
            created_at=m.created_at,
        )
        for m in messages
    ]


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: UserDocument = Depends(get_current_user),
):
    """Soft-delete a chat session."""
    user_id = str(current_user.id)
    session = await ChatSessionDocument.get(session_id)
    if not session or session.user_id != user_id:
        raise HTTPException(status_code=404, detail="Session not found")

    session.is_active = False
    await session.save()
    return {"message": "Session deleted"}
