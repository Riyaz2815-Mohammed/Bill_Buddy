import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BillCard from '../components/BillCard'
import useStore from '../store/useStore'

const FILTERS = ['All', 'Unpaid', 'Paid']

export default function Bills() {
  const navigate = useNavigate()
  const { bills } = useStore()
  const [filter, setFilter] = useState('All')

  const filtered = bills.filter(b => {
    if (filter === 'All') return true
    return b.status === filter.toLowerCase()
  })

  const filterColors = { 'All': '#6C63FF', 'Unpaid': '#FF6B6B', 'Paid': '#2AB876' }

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 84, background: '#F5F3EE' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A4B 100%)',
        padding: '48px 16px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} className="tap-scale" style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>Your Bills 🧾</h1>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className="tap-scale" style={{
              padding: '8px 18px', borderRadius: 30, border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
              background: filter === f ? filterColors[f] : 'rgba(255,255,255,0.1)',
              color: '#fff',
              boxShadow: filter === f ? `0 4px 12px ${filterColors[f]}55` : 'none',
              transition: 'all 0.2s',
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bill list */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
            <p style={{ color: '#666', fontWeight: 700 }}>You're all cleared up!</p>
            <p style={{ color: '#999', fontSize: 13 }}>No {filter.toLowerCase()} bills</p>
          </div>
        ) : (
          filtered.map(bill => <BillCard key={bill.id} bill={bill} />)
        )}
      </div>
    </div>
  )
}
