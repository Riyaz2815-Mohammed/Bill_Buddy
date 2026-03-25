from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Bill, BillItem, BillMember, User
from typing import List
import uuid

router = APIRouter()

class ItemSchema(BaseModel):
    name: str
    price: float
    quantity: int = 1

class CreateBillRequest(BaseModel):
    title: str
    items: List[ItemSchema]
    member_ids: List[str]
    created_by: str
    type: str = "manual"

class SelectItemsRequest(BaseModel):
    item_ids: List[str]

@router.post("/create")
async def create_bill(data: CreateBillRequest, db: Session = Depends(get_db)):
    bill_id = uuid.uuid4()
    total = sum(item.price * item.quantity for item in data.items)

    bill = Bill(
        id=bill_id,
        title=data.title,
        total=total,
        created_by=uuid.UUID(data.created_by),
        status="active",
        type=data.type
    )
    db.add(bill)

    for item in data.items:
        db.add(BillItem(
            bill_id=bill_id,
            name=item.name,
            price=item.price,
            quantity=item.quantity
        ))

    per_person = total / (len(data.member_ids) + 1)
    
    # Add creator
    db.add(BillMember(
        bill_id=bill_id,
        user_id=uuid.UUID(data.created_by),
        amount_owed=per_person
    ))

    # Add other members
    for member_id in data.member_ids:
        if member_id != data.created_by:
            db.add(BillMember(
                bill_id=bill_id,
                user_id=uuid.UUID(member_id),
                amount_owed=per_person
            ))

    db.commit()
    return {"bill_id": str(bill_id), "total": float(total)}

@router.get("/{bill_id}")
async def get_bill(bill_id: str, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
        
    items = db.query(BillItem).filter(BillItem.bill_id == bill_id).all()
    members = db.query(BillMember).filter(BillMember.bill_id == bill_id).all()
    
    member_data = []
    for m in members:
        user = db.query(User).filter(User.id == m.user_id).first()
        member_data.append({
            "id": str(m.id),
            "user_id": str(m.user_id),
            "amount_owed": float(m.amount_owed),
            "paid": m.paid,
            "selected_items": [str(x) for x in m.selected_items] if m.selected_items else [],
            "user": {"name": user.name if user else "Unknown", "avatar_seed": user.avatar_seed if user else "default"}
        })

    return {
        "bill": {
            "id": str(bill.id),
            "title": bill.title,
            "total": float(bill.total),
            "status": bill.status,
            "type": bill.type,
            "created_by": str(bill.created_by)
        },
        "items": [{"id": str(i.id), "name": i.name, "price": float(i.price), "quantity": i.quantity} for i in items],
        "members": member_data
    }

@router.patch("/{bill_id}/select_items/{user_id}")
async def select_items(bill_id: str, user_id: str, data: SelectItemsRequest, db: Session = Depends(get_db)):
    member = db.query(BillMember).filter(BillMember.bill_id == bill_id, BillMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found on this bill")
    
    member.selected_items = [uuid.UUID(i) for i in data.item_ids]
    db.commit()
    return {"message": "Items selected successfully"}

@router.get("/user/{user_id}")
async def get_user_bills(user_id: str, db: Session = Depends(get_db)):
    user_uuid = uuid.UUID(user_id)
    bills = db.query(Bill).filter(
        (Bill.created_by == user_uuid) | 
        (Bill.id.in_(db.query(BillMember.bill_id).filter(BillMember.user_id == user_uuid)))
    ).order_by(Bill.created_at.desc()).all()
    
    return {"bills": [{
        "id": str(b.id), "title": b.title, "total": float(b.total), "status": b.status, "type": b.type, "created_by": str(b.created_by)
    } for b in bills]}

@router.patch("/{bill_id}/pay/{user_id}")
async def mark_paid(bill_id: str, user_id: str, db: Session = Depends(get_db)):
    member = db.query(BillMember).filter(BillMember.bill_id == bill_id, BillMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found on this bill")
    
    member.paid = True
    db.commit()
    return {"message": "Marked as paid"}
