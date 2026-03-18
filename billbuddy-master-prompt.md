# 🚀 BILL BUDDY — MASTER BUILD PROMPT
> Paste this entire prompt into Claude in Antigravity IDE to build the full app.

---

## 🎯 WHAT YOU ARE BUILDING

Build a full-stack mobile-first web app called **Bill Buddy** — an Indian bill splitting app
that lets users scan/upload a restaurant bill, extract items via OCR, split it with friends,
generate a QR code to share, and collect payments via UPI deep links.

The app must work as:
- A **PWA (Progressive Web App)** — installable from browser on Android
- Deployable on **Vercel** (frontend) + **Railway** (backend)

---

## 🏗️ TECH STACK

### Frontend
- **React** (Vite) with React Router v6
- **React Native Web** feel — mobile-first layout, max-width 430px centered
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Axios** for API calls
- **react-qr-code** for QR generation
- **DiceBear avatars** for profile pictures

### Backend
- **Python FastAPI**
- **Supabase** (PostgreSQL database + Auth)
- **Mistral AI API** for OCR bill scanning
- **python-dotenv** for environment variables
- **Deployed on Railway**

### Services
- **Supabase** — database, auth (phone OTP), file storage
- **Vercel** — frontend hosting + PWA
- **Railway** — FastAPI backend
- **Mistral API** — OCR for bill scanning

---

## 🎨 DESIGN SYSTEM (STRICT — DO NOT DEVIATE)

### Colors
```css
--bg:           #EDEBE5   /* warm cream — used as page background everywhere */
--white:        #FFFFFF
--green:        #2AB876   /* primary brand green */
--green-dark:   #1E9E63
--green-light:  #E0F5EC   /* paid badge background */
--red:          #E53E3E   /* unpaid amount, pending */
--red-light:    #FFE8E8   /* unpaid card background */
--gray-pill:    #E0E0E0   /* input backgrounds, pill tags */
--text-primary: #111111
--text-gray:    #666666
--text-light:   #999999
```

### Typography
- Font: `Inter` (Google Fonts)
- Page title: 22px, font-weight 700
- Section header: 18px, font-weight 700
- Card title: 16px, font-weight 600
- Body text: 14px, font-weight 400
- Small label: 12px, font-weight 400

### Layout
- All screens: background `#EDEBE5`, NO white page backgrounds
- Mobile container: max-width 430px, centered on desktop
- Safe padding: 16px horizontal on all screens
- Bottom navigation height: 64px fixed

### Cards
- Background: white
- Border-radius: 16px
- Box-shadow: `0 2px 12px rgba(0,0,0,0.07)`
- Padding: 16px

### Buttons
- **Primary**: full-width, bg `#2AB876`, white text, border-radius 30px, height 52px, font-weight 700
- **Toggle pill**: pill-shaped container with gray bg, active side is `#2AB876` white text, inactive is transparent dark text
- **Ghost**: transparent, green text, no border

### Badges
- **Unpaid**: bg `#FFE8E8`, text `#E53E3E`, border-radius 20px, padding 4px 12px, font-size 12px
- **Paid**: bg `#E0F5EC`, text `#2AB876`, same shape

### Bottom Navigation
- 5 items: Home, Bills, [Scan FAB], Pay, Profile
- Center "Scan" = large green circle `#2AB876`, size 60px, elevated with shadow, white scan icon
- Active tab: icon + label in `#2AB876`
- Inactive: `#999999`
- Bar bg: white, `box-shadow: 0 -2px 10px rgba(0,0,0,0.06)`

### Avatars
- URL: `https://api.dicebear.com/7.x/adventurer/svg?seed={name}`
- Sizes: 40px (lists), 48px (friends row), 80px (profile)
- Circular, border: 2px solid `#E0E0E0`

---

## 🗄️ DATABASE SCHEMA (Supabase)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_seed VARCHAR(100) DEFAULT 'default',
  birthday DATE,
  kyc_verified BOOLEAN DEFAULT false,
  upi_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Friends table (many-to-many)
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Bills table
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  qr_code_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bill items
CREATE TABLE bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1
);

-- Bill members (who is splitting this bill)
CREATE TABLE bill_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  amount_owed DECIMAL(10,2) DEFAULT 0,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP,
  selected_items UUID[] DEFAULT '{}'
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id),
  from_user UUID REFERENCES users(id),
  to_user UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('paid', 'received')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 BACKEND API (FastAPI on Railway)

### File structure
```
backend/
├── main.py
├── requirements.txt
├── .env
├── routes/
│   ├── auth.py
│   ├── bills.py
│   ├── ocr.py
│   ├── friends.py
│   └── transactions.py
├── models.py
├── database.py
└── utils.py
```

### requirements.txt
```
fastapi
uvicorn
supabase
python-dotenv
httpx
python-multipart
Pillow
mistralai
```

### Environment variables (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
MISTRAL_API_KEY=your_mistral_api_key
FRONTEND_URL=https://your-vercel-url.vercel.app
```

### main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, bills, ocr, friends, transactions
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Bill Buddy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL"), "http://localhost:5173"],
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
def health(): return {"status": "ok"}
```

### OCR Route (routes/ocr.py)
```python
from fastapi import APIRouter, UploadFile, File
from mistralai import Mistral
import os, base64

router = APIRouter()
client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

@router.post("/scan")
async def scan_bill(file: UploadFile = File(...)):
    image_data = await file.read()
    base64_image = base64.b64encode(image_data).decode("utf-8")
    
    response = client.chat.complete(
        model="pixtral-12b-2409",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": f"data:{file.content_type};base64,{base64_image}"
                },
                {
                    "type": "text",
                    "text": """Extract all items and prices from this restaurant bill.
                    Return ONLY a valid JSON array like this:
                    [{"name": "Item Name", "price": 150, "quantity": 1}]
                    No extra text, no markdown, just the JSON array."""
                }
            ]
        }]
    )
    
    import json
    text = response.choices[0].message.content
    items = json.loads(text.strip())
    return {"items": items}
```

### Bills Route (routes/bills.py)
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase
from typing import List, Optional
import uuid

router = APIRouter()

class BillItem(BaseModel):
    name: str
    price: float
    quantity: int = 1

class CreateBillRequest(BaseModel):
    title: str
    items: List[BillItem]
    member_ids: List[str]
    created_by: str

@router.post("/create")
async def create_bill(data: CreateBillRequest):
    bill_id = str(uuid.uuid4())
    total = sum(item.price * item.quantity for item in data.items)
    
    # Create bill
    bill = supabase.table("bills").insert({
        "id": bill_id,
        "title": data.title,
        "total": total,
        "created_by": data.created_by,
        "status": "active"
    }).execute()
    
    # Insert items
    for item in data.items:
        supabase.table("bill_items").insert({
            "bill_id": bill_id,
            "name": item.name,
            "price": item.price,
            "quantity": item.quantity
        }).execute()
    
    # Add members
    per_person = total / (len(data.member_ids) + 1)  # +1 for creator
    for member_id in data.member_ids:
        supabase.table("bill_members").insert({
            "bill_id": bill_id,
            "user_id": member_id,
            "amount_owed": per_person
        }).execute()
    
    return {"bill_id": bill_id, "total": total}

@router.get("/{bill_id}")
async def get_bill(bill_id: str):
    bill = supabase.table("bills").select("*").eq("id", bill_id).single().execute()
    items = supabase.table("bill_items").select("*").eq("bill_id", bill_id).execute()
    members = supabase.table("bill_members").select("*, users(name, avatar_seed)").eq("bill_id", bill_id).execute()
    return {"bill": bill.data, "items": items.data, "members": members.data}

@router.get("/user/{user_id}")
async def get_user_bills(user_id: str):
    bills = supabase.table("bills").select("*").eq("created_by", user_id).order("created_at", desc=True).execute()
    return {"bills": bills.data}
```

---

## 💻 FRONTEND STRUCTURE (React + Vite)

### File structure
```
frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── public/
│   ├── manifest.json       ← PWA manifest
│   └── icons/              ← App icons
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/
│   │   └── client.js       ← Axios instance
│   ├── store/
│   │   └── useStore.js     ← Zustand store
│   ├── components/
│   │   ├── BottomNav.jsx
│   │   ├── Avatar.jsx
│   │   ├── BillCard.jsx
│   │   ├── Badge.jsx
│   │   └── ItemRow.jsx
│   └── pages/
│       ├── Home.jsx
│       ├── Bills.jsx
│       ├── GenerateBill.jsx
│       ├── Pay.jsx
│       ├── Profile.jsx
│       ├── Chats.jsx
│       └── Transactions.jsx
```

### PWA manifest (public/manifest.json)
```json
{
  "name": "Bill Buddy",
  "short_name": "BillBuddy",
  "description": "Split bills with friends easily",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#EDEBE5",
  "theme_color": "#2AB876",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Zustand store (src/store/useStore.js)
```javascript
import { create } from 'zustand'

const useStore = create((set) => ({
  user: null,
  friends: [],
  bills: [],
  transactions: [],
  
  setUser: (user) => set({ user }),
  setFriends: (friends) => set({ friends }),
  setBills: (bills) => set({ bills }),
  setTransactions: (transactions) => set({ transactions }),
}))

export default useStore
```

### Axios client (src/api/client.js)
```javascript
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
})

export default client
```

---

## 📱 ALL SCREENS — FULL DETAIL

### SCREEN 1: HOME (pages/Home.jsx)

**Top bar:**
- Left: circular DiceBear avatar (user's seed), 40px
- Center: search bar with 🔍 icon, placeholder "Search friends...", bg `#E0E0E0`, border-radius 20px, height 38px
- Right: chat bubble icon with red badge showing unread count "3"

**Hero card (white card, 16px radius):**
- Left column: "Good evening" (gray, 13px), user's name bold 24px + 👋 emoji, "Tap to scan a bill" (gray, 13px)
- Right: soft gray square button (bg `#F0F0F0`, 56px, border-radius 14px) with green camera icon
- On click → navigate to `/generate`

**"New Bills" section:**
- "New Bills" bold left + "View all →" green right (links to /bills)
- Horizontal scroll cards (no scrollbar visible):
  - Card bg: `#FFE8E8`, border-radius 16px, padding 16px, min-width 160px
  - "Unpaid" red badge top-left
  - Bill name bold
  - ₹amount large bold black
  - "by Name" gray small

**"Quick Actions" section:**
- 5 items in a row, each: icon (outlined, 28px, green) + label below (12px)
- Scan → `/generate?tab=scan`
- Generate → `/generate?tab=manual`
- Bills → `/bills`
- Transactions → `/transactions`
- Chat → `/chats`

**"Friends" section:**
- Horizontal scroll of avatar circles (48px) + name below (12px)
- Green dot on avatar bottom-right if online

---

### SCREEN 2: BILLS (pages/Bills.jsx)

**Header:** ← back arrow + "Your Bills" bold

**Filter tabs:**
- "All" | "Unpaid" | "Paid"
- Active = green filled pill (bg `#2AB876`, white text)
- Inactive = just text, gray

**Bill list:**

UNPAID card:
- bg: `#FFE8E8`, border-radius 16px, padding 16px
- Top row: bill name bold left, "Unpaid" red badge right
- "Total: ₹XXXX" gray
- "₹XXX pending" red bold large
- "by Name" gray small bottom-right

PAID card:
- bg: white, same shape
- No pending text
- "Paid" green badge top-right
- "by Name" gray bottom-right
- Total gray

---

### SCREEN 3: GENERATE BILL (pages/GenerateBill.jsx)

**Header:** ← back arrow + "Generate Bill"

**Tab switcher (pill toggle):**
- Container: bg `#E8E8E8`, border-radius 30px, padding 4px
- Active tab fills with `#2AB876`, white text, border-radius 26px
- Inactive: transparent, dark text

**MANUAL TAB:**

Items section:
- "Items" bold header
- Each item row:
  - Text input left (placeholder "Item name"), border-bottom only style
  - Gray pill right (bg `#E0E0E0`, border-radius 12px) with price number
  - Red trash icon 🗑️ far right
- "+ Add item" green text button below

Split with section:
- "Split with" bold header
- Horizontal scroll of friend avatars (48px circles)
- SELECTED: full color avatar + green border ring
- UNSELECTED: faded/low opacity (opacity 0.4)

Total row:
- "Total" gray left, "₹XXXX" green bold large right
- Divider line above

"Generate Bill" primary green button full-width
- On click: POST to /bills/create → show QR code below

QR code section (shown after bill created):
- White card, centered
- QR code component (react-qr-code)
- QR encodes: `{VITE_APP_URL}/bill/{billId}`
- "Share this QR with friends" gray caption below
- "🔗 Share Link" pill button (gray bg, dark text) — uses Web Share API

**SCAN TAB:**

Empty state:
- Large gray dashed-border square (250px × 250px, border-radius 16px)
- Camera icon centered inside (gray, 48px)
- "Point camera at the bill" gray caption
- "Open Camera" green rounded button
- On click: open file picker (accept="image/*", capture="camera")

After image selected → call POST /ocr/scan → show results:
- "Scanned Items" bold header
- Each item: name left + gray pill price right (editable) + 🗑️
- "+ Add item" green link
- Same "Split with" avatars
- "Total ₹XXXX" green
- "Generate Bill" button
- QR section (same as manual)

---

### SCREEN 4: CHATS (pages/Chats.jsx)

**Header:** ← + "Chats"

**Contact list:**
- Each row: 48px avatar left + name bold + "Tap to chat" gray subtitle + "online" green text right (conditional)
- Separator line between items
- On tap: open a basic chat view (simple UI, out of scope for v1 — show "Coming soon" toast)

---

### SCREEN 5: TRANSACTIONS (pages/Transactions.jsx)

**Header:** ← + "Transactions"

**Month filter tabs:**
- "All" | "Mar" | "Feb" | "Jan"
- Active = green filled pill

**Transaction rows:**
- Left circle icon:
  - PAID OUT: red circle, ↗ arrow icon (up-right)
  - RECEIVED: green circle, ↙ arrow icon (down-left)
- "Paid to {Name}" or "Received from {Name}" bold
- Date + time below in gray (format: "2026-03-02 • 14:30")
- Amount far right:
  - Paid: red "-₹XXX"
  - Received: green "+₹XXX"

---

### SCREEN 6: PROFILE (pages/Profile.jsx)

**Header:** ← + "Profile" centered + ⚙️ gear icon right

**Avatar section:**
- 80px circle, teal/green border ring (2px, `#2AB876`)
- Green circle button bottom-right of avatar (24px, pencil/edit icon)

**Name + handle:**
- Name bold 22px
- "@handle" gray 14px

**Info row:**
- 🎂 birthday (gray text)
- 🛡️ "KYC Verified" green text with shield icon

**UPI IDs section:**
- "UPI IDs" bold
- Horizontal wrapping list of gray pills (bg `#E0E0E0`, border-radius 20px)
- Each pill: UPI ID text

**Friends section:**
- "Friends" bold left + count green right (e.g. "47")
- Horizontal scroll of avatar circles (40px) + name (11px) below

**Menu rows:**
- "Edit Profile" → with arrow
- "Notifications" → with arrow
- Each row: gray divider, full-width, 52px height

---

## 🔗 UPI PAYMENT INTEGRATION

When a friend wants to pay their share:
```javascript
const handleUPIPay = (upiId, amount, billId) => {
  const upiUrl = `upi://pay?pa=${upiId}&pn=BillBuddy&am=${amount}&tn=BillBuddy-${billId}&cu=INR`
  window.location.href = upiUrl
  // On Android: opens GPay / PhonePe / Paytm automatically
  // On web (non-Android): show a "Copy UPI ID" fallback
}
```

---

## 🧪 DUMMY DATA (use throughout for demo/dev)

```javascript
export const DUMMY_USER = {
  id: "user-001",
  name: "Arjun Mehta",
  username: "arjunm",
  avatar_seed: "arjun",
  birthday: "2004-08-15",
  kyc_verified: true,
  upi_ids: ["arjun@upi", "arjun@paytm", "arjun.m@ybl"]
}

export const DUMMY_FRIENDS = [
  { id: "u2", name: "Priya Sharma", username: "priyas", avatar_seed: "priya", online: true },
  { id: "u3", name: "Rahul Dev", username: "rahuldev", avatar_seed: "rahul", online: false },
  { id: "u4", name: "Sneha Patel", username: "snehap", avatar_seed: "sneha", online: true },
  { id: "u5", name: "Karan Singh", username: "karans", avatar_seed: "karan", online: false },
  { id: "u6", name: "Ananya Iyer", username: "ananyai", avatar_seed: "ananya", online: true },
  { id: "u7", name: "Vikram Joshi", username: "vikramj", avatar_seed: "vikram", online: false },
]

export const DUMMY_BILLS = [
  { id: "b1", title: "Friday Dinner", total: 2450, amount_owed: 1200, status: "unpaid", created_by: "Priya Sharma" },
  { id: "b2", title: "Movie Night", total: 1800, amount_owed: 600, status: "unpaid", created_by: "Rahul Dev" },
  { id: "b3", title: "Coffee Run", total: 680, status: "paid", created_by: "Arjun Mehta" },
  { id: "b4", title: "Groceries Split", total: 3200, status: "paid", created_by: "Sneha Patel" },
]

export const DUMMY_ITEMS = [
  { id: "i1", name: "Margherita Pizza", price: 450, quantity: 1 },
  { id: "i2", name: "Garlic Bread", price: 180, quantity: 1 },
  { id: "i3", name: "Coke (2)", price: 120, quantity: 1 },
  { id: "i4", name: "Pasta Alfredo", price: 380, quantity: 1 },
]

export const DUMMY_TRANSACTIONS = [
  { id: "t1", type: "paid", name: "Priya Sharma", amount: 600, date: "2026-03-02 • 14:30" },
  { id: "t2", type: "received", name: "Karan Singh", amount: 340, date: "2026-03-01 • 18:45" },
  { id: "t3", type: "paid", name: "Rahul Dev", amount: 1200, date: "2026-02-28 • 21:00" },
  { id: "t4", type: "received", name: "Sneha Patel", amount: 800, date: "2026-02-27 • 10:15" },
  { id: "t5", type: "paid", name: "Ananya Iyer", amount: 450, date: "2026-02-25 • 13:00" },
  { id: "t6", type: "received", name: "Vikram Joshi", amount: 1600, date: "2026-02-22 • 20:30" },
]
```

---

## 🚀 DEPLOYMENT CONFIG

### Vercel (frontend) — vercel.json
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [{ "key": "Content-Type", "value": "application/manifest+json" }]
    }
  ]
}
```

### Railway (backend) — Procfile
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Environment variables needed
```
Frontend (.env):
VITE_API_URL=https://your-railway-app.railway.app
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://your-vercel-app.vercel.app

Backend (.env):
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
MISTRAL_API_KEY=your_mistral_api_key
FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

## ✅ BUILD RULES (MUST FOLLOW)

1. ALL screens use background `#EDEBE5` — never white page backgrounds
2. Bottom navigation persists on all main screens
3. Center Scan FAB is always elevated, circular, green `#2AB876`
4. All ₹ symbols use the actual Rupee sign: ₹ (not Rs. or INR)
5. Avatars always use DiceBear URL with seed = person's first name lowercase
6. Use dummy data for all screens initially — connect to real API in Phase 2
7. Mobile-first: max-width 430px, centered on desktop with gray side areas
8. The app must be fully navigable with no broken routes
9. Show loading spinners on all async operations
10. All forms have proper validation with error messages shown below inputs
11. Use React Router v6 for all navigation
12. The QR code bill-sharing page (`/bill/:id`) must be publicly accessible (no login required)

---

## 📋 BUILD ORDER (follow this sequence)

```
Phase 1 — Static UI (no backend)
  1. Set up Vite + React + Tailwind + React Router
  2. Build BottomNav component
  3. Build Home screen with dummy data
  4. Build Bills screen with dummy data
  5. Build GenerateBill screen (Manual tab, static)
  6. Build Scan tab (static upload UI)
  7. Build Transactions screen
  8. Build Chats screen
  9. Build Profile screen
  10. Add PWA manifest + meta tags

Phase 2 — Backend connection
  11. Set up FastAPI project
  12. Connect Supabase
  13. Implement /bills/create and /bills/:id
  14. Wire up GenerateBill form to backend
  15. Implement OCR scan endpoint with Mistral
  16. Wire up camera/upload → OCR → items displayed

Phase 3 — Auth + Payments
  17. Supabase phone OTP auth
  18. Auth guard on routes
  19. UPI deep link payment button
  20. Friends system

Phase 4 — Deploy
  21. Deploy frontend to Vercel
  22. Deploy backend to Railway
  23. Test PWA install on Android
  24. Fix any production bugs
```

---

Start with Phase 1. Build all screens with dummy data first so the full UI is visible and navigable before touching any backend.
