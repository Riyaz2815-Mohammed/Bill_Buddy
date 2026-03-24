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
    <button onClick={() => navigate(-1)} className="tap-scale brutal-card" style={{ width: 44, height: 44, borderRadius: 12, background: '#111', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </button>
  )
}

function FriendSelector({ friends, selectedFriends, toggle, totalAmount }) {
  const personsCount = selectedFriends.length + 1 // including 'you'
  const splitAmount = totalAmount ? (totalAmount / personsCount).toFixed(2) : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 16px' }}>
        <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>SPLIT WITH 👥</p>
        <p style={{ fontSize: 12, fontWeight: 900, color: '#00F0FF', margin: 0, background: '#00F0FF22', padding: '4px 10px', borderRadius: 8 }}>{personsCount} PPL</p>
      </div>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }} className="scroll-hide">
        {/* 'You' Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ borderRadius: '50%', border: '3px solid #CCFF00', padding: 2 }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#CCFF00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: 14 }}>YOU</div>
          </div>
          <span style={{ fontSize: 13, color: '#CCFF00', fontWeight: 900 }}>₹{splitAmount}</span>
        </div>
        
        {friends.map(f => {
          const sel = selectedFriends.includes(f.id)
          return (
            <button key={f.id} onClick={() => toggle(f.id)} className="tap-scale" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0,
              opacity: sel ? 1 : 0.4, transition: 'opacity 0.15s',
            }}>
              <div style={{ borderRadius: '50%', border: sel ? '3px solid #CCFF00' : '3px solid #333', padding: 2, transition: 'border 0.15s' }}>
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${f.avatar_seed}`} alt={f.name} width={50} height={50} style={{ borderRadius: '50%', display: 'block', background: '#222' }} />
              </div>
              <span style={{ fontSize: 13, color: sel ? '#CCFF00' : '#888', fontWeight: sel ? 900 : 700, textTransform: 'uppercase' }}>
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
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100, background: '#000000', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '32px 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <BackBtn navigate={navigate} />
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>NEW BILL 🧾</h1>
        </div>
        
        {/* Tab switcher */}
        <div style={{ background: '#111', borderRadius: 20, padding: 6, display: 'flex', border: '2px solid #222' }}>
          {['manual', 'scan'].map(t => (
            <button key={t} onClick={() => setTab(t)} className="tap-scale" style={{
              flex: 1, padding: '14px 0', borderRadius: 14, border: 'none',
              background: tab === t ? '#CCFF00' : 'transparent',
              color: tab === t ? '#000' : '#888',
              fontWeight: 900, fontSize: 14, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: 1
            }}>
              {t === 'manual' ? '✏️ MANUAL' : '📸 SCAN'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#0A0A0A', borderRadius: 24, padding: '20px', border: '2px solid #222' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="TITLE (e.g. PIZZA NIGHT)" style={{
          width: '100%', fontSize: 18, fontWeight: 900, color: '#fff',
          border: 'none', background: 'transparent', outline: 'none',
          fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5
        }} />
      </div>

      <div style={{ background: '#0A0A0A', borderRadius: 24, padding: '20px', border: '2px solid #222' }}>
        <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>ITEMS 🍔</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {items.map(item => <ItemRow key={item.id} item={item} onDelete={deleteItem} onNameChange={updateName} onPriceChange={updatePrice} />)}
        </div>
        <button onClick={addItem} className="tap-scale" style={{ background: '#111', border: '2px dashed #444', color: '#00F0FF', borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: 'pointer', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', textTransform: 'uppercase', letterSpacing: 1 }}>
          + ADD ITEM
        </button>
      </div>

      <div style={{ background: '#0A0A0A', borderRadius: 24, padding: '20px', border: '2px solid #222' }}>
        <FriendSelector friends={friends} selectedFriends={selectedFriends} toggle={toggleFriend} totalAmount={total} />
      </div>

      {/* Total + Generate */}
      <div style={{ background: '#CCFF00', borderRadius: 24, padding: '24px', border: '3px solid #000', boxShadow: '4px 6px 0px #222', color: '#000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL</span>
          <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>₹{total}</span>
        </div>
        <button onClick={() => setBillId('bill-' + Date.now())} className="tap-scale" style={{
          width: '100%', padding: '20px', background: '#000', color: '#CCFF00',
          border: 'none', borderRadius: 16, fontSize: 18, fontWeight: 900, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 2
        }}>
          GENERATE 🚀
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 10 }}>
        <div style={{
          width: '100%', maxWidth: 360, height: 420, borderRadius: 32, overflow: 'hidden',
          background: '#111', position: 'relative', border: '2px solid #333'
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
            <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <div style={{ width: 64, height: 64, border: '6px solid #222', borderTop: '6px solid #00F0FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#00F0FF', fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>EXTRACTING... 🤖</p>
            </div>
          )}
          {/* Viewfinder overlay */}
          {!scanning && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', border: 'rgba(0,0,0,0.6) solid 50px' }}>
              <div style={{ width: '100%', height: '100%', border: '2px dashed #00F0FF', borderRadius: 16 }}></div>
            </div>
          )}
        </div>
        
        {!scanning && (
          <button onClick={capture} className="tap-scale" style={{
            width: 80, height: 80, borderRadius: '50%', background: '#00F0FF', border: '6px solid #000',
            boxShadow: '0 0 0 4px #00F0FF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke="#000" strokeWidth="3" strokeLinecap="square" /><rect x="7" y="7" width="10" height="10" stroke="#000" strokeWidth="3" strokeLinecap="square" /></svg>
          </button>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#0A0A0A', borderRadius: 24, padding: '20px', border: '2px solid #222' }}>
        <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>🤖 ITEMS EXTRACTED</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {items.map(item => <ItemRow key={item.id} item={item} onDelete={deleteItem} onPriceChange={updatePrice} />)}
        </div>
        <button onClick={() => { nextId++; setItems(p => [...p, { id: nextId, name: '', price: 0, quantity: 1 }]) }} className="tap-scale" style={{ background: '#111', border: '2px dashed #444', color: '#00F0FF', borderRadius: 12, fontSize: 14, fontWeight: 900, cursor: 'pointer', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', textTransform: 'uppercase', letterSpacing: 1 }}>
          + ADD MANUAL ITEM
        </button>
      </div>

      <div style={{ background: '#0A0A0A', borderRadius: 24, padding: '20px', border: '2px solid #222' }}>
        <FriendSelector friends={friends} selectedFriends={selectedFriends} toggle={toggleFriend} totalAmount={total} />
      </div>

      <div style={{ background: '#00F0FF', borderRadius: 24, padding: '24px', border: '3px solid #000', boxShadow: '4px 6px 0px #222', color: '#000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL</span>
          <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>₹{total}</span>
        </div>
        <button onClick={() => setBillId('bill-' + Date.now())} className="tap-scale" style={{
          width: '100%', padding: '20px', background: '#000', color: '#00F0FF',
          border: 'none', borderRadius: 16, fontSize: 18, fontWeight: 900, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 2
        }}>
          GENERATE 🚀
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
    <div className="bounce-in" style={{ background: '#111', borderRadius: 32, padding: 32, marginTop: 16, textAlign: 'center', border: '2px solid #333' }}>
      <p style={{ color: '#CCFF00', fontWeight: 900, fontSize: 20, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>🎉 INSTANT BILL!</p>
      <div style={{ background: '#fff', borderRadius: 24, padding: 24, display: 'inline-block', border: '4px solid #000' }}>
        <QRCode value={link} size={160} />
      </div>
      <p style={{ color: '#666', fontSize: 14, marginTop: 16, marginBottom: 24, fontWeight: 800, textTransform: 'uppercase' }}>SHARE TO GET PAID</p>
      <button onClick={share} className="tap-scale" style={{
        background: '#FF00E5', color: '#fff', border: '3px solid #000',
        borderRadius: 16, padding: '16px 32px', fontSize: 16, fontWeight: 900,
        cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 1, boxShadow: '3px 4px 0px #000'
      }}>
        🔗 SHARE LINK
      </button>
    </div>
  )
}
