import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import client from '../api/client'

export default function Profile() {
  const navigate = useNavigate()
  const { user, setUser, friends } = useStore()
  const [newUpi, setNewUpi] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      // 1. Convert to Image
      const img = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const image = new Image()
          image.onload = () => resolve(image)
          image.onerror = reject
          image.src = e.target.result
        }
        reader.readAsDataURL(file)
      })

      // 2. Resize via Canvas
      const MAX_SIZE = 400
      let width = img.width
      let height = img.height

      if (width > height && width > MAX_SIZE) {
        height *= MAX_SIZE / width
        width = MAX_SIZE
      } else if (height > MAX_SIZE) {
        width *= MAX_SIZE / height
        height = MAX_SIZE
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // 3. Compress to JPEG Base64 (0.6 quality)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
      const base64Data = dataUrl.split(',')[1]

      // 4. Upload to backend
      await client.patch(`/auth/profile/avatar/${user.id}`, { avatar_base64: base64Data })
      
      // 5. Hydrate Store
      setUser({ ...user, avatar_base64: base64Data })
      alert('Avatar uploaded! 📸')
    } catch (err) {
      console.error(err)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleAddUpi = async () => {
    if (!newUpi.includes('@')) return alert('Valid UPI ID needed 😬')
    if (user.upi_ids.includes(newUpi)) return alert('Already got that one 🛑')
    
    try {
      await client.patch(`/auth/profile/upi/${user.id}`, { upi_id: newUpi })
      setUser({ ...user, upi_ids: [...user.upi_ids, newUpi] })
      setNewUpi('')
    } catch (e) {
      console.error(e)
      alert('Failed to save UPI ID to database')
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100, background: '#000000', color: '#fff' }}>
      
      {/* ── HEADER STRIP ── */}
      <div style={{ padding: '32px 16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <button className="tap-scale brutal-card" style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#111' }} onClick={() => navigate(-1)}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </button>
        <button className="tap-scale brutal-card" style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#111' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="2.5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" />
          </svg>
        </button>
      </div>

      {/* ── AVATAR & INFO ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 24px' }}>
        <label className="tap-scale" style={{ position: 'relative', marginBottom: 16, cursor: 'pointer', display: 'block' }}>
          <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={uploading} />
          
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: '4px solid #CCFF00', padding: 4, background: '#000', boxShadow: '0 0 30px rgba(204,255,0,0.2)' }}>
            {user.avatar_base64 ? (
              <img src={`data:image/jpeg;base64,${user.avatar_base64}`} alt="" width={104} height={104} style={{ borderRadius: '50%', display: 'block', background: '#1a1a1a', objectFit: 'cover' }} />
            ) : (
              <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatar_seed}`} alt="" width={104} height={104} style={{ borderRadius: '50%', display: 'block', background: '#1a1a1a' }} />
            )}
          </div>
          
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 36, height: 36, background: '#CCFF00',
            border: '3px solid #000', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {uploading ? (
              <div style={{ width: 14, height: 14, border: '2px solid #000', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#000" strokeWidth="2.5" strokeLinecap="square" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#000" strokeWidth="2.5" strokeLinejoin="miter" />
              </svg>
            )}
          </div>
        </label>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: -1 }}>{user.name}</h2>
        <p style={{ fontSize: 16, color: '#00F0FF', margin: '0 0 16px', fontWeight: 800, textTransform: 'uppercase' }}>@{user.username}</p>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#aaa', border: '1px solid #333', background: '#111', borderRadius: 8, padding: '6px 12px' }}>DOB: {user.birthday}</span>
          {user.kyc_verified && (
            <span style={{ fontSize: 12, fontWeight: 900, color: '#000', background: '#CCFF00', borderRadius: 8, padding: '6px 12px', textTransform: 'uppercase' }}>VERIFIED ⚡</span>
          )}
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{ display: 'flex', gap: 12, padding: '0 16px', marginBottom: 24 }}>
        {[['47', 'SQUAD', '#00F0FF'], ['₹12K', 'PAID', '#CCFF00'], ['8', 'OWED', '#FF00E5']].map(([val, label, color]) => (
          <div key={label} style={{ flex: 1, background: '#0A0A0A', border: '1px solid #222', borderRadius: 20, padding: '16px 10px', textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 900, color, margin: '0 0 4px', letterSpacing: -1 }}>{val}</p>
            <p style={{ fontSize: 11, color: '#666', margin: 0, fontWeight: 900, textTransform: 'uppercase' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── UPI IDS ── */}
      <div style={{ padding: '0 16px 24px' }}>
        <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>UPI ACCOUNTS 💳</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {user.upi_ids.map(id => (
            <span key={id} style={{
              background: '#111', borderRadius: 12, padding: '10px 16px',
              fontSize: 14, fontWeight: 800, color: '#fff', border: '1px solid #333'
            }}>
              {id}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            value={newUpi}
            onChange={e => setNewUpi(e.target.value.toLowerCase())}
            placeholder="NEW UPI (NAME@BANK)"
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 12, border: '2px solid #333',
              fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', background: '#000', color: '#fff', fontWeight: 700, textTransform: 'uppercase'
            }}
          />
          <button onClick={handleAddUpi} className="tap-scale" style={{
            background: '#CCFF00', color: '#000', border: 'none', borderRadius: 12, padding: '0 20px', 
            fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
          }}>
            ADD
          </button>
        </div>
      </div>

      {/* ── MENU ── */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ background: '#0A0A0A', borderRadius: 24, overflow: 'hidden', border: '1px solid #222' }}>
          {[['⚙️', 'PROFILE SETTINGS', '#00F0FF'], ['🔔', 'NOTIFICATIONS', '#FF00E5'], ['🔒', 'PRIVACY', '#CCFF00'], ['❓', 'HELP & SUPPORT', '#fff']].map(([icon, label, color], i, arr) => (
            <div key={label}>
              <button className="tap-scale" style={{
                width: '100%', height: 60, background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px'
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#1a1a1a', border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {icon}
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: '#fff', textAlign: 'left', letterSpacing: 0.5 }}>{label}</span>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" stroke="#444" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
              </button>
              {i < arr.length - 1 && <div style={{ height: 1, background: '#222', margin: '0 20px' }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
