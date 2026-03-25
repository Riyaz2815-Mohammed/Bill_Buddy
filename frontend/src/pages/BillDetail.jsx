import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import client from '../api/client'
import QRCode from 'react-qr-code'

export default function BillDetail() {
  const { id } = useParams()
  const { user, bills, setBills } = useStore()
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

  const incrementItem = (itemId) => {
    if (me?.paid) return
    const item = items.find(i => i.id === itemId)
    const currentCount = localSelected.filter(id => id === itemId).length
    if (item && currentCount < (item.quantity || 1)) {
      setLocalSelected(prev => [...prev, itemId])
    }
  }

  const decrementItem = (itemId) => {
    if (me?.paid) return
    setLocalSelected(prev => {
      const arr = [...prev]
      const idx = arr.indexOf(itemId)
      if (idx > -1) arr.splice(idx, 1)
      return arr
    })
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

  const deleteBill = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this bill? 💀")) return
    try {
      await client.delete(`/bills/${id}`)
      // Optimistically remove from Zustand store so Bills list updates immediately
      setBills((bills || []).filter(b => b.id !== id))
      navigate('/bills', { replace: true })
    } catch (err) {
      alert("Failed to delete bill")
    }
  }

  const markAsSettled = async () => {
    if (!window.confirm("Mark this entire bill as SETTLED? ✅")) return
    try {
      await client.patch(`/bills/${id}/status?status=paid`)
      // Optimistically update store
      setBills((bills || []).map(b => b.id === id ? { ...b, status: 'paid' } : b))
      await fetchBill()
    } catch (err) {
      alert("Failed to update status")
    }
  }

  const calculateTotal = (selectedItemsArr) => {
    let cost = 0
    // Safely iterate allowing duplicates for quantities
    ;((selectedItemsArr && Array.isArray(selectedItemsArr)) ? selectedItemsArr : []).forEach(itemId => {
      const item = items.find(i => i.id === itemId)
      if (item) {
        cost += Number(item.price) || 0
      }
    })
    return cost.toFixed(2)
  }

  const myTotal = calculateTotal(localSelected)
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
            <div style={{ background: '#fff', padding: 16, display: 'inline-block', borderRadius: 16, marginBottom: 16 }}>
              <QRCode value={billUrl} size={150} />
            </div>
            <button onClick={() => window.open(`whatsapp://send?text=Pay your share for ${encodeURIComponent(bill.title)} on Bill Buddy! 💸 %0A%0A${encodeURIComponent(billUrl)}`, '_blank')} className="tap-scale" style={{ width: '100%', background: '#25D366', color: '#fff', border: '3px solid #000', borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              SHARE WITH WHATSAPP
            </button>
            <p style={{ marginTop: 16, fontSize: 12, color: '#888', fontWeight: 800 }}>{billUrl}</p>
          </div>
        )}

        {/* ITEMS SELECTION MATRIX */}
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16, textTransform: 'uppercase', color: '#00F0FF' }}>
          {isCreator ? 'ITEMS ON THIS BILL' : 'WHAT DID YOU CHOOSE?'}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {items.map(item => {
            const count = localSelected.filter(id => id === item.id).length
            const isSelected = count > 0
            const maxQty = item.quantity || 1
            const globalClaims = members.reduce((sum, m) => sum + (m.selected_items?.filter(id => id === item.id).length || 0), 0)
            
            return (
              <div 
                key={item.id} 
                style={{
                  background: isSelected ? '#CCFF00' : '#111',
                  color: isSelected ? '#000' : '#fff',
                  border: `2px solid ${isSelected ? '#CCFF00' : '#333'}`,
                  padding: '16px 20px', borderRadius: 16, transition: 'all 0.2s', opacity: me?.paid ? 0.6 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, textTransform: 'uppercase' }}>{item.name}</h3>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, background: isSelected ? '#000' : '#333', color: isSelected ? '#CCFF00' : '#888', padding: '2px 8px', borderRadius: 4 }}>
                        ₹{item.price} / each (Max: {maxQty})
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>₹{(item.price * count).toFixed(2)}</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${isSelected ? '#00000033' : '#333'}` }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? '#555' : '#888' }}>
                    {globalClaims} / {maxQty} CLAIMED GLOBALLY
                  </span>
                  
                  {!isCreator && !me?.paid && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={(e) => { e.stopPropagation(); decrementItem(item.id) }} style={{ width: 32, height: 32, borderRadius: 16, border: `2px solid ${isSelected ? '#000' : '#888'}`, background: 'transparent', color: isSelected ? '#000' : '#888', fontSize: 18, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                      <span style={{ fontSize: 16, fontWeight: 900, width: 20, textAlign: 'center' }}>{count}</span>
                      <button onClick={(e) => { e.stopPropagation(); incrementItem(item.id) }} disabled={count >= maxQty} style={{ width: 32, height: 32, borderRadius: 16, border: 'none', background: isSelected ? '#000' : '#CCFF00', color: isSelected ? '#CCFF00' : '#000', fontSize: 18, fontWeight: 900, cursor: count >= maxQty ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: count >= maxQty ? 0.5 : 1 }}>+</button>
                    </div>
                  )}
                </div>
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
                  {m.paid ? 'SETTLED' : `OWES ₹${m.user_id === user.id ? myTotal : calculateTotal(m.selected_items || [])}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CREATOR ADMIN CONTROLS */}
        {isCreator && (
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bill.status !== 'paid' && (
              <button onClick={markAsSettled} className="tap-scale" style={{ width: '100%', padding: '16px', background: '#CCFF00', color: '#000', border: '3px solid #000', borderRadius: 16, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '4px 6px 0px #222' }}>
                MARK BILL AS SETTLED ✅
              </button>
            )}
            <button onClick={deleteBill} className="tap-scale" style={{ width: '100%', padding: '16px', background: 'transparent', color: '#FF00E5', border: '2px dashed #FF00E5', borderRadius: 16, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>
              DELETE BILL 🗑️
            </button>
          </div>
        )}

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
