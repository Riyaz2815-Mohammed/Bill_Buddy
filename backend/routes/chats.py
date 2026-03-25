from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Message, User
from sqlalchemy import or_, and_
import uuid

router = APIRouter()

class SendMessageRequest(BaseModel):
    sender_id: str
    receiver_id: str
    content: str

@router.get("/{user1_id}/{user2_id}")
async def get_messages(user1_id: str, user2_id: str, db: Session = Depends(get_db)):
    u1, u2 = uuid.UUID(user1_id), uuid.UUID(user2_id)
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == u1, Message.receiver_id == u2),
            and_(Message.sender_id == u2, Message.receiver_id == u1)
        )
    ).order_by(Message.created_at.asc()).all()
    
    return {"messages": [{
        "id": str(m.id),
        "sender_id": str(m.sender_id),
        "content": m.content,
        "created_at": m.created_at.isoformat()
    } for m in messages]}

@router.post("/send")
async def send_message(data: SendMessageRequest, db: Session = Depends(get_db)):
    msg = Message(
        sender_id=uuid.UUID(data.sender_id),
        receiver_id=uuid.UUID(data.receiver_id),
        content=data.content
    )
    db.add(msg)
    db.commit()
    return {"status": "ok"}
