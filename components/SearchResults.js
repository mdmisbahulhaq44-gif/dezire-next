'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { cldOpt } from '../lib/cloudinary'

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
          <Link className="srImg" href={`/product/${p.id}`} data-no-vt="1" onClick={open}>
            {p.img && <img src={cldOpt(p.img, 700)} alt={p.name} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />}
          </Link>
          <h2 className="srName"><Link href={`/product/${p.id}`} data-no-vt="1" onClick={open}>{p.name}</Link></h2>
          {p.lines.length > 0 && (
            <div className="srMeas">
              <b>Measurements (in inches):</b>
              {p.lines.map((l, k) => <div key={k}>{l}</div>)}
            </div>
          )}
          <Link className="srMore" href={`/product/${p.id}`} data-no-vt="1" onClick={open}>Read More »</Link>
        </div>
      ))}
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
