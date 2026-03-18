import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Profile() {
  const navigate = useNavigate()
  const { user, friends } = useStore()

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 84, background: '#F5F3EE' }}>
      {/* Dark gradient header */}
      <div style={{
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A4B 70%, #6C63FF33 100%)',
        padding: '48px 16px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Settings btn */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button className="tap-scale" style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Avatar centered */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              padding: 3,
              background: 'linear-gradient(135deg, #2AB876, #6C63FF)',
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0' }}>
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatar_seed}`} alt="" width={84} height={84} style={{ display: 'block' }} />
              </div>
            </div>
            <button className="tap-scale" style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 28, height: 28, background: 'linear-gradient(135deg,#2AB876,#00d4aa)',
              border: '2.5px solid #1B3A4B', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 2px' }}>{user.name}</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 10px', fontWeight: 600 }}>@{user.username}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>🎂 {user.birthday}</span>
            {user.kyc_verified && (
              <span style={{ fontSize: 13, fontWeight: 700, color: '#2AB876', background: 'rgba(42,184,118,0.15)', borderRadius: 10, padding: '3px 10px' }}>✅ KYC Verified</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px', marginTop: -24, position: 'relative', zIndex: 2 }}>
        {[['47', 'Friends', '#6C63FF'], ['₹12K', 'Settled', '#2AB876'], ['8', 'Bills', '#FF6B6B']].map(([val, label, color]) => (
          <div key={label} style={{ flex: 1, background: '#fff', borderRadius: 16, padding: '14px 10px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: 20, fontWeight: 900, color, margin: '0 0 2px' }}>{val}</p>
            <p style={{ fontSize: 11, color: '#999', margin: 0, fontWeight: 600 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* UPI IDs */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 10 }}>💳 UPI IDs</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {user.upi_ids.map(id => (
            <span key={id} style={{
              background: '#fff', borderRadius: 12, padding: '8px 14px',
              fontSize: 13, fontWeight: 600, color: '#333',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              border: '1.5px solid #E0E0E0',
            }}>
              {id}
            </span>
          ))}
        </div>
      </div>

      {/* Friends */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 10 }}>🤝 Squad</p>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto' }} className="scroll-hide">
          {friends.map(f => (
            <div key={f.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', border: `2.5px solid ${f.online ? '#2AB876' : '#E0E0E0'}`, padding: 2 }}>
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${f.avatar_seed}`} alt="" width={42} height={42} style={{ borderRadius: '50%', display: 'block', background: '#f0f0f0' }} />
              </div>
              <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>{f.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div style={{ margin: '20px 16px 0', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {[['✏️', 'Edit Profile', '#6C63FF'], ['🔔', 'Notifications', '#FF6B6B'], ['🔒', 'Privacy', '#F59E0B'], ['❓', 'Help & Support', '#2AB876']].map(([icon, label, color], i, arr) => (
          <div key={label}>
            <button className="tap-scale" style={{
              width: '100%', height: 54, background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
              fontFamily: 'Inter, sans-serif',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {icon}
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#111', textAlign: 'left' }}>{label}</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {i < arr.length - 1 && <div style={{ height: 1, background: '#F5F3EE', margin: '0 16px' }} />}
          </div>
        ))}
      </div>
    </div>
  )
}
