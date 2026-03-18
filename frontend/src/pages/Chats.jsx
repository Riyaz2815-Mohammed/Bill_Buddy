import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Chats() {
  const navigate = useNavigate()
  const { friends } = useStore()

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 84, background: '#F5F3EE' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A4B 100%)', padding: '48px 16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <button onClick={() => navigate(-1)} className="tap-scale" style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>Chats 💬</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, marginLeft: 50 }}>
          {friends.filter(f => f.online).length} online now
        </p>
      </div>

      <div style={{ padding: '12px 0' }}>
        {friends.map((f, idx) => (
          <div key={f.id}>
            <button onClick={() => alert('Chat coming soon! 🚧')} className="tap-scale" style={{
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', textAlign: 'left',
            }}>
              {/* Avatar with online ring */}
              <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  border: f.online ? '2.5px solid #2AB876' : '2.5px solid #E0E0E0',
                  padding: 2,
                }}>
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${f.avatar_seed}`} alt={f.name} width={44} height={44} style={{ borderRadius: '50%', display: 'block', background: '#f0f0f0' }} />
                </div>
                {f.online && <div style={{ position: 'absolute', bottom: 2, right: 2, width: 11, height: 11, background: '#2AB876', borderRadius: '50%', border: '2px solid #F5F3EE' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#111', margin: '0 0 2px' }}>{f.name}</p>
                <p style={{ fontSize: 13, color: '#aaa', margin: 0, fontWeight: 500 }}>Tap to chat ✉️</p>
              </div>
              {f.online ? (
                <span style={{ fontSize: 11, color: '#fff', background: '#2AB876', borderRadius: 8, padding: '3px 10px', fontWeight: 700 }}>LIVE</span>
              ) : (
                <span style={{ fontSize: 11, color: '#aaa', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '3px 10px', fontWeight: 600 }}>Offline</span>
              )}
            </button>
            {idx < friends.length - 1 && <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px 0 82px' }} />}
          </div>
        ))}
      </div>
    </div>
  )
}
