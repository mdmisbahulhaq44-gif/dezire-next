'use client'

import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'
import { cldOpt } from '../lib/cloudinary'
import { closeWithFade } from '../lib/closeWithFade'
import PdTopBar from './PdTopBar'

// Shows the product panel INSTANTLY when a product card is tapped, using the
// data the card already has (name, price, photo). The real panel (fetched
// from the server) replaces it the moment it arrives, so a slow network no
// longer leaves the shopper staring at the old page.
export default function ProductPreview() {
  const pathname = usePathname()
  const router = useRouter()
  const [p, setP] = useState(null)
  const closeAfter = useRef(false)
  const hold = useRef(0)
  const shownAt = useRef(0)
  const readyRef = useRef(false)
  const readyTimer = useRef(null)
  const [ready, setReady] = useState(false)
  const markReady = () => {
    if (readyRef.current) return
    readyRef.current = true
    clearTimeout(readyTimer.current)
    shownAt.current = performance.now()
    setReady(true)
  }
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
      shownAt.current = performance.now()
      readyRef.current = false
      setReady(false)
      hold.current = a.dataset.hold ? performance.now() + Number(a.dataset.hold) : 0
      const show = () => {
        if (location.pathname === target) return
        flushSync(() => setP(Object.assign({}, data, { __still: location.pathname.startsWith('/product/') })))
      }
      window.__dzEnter = { t: performance.now(), mode: 'preview', still: location.pathname.startsWith('/product/') }
      show()
      clearTimeout(readyTimer.current)
      readyTimer.current = setTimeout(markReady, 250)
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
    const wait = Math.max(hold.current ? Math.max(0, hold.current - performance.now()) : 0, shownAt.current ? Math.max(0, shownAt.current + 340 - performance.now()) : 0)
    hold.current = 0
    const finish = () => {
      const ims = document.querySelectorAll('#productPanel .pdSlide img[aria-hidden="true"]')
      const im = ims[ims.length - 1]
      const done = () => requestAnimationFrame(() => requestAnimationFrame(() => setP(null)))
      if (im && im.decode) Promise.race([im.decode(), new Promise(r => setTimeout(r, 400))]).then(done, done)
      else done()
    }
    if (wait > 0) timer.current = setTimeout(finish, wait)
    else finish()
    if (closeAfter.current) {
      closeAfter.current = false
      closeWithFade(router)
    }
  }, [pathname, router])

  if (!p) return null
  const thumbs = p.all ? String(p.all).split(',').map(s => s.trim()).filter(Boolean) : []

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
      style={{ transform: 'none', opacity: 1, transition: 'none', animation: p.__still ? 'none' : 'pdFadeIn 320ms cubic-bezier(.22,.61,.36,1) backwards', animationPlayState: (ready || p.__still) ? 'running' : 'paused', pointerEvents: 'auto', overscrollBehavior: 'contain' }}
    >
      <PdTopBar onBack={() => { closeAfter.current = true }} />

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
                  onLoad={markReady}
                  onError={markReady}
                  ref={el => { if (el && el.complete && el.naturalWidth > 0) markReady() }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </>
            ) : (
              <div>👕</div>
            )}
          </div>
        </div>
      </div>

      {thumbs.length > 1 && (
        // same thumbnails as the real page (same photos, same rows), so nothing shifts or pops in when the real page arrives
        <div className="pdThumbs">
          {thumbs.map((u, i) => (
            <div key={i} className={'pdThumb' + (i === 0 ? ' active' : '')}>
              <img src={cldOpt(u, 240)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

      <div style={{ paddingTop: 14 }}>
        <div style={bar('62%', 24, 6)}></div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, minHeight: 18 }}></div>
<div style={bar('28%', 20, 14)}></div>
        <div style={bar('40%', 14, 10)}></div>
        <div style={bar('100%', 42, 22)}></div>
        <div style={bar('100%', 48, 22)}></div>
        <div style={bar('100%', 48, 10)}></div>
      </div>
    </div>
  )
}
