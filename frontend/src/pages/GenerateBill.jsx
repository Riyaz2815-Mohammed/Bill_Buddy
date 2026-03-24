import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import QRCode from 'react-qr-code'
import Webcam from 'react-webcam'
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

function FriendSelector({ friends, selectedFriends, toggle, totalAmount }) {
  const personsCount = selectedFriends.length + 1 // including 'you'
  const splitAmount = totalAmount ? (totalAmount / personsCount).toFixed(2) : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0 10px' }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: '#111', margin: 0 }}>Split with 👥</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#666', margin: 0 }}>{personsCount} people</p>
      </div>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }} className="scroll-hide">
        {/* 'You' Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <div style={{ borderRadius: '50%', border: '3px solid #2AB876', padding: 1 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #2AB876, #00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>You</div>
          </div>
          <span style={{ fontSize: 11, color: '#111', fontWeight: 800 }}>₹{splitAmount}</span>
        </div>
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
              <span style={{ fontSize: 11, color: sel ? '#111' : '#444', fontWeight: sel ? 800 : 600 }}>
                {sel ? `₹${splitAmount}` : f.name.split(' ')[0]}
              </span>
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
        <FriendSelector friends={friends} selectedFriends={selectedFriends} toggle={toggleFriend} totalAmount={total} />
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
  const webcamRef = useRef(null)

  const capture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) return
    setScanning(true)
    
    // Simulate API call to OCR endpoint
    await new Promise(r => setTimeout(r, 2000))
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 10 }}>
        <div style={{
          width: '100%', maxWidth: 360, height: 400, borderRadius: 24, overflow: 'hidden',
          background: '#000', position: 'relative', boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
        }}>
          {!scanning ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'rgba(42,184,118,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, border: '4px solid rgba(42,184,118,0.3)', borderTop: '4px solid #2AB876', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#2AB876', fontSize: 16, fontWeight: 800 }}>Analyzing Bill... 🤖</p>
            </div>
          )}
          {/* Viewfinder overlay */}
          {!scanning && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', border: 'rgba(0,0,0,0.4) solid 40px' }}>
              <div style={{ width: '100%', height: '100%', border: '2px dashed rgba(255,255,255,0.7)', borderRadius: 12 }}></div>
            </div>
          )}
        </div>
        
        {!scanning && (
          <button onClick={capture} className="tap-scale" style={{
            width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '5px solid #2AB876',
            boxShadow: '0 6px 20px rgba(42,184,118,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#2AB876' }}></div>
          </button>
        )}
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
        <FriendSelector friends={friends} selectedFriends={selectedFriends} toggle={toggleFriend} totalAmount={total} />
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
