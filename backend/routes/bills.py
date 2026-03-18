from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase
from typing import List, Optional
import uuid

router = APIRouter()

class BillItem(BaseModel):
    name: str
    price: float
    quantity: int = 1

class CreateBillRequest(BaseModel):
    title: str
    items: List[BillItem]
    member_ids: List[str]
    created_by: str

@router.post("/create")
async def create_bill(data: CreateBillRequest):
    bill_id = str(uuid.uuid4())
    total = sum(item.price * item.quantity for item in data.items)

    supabase.table("bills").insert({
        "id": bill_id,
        "title": data.title,
        "total": total,
        "created_by": data.created_by,
        "status": "active"
    }).execute()

    for item in data.items:
        supabase.table("bill_items").insert({
            "bill_id": bill_id,
            "name": item.name,
            "price": item.price,
            "quantity": item.quantity
        }).execute()

    per_person = total / (len(data.member_ids) + 1)
    for member_id in data.member_ids:
        supabase.table("bill_members").insert({
            "bill_id": bill_id,
            "user_id": member_id,
            "amount_owed": per_person
        }).execute()

    return {"bill_id": bill_id, "total": total}

@router.get("/{bill_id}")
async def get_bill(bill_id: str):
    bill = supabase.table("bills").select("*").eq("id", bill_id).single().execute()
    items = supabase.table("bill_items").select("*").eq("bill_id", bill_id).execute()
    members = supabase.table("bill_members").select("*, users(name, avatar_seed)").eq("bill_id", bill_id).execute()
    return {"bill": bill.data, "items": items.data, "members": members.data}

@router.get("/user/{user_id}")
async def get_user_bills(user_id: str):
    bills = supabase.table("bills").select("*").eq("created_by", user_id).order("created_at", desc=True).execute()
    return {"bills": bills.data}

@router.patch("/{bill_id}/pay/{user_id}")
async def mark_paid(bill_id: str, user_id: str):
    supabase.table("bill_members").update({"paid": True}).eq("bill_id", bill_id).eq("user_id", user_id).execute()
    return {"message": "Marked as paid"}
