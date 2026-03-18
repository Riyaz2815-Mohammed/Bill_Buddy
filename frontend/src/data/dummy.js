// Dummy data for Phase 1 static UI

export const DUMMY_USER = {
  id: "user-001",
  name: "Arjun Mehta",
  username: "arjunm",
  avatar_seed: "arjun",
  birthday: "Aug 15, 2004",
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
  { id: "b3", title: "Coffee Run", total: 680, amount_owed: 0, status: "paid", created_by: "Arjun Mehta" },
  { id: "b4", title: "Groceries Split", total: 3200, amount_owed: 0, status: "paid", created_by: "Sneha Patel" },
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
  { id: "t7", type: "paid", name: "Priya Sharma", amount: 280, date: "2026-02-20 • 09:00" },
]
