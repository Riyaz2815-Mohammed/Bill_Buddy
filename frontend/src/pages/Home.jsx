import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import useStore from '../store/useStore'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return ['Good morning', '☀️']
  if (h < 17) return ['Good afternoon', '✌️']
  return ['Good evening', '🌙']
}

// Quick action tile colours (Gen Z gradient pairs)
const QUICK_ACTIONS = [
  { label: 'Scan', to: '/generate?tab=scan', grad: ['#2AB876', '#00d4aa'], icon: ScanIcon },
  { label: 'Generate', to: '/generate?tab=manual', grad: ['#6C63FF', '#a78bfa'], icon: GenIcon },
  { label: 'Bills', to: '/bills', grad: ['#FF6B6B', '#FF8E53'], icon: BillsIcon },
  { label: 'History', to: '/transactions', grad: ['#F59E0B', '#FBBF24'], icon: HistoryIcon },
  { label: 'Chat', to: '/chats', grad: ['#EC4899', '#f472b6'], icon: ChatIcon },
]

export default function Home() {
  const navigate = useNavigate()
  const { user, friends, bills } = useStore()
  const [greet, emoji] = getGreeting()
  const unpaidBills = bills.filter(b => b.status === 'unpaid')
  const totalOwed = unpaidBills.reduce((s, b) => s + b.amount_owed, 0)

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 84, background: '#F5F3EE' }}>

      {/* ── HEADER gradient strip ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A4B 60%, #0f3460 100%)',
        padding: '48px 16px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(42,184,118,0.15)', borderRadius: '50%', filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -10, width: 80, height: 80, background: 'rgba(108,99,255,0.2)', borderRadius: '50%', filter: 'blur(20px)' }} />

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2.5px solid #2AB876', padding: 2, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatar_seed}`} alt="" width={36} height={36} style={{ borderRadius: '50%', display: 'block' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{greet} {emoji}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{user.name.split(' ')[0]} 👋</p>
          </div>
          {/* Search + chat */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button onClick={() => navigate('/chats')} style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
              <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#FF6B6B', borderRadius: '50%', border: '1.5px solid #1B3A4B' }} />
            </button>
          </div>
        </div>

        {/* Balance card */}
        <div className="glass bounce-in" style={{ borderRadius: 20, padding: '18px 20px', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>💸 You owe</p>
          <p style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, marginBottom: 6 }} className="gradient-text-hot">
            ₹{totalOwed.toLocaleString('en-IN')}
          </p>
          <p style={{ fontSize: 13, color: '#666' }}>across {unpaidBills.length} bill{unpaidBills.length !== 1 ? 's' : ''} — pay up bestie 😬</p>
          <button onClick={() => navigate('/generate?tab=scan')} style={{
            marginTop: 14,
            background: 'linear-gradient(135deg, #2AB876, #00d4aa)',
            color: '#fff', border: 'none', borderRadius: 14, padding: '10px 18px',
            fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', gap: 6,
          }} className="tap-scale">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
              <rect x="7" y="7" width="10" height="10" rx="2" stroke="#fff" strokeWidth="2" />
            </svg>
            Scan a Bill
          </button>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ padding: '20px 16px 4px' }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 12 }}>Quick Actions ⚡</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.label} onClick={() => navigate(a.to)} className="tap-scale" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: `linear-gradient(135deg, ${a.grad[0]}, ${a.grad[1]})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 14px ${a.grad[0]}55`,
              }}>
                <a.icon />
              </div>
              <span style={{ fontSize: 11, color: '#444', fontWeight: 700 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── NEW BILLS ── */}
      <div style={{ padding: '16px 16px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>Pending Bills 🔥</p>
          <button onClick={() => navigate('/bills')} style={{ background: 'none', border: 'none', color: '#2AB876', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
            See all →
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="scroll-hide">
          {unpaidBills.map(bill => (
            <div key={bill.id} className="tap-scale card-hover" style={{
              minWidth: 155, flexShrink: 0, borderRadius: 20, padding: 16,
              background: 'linear-gradient(135deg, #FF6B6B 0%,#FF8E53 100%)',
              boxShadow: '0 6px 20px rgba(255,107,107,0.35)',
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8, padding: '3px 8px', letterSpacing: 0.5 }}>UNPAID</span>
              <p style={{ fontWeight: 800, fontSize: 14, color: '#fff', margin: '8px 0 4px', lineHeight: 1.2 }}>{bill.title}</p>
              <p style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 2px', lineHeight: 1 }}>₹{bill.amount_owed}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: 0 }}>by {bill.created_by.split(' ')[0]}</p>
            </div>
          ))}
          {/* Add bill CTA card */}
          <button onClick={() => navigate('/generate')} className="tap-scale" style={{
            minWidth: 120, flexShrink: 0, borderRadius: 20, padding: 16,
            background: 'rgba(42,184,118,0.08)', border: '2px dashed #2AB876',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 6, cursor: 'pointer',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#2AB876,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#2AB876', textAlign: 'center' }}>New Bill</p>
          </button>
        </div>
      </div>

      {/* ── FRIENDS ── */}
      <div style={{ padding: '16px 16px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>Your Squad 🤝</p>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#2AB876', background: 'rgba(42,184,118,0.1)', borderRadius: 10, padding: '2px 10px' }}>47</span>
        </div>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }} className="scroll-hide">
          {friends.map(f => (
            <div key={f.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{ position: 'relative', width: 52, height: 52 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: f.online ? '2.5px solid #2AB876' : '2.5px solid transparent', padding: 2 }}>
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${f.avatar_seed}`} alt={f.name} width={44} height={44} style={{ borderRadius: '50%', display: 'block', background: '#f0f0f0' }} />
                </div>
                {f.online && (
                  <div style={{ position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, background: '#2AB876', borderRadius: '50%', border: '2px solid #F5F3EE' }} />
                )}
              </div>
              <span style={{ fontSize: 11, color: '#444', fontWeight: 600 }}>{f.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// Quick action icons (white, for coloured background)
function ScanIcon() {
  return <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <rect x="7" y="7" width="10" height="10" rx="2" stroke="#fff" strokeWidth="2" />
  </svg>
}
function GenIcon() {
  return <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
    <rect x="4" y="3" width="16" height="18" rx="3" stroke="#fff" strokeWidth="2" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
}
function BillsIcon() {
  return <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
    <rect x="2" y="6" width="20" height="14" rx="3" stroke="#fff" strokeWidth="2" />
    <path d="M2 10h20" stroke="#fff" strokeWidth="2" />
    <rect x="6" y="14" width="4" height="2" rx="1" fill="#fff" />
  </svg>
}
function HistoryIcon() {
  return <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
    <path d="M12 8v4l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.05 11a9 9 0 1 0 .5-3M3 4v5h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}
function ChatIcon() {
  return <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
  </svg>
}
