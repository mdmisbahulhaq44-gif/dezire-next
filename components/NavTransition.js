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

  // Every internal link tap (category, sub-category, menu, breadcrumb...) gets
  // the same single native cross-fade the original site had. The tap is held
  // back until the browser has photographed the old screen, then replayed
  // inside the transition (so the link's own handlers still run). If the new
  // page hasn't arrived within 350ms the screen is released (never frozen) and
  // a thin progress bar shows until it arrives.
  useEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canVT = !!document.startViewTransition && !reduced
    let replayingClick = false

    function onClick(e) {
      if (replayingClick) return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest && e.target.closest('a[href]')
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('data-no-vt')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || url.pathname.startsWith('/admin')) return
      if (url.pathname === location.pathname) return

      // Product cards have their own instant preview panel (ProductPreview)
      if (a.dataset.preview) return

      if (!canVT) {
        root.setAttribute('data-nav', '1')
        setTimeout(() => root.removeAttribute('data-nav'), 10000)
        return
      }

      e.preventDefault()
      e.stopImmediatePropagation()
      document.startViewTransition(() => new Promise(resolve => {
        pending.current = resolve
        replayingClick = true
        try { a.click() } finally { replayingClick = false }
        setTimeout(() => {
          if (pending.current === resolve) {
            pending.current = null
            root.setAttribute('data-nav', '1')
            setTimeout(() => root.removeAttribute('data-nav'), 10000)
            resolve()
          }
        }, 350)
      }))
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
