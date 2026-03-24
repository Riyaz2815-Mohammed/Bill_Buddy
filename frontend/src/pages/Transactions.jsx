import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const MONTHS = ['ALL', 'MAR', 'FEB', 'JAN']

export default function Transactions() {
  const navigate = useNavigate()
  const { transactions } = useStore()
  const [month, setMonth] = useState('ALL')

  const filtered = transactions.filter(t => {
    if (month === 'ALL') return true
    if (month === 'MAR') return t.date.startsWith('2026-03')
    if (month === 'FEB') return t.date.startsWith('2026-02')
    if (month === 'JAN') return t.date.startsWith('2026-01')
    return true
  })

  const totalPaid = filtered.filter(t => t.type === 'paid').reduce((s, t) => s + t.amount, 0)
  const totalReceived = filtered.filter(t => t.type === 'received').reduce((s, t) => s + t.amount, 0)

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100, background: '#000000', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '32px 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} className="tap-scale brutal-card" style={{ 
            width: 44, height: 44, borderRadius: 12, padding: 0, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>HISTORY 💳</h1>
        </div>

        {/* Summary pills */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, background: '#FF00E5', borderRadius: 20, padding: '20px 16px', border: '2px solid #000', boxShadow: '3px 4px 0px #222', color: '#000' }}>
            <p style={{ fontSize: 13, fontWeight: 900, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>↗ PAID OUT</p>
            <p style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1 }}>₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div style={{ flex: 1, background: '#CCFF00', borderRadius: 20, padding: '20px 16px', border: '2px solid #000', boxShadow: '3px 4px 0px #222', color: '#000' }}>
            <p style={{ fontSize: 13, fontWeight: 900, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>↙ RECEIVED</p>
            <p style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1 }}>₹{totalReceived.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Month filter */}
      <div style={{ display: 'flex', gap: 12, padding: '16px 16px 8px', overflowX: 'auto' }} className="scroll-hide">
        {MONTHS.map(m => (
          <button key={m} onClick={() => setMonth(m)} className="tap-scale brutal-card" style={{
            padding: '12px 24px', borderRadius: 16, cursor: 'pointer', flexShrink: 0,
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 900, letterSpacing: 1,
            background: month === m ? '#00F0FF' : '#111',
            color: month === m ? '#000' : '#888',
            border: month === m ? '2px solid #000' : '2px solid #222',
            boxShadow: month === m ? '2px 3px 0px #000' : 'none',
          }}>
            {m}
          </button>
        ))}
      </div>

      {/* Transaction rows */}
      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(t => {
          const isPaid = t.type === 'paid'
          const iconColor = isPaid ? '#FF00E5' : '#CCFF00'
          return (
            <div key={t.id} className="tap-scale" style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: '#0A0A0A', borderRadius: 20, padding: '16px',
              border: '1px solid #222'
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                background: '#000', border: `2px solid ${iconColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isPaid ? (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path d="M7 17L17 7M17 7H7M17 7v10" stroke={iconColor} strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                ) : (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path d="M17 7L7 17M7 17h10M7 17V7" stroke={iconColor} strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {isPaid ? `PAY ➞ ${t.name}` : `FROM ➞ ${t.name}`}
                </p>
                <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0', fontWeight: 800, textTransform: 'uppercase' }}>{t.date}</p>
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: iconColor }}>
                {isPaid ? '-' : '+'}₹{t.amount}
              </span>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', background: '#0A0A0A', borderRadius: 24, border: '2px dashed #222' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🕸️</p>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>IT'S EMPTY</p>
          </div>
        )}
      </div>
    </div>
  )
}
