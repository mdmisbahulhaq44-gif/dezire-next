'use client'
import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function NavTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const pending = useRef(null)

  useEffect(() => {
    document.documentElement.removeAttribute('data-nav')
    const done = pending.current
    if (!done) return
    pending.current = null
    requestAnimationFrame(() => requestAnimationFrame(done))
  }, [pathname])

  useEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canVT = !!document.startViewTransition && !reduced

    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest && e.target.closest('a[href]')
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('data-no-vt')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || url.pathname.startsWith('/admin')) return
      if (url.pathname === location.pathname) return

      const hero = a.querySelector('.productImage')

      // Category and other links: no frozen screen, normal Next navigation + progress bar
      // Product cards also skip the freeze: an instant preview panel is shown instead
      if (!hero || !canVT || a.dataset.preview) {
        root.setAttribute('data-nav', '1')
        setTimeout(() => root.removeAttribute('data-nav'), 10000)
        return
      }

      e.preventDefault()
      e.stopPropagation()
      const href = url.pathname + url.search + url.hash
      const replace = a.dataset.replace === '1'
      const old = document.querySelector('.pdGallery')
      if (old) old.style.viewTransitionName = 'none'
      hero.style.viewTransitionName = 'product-hero'

      const t = document.startViewTransition(() => new Promise(resolve => {
        pending.current = resolve
        if (replace) router.replace(href); else router.push(href)
        setTimeout(() => {
          if (pending.current === resolve) { pending.current = null; resolve() }
        }, 600)
      }))
      t.finished.finally(() => {
        hero.style.viewTransitionName = ''
        if (old) old.style.viewTransitionName = ''
      })
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [router])

  return null
}
