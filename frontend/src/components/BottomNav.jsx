import { NavLink } from 'react-router-dom'

const navItems = [
  {
    to: '/',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
          stroke={active ? '#2AB876' : '#aaa'} strokeWidth="2"
          fill={active ? 'rgba(42,184,118,0.15)' : 'none'} />
        <path d="M9 21V12h6v9" stroke={active ? '#2AB876' : '#aaa'} strokeWidth="1.8" />
      </svg>
    )
  },
  {
    to: '/bills',
    label: 'Bills',
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <rect x="4" y="3" width="16" height="18" rx="3"
          stroke={active ? '#2AB876' : '#aaa'} strokeWidth="2"
          fill={active ? 'rgba(42,184,118,0.15)' : 'none'} />
        <path d="M8 8h8M8 12h8M8 16h5"
          stroke={active ? '#2AB876' : '#aaa'} strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  { to: '/generate', label: 'Scan', isFAB: true },
  {
    to: '/pay',
    label: 'Pay',
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="14" rx="3"
          stroke={active ? '#2AB876' : '#aaa'} strokeWidth="2"
          fill={active ? 'rgba(42,184,118,0.15)' : 'none'} />
        <path d="M2 10h20" stroke={active ? '#2AB876' : '#aaa'} strokeWidth="2" />
        <rect x="6" y="14" width="4" height="2" rx="1" fill={active ? '#2AB876' : '#aaa'} />
      </svg>
    )
  },
  {
    to: '/profile',
    label: 'You',
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"
          stroke={active ? '#2AB876' : '#aaa'} strokeWidth="2"
          fill={active ? 'rgba(42,184,118,0.15)' : 'none'} />
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
          stroke={active ? '#2AB876' : '#aaa'} strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      height: 68,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {navItems.map(item => {
        if (item.isFAB) {
          return (
            <NavLink key={item.to} to={item.to}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', flex: 1 }}>
              {({ isActive }) => (
                <>
                  <div className="fab-pulse tap-scale" style={{
                    width: 58, height: 58,
                    background: 'linear-gradient(135deg, #2AB876 0%, #00d4aa 100%)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: -22,
                    border: '3px solid #F5F3EE',
                  }}>
                    <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"
                        stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                      <rect x="7" y="7" width="10" height="10" rx="2" stroke="#fff" strokeWidth="2" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 10, color: isActive ? '#2AB876' : '#aaa', fontWeight: 700, letterSpacing: 0.3 }}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        }
        return (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', flex: 1, paddingBottom: 2 }}
            className="tap-scale">
            {({ isActive }) => (
              <>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'rgba(42,184,118,0.1)' : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  {item.icon(isActive)}
                </div>
                <span style={{ fontSize: 10, color: isActive ? '#2AB876' : '#aaa', fontWeight: isActive ? 700 : 500, letterSpacing: 0.2 }}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
