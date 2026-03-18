import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import QRCode from 'react-qr-code'
import ItemRow from '../components/ItemRow'
import useStore from '../store/useStore'
import { DUMMY_ITEMS } from '../data/dummy'

let nextId = 100

function BackBtn({ navigate }) {
  return (
    <button onClick={() => navigate(-1)} className="tap-scale" style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function FriendSelector({ friends, selectedFriends, toggle }) {
  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#111', margin: '18px 0 10px' }}>Split with 👥</p>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }} className="scroll-hide">
        {friends.map(f => {
          const sel = selectedFriends.includes(f.id)
          return (
            <button key={f.id} onClick={() => toggle(f.id)} className="tap-scale" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0,
              opacity: sel ? 1 : 0.4, transition: 'opacity 0.15s',
            }}>
              <div style={{ borderRadius: '50%', border: sel ? '3px solid #2AB876' : '3px solid transparent', padding: 1, transition: 'border 0.15s' }}>
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${f.avatar_seed}`} alt={f.name} width={44} height={44} style={{ borderRadius: '50%', display: 'block', background: '#f0f0f0' }} />
              </div>
              <span style={{ fontSize: 11, color: '#444', fontWeight: 700 }}>{f.name.split(' ')[0]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function GenerateBill() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') === 'scan' ? 'scan' : 'manual')

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 84, background: '#F5F3EE' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A4B 100%)', padding: '48px 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <BackBtn navigate={navigate} />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>Generate Bill 🧾</h1>
        </div>
        {/* Tab switcher */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 4, display: 'flex' }}>
          {['manual', 'scan'].map(t => (
            <button key={t} onClick={() => setTab(t)} className="tap-scale" style={{
              flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#111' : 'rgba(255,255,255,0.6)',
              fontWeight: 800, fontSize: 14, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
            }}>
              {t === 'manual' ? '✏️ Manual' : '📷 Scan'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {tab === 'manual' ? <ManualTab /> : <ScanTab />}
      </div>
    </div>
  )
}

function ManualTab() {
  const { friends } = useStore()
  const [items, setItems] = useState([{ id: 1, name: '', price: 0, quantity: 1 }])
  const [title, setTitle] = useState('')
  const [selectedFriends, setSelectedFriends] = useState([])
  const [billId, setBillId] = useState(null)
  const total = items.reduce((s, i) => s + (Number(i.price) || 0), 0)

  const addItem = () => { nextId++; setItems(p => [...p, { id: nextId, name: '', price: 0, quantity: 1 }]) }
  const deleteItem = (id) => setItems(p => p.filter(i => i.id !== id))
  const updateName = (id, name) => setItems(p => p.map(i => i.id === id ? { ...i, name } : i))
  const updatePrice = (id, price) => setItems(p => p.map(i => i.id === id ? { ...i, price } : i))
  const toggleFriend = (id) => setSelectedFriends(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id])

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="✍️ Bill title (e.g. Friday Dinner)" style={{
          width: '100%', fontSize: 16, fontWeight: 700, color: '#111',
          border: 'none', background: 'transparent', outline: 'none', paddingBottom: 4,
          fontFamily: 'Inter, sans-serif',
        }} />
      </div>

      <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 8 }}>Items 🍕</p>
        {items.map(item => <ItemRow key={item.id} item={item} onDelete={deleteItem} onNameChange={updateName} onPriceChange={updatePrice} />)}
        <button onClick={addItem} style={{ background: 'none', border: 'none', color: '#2AB876', fontSize: 14, fontWeight: 800, cursor: 'pointer', padding: '8px 0', display: 'flex', alignItems: 'center', gap: 4 }}>+ Add item</button>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <FriendSelector friends={friends} selectedFriends={selectedFriends} toggle={toggleFriend} />
      </div>

      {/* Total + Generate */}
      <div style={{ background: 'linear-gradient(135deg,#0D1B2A,#1B3A4B)', borderRadius: 20, padding: 18, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Total</span>
          <span style={{ fontSize: 30, fontWeight: 900, background: 'linear-gradient(135deg,#2AB876,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{total}</span>
        </div>
        <button onClick={() => setBillId('bill-' + Date.now())} className="tap-scale" style={{
          width: '100%', height: 52, background: 'linear-gradient(135deg,#2AB876,#00d4aa)', color: '#fff',
          border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(42,184,118,0.4)',
        }}>
          Generate Bill 🚀
        </button>
      </div>

      {billId && <QRSection billId={billId} />}
    </div>
  )
}

function ScanTab() {
  const { friends } = useStore()
  const [items, setItems] = useState([])
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [selectedFriends, setSelectedFriends] = useState([])
  const [billId, setBillId] = useState(null)
  const fileRef = useRef()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    await new Promise(r => setTimeout(r, 1500))
    setItems(DUMMY_ITEMS.map(i => ({ ...i })))
    setScanning(false)
    setScanned(true)
  }

  const total = items.reduce((s, i) => s + (Number(i.price) || 0), 0)
  const deleteItem = (id) => setItems(p => p.filter(i => i.id !== id))
  const updatePrice = (id, price) => setItems(p => p.map(i => i.id === id ? { ...i, price } : i))
  const toggleFriend = (id) => setSelectedFriends(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id])

  if (!scanned) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 20 }}>
        <div style={{
          width: 240, height: 240, border: '2.5px dashed #2AB876',
          borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(42,184,118,0.04)', gap: 12,
        }}>
          {scanning ? (
            <>
              <div style={{ width: 44, height: 44, border: '3.5px solid #E0E0E0', borderTop: '3.5px solid #2AB876', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#2AB876', fontSize: 14, fontWeight: 700 }}>Scanning... ✨</p>
            </>
          ) : (
            <>
              <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#2AB876,#00d4aa)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(42,184,118,0.3)' }}>
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#fff" strokeWidth="1.8" />
                  <circle cx="12" cy="13" r="4" stroke="#fff" strokeWidth="1.8" />
                </svg>
              </div>
              <p style={{ color: '#666', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>Point camera<br />at the bill 📸</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="camera" onChange={handleFileChange} style={{ display: 'none' }} />
        <button onClick={() => fileRef.current?.click()} className="tap-scale" style={{
          padding: '14px 40px', background: 'linear-gradient(135deg,#2AB876,#00d4aa)', color: '#fff',
          border: 'none', borderRadius: 18, fontSize: 16, fontWeight: 800, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', boxShadow: '0 6px 20px rgba(42,184,118,0.35)',
        }}>
          Open Camera 📷
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 8 }}>🤖 Scanned Items</p>
        {items.map(item => <ItemRow key={item.id} item={item} onDelete={deleteItem} onPriceChange={updatePrice} />)}
        <button onClick={() => { nextId++; setItems(p => [...p, { id: nextId, name: '', price: 0, quantity: 1 }]) }} style={{ background: 'none', border: 'none', color: '#2AB876', fontSize: 14, fontWeight: 800, cursor: 'pointer', padding: '8px 0' }}>+ Add item</button>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <FriendSelector friends={friends} selectedFriends={selectedFriends} toggle={toggleFriend} />
      </div>

      <div style={{ background: 'linear-gradient(135deg,#0D1B2A,#1B3A4B)', borderRadius: 20, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Total</span>
          <span style={{ fontSize: 30, fontWeight: 900, background: 'linear-gradient(135deg,#2AB876,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{total}</span>
        </div>
        <button onClick={() => setBillId('bill-' + Date.now())} className="tap-scale" style={{
          width: '100%', height: 52, background: 'linear-gradient(135deg,#2AB876,#00d4aa)', color: '#fff',
          border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(42,184,118,0.4)',
        }}>
          Generate Bill 🚀
        </button>
      </div>

      {billId && <QRSection billId={billId} />}
    </div>
  )
}

function QRSection({ billId }) {
  const link = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/bill/${billId}`
  const share = () => {
    if (navigator.share) navigator.share({ title: 'Bill Buddy', url: link })
    else { navigator.clipboard.writeText(link); alert('Link copied! 🔗') }
  }
  return (
    <div className="bounce-in" style={{ background: 'linear-gradient(135deg,#0D1B2A,#1B3A4B)', borderRadius: 24, padding: 24, marginTop: 16, textAlign: 'center' }}>
      <p style={{ color: '#2AB876', fontWeight: 800, fontSize: 15, marginBottom: 14 }}>🎉 Bill Created!</p>
      <div style={{ background: '#fff', borderRadius: 16, padding: 16, display: 'inline-block', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
        <QRCode value={link} size={140} />
      </div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 10, marginBottom: 14 }}>Share with your besties ✌️</p>
      <button onClick={share} className="tap-scale" style={{
        background: 'linear-gradient(135deg,#6C63FF,#a78bfa)', color: '#fff', border: 'none',
        borderRadius: 16, padding: '12px 28px', fontSize: 14, fontWeight: 800,
        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 14px rgba(108,99,255,0.4)',
      }}>
        🔗 Share Link
      </button>
    </div>
  )
}
