import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Chats() {
  const navigate = useNavigate()
  const { friends } = useStore() // We use friends list as initial chat targets

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100, background: '#000000', color: '#fff' }}>
      
      {/* ── HEADER ── */}
      <div style={{ padding: '32px 16px 20px', borderBottom: '2px solid #333' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <button onClick={() => navigate(-1)} className="tap-scale brutal-card" style={{ 
            width: 44, height: 44, borderRadius: 12, background: '#111', border: '2px solid #333', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>CHATS 💬</h1>
        </div>
        
        {/* Status Pill */}
        <div style={{ display: 'inline-block', background: '#CCFF00', color: '#000', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {friends.length} SQUAD MEMBERS ⚡
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        
        {/* SEARCH BAR (Visual only) */}
        <div style={{ background: '#111', borderRadius: 16, padding: '16px 20px', border: '2px solid #333', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input placeholder="SEARCH FRIENDS" style={{
            background: 'transparent', border: 'none', color: '#fff', fontSize: 16, fontWeight: 900,
            outline: 'none', width: '100%', fontFamily: 'Inter', textTransform: 'uppercase'
          }} />
        </div>

        {/* CHAT LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {friends.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', background: '#0A0A0A', borderRadius: 24, border: '2px dashed #222' }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>👻</p>
              <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>NO FRIENDS YET</p>
              <p style={{ color: '#666', fontSize: 13, fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>ADD THEM FIRST</p>
            </div>
          ) : (
            friends.map((f, idx) => {
              // Simulated random online status for UI visual
              const isOnline = idx % 3 === 0
              
              return (
                <button
                  key={f.id}
                  onClick={() => navigate(`/chat/${f.friend_id || f.id}`)}
                  className="tap-scale brutal-card"
                  style={{
                    width: '100%', background: '#111', border: '2px solid #333', borderRadius: 20, 
                    padding: '16px', display: 'flex', alignItems: 'center', gap: 16, 
                    cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  {/* Avatar Frame */}
                  <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      border: isOnline ? '3px solid #CCFF00' : '3px solid #444',
                      padding: 2, background: '#000'
                    }}>
                      <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${f.avatar_seed}`} alt={f.name} width={46} height={46} style={{ borderRadius: '50%', display: 'block', background: '#222' }} />
                    </div>
                    {isOnline && (
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, background: '#CCFF00', borderRadius: '50%', border: '3px solid #000' }} />
                    )}
                  </div>

                  {/* Text Container */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {f.name.substring(0, 15)}{f.name.length > 15 ? '...' : ''}
                      </p>
                      <span style={{ fontSize: 11, color: '#666', fontWeight: 800 }}>JUST NOW</span>
                    </div>
                    
                    <p style={{ fontSize: 13, color: '#00F0FF', margin: 0, fontWeight: 800 }}>
                      TAP TO CHAT ⚡
                    </p>
                  </div>

                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
