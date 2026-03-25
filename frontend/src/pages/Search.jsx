import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import useStore from '../store/useStore'

export default function Search() {
  const navigate = useNavigate()
  const { user, friends, setFriends } = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (val) => {
    setQuery(val)
    if (val.length < 2) return setResults([])
    
    setLoading(true)
    try {
      const res = await client.get(`/friends/search/${val}`)
      // filter out self and people already friends
      const friendIds = friends.map(f => f.friend_id || f.id)
      const filtered = res.data.users.filter(u => u.id !== user.id && !friendIds.includes(u.id))
      setResults(filtered)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const addFriend = async (friendId) => {
    try {
      await client.post('/friends/add', { user_id: user.id, friend_id: friendId })
      // refetch friends
      const res = await client.get(`/friends/${user.id}`)
      setFriends(res.data.friends)
      // remove from results
      setResults(p => p.filter(u => u.id !== friendId))
    } catch (e) {
      console.error(e)
      alert("Failed to add friend")
    }
  }

  return (
    <div style={{ flex: 1, padding: '32px 16px', background: '#000', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="tap-scale brutal-card" style={{ width: 44, height: 44, borderRadius: 12, background: '#111', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>ADD FRIENDS 🤝</h1>
      </div>

      <div style={{ background: '#0A0A0A', borderRadius: 24, padding: '20px', border: '2px solid #222', marginBottom: 24 }}>
        <input 
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="SEARCH USERNAME..." 
          style={{
            width: '100%', fontSize: 18, fontWeight: 900, color: '#fff',
            border: 'none', background: 'transparent', outline: 'none',
            fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5
          }} 
        />
      </div>

      {loading && <p style={{ color: '#00F0FF', fontWeight: 900, textAlign: 'center' }}>SEARCHING...</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results.map(u => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', padding: '12px 16px', borderRadius: 16, border: '1px solid #333' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #CCFF00', padding: 2 }}>
                {u.avatar_base64 ? (
                  <img src={`data:image/jpeg;base64,${u.avatar_base64}`} alt="" width={36} height={36} style={{ borderRadius: '50%', display: 'block', background: '#222', objectFit: 'cover' }} />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${u.avatar_seed}`} alt="" width={36} height={36} style={{ borderRadius: '50%', display: 'block', background: '#222' }} />
                )}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 900, fontSize: 16, textTransform: 'uppercase' }}>{u.name}</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: '#00F0FF' }}>@{u.username}</p>
              </div>
            </div>
            <button onClick={() => addFriend(u.id)} className="tap-scale" style={{ background: '#CCFF00', color: '#000', border: 'none', borderRadius: 12, padding: '8px 16px', fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>
              ADD
            </button>
          </div>
        ))}
        {!loading && query.length >= 2 && results.length === 0 && (
          <p style={{ color: '#888', fontWeight: 800, textAlign: 'center' }}>NO USERS FOUND</p>
        )}
      </div>
    </div>
  )
}
