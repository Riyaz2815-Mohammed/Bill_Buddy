from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from models import Transaction, User
from pydantic import BaseModel
import uuid

router = APIRouter()

class CreateTransactionRequest(BaseModel):
    bill_id: str
    from_user: str
    to_user: str
    amount: float
    type: str  # 'paid' or 'received'

@router.post("/create")
async def create_transaction(data: CreateTransactionRequest, db: Session = Depends(get_db)):
    tx = Transaction(
        bill_id=uuid.UUID(data.bill_id) if data.bill_id else None,
        from_user=uuid.UUID(data.from_user),
        to_user=uuid.UUID(data.to_user),
        amount=data.amount,
        type=data.type
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    
    return {"transaction": {"id": str(tx.id), "amount": str(tx.amount)}}

@router.get("/user/{user_id}")
async def get_user_transactions(user_id: str, db: Session = Depends(get_db)):
    txs = db.query(Transaction).filter(
        or_(Transaction.from_user == user_id, Transaction.to_user == user_id)
    ).order_by(Transaction.created_at.desc()).all()
    
    results = []
    for t in txs:
        from_u = db.query(User).filter(User.id == t.from_user).first()
        to_u = db.query(User).filter(User.id == t.to_user).first()
        
        results.append({
            "id": str(t.id),
            "bill_id": str(t.bill_id) if t.bill_id else None,
            "amount": float(t.amount),
            "type": t.type,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "from_user_data": {"name": from_u.name if from_u else "Unknown"},
            "to_user_data": {"name": to_u.name if to_u else "Unknown"}
        })

    return {"transactions": results}
