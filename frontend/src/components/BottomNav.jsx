import { NavLink } from 'react-router-dom'

const activeColor = '#CCFF00' // Neon Yellow-Green
const inactiveColor = '#555555'

const navItems = [
  {
    to: '/',
    label: 'HOME',
    icon: (active) => (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={active ? activeColor : inactiveColor} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" stroke={active ? activeColor : inactiveColor} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    to: '/bills',
    label: 'BILLS',
    icon: (active) => (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="16" rx="4" stroke={active ? activeColor : inactiveColor} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M8 9h8M8 13h8M8 17h4" stroke={active ? activeColor : inactiveColor} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  },
  { to: '/generate', label: 'PAY', isFAB: true },
  {
    to: '/pay',
    label: 'SEND',
    icon: (active) => (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={active ? activeColor : inactiveColor} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    to: '/profile',
    label: 'U',
    icon: (active) => (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="7" r="4" stroke={active ? activeColor : inactiveColor} strokeWidth="2.5" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke={active ? activeColor : inactiveColor} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  },
]

export default function BottomNav() {
  return (
    <div style={{ position: 'fixed', bottom: 16, left: 16, right: 16, display: 'flex', justifyContent: 'center', zIndex: 100, pointerEvents: 'none' }}>
      <nav className="glass-dark" style={{
        width: '100%',
        maxWidth: 400,
        height: 72,
        borderRadius: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        pointerEvents: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)'
      }}>
        {navItems.map(item => {
          if (item.isFAB) {
            return (
              <NavLink key={item.to} to={item.to}
                className="tap-scale"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', position: 'relative' }}>
                <div className="fab-neon" style={{
                  width: 64, height: 64,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: -28,
                  border: '4px solid #050505',
                }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke="#000" strokeWidth="2.5" strokeLinecap="square" />
                    <rect x="7" y="7" width="10" height="10" stroke="#000" strokeWidth="2.5" strokeLinecap="square" />
                  </svg>
                </div>
              </NavLink>
            )
          }
          return (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className="tap-scale"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', width: 64 }}>
              {({ isActive }) => (
                <>
                  <div style={{ transition: 'transform 0.2s', transform: isActive ? 'translateY(-2px)' : 'none' }}>
                    {item.icon(isActive)}
                  </div>
                  {isActive && (
                    <div style={{ width: 4, height: 4, borderRadius: 2, background: activeColor, position: 'absolute', bottom: 6 }} />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
