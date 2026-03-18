from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase

router = APIRouter()

class AddFriendRequest(BaseModel):
    user_id: str
    friend_id: str

@router.post("/add")
async def add_friend(data: AddFriendRequest):
    if data.user_id == data.friend_id:
        raise HTTPException(status_code=400, detail="Cannot add yourself")
    supabase.table("friends").upsert({
        "user_id": data.user_id,
        "friend_id": data.friend_id
    }).execute()
    supabase.table("friends").upsert({
        "user_id": data.friend_id,
        "friend_id": data.user_id
    }).execute()
    return {"message": "Friend added"}

@router.get("/{user_id}")
async def get_friends(user_id: str):
    res = supabase.table("friends").select("*, users!friends_friend_id_fkey(*)").eq("user_id", user_id).execute()
    return {"friends": res.data}

@router.get("/search/{query}")
async def search_users(query: str):
    res = supabase.table("users").select("id, name, username, avatar_seed").ilike("username", f"%{query}%").limit(10).execute()
    return {"users": res.data}
