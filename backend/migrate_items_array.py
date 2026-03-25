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
        print("Adding selected_items array column to bill_members table...")
        conn.execute(text("ALTER TABLE bill_members ADD COLUMN IF NOT EXISTS selected_items UUID[] DEFAULT '{}';"))
        print("Successfully added selected_items to Neon DB!")
except Exception as e:
    print(f"Error executing migration: {e}")
