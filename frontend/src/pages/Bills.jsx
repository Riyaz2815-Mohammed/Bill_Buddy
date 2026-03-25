import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BillCard from '../components/BillCard'
import useStore from '../store/useStore'
import client from '../api/client'

const FILTERS = ['ALL', 'UNPAID', 'SETTLED']

export default function Bills() {
  const navigate = useNavigate()
  const { bills, user, setBills } = useStore()
  const [filter, setFilter] = useState('ALL')

  // Refresh bills on every mount so delete/settle reflects immediately
  useEffect(() => {
    if (user?.id) {
      client.get(`/bills/user/${user.id}`).then(res => setBills(res.data.bills)).catch(console.error)
    }
  }, [])

  const filtered = bills.filter(b => {
    if (filter === 'ALL') return true
    if (filter === 'UNPAID') return b.status === 'unpaid'
    return b.status === 'paid'
  })

  // Colors for brutalist pills
  const filterColors = { 'ALL': '#00F0FF', 'UNPAID': '#FF00E5', 'SETTLED': '#333333' }
  const textColors = { 'ALL': '#000', 'UNPAID': '#fff', 'SETTLED': '#fff' }

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100, background: '#000000', color: '#fff' }}>
      
      {/* Header */}
      <div style={{ padding: '32px 16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} className="tap-scale" style={{ 
            width: 44, height: 44, borderRadius: 12, background: '#111', border: '2px solid #333', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>BILLS 🧾</h1>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="scroll-hide">
          {FILTERS.map(f => {
            const isActive = filter === f
            return (
              <button key={f} onClick={() => setFilter(f)} className="tap-scale brutal-card" style={{
                padding: '12px 24px', borderRadius: 16, cursor: 'pointer', flexShrink: 0,
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 900, letterSpacing: 1,
                background: isActive ? filterColors[f] : '#111',
                color: isActive ? textColors[f] : '#888',
                border: isActive ? `2px solid ${f==='SETTLED' ? '#555' : '#000'}` : '2px solid #222',
                boxShadow: isActive && f !== 'SETTLED' ? '2px 3px 0px #000' : 'none',
              }}>
                {f}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bill list */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: '#0A0A0A', borderRadius: 24, border: '2px dashed #222' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>💀</p>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>NOTHING HERE</p>
            <p style={{ color: '#666', fontSize: 13, fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>NO {filter} BILLS FOUND</p>
          </div>
        ) : (
          filtered.map(bill => <BillCard key={bill.id} bill={bill} />)
        )}
      </div>
    </div>
  )
}
