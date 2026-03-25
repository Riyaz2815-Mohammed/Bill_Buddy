import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import client from '../api/client'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const { setToken } = useStore()
  const navigate = useNavigate()

  // Form State
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    try {
      if (isLogin) {
        if (!phone || !password) {
          setLoading(false)
          setErrorMsg('ENTER PHONE/USERNAME AND PASSWORD 🛑')
          return
        }
        
        const res = await client.post('/auth/login', {
          identifier: phone,
          password: password
        })
        
        setToken(res.data.access_token, res.data.user)
        navigate('/')
        
      } else {
        if (!phone || !password || !name || !age) {
          setLoading(false)
          setErrorMsg('FILL REQUIRED FIELDS 🛑')
          return
        }

        const res = await client.post('/auth/signup', {
          phone: phone,
          password: password,
          name: name,
          age: parseInt(age, 10),
          // Auto-generate a generic username under the hood since it's required by the DB
          username: `${name.split(' ')[0].toLowerCase()}${Math.floor(Math.random() * 1000)}`,
        })
        
        setToken(res.data.access_token, res.data.user)
        navigate('/')
      }
    } catch (err) {
      console.error("Auth error", err)
      setErrorMsg(err.response?.data?.detail || "SOMETHING WENT WRONG 💀")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', color: '#fff', padding: '40px 24px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* Header Art */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: '#CCFF00', border: '4px solid #000', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 6px 0px #333' }}>
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#000" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" /></svg>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -1, margin: '0 0 8px' }}>
            BILL BUDDY ⚡
          </h1>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
            {isLogin ? 'WELCOME BACK, LEGEND.' : 'CREATE YOUR PROFILE.'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {errorMsg && (
            <div style={{ background: '#FF00E5', color: '#000', padding: 12, borderRadius: 12, fontWeight: 900, textAlign: 'center', fontSize: 14, border: '2px solid #000' }}>
              {errorMsg}
            </div>
          )}

          {!isLogin && (
            <>
              <input 
                value={name} onChange={e => setName(e.target.value)} 
                placeholder="FULL NAME" required
                style={{
                  width: '100%', padding: '20px 24px', borderRadius: 16, background: '#111', border: '2px solid #333',
                  color: '#fff', fontSize: 16, fontWeight: 900, outline: 'none', textTransform: 'uppercase', fontFamily: 'Inter'
                }}
              />
              <input 
                type="number"
                value={age} onChange={e => setAge(e.target.value)} 
                placeholder="AGE" required
                style={{
                  width: '100%', padding: '20px 24px', borderRadius: 16, background: '#111', border: '2px solid #333',
                  color: '#00F0FF', fontSize: 16, fontWeight: 900, outline: 'none', textTransform: 'uppercase', fontFamily: 'Inter'
                }}
              />
            </>
          )}

          <input 
            type={isLogin ? 'text' : 'tel'}
            value={phone} onChange={e => setPhone(e.target.value)} 
            placeholder={isLogin ? "PHONE NUMBER" : "PHONE NUMBER"} required
            style={{
              width: '100%', padding: '20px 24px', borderRadius: 16, background: '#111', border: '2px solid #333',
              color: '#fff', fontSize: 16, fontWeight: 900, outline: 'none', fontFamily: 'Inter', textTransform: isLogin ? 'uppercase' : 'none'
            }}
          />
          
          <input 
            type="password"
            value={password} onChange={e => setPassword(e.target.value)} 
            placeholder="PASSWORD" required
            style={{
              width: '100%', padding: '20px 24px', borderRadius: 16, background: '#111', border: '2px solid #333',
              color: '#fff', fontSize: 16, fontWeight: 900, outline: 'none', fontFamily: 'Inter'
            }}
          />

          {!isLogin && (
             <p style={{ fontSize: 12, color: '#888', fontWeight: 800, textAlign: 'center', marginTop: 8, textTransform: 'uppercase' }}>
              AVATAR, DOB, & UPI CAN BE ADDED LATER ✌️
            </p>
          )}

          <button type="submit" disabled={loading} className="tap-scale" style={{
            width: '100%', padding: '20px', background: '#CCFF00', color: '#000',
            border: 'none', borderRadius: 16, fontSize: 18, fontWeight: 900, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 2,
            marginTop: 16, boxShadow: '4px 6px 0px #222', opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN 🚀' : 'SIGN UP ⚡')}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setPassword(''); }} style={{
            background: 'none', border: 'none', color: '#888', fontSize: 14, fontWeight: 900, cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Inter'
          }}>
            {isLogin ? 'NEW HERE? CREATE ACCOUNT' : 'ALREADY HAVE AN ACCOUNT? LOGIN'}
          </button>
        </div>

      </div>
    </div>
  )
}
