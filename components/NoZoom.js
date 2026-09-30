'use client'

import { useEffect } from 'react'

// Last line of defence against hand zoom. The viewport tag and CSS
// touch-action already block pinch / double-tap zoom in most browsers;
// this also stops the ones that ignore them (iPhone Safari gesture events,
// multi-finger touchmove, ctrl+wheel / trackpad pinch on desktop).
export default function NoZoom() {
  useEffect(() => {
    const stop = e => e.preventDefault()
    const onTouchMove = e => { if (e.touches && e.touches.length > 1) e.preventDefault() }
    const onWheel = e => { if (e.ctrlKey) e.preventDefault() }

    document.addEventListener('gesturestart', stop, { passive: false })
    document.addEventListener('gesturechange', stop, { passive: false })
    document.addEventListener('gestureend', stop, { passive: false })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      document.removeEventListener('gesturestart', stop)
      document.removeEventListener('gesturechange', stop)
      document.removeEventListener('gestureend', stop)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('wheel', onWheel)
    }
  }, [])
  return null
}
