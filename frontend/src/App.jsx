import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Bills from './pages/Bills'
import GenerateBill from './pages/GenerateBill'
import Chats from './pages/Chats'
import Transactions from './pages/Transactions'
import Profile from './pages/Profile'
import Pay from './pages/Pay'

export default function App() {
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
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
