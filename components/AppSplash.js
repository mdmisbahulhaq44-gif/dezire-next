'use client'

import { useEffect } from 'react'

// Inside the HEAVEN Android app: keep the splash screen until the page has really loaded, then fade it away.
export default function AppSplash() {
  useEffect(() => {
    const hide = () => {
      try {
        const s = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SplashScreen
        if (s && s.hide) s.hide({ fadeOutDuration: 250 })
      } catch (e) {}
    }
    const go = () => requestAnimationFrame(() => requestAnimationFrame(hide))
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
  }, [])
  return null
}
