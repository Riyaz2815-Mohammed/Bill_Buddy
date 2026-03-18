import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const MONTHS = ['All', 'Mar', 'Feb', 'Jan']

export default function Transactions() {
  const navigate = useNavigate()
  const { transactions } = useStore()
  const [month, setMonth] = useState('All')

  const filtered = transactions.filter(t => {
    if (month === 'All') return true
    if (month === 'Mar') return t.date.startsWith('2026-03')
    if (month === 'Feb') return t.date.startsWith('2026-02')
    if (month === 'Jan') return t.date.startsWith('2026-01')
    return true
  })

  const totalPaid = filtered.filter(t => t.type === 'paid').reduce((s, t) => s + t.amount, 0)
  const totalReceived = filtered.filter(t => t.type === 'received').reduce((s, t) => s + t.amount, 0)

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 84, background: '#F5F3EE' }}>
      {/* Dark header */}
      <div style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A4B 100%)', padding: '48px 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} className="tap-scale" style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>Transactions 💳</h1>
        </div>

        {/* Summary pills */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: 'rgba(255,107,107,0.2)', borderRadius: 16, padding: '12px 14px', border: '1px solid rgba(255,107,107,0.3)' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>↗ Paid Out</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#FF8E8E' }}>₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(42,184,118,0.2)', borderRadius: 16, padding: '12px 14px', border: '1px solid rgba(42,184,118,0.3)' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>↙ Received</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#2AB876' }}>₹{totalReceived.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Month filter */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 16px 8px', overflowX: 'auto' }} className="scroll-hide">
        {MONTHS.map(m => (
          <button key={m} onClick={() => setMonth(m)} className="tap-scale" style={{
            padding: '8px 18px', borderRadius: 30, border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
            background: month === m ? '#111' : '#fff',
            color: month === m ? '#fff' : '#666',
            boxShadow: month === m ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}>
            {m}
          </button>
        ))}
      </div>

      {/* Transaction rows */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(t => {
          const isPaid = t.type === 'paid'
          return (
            <div key={t.id} className="card-hover" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', borderRadius: 18, padding: '14px 16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 16, flexShrink: 0,
                background: isPaid
                  ? 'linear-gradient(135deg, #FF6B6B, #FF8E53)'
                  : 'linear-gradient(135deg, #2AB876, #00d4aa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isPaid ? '0 4px 10px rgba(255,107,107,0.35)' : '0 4px 10px rgba(42,184,118,0.35)',
              }}>
                {isPaid ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M7 17L17 7M17 7H7M17 7v10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M17 7L7 17M7 17h10M7 17V7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>
                  {isPaid ? `Paid to ${t.name}` : `From ${t.name}`}
                </p>
                <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0', fontWeight: 500 }}>{t.date}</p>
              </div>
              <span style={{
                fontSize: 17, fontWeight: 900,
                background: isPaid
                  ? 'linear-gradient(135deg, #FF6B6B, #FF8E53)'
                  : 'linear-gradient(135deg, #2AB876, #00d4aa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {isPaid ? '-' : '+'}₹{t.amount}
              </span>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>💸</p>
            <p style={{ color: '#666', fontWeight: 700 }}>No transactions here</p>
          </div>
        )}
      </div>
    </div>
  )
}
