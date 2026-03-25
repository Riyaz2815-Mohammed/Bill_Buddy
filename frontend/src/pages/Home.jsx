import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Avatar from '../components/Avatar'
import useStore from '../store/useStore'
import client from '../api/client'

// Quick action tile colours (Gen Z gradient pairs)
const QUICK_ACTIONS = [
  { label: 'SCAN', to: '/generate?tab=scan', color: '#CCFF00', icon: ScanIcon },
  { label: 'NEW', to: '/generate?tab=manual', color: '#00F0FF', icon: GenIcon },
  { label: 'BILLS', to: '/bills', color: '#FF00E5', icon: BillsIcon },
  { label: 'HISTORY', to: '/transactions', color: '#FFB800', icon: HistoryIcon },
]

export default function Home() {
  const navigate = useNavigate()
  const { user, friends, bills } = useStore()
  
  const unpaidBills = bills.filter(b => b.status === 'unpaid')
  const totalOwed = unpaidBills.reduce((s, b) => s + b.amount_owed, 0)

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100, background: '#000000' }}>
      
      {/* ── TOP MARQUEE ── */}
      <div style={{ background: '#CCFF00', color: '#000', padding: '6px 0', borderBottom: '2px solid #000', borderTop: '2px solid #000', fontWeight: 900, fontSize: 11, letterSpacing: 1 }} className="marquee-container">
        <div className="marquee-content">
          BILL BUDDY ⚡️ SPLIT FASTER 💸 NO DRAMA 🛑 BILL BUDDY ⚡️ SPLIT FASTER 💸 NO DRAMA 🛑 BILL BUDDY ⚡️
        </div>
      </div>

      {/* ── HEADER STRIP ── */}
      <div style={{ padding: '24px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="tap-scale" style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #CCFF00', padding: 2, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            {user.avatar_base64 ? (
              <img src={`data:image/jpeg;base64,${user.avatar_base64}`} alt="" width={40} height={40} style={{ borderRadius: '50%', display: 'block', background: '#222', objectFit: 'cover' }} />
            ) : (
              <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatar_seed}`} alt="" width={40} height={40} style={{ borderRadius: '50%', display: 'block', background: '#222' }} />
            )}
          </div>
          <div>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Wassup,</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'uppercase', margin: 0 }}>{user.name.split(' ')[0]}</p>
            {totalOwed > 0 && (
              <p style={{ fontSize: 12, fontWeight: 900, color: '#FF00E5', background: '#FF00E522', padding: '4px 8px', borderRadius: 8, display: 'inline-block', marginTop: 4, margin: '4px 0 0 0', border: '1px solid #FF00E555' }}>
                OWES ₹{totalOwed.toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="tap-scale brutal-card" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke="#fff" strokeWidth="2.5" />
              <path d="m21 21-4.35-4.35" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" />
            </svg>
          </button>
          <button onClick={() => navigate('/chats')} className="tap-scale brutal-card" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer', position: 'relative' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
            <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, background: '#FF00E5', borderRadius: '50%', border: '2px solid #000' }} />
          </button>
        </div>
      </div>

      {/* ── BIG HERO CARD ── */}
      <div style={{ padding: '16px' }}>
        <button onClick={() => navigate('/generate?tab=scan')} className="bounce-in tap-scale" style={{ 
          background: '#CCFF00', borderRadius: 24, padding: '40px 24px', 
          border: '3px solid #000', boxShadow: '4px 6px 0px #2A2A2A',
          position: 'relative', overflow: 'hidden', width: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}>
          {/* Abstract BG Shape */}
          <div style={{ position: 'absolute', left: -20, bottom: -20, width: 140, height: 140, background: '#000', borderRadius: '50%', opacity: 0.05 }} />
          
          <svg width="56" height="56" fill="none" viewBox="0 0 24 24" style={{ marginBottom: 16 }}>
            <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke="#000" strokeWidth="2.5" strokeLinecap="square" />
            <rect x="7" y="7" width="10" height="10" stroke="#000" strokeWidth="2.5" strokeLinecap="square" />
          </svg>
          
          <p style={{ fontSize: 36, fontWeight: 900, color: '#000', lineHeight: 1, margin: 0, letterSpacing: -1 }}>
            SCAN
          </p>
        </button>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ padding: '8px 16px 16px' }}>
        <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>ACTIONS ⚡</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.label} onClick={() => navigate(a.to)} className="tap-scale brutal-card" style={{
              padding: '16px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, border: '1px solid #333'
            }}>
              <div style={{ color: a.color }}>
                <a.icon />
              </div>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 800, letterSpacing: 0.5 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── PENDING BILLS ── */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>FIRE BILLS 🔥</p>
          <button onClick={() => navigate('/bills')} className="tap-scale" style={{ background: '#CCFF00', color: '#000', border: '2px solid #000', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase' }}>
            ALL
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 10, paddingRight: 16, margin: '0 -16px', paddingLeft: 16 }} className="scroll-hide">
          {unpaidBills.map((bill, i) => {
            const colors = ['#FF00E5', '#00F0FF', '#FFB800']
            const bgColor = colors[i % colors.length]
            const isDark = bgColor === '#FF00E5' // for text contrast
            return (
              <div key={bill.id} className="tap-scale" style={{
                minWidth: 160, flexShrink: 0, borderRadius: 24, padding: 20,
                background: bgColor, border: '2px solid #000', boxShadow: '3px 4px 0px #222',
                cursor: 'pointer', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ background: '#000', color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 8px', borderRadius: 6, letterSpacing: 1 }}>UNPAID</span>
                </div>
                <p style={{ fontSize: 32, fontWeight: 900, color: '#000', lineHeight: 1, margin: '0 0 4px', letterSpacing: -1 }}>₹{bill.amount_owed}</p>
                <p style={{ fontWeight: 900, fontSize: 14, color: '#000', marginBottom: 8, lineHeight: 1.1, textTransform: 'uppercase' }}>{bill.title}</p>
                <p style={{ fontSize: 11, color: '#111', fontWeight: 800, textTransform: 'uppercase' }}>BY {bill.created_by.split(' ')[0]}</p>
              </div>
            )
          })}
          
          <button onClick={() => navigate('/generate')} className="tap-scale brutal-card" style={{
            minWidth: 140, flexShrink: 0, padding: 20, border: '2px dashed #444', background: '#0A0A0A',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#CCFF00" strokeWidth="3" strokeLinecap="square" /></svg>
            </div>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#CCFF00', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>NEW BILL</p>
          </button>
        </div>
      </div>

      {/* ── FRIENDS SQUAD ── */}
      <div style={{ padding: '16px 16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>SQUAD 🤝</p>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4 }} className="scroll-hide">
          {friends.map(f => (
            <div key={f.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ position: 'relative', width: 60, height: 60 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', border: f.online ? '3px solid #CCFF00' : '3px solid #333', padding: 2 }}>
                  {f.avatar_base64 ? (
                    <img src={`data:image/jpeg;base64,${f.avatar_base64}`} alt={f.name} width={52} height={52} style={{ borderRadius: '50%', display: 'block', background: '#222', objectFit: 'cover' }} />
                  ) : (
                    <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${f.avatar_seed}`} alt={f.name} width={52} height={52} style={{ borderRadius: '50%', display: 'block', background: '#222' }} />
                  )}
                </div>
                {f.online && (
                  <div style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, background: '#CCFF00', borderRadius: '50%', border: '3px solid #000' }} />
                )}
              </div>
              <span style={{ fontSize: 12, color: '#aaa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.name.split(' ')[0]}</span>
            </div>
          ))}
          
          <button onClick={() => navigate('/search')} className="tap-scale brutal-card" style={{
            width: 60, height: 60, flexShrink: 0, borderRadius: '50%', border: '2px dashed #666', background: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#888" strokeWidth="3" strokeLinecap="square" /></svg>
          </button>
        </div>
      </div>

    </div>
  )
}

function ScanIcon() {
  return <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
    <rect x="7" y="7" width="10" height="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
  </svg>
}
function GenIcon() {
  return <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2.5" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
  </svg>
}
function BillsIcon() {
  return <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
    <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
    <path d="M2 10h20" stroke="currentColor" strokeWidth="2.5" />
    <rect x="6" y="14" width="4" height="2" fill="currentColor" />
  </svg>
}
function HistoryIcon() {
  return <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
    <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="round" />
    <path d="M3.05 11a9 9 0 1 0 .5-3M3 4v5h5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="round" />
  </svg>
}
