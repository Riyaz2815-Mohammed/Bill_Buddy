from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User
import jwt
import os
import datetime

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-12345")
ALGORITHM = "HS256"

class PhoneRequest(BaseModel):
    phone: str

class VerifyRequest(BaseModel):
    phone: str
    token: str # Simple mock OTP for now
    name: str
    username: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

@router.post("/send-otp")
async def send_otp(data: PhoneRequest):
    # In a real app, integrate Twilio/MessageBird here
    return {"message": "OTP sent", "mock_otp": "123456"}

@router.post("/verify-otp")
async def verify_otp(data: VerifyRequest, db: Session = Depends(get_db)):
    if data.token != "123456" and data.token != "000000":
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Upsert user profile
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        user = User(
            phone=data.phone,
            name=data.name,
            username=data.username,
            avatar_seed=data.name.split()[0].lower()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update existing
        user.name = data.name
        user.username = data.username
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id), "phone": user.phone})
    return {"user_id": str(user.id), "access_token": token}

@router.get("/profile/{user_id}")
async def get_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user.id),
        "phone": user.phone,
        "name": user.name,
        "username": user.username,
        "avatar_seed": user.avatar_seed,
        "birthday": user.birthday,
        "kyc_verified": user.kyc_verified,
        "upi_ids": user.upi_ids
    }
