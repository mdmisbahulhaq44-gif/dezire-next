'use client'
import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function NavTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const pending = useRef(null)

  useEffect(() => {
    const done = pending.current
    if (!done) return
    pending.current = null
    requestAnimationFrame(() => requestAnimationFrame(done))
  }, [pathname])

  useEffect(() => {
    if (!document.startViewTransition) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest && e.target.closest('a[href]')
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('data-no-vt')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || url.pathname.startsWith('/admin')) return
      if (url.pathname === location.pathname) return

      e.preventDefault()
      e.stopPropagation()
      const href = url.pathname + url.search + url.hash
      const replace = a.dataset.replace === '1'
      const hero = a.querySelector('.productImage')
      const old = document.querySelector('.pdGallery')
      if (hero) {
        if (old) old.style.viewTransitionName = 'none'
        hero.style.viewTransitionName = 'product-hero'
      }

      const t = document.startViewTransition(() => new Promise(resolve => {
        pending.current = resolve
        if (replace) router.replace(href); else router.push(href)
        setTimeout(() => {
          if (pending.current === resolve) { pending.current = null; resolve() }
        }, 1500)
      }))
      t.finished.finally(() => {
        if (hero) hero.style.viewTransitionName = ''
        if (old) old.style.viewTransitionName = ''
      })
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [router])

  return null
}
