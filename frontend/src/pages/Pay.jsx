import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Pay() {
  const navigate = useNavigate()
  const { friends } = useStore()

  const handlePay = (f) => {
    const upiUrl = `upi://pay?pa=billbuddy@upi&pn=BillBuddy&am=100&tn=BillBuddy-split&cu=INR`
    window.location.href = upiUrl
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
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, marginLeft: 50 }}>Settle up in seconds via UPI</p>
      </div>

      {/* UPI apps strip */}
      <div style={{ padding: '14px 16px 4px', display: 'flex', gap: 10, overflowX: 'auto' }} className="scroll-hide">
        {[['GPay', '#4285F4'], ['PhonePe', '#5F259F'], ['Paytm', '#00BAF2'], ['BHIM', '#00823E']].map(([name, color]) => (
          <div key={name} style={{ flexShrink: 0, background: color, borderRadius: 12, padding: '7px 14px', fontSize: 12, fontWeight: 800, color: '#fff', boxShadow: `0 3px 10px ${color}55` }}>
            {name}
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 0' }}>
        {friends.map((f, idx) => (
          <div key={f.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px' }}>
              <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: f.online ? '2.5px solid #2AB876' : '2.5px solid #E0E0E0', padding: 2 }}>
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${f.avatar_seed}`} alt="" width={44} height={44} style={{ borderRadius: '50%', display: 'block', background: '#f0f0f0' }} />
                </div>
                {f.online && <div style={{ position: 'absolute', bottom: 2, right: 2, width: 11, height: 11, background: '#2AB876', borderRadius: '50%', border: '2px solid #F5F3EE' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#111', margin: '0 0 1px' }}>{f.name}</p>
                <p style={{ fontSize: 12, color: '#aaa', margin: 0, fontWeight: 600 }}>@{f.username}</p>
              </div>
              <button onClick={() => handlePay(f)} className="tap-scale" style={{
                background: 'linear-gradient(135deg,#2AB876,#00d4aa)', color: '#fff', border: 'none',
                borderRadius: 14, padding: '9px 18px', fontSize: 13, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                boxShadow: '0 3px 10px rgba(42,184,118,0.35)',
              }}>
                Pay ₹
              </button>
            </div>
            {idx < friends.length - 1 && <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px 0 82px' }} />}
          </div>
        ))}
      </div>
    </div>
  )
}
