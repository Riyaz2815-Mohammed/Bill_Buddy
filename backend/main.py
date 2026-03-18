from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, bills, ocr, friends, transactions
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Bill Buddy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173"), "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(bills.router, prefix="/bills", tags=["bills"])
app.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
app.include_router(friends.router, prefix="/friends", tags=["friends"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
