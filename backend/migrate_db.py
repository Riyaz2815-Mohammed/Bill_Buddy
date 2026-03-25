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
        print("Checking users table schema...")
        # Add password_hash column if it doesn't exist
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT 'migration-placeholder';"))
        
        # We can also add an email column if we ever need it, but for now we'll stick to phone/username.
        print("Successfully applied schema migrations to Neon DB!")
except Exception as e:
    print(f"Error executing migration: {e}")
