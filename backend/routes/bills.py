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

    per_person = 0.0
    
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
            "amount_owed": float(m.amount_owed) if m.amount_owed is not None else 0.0,
            "paid": m.paid,
            "selected_items": [str(x) for x in m.selected_items] if m.selected_items else [],
            "user": {"name": user.name if user else "Unknown", "avatar_seed": user.avatar_seed if user else "default"}
        })

    return {
        "bill": {
            "id": str(bill.id),
            "title": bill.title,
            "total": float(bill.total) if bill.total is not None else 0.0,
            "status": bill.status,
            "type": bill.type,
            "created_by": str(bill.created_by)
        },
        "items": [{"id": str(i.id), "name": i.name, "price": float(i.price) if i.price is not None else 0.0, "quantity": i.quantity if i.quantity is not None else 1} for i in items],
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
    
    result = []
    for b in bills:
        # Get creator name
        creator = db.query(User).filter(User.id == b.created_by).first()
        creator_name = creator.name if creator else "Unknown"
        
        # Get amount owed for this specific user dynamically via item claims
        amount_owed = 0.0
        member = db.query(BillMember).filter(BillMember.bill_id == b.id, BillMember.user_id == user_uuid).first()
        if member and member.selected_items:
            for item_id in member.selected_items:
                item = db.query(BillItem).filter(BillItem.id == item_id).first()
                if item and item.price is not None:
                    amount_owed += float(item.price)
        
        # Priority fallback: if this is a legacy bill where amount_owed was centrally written
        if amount_owed == 0.0 and member and member.amount_owed is not None:
            amount_owed = float(member.amount_owed)

        # Personal status (did THIS user pay, or is the global bill settled?)
        personal_status = "paid" if (b.status == "paid" or (member and member.paid)) else "unpaid"
        
        result.append({
            "id": str(b.id), 
            "title": b.title, 
            "total": float(b.total) if b.total is not None else 0.0, 
            "status": personal_status, 
            "amount_owed": float(amount_owed) if amount_owed is not None else 0.0,
            "type": b.type, 
            "created_by": creator_name
        })
        
    return {"bills": result}

@router.patch("/{bill_id}/pay/{user_id}")
async def mark_paid(bill_id: str, user_id: str, db: Session = Depends(get_db)):
    member = db.query(BillMember).filter(BillMember.bill_id == bill_id, BillMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found on this bill")
    
    member.paid = True
    db.commit()
    return {"message": "Marked as paid"}

@router.delete("/{bill_id}")
async def delete_bill(bill_id: str, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    db.delete(bill)
    db.commit()
    return {"message": "Bill successfully deleted"}

@router.patch("/{bill_id}/status")
async def update_bill_status(bill_id: str, status: str, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    bill.status = status
    db.commit()
    return {"message": f"Bill status updated to {status}"}
