import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Pay() {
  const navigate = useNavigate()
  const { friends, user } = useStore()
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [amount, setAmount] = useState('')

  const handlePay = (appId) => {
    if (!selectedFriend || !amount) return alert('SELECT A FRIEND AND AMOUNT 🛑')
    // Generate actual UPI URL syntax (pa= payee address, pn= payee name, am= amount)
    const payeeUpi = `${selectedFriend.username}@ybl` 
    
    let baseUri = `upi://pay`
    if (appId === 'gpay') baseUri = `teal://pay`
    if (appId === 'phonepe') baseUri = `phonepe://pay`
    if (appId === 'paytm') baseUri = `paytmmp://pay`

    const upiUrl = `${baseUri}?pa=${payeeUpi}&pn=${encodeURIComponent(selectedFriend.name)}&am=${amount}&tn=BillBuddy-settle&cu=INR`
    
    // Trigger installed UPI app on mobile
    window.location.href = upiUrl
    
    // Fallback UI or toast in case desktop
    setTimeout(() => {
      alert(`DESKTOP? SEND ₹${amount} TO ${payeeUpi} MANUALLY ✌️`)
      setSelectedFriend(null)
      setAmount('')
    }, 2000)
  }

  if (selectedFriend) {
    return (
      <div style={{ flex: 1, padding: '32px 16px 100px', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
        <button onClick={() => setSelectedFriend(null)} className="tap-scale brutal-card" style={{ alignSelf: 'flex-start', width: 44, height: 44, borderRadius: 12, background: '#111', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 32, padding: 0 }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" /></svg>
        </button>

        {/* Paying Who */}
        <div style={{ border: '4px solid #CCFF00', borderRadius: '50%', padding: 4, background: '#000', marginBottom: 16, boxShadow: '0 0 24px rgba(204,255,0,0.15)' }}>
          <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedFriend.avatar_seed}`} alt="" width={90} height={90} style={{ borderRadius: '50%', display: 'block', background: '#111' }} />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: -0.5 }}>PAY {selectedFriend.name.split(' ')[0]}</h2>
        <p style={{ fontSize: 14, color: '#00F0FF', margin: '0 0 40px', fontWeight: 800, textTransform: 'uppercase' }}>{selectedFriend.username}@YBL</p>

        {/* Amount Input */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 48, background: '#111', padding: '16px 32px', borderRadius: 24, border: '2px solid #333' }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: '#CCFF00', marginTop: 4 }}>₹</span>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            style={{ 
              fontSize: 64, fontWeight: 900, color: '#CCFF00', background: 'transparent',
              border: 'none', width: amount.length ? `${amount.length * 40}px` : '48px',
              outline: 'none', textAlign: 'center', fontFamily: 'Inter, sans-serif', letterSpacing: -2
            }} 
          />
        </div>

        {/* Pay buttons */}
        <div style={{ width: '100%', background: '#0A0A0A', borderRadius: 24, padding: '24px', border: '2px solid #222' }}>
          <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 20, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>SELECT APP ⚡</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
             <button onClick={() => handlePay('gpay')} className="tap-scale" style={{ background: '#CCFF00', borderRadius: 16, padding: '16px 0', border: '3px solid #000', color: '#000', fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: '3px 4px 0px #222', textTransform: 'uppercase', letterSpacing: 1 }}>
               G-PAY
             </button>
             <button onClick={() => handlePay('phonepe')} className="tap-scale" style={{ background: '#00F0FF', borderRadius: 16, padding: '16px 0', border: '3px solid #000', color: '#000', fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: '3px 4px 0px #222', textTransform: 'uppercase', letterSpacing: 1 }}>
               PHONEPE
             </button>
          </div>
          <button onClick={() => handlePay('upi')} className="tap-scale" style={{ width: '100%', background: '#111', borderRadius: 16, padding: '16px 0', border: '2px solid #444', color: '#fff', fontWeight: 900, fontSize: 16, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
            OTHER UPI APP
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100, background: '#000000', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '32px 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <button onClick={() => navigate(-1)} className="tap-scale brutal-card" style={{ width: 44, height: 44, borderRadius: 12, background: '#111', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>SEND CASH 💸</h1>
        </div>
        <p style={{ color: '#00F0FF', fontSize: 14, fontWeight: 900, marginLeft: 60, textTransform: 'uppercase' }}>SELECT A FRIEND</p>
      </div>

      <div style={{ padding: '16px' }}>
        {friends.map((f, idx) => (
          <div key={f.id} style={{ marginBottom: 12 }}>
            <button onClick={() => setSelectedFriend(f)} className="tap-scale" style={{ 
              width: '100%', background: '#0A0A0A', border: '1px solid #222', borderRadius: 20, display: 'flex', alignItems: 'center', 
              gap: 16, padding: '16px', cursor: 'pointer', textAlign: 'left' 
            }}>
              <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', border: f.online ? '3px solid #CCFF00' : '3px solid #333', padding: 2 }}>
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${f.avatar_seed}`} alt="" width={50} height={50} style={{ borderRadius: '50%', display: 'block', background: '#111' }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.name}</p>
                <p style={{ fontSize: 13, color: '#888', margin: 0, fontWeight: 800, textTransform: 'uppercase' }}>@{f.username}</p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333' }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" /></svg>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
