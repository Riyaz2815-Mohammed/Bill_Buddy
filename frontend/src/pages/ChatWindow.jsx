import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import client from '../api/client'

export default function ChatWindow() {
  const { id } = useParams() // This is the friend's user_id
  const navigate = useNavigate()
  const { user } = useStore()
  
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [friend, setFriend] = useState(null)
  const bottomRef = useRef(null)

  const fetchMessages = async () => {
    try {
      const res = await client.get(`/chats/${user.id}/${id}`)
      setMessages(res.data.messages)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (e) {
      console.error(e)
    }
  }

  const fetchFriendInfo = async () => {
    try {
      const res = await client.get(`/auth/profile/${id}`)
      setFriend(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchFriendInfo()
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [id])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    
    // Optimistic UI updates
    const tempMsg = {
      id: Date.now().toString(),
      sender_id: user.id,
      content: inputText,
      created_at: new Date().toISOString()
    }
    setMessages(p => [...p, tempMsg])
    setInputText('')
    
    try {
      await client.post('/chats/send', {
        sender_id: user.id,
        receiver_id: id,
        content: tempMsg.content
      })
      fetchMessages()
    } catch (err) {
      console.error('Failed to send', err)
    }
  }

  return (
    <div style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff' }}>
      
      {/* HEADER */}
      <div style={{ padding: '24px 16px 16px', borderBottom: '2px solid #333', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate(-1)} className="tap-scale brutal-card" style={{ 
          width: 44, height: 44, borderRadius: 12, background: '#111', border: '2px solid #333', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 
        }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" />
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {friend && (
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#CCFF00', border: '2px solid #000', padding: 2 }}>
              <img src={friend.avatar_base64 ? `data:image/jpeg;base64,${friend.avatar_base64}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.avatar_seed}`} alt="" width={36} height={36} style={{ borderRadius: '50%', background: '#222' }} />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{friend?.name || 'LOADING...'}</h1>
            <p style={{ margin: 0, fontSize: 11, color: '#00F0FF', fontWeight: 900 }}>⚡ ONLINE</p>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(msg => {
          const isMe = msg.sender_id === user.id
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '12px 16px', borderRadius: 20,
                border: '2px solid #000', boxShadow: '2px 3px 0px #1a1a1a',
                background: isMe ? '#CCFF00' : '#FF00E5',
                color: isMe ? '#000' : '#fff',
                fontWeight: 800, fontSize: 14, lineHeight: 1.4,
                borderBottomRightRadius: isMe ? 4 : 20,
                borderBottomLeftRadius: isMe ? 20 : 4,
              }}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div style={{ padding: '16px', borderTop: '2px solid #333', background: '#0A0A0A', paddingBottom: 32 }}>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12 }}>
          <input 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="TYPE MESSAGE..." 
            style={{
              flex: 1, background: '#111', border: '2px solid #444', color: '#fff',
              padding: '16px 20px', borderRadius: 24, fontSize: 15, fontWeight: 700, outline: 'none'
            }} 
          />
          <button type="submit" disabled={!inputText.trim()} className="tap-scale" style={{
            width: 56, height: 56, borderRadius: '50%', background: inputText.trim() ? '#CCFF00' : '#333',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'default',
            boxShadow: inputText.trim() ? '2px 4px 0px #000' : 'none', flexShrink: 0
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={inputText.trim() ? '#000' : '#888'} strokeWidth="2.5" strokeLinejoin="round" /></svg>
          </button>
        </form>
      </div>
    </div>
  )
}
