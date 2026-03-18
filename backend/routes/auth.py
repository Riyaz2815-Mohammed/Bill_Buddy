from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase

router = APIRouter()

class PhoneRequest(BaseModel):
    phone: str

class VerifyRequest(BaseModel):
    phone: str
    token: str
    name: str
    username: str

@router.post("/send-otp")
async def send_otp(data: PhoneRequest):
    try:
        res = supabase.auth.sign_in_with_otp({"phone": data.phone})
        return {"message": "OTP sent"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-otp")
async def verify_otp(data: VerifyRequest):
    try:
        res = supabase.auth.verify_otp({
            "phone": data.phone,
            "token": data.token,
            "type": "sms"
        })
        user_id = res.user.id
        # Upsert user profile
        supabase.table("users").upsert({
            "id": user_id,
            "phone": data.phone,
            "name": data.name,
            "username": data.username,
            "avatar_seed": data.name.split()[0].lower(),
        }).execute()
        return {"user_id": user_id, "access_token": res.session.access_token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    res = supabase.table("users").select("*").eq("id", user_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return res.data
