-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_seed VARCHAR(100) DEFAULT 'default',
  avatar_base64 TEXT,
  birthday DATE,
  kyc_verified BOOLEAN DEFAULT false,
  upi_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Friends table (many-to-many)
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  qr_code_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bill items
CREATE TABLE IF NOT EXISTS bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1
);

-- Bill members (who is splitting this bill)
CREATE TABLE IF NOT EXISTS bill_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  amount_owed DECIMAL(10,2) DEFAULT 0,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP,
  selected_items UUID[] DEFAULT '{}'
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  from_user UUID REFERENCES users(id),
  to_user UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('paid', 'received')),
  created_at TIMESTAMP DEFAULT NOW()
);
