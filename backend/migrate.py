"""
DB Migration Script - Run this once to sync the production DB with the current models.
Adds any missing columns that were added after the initial schema.sql was run.
"""
from database import engine
from sqlalchemy import text

migrations = [
    # Add 'type' column to bills (was missing from original schema.sql)
    "ALTER TABLE bills ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'manual'",
    # Ensure quantity exists on bill_items (was added later)
    "ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1",
    # Ensure selected_items exists on bill_members
    "ALTER TABLE bill_members ADD COLUMN IF NOT EXISTS selected_items UUID[] DEFAULT '{}'",
    # Ensure messages table exists (for chat)
    """CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        receiver_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        content VARCHAR(1000) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    )""",
]

print("Running migrations...")
with engine.connect() as conn:
    for sql in migrations:
        try:
            conn.execute(text(sql))
            conn.commit()
            print(f"OK: {sql[:60]}...")
        except Exception as e:
            print(f"SKIP/ERROR: {e}")

    # Print current columns for verification
    for table in ['bills', 'bill_items', 'bill_members']:
        result = conn.execute(text(
            f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='{table}' ORDER BY ordinal_position"
        ))
        cols = [(r[0], r[1]) for r in result]
        print(f"\n{table}: {cols}")

print("\nMigration complete!")
