'use client'

import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'
import { cldOpt } from '../lib/cloudinary'
import { closeWithFade } from '../lib/closeWithFade'

// Shows the product panel INSTANTLY when a product card is tapped, using the
// data the card already has (name, price, photo). The real panel (fetched
// from the server) replaces it the moment it arrives, so a slow network no
// longer leaves the shopper staring at the old page.
export default function ProductPreview() {
  const pathname = usePathname()
  const router = useRouter()
  const [p, setP] = useState(null)
  const closeAfter = useRef(false)
  const timer = useRef(null)

  useEffect(() => {
    function clear() {
      clearTimeout(timer.current)
      closeAfter.current = false
      setP(null)
    }

    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest && e.target.closest('a[data-preview]')
      if (!a) return
      let url
      try { url = new URL(a.href, location.href) } catch (err) { return }
      if (url.origin !== location.origin || url.pathname === location.pathname) return
      let data
      try { data = JSON.parse(a.dataset.preview) } catch (err) { return }
      closeAfter.current = false
      const target = url.pathname
      const show = () => {
        if (location.pathname === target) return
        flushSync(() => setP(data))
      }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (document.startViewTransition && !reduced) document.startViewTransition(show)
      else show()
      clearTimeout(timer.current)
      // Safety net: never leave the preview stuck if navigation fails
      timer.current = setTimeout(() => setP(null), 12000)
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', clear)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', clear)
      clearTimeout(timer.current)
    }
  }, [])

  // The real product panel has arrived (URL is now /product/...): remove the preview
  useEffect(() => {
    if (!pathname || !pathname.startsWith('/product/')) return
    clearTimeout(timer.current)
    setP(null)
    if (closeAfter.current) {
      closeAfter.current = false
      closeWithFade(router)
    }
  }, [pathname, router])

  if (!p) return null

  const bar = (w, h, mt) => ({
    width: w,
    height: h,
    marginTop: mt,
    borderRadius: 8,
    background: 'rgba(128,128,128,.15)',
  })

  return (
    <div
      className="panel show"
      id="productPreview"
      style={{ transform: 'none', opacity: 1, transition: 'none', pointerEvents: 'auto', overscrollBehavior: 'contain' }}
    >
      <div className="panelHead">
        <h2>Product Details</h2>
        <button className="close" onClick={() => { closeAfter.current = true }}>×</button>
      </div>

      <div className="pdGallery">
        <div className="pdGalleryTrack">
          <div className="pdSlide" style={{ position: 'relative' }}>
            {p.img ? (
              <>
                {/* small photo is already cached from the card; big one paints over it when ready */}
                <img
                  src={cldOpt(p.img, 500)}
                  alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <img
                  src={cldOpt(p.img, 900)}
                  alt={p.name}
                  fetchPriority="high"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </>
            ) : (
              <div>👕</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 18 }}>
        <h2 style={{ margin: '6px 0 10px', fontSize: 22 }}>{p.name}</h2>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, minHeight: 18 }}></div>
        <div className="price" style={{ fontSize: 20 }}>
          ৳{Number(p.price).toLocaleString()}
          {p.old ? <> <span className="old">৳{Number(p.old).toLocaleString()}</span></> : null}
        </div>
        <div style={bar('40%', 14, 10)}></div>
        <div style={bar('100%', 42, 22)}></div>
        <div style={bar('100%', 48, 22)}></div>
        <div style={bar('100%', 48, 10)}></div>
      </div>
    </div>
  )
}
