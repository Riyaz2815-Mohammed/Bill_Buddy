import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Pay() {
  const navigate = useNavigate()
  const { friends, user } = useStore()
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [amount, setAmount] = useState('')

  const handlePay = (appId) => {
    if (!selectedFriend || !amount) return alert('Select a friend and enter amount')
    // Generate actual UPI URL syntax (pa= payee address, pn= payee name, am= amount)
    const payeeUpi = `${selectedFriend.username}@ybl` // Dummy assuming friends have @ybl
    
    let baseUri = `upi://pay`
    // Attempting app-specific intents for Android
    if (appId === 'gpay') baseUri = `teal://pay`
    if (appId === 'phonepe') baseUri = `phonepe://pay`
    if (appId === 'paytm') baseUri = `paytmmp://pay`

    const upiUrl = `${baseUri}?pa=${payeeUpi}&pn=${encodeURIComponent(selectedFriend.name)}&am=${amount}&tn=BillBuddy-settle&cu=INR`
    
    // In a real web app, this triggers the installed UPI app on mobile
    window.location.href = upiUrl
    
    // Fallback UI or toast in case desktop
    setTimeout(() => {
      alert(`If on desktop, scan their QR or send ₹${amount} to ${payeeUpi} manually.`)
      setSelectedFriend(null)
      setAmount('')
    }, 2000)
  }

  if (selectedFriend) {
    return (
      <div style={{ flex: 1, padding: '48px 16px 84px', background: '#F5F3EE', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button onClick={() => setSelectedFriend(null)} className="tap-scale" style={{ alignSelf: 'flex-start', width: 38, height: 38, borderRadius: 12, background: '#E0E0E0', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 20 }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke="#333" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {/* Paying Who */}
        <div style={{ padding: 4, borderRadius: '50%', background: 'linear-gradient(135deg, #2AB876, #6C63FF)', marginBottom: 12 }}>
          <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedFriend.avatar_seed}`} alt="" width={80} height={80} style={{ borderRadius: '50%', display: 'block', background: '#fff' }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', margin: '0 0 4px' }}>Paying {selectedFriend.name}</h2>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 32px', fontWeight: 600 }}>{selectedFriend.username}@ybl</p>

        {/* Amount Input */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 40 }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: '#aaa', marginTop: 4 }}>₹</span>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            style={{ 
              fontSize: 54, fontWeight: 900, color: '#111', background: 'transparent',
              border: 'none', width: amount.length ? `${amount.length * 32}px` : '40px',
              outline: 'none', textAlign: 'center', fontFamily: 'Inter, sans-serif'
            }} 
          />
        </div>

        {/* Pay buttons (GPay, PhonePe, General) */}
        <div style={{ width: '100%', background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 16, textAlign: 'center' }}>Select App to Pay</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
             <button onClick={() => handlePay('gpay')} className="tap-scale card-hover" style={{ background: '#4285F4', borderRadius: 16, padding: '16px 0', border: 'none', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 14px rgba(66,133,244,0.3)' }}>
               GPay
             </button>
             <button onClick={() => handlePay('phonepe')} className="tap-scale card-hover" style={{ background: '#5F259F', borderRadius: 16, padding: '16px 0', border: 'none', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 14px rgba(95,37,159,0.3)' }}>
               PhonePe
             </button>
          </div>
          <button onClick={() => handlePay('upi')} className="tap-scale" style={{ width: '100%', background: '#111', borderRadius: 16, padding: '16px 0', border: 'none', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            Other UPI App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 84, background: '#F5F3EE' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A4B 100%)', padding: '48px 16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <button onClick={() => navigate(-1)} className="tap-scale" style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>Pay Friends 💸</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, marginLeft: 50 }}>Select a friend to settle up</p>
      </div>

      <div style={{ padding: '10px 0' }}>
        {friends.map((f, idx) => (
          <div key={f.id}>
            <button onClick={() => setSelectedFriend(f)} className="tap-scale" style={{ 
              width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', 
              gap: 14, padding: '12px 16px', cursor: 'pointer', textAlign: 'left' 
            }}>
              <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: f.online ? '2.5px solid #2AB876' : '2.5px solid #E0E0E0', padding: 2 }}>
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${f.avatar_seed}`} alt="" width={44} height={44} style={{ borderRadius: '50%', display: 'block', background: '#f0f0f0' }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#111', margin: '0 0 1px' }}>{f.name}</p>
                <p style={{ fontSize: 12, color: '#aaa', margin: 0, fontWeight: 600 }}>@{f.username}</p>
              </div>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="#999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {idx < friends.length - 1 && <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px 0 82px' }} />}
          </div>
        ))}
      </div>
    </div>
  )
}
