from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import ChatRequest, ChatResponse
from app.models.models import ChatMessage
from app.services.ai_assistant import handle_chat_query

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(payload: ChatRequest, db: Session = Depends(get_db)):
    result = handle_chat_query(
        db=db,
        message=payload.message,
        session_id=payload.session_id or "default",
        roadmap_id=payload.roadmap_id,
        user_id=1
    )
    return result

@router.get("/history")
def get_chat_history(session_id: str = "default", db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == 1,
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "is_ai_generated": m.is_ai_generated,
            "provider_note": m.provider_note,
            "created_at": m.created_at.isoformat()
        }
        for m in messages
    ]
