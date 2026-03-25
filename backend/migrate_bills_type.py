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
        print("Adding type column to bills table...")
        # Add age column if it doesn't exist
        conn.execute(text("ALTER TABLE bills ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'manual';"))
        print("Successfully added type column to Neon DB bills table!")
except Exception as e:
    print(f"Error executing migration: {e}")
