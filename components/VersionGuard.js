'use client'

import { useEffect } from 'react'

const MINE = process.env.NEXT_PUBLIC_BUILD_ID || 'dev'

// A tab (or the app) left open for hours keeps running the OLD code in memory, so fixed bugs seem to come back.
// When the person returns to it, ask the server for the newest build id and reload once if it changed.
export default function VersionGuard() {
  useEffect(() => {
    if (MINE === 'dev') return
    let hiddenAt = document.hidden ? Date.now() : 0
    let busy = false
    async function check() {
      if (busy) return
      busy = true
      try {
        const r = await fetch('/api/version', { cache: 'no-store' })
        const d = await r.json()
        if (d && d.id && d.id !== 'dev' && d.id !== MINE) {
          const el = document.activeElement
          const typing = el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)
          if (!typing) window.location.reload()
        }
      } catch (e) {}
      busy = false
    }
    function onVis() {
      if (document.hidden) { hiddenAt = Date.now(); return }
      if (hiddenAt && Date.now() - hiddenAt > 30000) check()
      hiddenAt = 0
    }
    function onShow(e) { if (e.persisted) check() }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pageshow', onShow)
    const t = setTimeout(check, 4000)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pageshow', onShow)
      clearTimeout(t)
    }
  }, [])
  return null
}
