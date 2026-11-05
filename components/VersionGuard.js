'use client'

import { useEffect } from 'react'

const MINE = process.env.NEXT_PUBLIC_BUILD_ID || 'dev'

// A tab (or the app) left open for hours keeps running the OLD code in memory, so fixed bugs seem to come back.
// When the person returns to it, ask the server for the newest build id and reload once if it changed.
const DATA_STALE_MS = 30 * 60 * 1000 // 30 minutes: beyond this, product/price/settings data may be stale too

export default function VersionGuard() {
  useEffect(() => {
    if (MINE === 'dev') return
    let hiddenAt = document.hidden ? Date.now() : 0
    let busy = false
    function reloadUnlessTyping() {
      const el = document.activeElement
      const typing = el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)
      if (!typing) window.location.reload()
    }
    async function check() {
      if (busy) return
      busy = true
      try {
        const r = await fetch('/api/version', { cache: 'no-store' })
        const d = await r.json()
        if (d && d.id && d.id !== 'dev' && d.id !== MINE) reloadUnlessTyping()
      } catch (e) {}
      busy = false
    }
    function onVis() {
      if (document.hidden) { hiddenAt = Date.now(); return }
      if (hiddenAt) {
        const away = Date.now() - hiddenAt
        // long away: data (products, prices, settings) may be stale even if the code build id is the same
        if (away > DATA_STALE_MS) reloadUnlessTyping()
        else if (away > 30000) check()
      }
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
