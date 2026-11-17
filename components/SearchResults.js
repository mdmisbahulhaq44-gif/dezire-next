'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cldOpt } from '../lib/cloudinary'

// Search result photo: shown in its own ratio (nothing cropped), like the reference.
// Until the photo has loaded, a 4:5 grey box holds its place so the list does not jump.
function SrPhoto({ src, alt, eager }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      ref={el => { if (el && el.complete && el.naturalWidth > 0) setLoaded(true) }}
      style={loaded
        ? { width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }
        : { width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      data-loaded={loaded ? '1' : '0'}
    />
  )
}

export default function SearchResults({ items, q }) {
  useEffect(() => {
    const root = document.documentElement
    root.removeAttribute('data-rhold')
    window.dispatchEvent(new Event('dz-search-ready'))
    return () => root.removeAttribute('data-rhold')
  }, [q])

  // a product was tapped: header + grey page at once, no fade, until the product page arrives
  function open() {
    window.__dzEnter = null
    const root = document.documentElement
    root.setAttribute('data-rhold', '1')
    setTimeout(() => root.removeAttribute('data-rhold'), 10000)
  }

  return (
    <div className="srPage">
      {!q && <div className="srEmpty">Enter a product name.</div>}
      {q && !items.length && <div className="srEmpty">No products found for &quot;{q}&quot;</div>}
      {items.map((p, i) => (
        <div className="srCard" key={p.id}>
          {/* the 4:5 grey box only holds the place until the photo has loaded; then the box follows the photo ratio */}
          <Link className="srImg srImgNat" href={`/product/${p.id}`}>
            {p.img && <SrPhoto src={cldOpt(p.img, 700)} alt={p.name} eager={i < 2} />}
          </Link>
          <h2 className="srName"><Link href={`/product/${p.id}`}>{p.name}</Link></h2>
          {p.lines.length > 0 && (
            <div className="srMeas">
              <b>Measurements (in inches):</b>
              {p.lines.map((l, k) => <div key={k}>{l}</div>)}
            </div>
          )}
          <Link className="srMore" href={`/product/${p.id}`}>Read More »</Link>
        </div>
      ))}
      <style>{`
        .srImgNat:has(img[data-loaded="1"]){aspect-ratio:auto;background:transparent}
      `}</style>
      <div className="srHold" aria-hidden="true">
        <div className="slHoldBar">
          <div className="logo">HEAVEN</div>
          <div className="pdTopRight">
            <span className="pdTopIc"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.2" r="4.7" /><path d="M3.2 21.2c0-4.7 3.8-7.7 8.8-7.7s8.8 3 8.8 7.7c0 .5-.4.8-.8.8H4c-.4 0-.8-.3-.8-.8z" /></svg></span>
            <span className="pdTopIc pdTopSearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"><circle cx="10" cy="10" r="7" strokeWidth="2.7" /><path d="M15.2 15.2L21.2 21.2" strokeWidth="3" /></svg></span>
            <span className="pdTopMenu"><span /><span /><span /></span>
          </div>
        </div>
      </div>
    </div>
  )
}
