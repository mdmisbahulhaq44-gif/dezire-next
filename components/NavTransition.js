'use client'
import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Same idea as the original site: every navigation (link tap, x button,
// back gesture) goes through ONE native cross-fade (View Transitions API).
const MAX_WAIT = 450

function samePath(a, b) {
  try { return decodeURIComponent(a) === decodeURIComponent(b) } catch (e) { return a === b }
}

export default function NavTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const pending = useRef(null)
  const shown = useRef(pathname)

  useEffect(() => {
    shown.current = pathname
    document.documentElement.removeAttribute('data-nav')
    const done = pending.current
    if (!done) return
    pending.current = null
    requestAnimationFrame(() => requestAnimationFrame(done))
  }, [pathname])

  useEffect(() => {
    const root = document.documentElement
    const canVT = !!document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function run(go, isPop) {
      document.startViewTransition(() => new Promise(resolve => {
        if (isPop && samePath(shown.current, location.pathname)) { resolve(); return }
        pending.current = resolve
        if (go) go()
        setTimeout(() => {
          if (pending.current === resolve) {
            pending.current = null
            root.setAttribute('data-nav', '1')
            setTimeout(() => root.removeAttribute('data-nav'), 8000)
            resolve()
          }
        }, MAX_WAIT)
      }))
    }

    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest && e.target.closest('a[href]')
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('data-no-vt')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || url.pathname.startsWith('/admin')) return
      if (url.pathname === location.pathname) return

      if (!canVT) {
        root.setAttribute('data-nav', '1')
        setTimeout(() => root.removeAttribute('data-nav'), 10000)
        return
      }

      e.preventDefault()
      e.stopPropagation()
      const href = url.pathname + url.search + url.hash
      const replace = a.dataset.replace === '1'
      run(() => { if (replace) router.replace(href); else router.push(href) }, false)
    }

    function onPop() { if (canVT) run(null, true) }

    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPop, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPop, true)
    }
  }, [router])

  return null
}
