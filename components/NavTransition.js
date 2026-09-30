'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function NavTransition() {
  const pathname = usePathname()
  const pending = useRef(null)
  const pathRef = useRef(pathname)

  useEffect(() => {
    pathRef.current = pathname
    document.documentElement.removeAttribute('data-nav')
    const done = pending.current
    if (!done) return
    pending.current = null
    requestAnimationFrame(() => requestAnimationFrame(done))
  }, [pathname])

  // Phone back gesture / back button / forward: cross-fade too.
  // React would swap the page BEFORE the browser photographs the old screen,
  // so we hold the popstate event back, let the browser take the photo, and
  // then replay the event inside the transition.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduced) return
    let replaying = false

    function onPop(e) {
      window.__dzEnter = null
      if (replaying) return
      const st = e.state
      if (!st || !(st.__NA || st.__PRIVATE_NEXTJS_INTERNALS_TREE)) return
      if (location.pathname === pathRef.current) return
      if (location.pathname.startsWith('/admin') || pathRef.current.startsWith('/admin')) return

      e.stopImmediatePropagation()
      let replayed = false
      const replay = () => {
        if (replayed) return
        replayed = true
        replaying = true
        try { window.dispatchEvent(new PopStateEvent('popstate', { state: st })) } finally { replaying = false }
      }
      const fallback = setTimeout(replay, 400)
      document.startViewTransition(() => new Promise(resolve => {
        clearTimeout(fallback)
        replay()
        const t0 = performance.now()
        const tick = () => {
          if (pathRef.current === location.pathname || performance.now() - t0 > 600) return resolve()
          setTimeout(tick, 16)
        }
        setTimeout(tick, 16)
      }))
    }

    window.addEventListener('popstate', onPop, true)
    return () => window.removeEventListener('popstate', onPop, true)
  }, [])

  // Category / menu / breadcrumb links: normal instant Next navigation (no held
  // tap, no frozen screen). A thin progress bar shows only if the page is slow.
  // Product cards are handled by ProductPreview (instant panel + cross-fade).
  useEffect(() => {
    const root = document.documentElement

    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest && e.target.closest('a[href]')
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('data-no-vt')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || url.pathname.startsWith('/admin')) return
      if (url.pathname === location.pathname) return
      if (a.dataset.preview) return
      if (url.pathname.startsWith('/product/')) window.__dzEnter = { t: performance.now(), mode: 'link' }

      root.setAttribute('data-nav', '1')
      setTimeout(() => root.removeAttribute('data-nav'), 10000)
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
