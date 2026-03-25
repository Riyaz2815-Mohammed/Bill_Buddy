import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Bills from './pages/Bills'
import GenerateBill from './pages/GenerateBill'
import Chats from './pages/Chats'
import Transactions from './pages/Transactions'
import Profile from './pages/Profile'
import Pay from './pages/Pay'
import Auth from './pages/Auth'
import BillDetail from './pages/BillDetail'
import useStore from './store/useStore'
import client from './api/client'

export default function App() {
  const { token, user, setBills, setFriends, setTransactions } = useStore()

  useEffect(() => {
    if (token && user?.id) {
      // Hydrate all global state from backend
      client.get(`/bills/user/${user.id}`).then(res => setBills(res.data.bills)).catch(console.error)
      client.get(`/friends/${user.id}`).then(res => setFriends(res.data.friends)).catch(console.error)
      client.get(`/transactions/user/${user.id}`).then(res => setTransactions(res.data.transactions)).catch(console.error)
    }
  }, [token, user])

  if (!token) {
    return (
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="*" element={<Auth />} />
          </Routes>
        </div>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/generate" element={<GenerateBill />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pay" element={<Pay />} />
          <Route path="/bill/:id" element={<BillDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
