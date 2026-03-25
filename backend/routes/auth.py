from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import User
import bcrypt
import jwt
import os
import datetime

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-12345")
ALGORITHM = "HS256"

class SignupRequest(BaseModel):
    phone: str
    password: str
    name: str
    age: int
    username: str
    avatar_seed: Optional[str] = None
    avatar_base64: Optional[str] = None
    birthday: Optional[str] = None

class UpiUpdateRequest(BaseModel):
    upi_id: str

class AvatarUpdateRequest(BaseModel):
    avatar_base64: str

class LoginRequest(BaseModel):
    identifier: str # phone or username
    password: str

def create_access_token(data: dict):
    to_encode = data.copy()
    # User requested longer expiry (days)
    expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@router.post("/signup")
async def signup(data: SignupRequest, db: Session = Depends(get_db)):
    # Check if phone or username already exists
    existing_user = db.query(User).filter(
        (User.phone == data.phone) | (User.username == data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number or username already registered")
    
    user = User(
        phone=data.phone,
        password_hash=get_password_hash(data.password),
        name=data.name,
        age=data.age,
        username=data.username,
        avatar_seed=data.avatar_seed or data.name.split()[0].lower(),
        avatar_base64=data.avatar_base64,
        birthday=data.birthday,
        kyc_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": str(user.id), "phone": user.phone})
    return {
        "access_token": token,
        "message": "Account created successfully",
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "name": user.name,
            "username": user.username,
            "avatar_seed": user.avatar_seed,
            "avatar_base64": user.avatar_base64,
            "kyc_verified": user.kyc_verified,
            "upi_ids": user.upi_ids
        }
    }

@router.post("/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.phone == data.identifier) | (User.username == data.identifier)
    ).first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": str(user.id), "phone": user.phone})
    return {
        "access_token": token,
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "name": user.name,
            "username": user.username,
            "avatar_seed": user.avatar_seed,
            "avatar_base64": user.avatar_base64,
            "kyc_verified": user.kyc_verified,
            "upi_ids": user.upi_ids
        }
    }

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
        "avatar_base64": user.avatar_base64,
        "birthday": user.birthday,
        "kyc_verified": user.kyc_verified,
        "upi_ids": user.upi_ids
    }

@router.patch("/profile/upi/{user_id}")
async def add_upi_id(user_id: str, data: UpiUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_upis = list(user.upi_ids) if user.upi_ids else []
    if data.upi_id not in current_upis:
        current_upis.append(data.upi_id)
        user.upi_ids = current_upis
        db.commit()
        
    return {"message": "UPI added successfully", "upi_ids": user.upi_ids}

@router.patch("/profile/avatar/{user_id}")
async def update_avatar(user_id: str, data: AvatarUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.avatar_base64 = data.avatar_base64
    db.commit()
    return {"message": "Avatar updated successfully"}
