import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // 1. Android / Chrome PWA detection
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // 2. iOS Detection (iOS doesn't support beforeinstallprompt)
    const ua = window.navigator.userAgent
    const webkit = !!ua.match(/WebKit/i)
    const isIPad = !!ua.match(/iPad/i)
    const isIPhone = !!ua.match(/iPhone/i)
    const isIOSMobile = isIPad || isIPhone
    const isSafari = isIOSMobile && webkit && !ua.match(/CriOS/i)
    
    // Check if app is NOT already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone

    if (isSafari && !isStandalone) {
      setIsIOS(true)
      setShowPrompt(true)
    }

    // 3. Cleanup on successful install
    const handleAppInstalled = () => {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const dismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="bounce-in" style={{
      position: 'fixed', bottom: 100, left: 16, right: 16, zIndex: 9999,
      background: '#CCFF00', border: '3px solid #000', borderRadius: 24, padding: 20,
      boxShadow: '4px 6px 0px #1a1a1a', display: 'flex', flexDirection: 'column', gap: 12
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: 1 }}>INSTALL BILL BUDDY 📲</h3>
        <button onClick={dismiss} className="tap-scale" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="#000" strokeWidth="3" strokeLinecap="square" /></svg>
        </button>
      </div>
      
      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#222' }}>
        Install our native app to your homescreen for instant access to bill splitting!
      </p>

      {isIOS ? (
        <div style={{ background: '#000', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 15V3m0 0L8.5 6.5M12 3l3.5 3.5M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" /></svg>
          <span style={{ fontSize: 13, fontWeight: 900 }}>Tap Share, then 'Add to Homescreen'</span>
        </div>
      ) : (
        <button onClick={handleInstallClick} className="tap-scale" style={{
          width: '100%', background: '#000', color: '#CCFF00', border: 'none', borderRadius: 12, padding: '14px', fontSize: 16, fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1
        }}>
          INSTALL NOW
        </button>
      )}
    </div>
  )
}
