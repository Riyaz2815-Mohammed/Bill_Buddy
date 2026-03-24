from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from database import get_db
from models import Friend, User
import uuid

router = APIRouter()

class AddFriendRequest(BaseModel):
    user_id: str
    friend_id: str

@router.post("/add")
async def add_friend(data: AddFriendRequest, db: Session = Depends(get_db)):
    if data.user_id == data.friend_id:
        raise HTTPException(status_code=400, detail="Cannot add yourself")
    
    u_id = uuid.UUID(data.user_id)
    f_id = uuid.UUID(data.friend_id)

    # Check if already friends
    existing = db.query(Friend).filter(
        or_(
            (Friend.user_id == u_id) & (Friend.friend_id == f_id),
            (Friend.user_id == f_id) & (Friend.friend_id == u_id)
        )
    ).first()

    if existing:
        return {"message": "Already friends"}

    # Bidirectional friendship
    friendship1 = Friend(user_id=u_id, friend_id=f_id)
    friendship2 = Friend(user_id=f_id, friend_id=u_id)
    
    db.add(friendship1)
    db.add(friendship2)
    db.commit()

    return {"message": "Friend added"}

@router.get("/{user_id}")
async def get_friends(user_id: str, db: Session = Depends(get_db)):
    friends_rows = db.query(Friend).filter(Friend.user_id == user_id).all()
    
    results = []
    for f in friends_rows:
        friend_user = db.query(User).filter(User.id == f.friend_id).first()
        if friend_user:
            results.append({
                "id": str(f.id),
                "friend_id": str(friend_user.id),
                "name": friend_user.name,
                "username": friend_user.username,
                "avatar_seed": friend_user.avatar_seed
            })

    return {"friends": results}

@router.get("/search/{query}")
async def search_users(query: str, db: Session = Depends(get_db)):
    users = db.query(User).filter(User.username.ilike(f"%{query}%")).limit(10).all()
    return {"users": [{
        "id": str(u.id),
        "name": u.name,
        "username": u.username,
        "avatar_seed": u.avatar_seed
    } for u in users]}
