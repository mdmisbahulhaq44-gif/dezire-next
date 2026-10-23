'use client'

import { useEffect, useState } from 'react'

const REPO = 'mdmisbahulhaq44-gif/heaven-app'
const HOST = 'heaven-bd.vercel.app'

// Only does anything inside the HEAVEN Android app: opens shared links in the app, shows the "update available" dialog and pull-to-refresh.
export default function AppNative() {
  const [upd, setUpd] = useState(null)

  useEffect(() => {
    const cap = window.Capacitor
    if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return
    const App = cap.Plugins && cap.Plugins.App
    const undo = []

    // links opened from outside (shared product links, payment return) land in the app
    const open = url => {
      try {
        const u = new URL(url)
        if (u.hostname !== HOST) return
        const t = u.pathname + u.search + u.hash
        if (t !== location.pathname + location.search + location.hash) location.href = t
      } catch (e) {}
    }
    if (App) {
      try {
        if (App.getLaunchUrl && !sessionStorage.getItem('dz_launch_done')) {
          sessionStorage.setItem('dz_launch_done', '1')
          App.getLaunchUrl().then(r => { if (r && r.url) open(r.url) }).catch(() => {})
        }
        if (App.addListener) App.addListener('appUrlOpen', e => open(e.url))
      } catch (e) {}

      // "update available" check
      const check = async () => {
        try {
          const info = await App.getInfo()
          const mine = parseInt(info.build, 10) || 0
          const r = await fetch('https://api.github.com/repos/' + REPO + '/releases/latest')
          const j = await r.json()
          const rem = parseInt(String(j.tag_name || '').replace(/\D/g, ''), 10) || 0
          if (rem > mine) {
            const later = Number(localStorage.getItem('dz_upd_later') || 0)
            if (Date.now() - later > 12 * 3600 * 1000) setUpd({ tag: j.tag_name })
          }
        } catch (e) {}
      }
      const tm = setTimeout(check, 2500)
      undo.push(() => clearTimeout(tm))
    }

    // pull down from the very top to refresh
    const ind = document.createElement('div')
    ind.textContent = '↻'
    ind.style.cssText = 'position:fixed;top:calc(var(--sat,0px) + 54px);left:50%;width:36px;height:36px;margin-left:-18px;border-radius:50%;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.25);z-index:9999;display:flex;align-items:center;justify-content:center;font-size:20px;color:#111;opacity:0;pointer-events:none;transform:translateY(-70px)'
    document.body.appendChild(ind)
    let y0 = null
    let pull = 0
    const busyUi = () => document.querySelector('.panel.show, .drawer.show, .miniCart.show, .searchLayer.show, .pickerSheet.open')
    const ts = e => { y0 = (window.scrollY <= 0 && e.touches.length === 1 && !busyUi()) ? e.touches[0].clientY : null; pull = 0 }
    const tmv = e => {
      if (y0 == null) return
      pull = e.touches[0].clientY - y0
      if (pull > 0) {
        const p = Math.min(pull, 140)
        ind.style.opacity = String(Math.min(1, p / 90))
        ind.style.transform = 'translateY(' + (p * 0.6 - 70) + 'px) rotate(' + p * 3 + 'deg)'
      }
    }
    const te = () => {
      if (y0 != null && pull > 120) location.reload()
      y0 = null; pull = 0
      ind.style.opacity = '0'
      ind.style.transform = 'translateY(-70px)'
    }
    document.addEventListener('touchstart', ts, { passive: true })
    document.addEventListener('touchmove', tmv, { passive: true })
    document.addEventListener('touchend', te, { passive: true })
    undo.push(() => {
      document.removeEventListener('touchstart', ts)
      document.removeEventListener('touchmove', tmv)
      document.removeEventListener('touchend', te)
      ind.remove()
    })
    return () => undo.forEach(f => f())
  }, [])

  if (!upd) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '24px 22px 18px', width: 'min(340px,100%)', boxShadow: '0 10px 40px rgba(0,0,0,.3)' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Update available</div>
        <div style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 20 }}>A new version of HEAVEN is ready. Update now to get the latest improvements.</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => { try { localStorage.setItem('dz_upd_later', String(Date.now())) } catch (e) {} setUpd(null) }} style={{ padding: '10px 18px', border: 0, background: 'none', fontSize: 14, fontWeight: 600, color: '#555', cursor: 'pointer' }}>Later</button>
          <button onClick={() => { setUpd(null); window.location.href = 'https://github.com/' + REPO + '/releases/latest/download/HEAVEN.apk' }} style={{ padding: '10px 20px', border: 0, borderRadius: 8, background: '#111', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Update now</button>
        </div>
      </div>
    </div>
  )
}
