import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import useStore from '../store/useStore'
import client from '../api/client'
import ItemRow from '../components/ItemRow'
import FriendSelector from '../components/FriendSelector'

let nextId = 1000

export default function GenerateBill() {
  const [tab, setTab] = useState('manual')
  const [showSuccess, setShowSuccess] = useState(false)

  return (
    <div style={{ flex: 1, minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* TABS */}
      <div style={{ display: 'flex', background: '#111', borderRadius: 20, padding: 6, margin: '24px 24px 32px' }}>
        <button onClick={() => setTab('manual')} style={{
          flex: 1, padding: '12px', borderRadius: 16, border: 'none',
          background: tab === 'manual' ? '#CCFF00' : 'transparent',
          color: tab === 'manual' ? '#000' : '#888',
          fontWeight: 900, transition: '0.2s', cursor: 'pointer', textTransform: 'uppercase'
        }}>Manual</button>
        <button onClick={() => setTab('scan')} style={{
          flex: 1, padding: '12px', borderRadius: 16, border: 'none',
          background: tab === 'scan' ? '#00F0FF' : 'transparent',
          color: tab === 'scan' ? '#000' : '#888',
          fontWeight: 900, transition: '0.2s', cursor: 'pointer', textTransform: 'uppercase'
        }}>Scan Bill</button>
      </div>

      <div style={{ padding: '0 24px 100px' }}>
        {tab === 'manual' ? <ManualTab setShowSuccess={setShowSuccess} /> : <ScanTab setShowSuccess={setShowSuccess} />}
      </div>

      {showSuccess && <SuccessOverlay />}
    </div>
  )
}

function SuccessOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#CCFF00', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 20, textAlign: 'center'
    }}>
      <div style={{ fontSize: 80, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }}>🔥</div>
      <h2 style={{ color: '#000', fontSize: 40, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -2, lineHeight: 1 }}>
        GENERATED<br />SUCCESSFULLY
      </h2>
      <div style={{ color: '#000', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', background: '#000', padding: '6px 14px', color: '#CCFF00', borderRadius: 4 }}>
        REDIRECTING TO BILL...
      </div>
    </div>
  )
}

function ManualTab({ setShowSuccess }) {
  const { friends, user } = useStore()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [items, setItems] = useState([])
  const [selectedFriends, setSelectedFriends] = useState([])
  const [includeMe, setIncludeMe] = useState(true)
  const [loading, setLoading] = useState(false)

  const addItem = () => {
    nextId++
    setItems([...items, { id: nextId, name: '', price: 0, quantity: 1 }])
  }

  const deleteItem = (id) => setItems(items.filter(i => i.id !== id))
  const updateName = (id, val) => setItems(items.map(i => i.id === id ? { ...i, name: val } : i))
  const updatePrice = (id, val) => setItems(items.map(i => i.id === id ? { ...i, price: val } : i))
  const updateQuantity = (id, val) => setItems(items.map(i => i.id === id ? { ...i, quantity: val } : i))

  const toggleFriend = (id) => {
    if (selectedFriends.includes(id)) {
      setSelectedFriends(selectedFriends.filter(f => f !== id))
    } else {
      setSelectedFriends([...selectedFriends, id])
    }
  }

  const total = items.reduce((s, i) => s + ((Number(i.price) || 0) * (i.quantity || 1)), 0)

  const generate = async () => {
    if (!title || items.length === 0) return alert('Add a Title and Items first! 🛑')
    setLoading(true)
    try {
      const payload = {
        title,
        items: items.map(i => ({ name: i.name || 'Item', price: Number(i.price) || 0, quantity: i.quantity || 1 })),
        member_ids: [
          ...selectedFriends,
          ...(includeMe ? [user.id] : [])
        ],
        created_by: user.id,
        type: 'manual'
      }
      const res = await client.post('/bills/create', payload)
      setShowSuccess(true)
      setTimeout(() => {
        navigate(`/bill/${res.data.bill_id}`, { replace: true })
      }, 1500)
    } catch (err) {
      console.error(err)
      alert('Failed to generate bill')
    } finally {
      // Keep loading true while showing success overlay
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#0A0A0A', borderRadius: 24, padding: '20px', border: '2px solid #222' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="TITLE (e.g. PIZZA NIGHT)" style={{
          width: '100%', fontSize: 18, fontWeight: 900, color: '#fff',
          border: 'none', background: 'transparent', outline: 'none',
          fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5
        }} />
      </div>

      <div style={{ background: '#0A0A0A', borderRadius: 24, padding: '20px', border: '2px solid #222' }}>
        <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>ADD ITEMS (UNIT RATES) 🍔</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {items.map(item => <ItemRow key={item.id} item={item} onDelete={deleteItem} onNameChange={updateName} onPriceChange={updatePrice} onQuantityChange={updateQuantity} />)}
        </div>
        <button onClick={addItem} className="tap-scale" style={{ background: '#111', border: '2px dashed #444', color: '#00F0FF', borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: 'pointer', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', textTransform: 'uppercase', letterSpacing: 1 }}>
          + ADD ITEM
        </button>
      </div>

      <div style={{ background: '#0A0A0A', borderRadius: 24, padding: '20px', border: '2px solid #222' }}>
        <FriendSelector friends={friends.map(f => ({ ...f, id: f.friend_id || f.id }))} selectedFriends={selectedFriends} toggle={toggleFriend} totalAmount={total} includeMe={includeMe} toggleMe={() => setIncludeMe(!includeMe)} />
      </div>

      <div style={{ background: '#CCFF00', borderRadius: 24, padding: '24px', border: '3px solid #000', boxShadow: '4px 6px 0px #222', color: '#000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL</span>
          <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>₹{total}</span>
        </div>
        <button onClick={generate} disabled={loading} className="tap-scale" style={{
          width: '100%', padding: '20px', background: '#000', color: '#CCFF00',
          border: 'none', borderRadius: 16, fontSize: 18, fontWeight: 900, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 2,
          opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'GENERATING...' : 'GENERATE 🚀'}
        </button>
      </div>
    </div>
  )
}

function ScanTab({ setShowSuccess }) {
  const { friends, user } = useStore()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [items, setItems] = useState([])
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [selectedFriends, setSelectedFriends] = useState([])
  const [includeMe, setIncludeMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const webcamRef = useRef(null)

  const capture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) return
    setScanning(true)
    
    // Convert to base64
    const base64 = imageSrc.split(',')[1]

    try {
      const res = await client.post('/ocr/scan', { base64_image: base64 })
      
      const mappedItems = res.data.items.map(i => ({
        id: ++nextId,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }))
      
      setItems(mappedItems)
      setTitle(res.data.title || 'SCANNED BILL')
    } catch (err) {
      console.error(err)
      alert('OCR Failed!')
    } finally {
      setScanning(false)
      setScanned(true)
    }
  }

  const total = items.reduce((s, i) => s + ((Number(i.price) || 0) * (i.quantity || 1)), 0)
  const handleDeleteItem = (id) => setItems(p => p.filter(i => i.id !== id))
  const handleNameChange = (id, val) => {
    setItems(items.map(i => i.id === id ? { ...i, name: val } : i))
  }
  const handlePriceChange = (id, val) => {
    setItems(items.map(i => i.id === id ? { ...i, price: val } : i))
  }
  const handleQuantityChange = (id, val) => {
    setItems(items.map(i => i.id === id ? { ...i, quantity: val } : i))
  }
  const toggleFriend = (id) => setSelectedFriends(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id])

  const generate = async () => {
    if (!title || items.length === 0) return alert('Add a Title and Items first! 🛑')
    setLoading(true)
    try {
      const payload = {
        title,
        items: items.map(i => ({ name: i.name || 'Item', price: Number(i.price) || 0, quantity: i.quantity || 1 })),
        member_ids: [
          ...selectedFriends,
          ...(includeMe ? [user.id] : [])
        ],
        created_by: user.id,
        type: 'scanned'
      }
      const res = await client.post('/bills/create', payload)
      setShowSuccess(true)
      setTimeout(() => {
        navigate(`/bill/${res.data.bill_id}`, { replace: true })
      }, 1500)
    } catch (err) {
      console.error(err)
      alert('Failed to generate bill')
    } finally {
      // Keep loading true while showing success overlay
    }
  }

  if (!scanned) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingBottom: 24 }}>
        <div style={{
          width: '100%', height: '62vh', minHeight: 450, borderRadius: 32, overflow: 'hidden',
          background: '#050505', position: 'relative', border: '3px solid #222',
          boxShadow: '0 10px 40px rgba(0, 240, 255, 0.1)'
        }}>
          {!scanning ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
              onUserMediaError={(err) => {
                console.error("Camera Error:", err)
                if (!window.location.protocol.includes('https') && window.location.hostname !== 'localhost') {
                  alert("Camera requires HTTPS. Please deploy to Vercel/Netlify for scanning! 📹")
                } else {
                  alert("Camera restricted or not found. Please enable permissions! 🛑")
                }
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#0A0A0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <div style={{ width: 72, height: 72, border: '6px solid #222', borderTop: '6px solid #00F0FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#00F0FF', fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>EXTRACTING 🤖</p>
              <p style={{ color: '#666', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>ANALYZING BILL ITEMS...</p>
            </div>
          )}

          {!scanning && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', padding: '24px 24px 100px 24px' }}>
              <div style={{ width: '100%', height: '100%', border: '2px dashed rgba(0, 240, 255, 0.4)', borderRadius: 24 }}></div>
            </div>
          )}

          {!scanning && (
            <button onClick={capture} className="tap-scale" style={{
              position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
              width: 80, height: 80, borderRadius: '50%', background: '#00F0FF', border: '6px solid #000',
              boxShadow: '0 0 0 4px #00F0FF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10
            }}>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke="#000" strokeWidth="3" strokeLinecap="square" /><rect x="7" y="7" width="10" height="10" stroke="#000" strokeWidth="3" strokeLinecap="square" /></svg>
            </button>
          )}
        </div>
        
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#0A0A0A', borderRadius: 24, padding: '20px', border: '2px solid #222' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="TITLE (e.g. SCANNED BILL)" style={{
          width: '100%', fontSize: 18, fontWeight: 900, color: '#fff',
          border: 'none', background: 'transparent', outline: 'none', marginBottom: 16,
          fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5
        }} />

        <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>🤖 ITEMS EXTRACTED (UNIT RATES)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {items.map(item => <ItemRow key={item.id} item={item} onDelete={handleDeleteItem} onNameChange={handleNameChange} onPriceChange={handlePriceChange} onQuantityChange={handleQuantityChange} />)}
        </div>
        <button onClick={() => { nextId++; setItems(p => [...p, { id: nextId, name: '', price: 0, quantity: 1 }]) }} className="tap-scale" style={{ background: '#111', border: '2px dashed #444', color: '#00F0FF', borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: 'pointer', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', textTransform: 'uppercase', letterSpacing: 1 }}>
          + ADD MANUAL ITEM
        </button>
      </div>

      <div style={{ background: '#0A0A0A', borderRadius: 24, padding: '20px', border: '2px solid #222' }}>
        <FriendSelector friends={friends.map(f => ({ ...f, id: f.friend_id || f.id }))} selectedFriends={selectedFriends} toggle={toggleFriend} totalAmount={total} includeMe={includeMe} toggleMe={() => setIncludeMe(!includeMe)} />
      </div>

      <div style={{ background: '#00F0FF', borderRadius: 24, padding: '24px', border: '3px solid #000', boxShadow: '4px 6px 0px #222', color: '#000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL</span>
          <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>₹{total}</span>
        </div>
        <button onClick={generate} disabled={loading} className="tap-scale" style={{
          width: '100%', padding: '20px', background: '#000', color: '#00F0FF',
          border: 'none', borderRadius: 16, fontSize: 18, fontWeight: 900, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 2,
          opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'GENERATING...' : 'GENERATE 🚀'}
        </button>
      </div>
    </div>
  )
}
