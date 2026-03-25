import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import client from '../api/client'
import QRCode from 'react-qr-code'

export default function BillDetail() {
  const { id } = useParams()
  const { user } = useStore()
  const navigate = useNavigate()
  
  const [billData, setBillData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [localSelected, setLocalSelected] = useState([])
  const [saving, setSaving] = useState(false)

  const fetchBill = async () => {
    try {
      const res = await client.get(`/bills/${id}`)
      setBillData(res.data)
      
      // Init local selection for the current user
      const me = res.data.members.find(m => m.user_id === user.id)
      if (me && me.selected_items) {
        setLocalSelected(me.selected_items)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBill()
  }, [id])

  if (loading || !billData) {
    return (
      <div style={{ flex: 1, background: '#000', color: '#00F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, textTransform: 'uppercase', height: '100vh' }}>
        LOADING DATA ⚡...
      </div>
    )
  }

  const { bill, items, members } = billData
  const isCreator = bill.created_by === user.id
  const me = members.find(m => m.user_id === user.id)
  
  // Get Creator's UPI ID for payment processing
  const creatorMember = members.find(m => m.user_id === bill.created_by)
  const creatorUpi = creatorMember?.user?.upi_ids?.[0] || 'upi@placeholder'

  const toggleItem = (itemId) => {
    if (me?.paid) return // locked if already paid
    setLocalSelected(prev => 
      prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]
    )
  }

  const saveSelection = async () => {
    if (saving) return
    setSaving(true)
    try {
      await client.patch(`/bills/${id}/select_items/${user.id}`, { item_ids: localSelected })
      await fetchBill() // refresh global counts
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Calculate dynamic split for current user based on currently saved `members` state
  const calculateMyTotal = () => {
    let exactCost = 0
    localSelected.forEach(itemId => {
      const item = items.find(i => i.id === itemId)
      if (item) {
        // How many people saved this item in the DB?
        let sharers = members.filter(m => m.selected_items?.includes(itemId)).length
        
        // If the user selected it locally but hasn't saved, ensure they are counted at least once
        if (sharers === 0) sharers = 1 
        
        exactCost += (item.price * item.quantity) / sharers
      }
    })
    return exactCost.toFixed(2)
  }

  const myTotal = calculateMyTotal()
  const billUrl = `${window.location.origin}/bill/${id}`

  return (
    <div style={{ flex: 1, minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', paddingBottom: 100 }}>
      
      {/* HEADER */}
      <div style={{ padding: '24px 24px', borderBottom: '2px solid #333', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#00F0FF', fontSize: 24, cursor: 'pointer', marginRight: 16 }}>
          ←
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: -1 }}>{bill.title}</h1>
          <p style={{ color: '#888', margin: 0, fontSize: 12, fontWeight: 800 }}>TOTAL: ₹{bill.total}</p>
        </div>
        <div style={{ padding: '6px 12px', background: bill.type === 'scanned' ? '#CCFF00' : '#FF00E5', color: '#000', borderRadius: 8, fontWeight: 900, fontSize: 10, textTransform: 'uppercase' }}>
          {bill.type}
        </div>
      </div>

      <div style={{ padding: 24 }}>
        
        {/* CREATOR VIEW: QR CODE & STATUS */}
        {isCreator && (
          <div style={{ background: '#111', padding: 24, borderRadius: 24, border: '2px solid #333', marginBottom: 24, textAlign: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, margin: '0 0 16px', color: '#CCFF00' }}>HAVE FRIENDS SCAN TO JOIN</h2>
            <div style={{ background: '#fff', padding: 16, display: 'inline-block', borderRadius: 16 }}>
              <QRCode value={billUrl} size={150} />
            </div>
            <p style={{ marginTop: 16, fontSize: 12, color: '#888', fontWeight: 800 }}>{billUrl}</p>
          </div>
        )}

        {/* ITEMS SELECTION MATRIX */}
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16, textTransform: 'uppercase', color: '#00F0FF' }}>
          {isCreator ? 'ITEMS ON THIS BILL' : 'WHAT DID YOU CHOOSE?'}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {items.map(item => {
            const isSelected = localSelected.includes(item.id)
            const sharers = members.filter(m => m.selected_items?.includes(item.id)).length
            return (
              <div 
                key={item.id} 
                onClick={() => !isCreator && toggleItem(item.id)}
                style={{
                  background: isSelected ? '#CCFF00' : '#111',
                  color: isSelected ? '#000' : '#fff',
                  border: `2px solid ${isSelected ? '#CCFF00' : '#333'}`,
                  padding: '16px 20px', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: isCreator ? 'default' : 'pointer', transition: 'all 0.2s', opacity: me?.paid ? 0.6 : 1
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, textTransform: 'uppercase' }}>{item.name}</h3>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, background: isSelected ? '#000' : '#333', color: isSelected ? '#CCFF00' : '#888', padding: '2px 8px', borderRadius: 4 }}>
                      ₹{item.price} {item.quantity > 1 ? `x${item.quantity}` : ''}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: isSelected ? '#555' : '#888' }}>
                      {sharers} SHARING
                    </span>
                  </div>
                </div>
                {!isCreator && (
                  <div style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${isSelected ? '#000' : '#555'}`, background: isSelected ? '#000' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <div style={{ width: 10, height: 10, borderRadius: 5, background: '#CCFF00' }} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* SAVE SELECTION BUTTON (FRIENDS) */}
        {!isCreator && !me?.paid && (
          <button onClick={saveSelection} disabled={saving} style={{
            width: '100%', padding: '16px', background: '#333', color: '#fff', border: 'none', borderRadius: 16,
            fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24,
            cursor: 'pointer', opacity: saving ? 0.7 : 1
          }}>
            {saving ? 'SAVING...' : 'CONFIRM SELECTION 💾'}
          </button>
        )}

        {/* MEMBERS STATUS CARD */}
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16, textTransform: 'uppercase', color: '#FF00E5' }}>SQUAD STATUS</h2>
        <div style={{ background: '#111', borderRadius: 24, border: '2px solid #333', overflow: 'hidden' }}>
          {members.map((m, i) => (
            <div key={m.id} style={{ padding: 16, display: 'flex', alignItems: 'center', borderBottom: i < members.length - 1 ? '1px solid #222' : 'none' }}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.avatar_seed || 'default'}`} alt="avatar" style={{ width: 40, height: 40, borderRadius: 20, background: '#FF00E5' }} />
              <div style={{ marginLeft: 16, flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 900, textTransform: 'uppercase' }}>
                  {m.user_id === user.id ? 'YOU' : m.user?.name}
                  {m.user_id === bill.created_by && ' 👑'}
                </h4>
                <p style={{ margin: 0, fontSize: 12, color: m.paid ? '#CCFF00' : '#888', fontWeight: 800 }}>
                  {m.paid ? 'SETTLED' : `OWES ₹${m.user_id === user.id ? myTotal : parseFloat(m.amount_owed).toFixed(2)}`}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* FIXED PAYMENT BAR FOR NON-CREATORS */}
      {!isCreator && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#000', padding: 24, borderTop: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: '#888', fontWeight: 800, textTransform: 'uppercase' }}>YOUR SHARE</p>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#00F0FF' }}>₹{myTotal}</h2>
          </div>
          
          <a
            href={me?.paid ? '#' : `upi://pay?pa=${creatorUpi}&pn=BillBuddy&am=${myTotal}&cu=INR`}
            onClick={(e) => {
               if (me?.paid) e.preventDefault()
               // You can add logic here to mark as paid if we assume they clicked it!
               if (!me?.paid && myTotal > 0) {
                 client.patch(`/bills/${id}/pay/${user.id}`).then(() => fetchBill())
               }
            }}
            style={{
              padding: '16px 32px', background: me?.paid ? '#333' : '#CCFF00', color: me?.paid ? '#888' : '#000',
              borderRadius: 16, fontSize: 16, fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase',
              letterSpacing: 1, boxShadow: me?.paid ? 'none' : '4px 6px 0px #333'
            }}
          >
            {me?.paid ? 'PAID 💸' : 'PAY UPI ⚡'}
          </a>
        </div>
      )}
    </div>
  )
}
