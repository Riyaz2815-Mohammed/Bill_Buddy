import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
url = os.getenv("DATA_BASE_URL", "").replace("postgres://", "postgresql://")
if not url:
    print("No database URL found.")
    exit(1)

engine = create_engine(url)

try:
    with engine.begin() as conn:
        print("Adding avatar_base64 text column to users table...")
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_base64 TEXT;"))
        print("Successfully added avatar_base64 to Neon DB!")
except Exception as e:
    print(f"Error executing migration: {e}")
