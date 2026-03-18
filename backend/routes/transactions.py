from fastapi import APIRouter
from database import supabase
from pydantic import BaseModel

router = APIRouter()

class CreateTransactionRequest(BaseModel):
    bill_id: str
    from_user: str
    to_user: str
    amount: float
    type: str  # 'paid' or 'received'

@router.post("/create")
async def create_transaction(data: CreateTransactionRequest):
    res = supabase.table("transactions").insert({
        "bill_id": data.bill_id,
        "from_user": data.from_user,
        "to_user": data.to_user,
        "amount": data.amount,
        "type": data.type,
    }).execute()
    return {"transaction": res.data}

@router.get("/user/{user_id}")
async def get_user_transactions(user_id: str):
    res = supabase.table("transactions").select(
        "*, from_user_data:users!transactions_from_user_fkey(name), to_user_data:users!transactions_to_user_fkey(name)"
    ).or_(f"from_user.eq.{user_id},to_user.eq.{user_id}").order("created_at", desc=True).execute()
    return {"transactions": res.data}
