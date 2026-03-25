import React from 'react'

export default function FriendSelector({ friends, selectedFriends, toggle, totalAmount, includeMe, toggleMe }) {
  const count = selectedFriends.length + (includeMe ? 1 : 0)
  const perPerson = count > 0 ? (totalAmount / count).toFixed(2) : totalAmount

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>SELECT SQUAD</p>
        <button 
          onClick={toggleMe}
          style={{
            padding: '8px 16px', borderRadius: 12, border: '2px solid #000',
            background: includeMe ? '#FF00E5' : '#111', color: includeMe ? '#fff' : '#888',
            fontSize: 10, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer',
            boxShadow: includeMe ? '2px 3px 0px #000' : 'none'
          }}
        >
          {includeMe ? '✅ SPLITTING WITH ME' : '+ INCLUDE ME'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none' }}>
        {friends.length === 0 ? (
          <p style={{ color: '#444', fontSize: 13, fontWeight: 800 }}>Search for friends to add them to your squad!</p>
        ) : (
          friends.map(f => {
            const isSelected = selectedFriends.includes(f.id)
            return (
              <div 
                key={f.id} 
                onClick={() => toggle(f.id)}
                className="tap-scale"
                style={{
                  minWidth: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: 'pointer', opacity: isSelected ? 1 : 0.4, transition: '0.2s'
                }}
              >
                <div style={{
                  width: 60, height: 60, borderRadius: 30, background: '#111',
                  border: `3px solid ${isSelected ? '#00F0FF' : '#333'}`, padding: 3,
                  position: 'relative', boxShadow: isSelected ? '0 0 15px rgba(0, 240, 255, 0.3)' : 'none'
                }}>
                  {f.avatar_base64 ? (
                    <img src={`data:image/jpeg;base64,${f.avatar_base64}`} alt="ava" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${f.avatar_seed || 'default'}`} alt="ava" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  )}
                  {isSelected && (
                    <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#00F0FF', width: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #000' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: isSelected ? '#00F0FF' : '#888', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {f.name || 'FRIEND'}
                </span>
              </div>
            )
          })
        )}
      </div>

      {count > 0 && (
        <div style={{ background: '#111', padding: '12px 16px', borderRadius: 16, border: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: '#666', textTransform: 'uppercase' }}>SPLIT BETWEEN {count} PERS.</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#00F0FF' }}>₹{perPerson} EA.</span>
        </div>
      )}
    </div>
  )
}
