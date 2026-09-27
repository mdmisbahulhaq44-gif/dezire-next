'use client'

import { useState, useEffect } from 'react'

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <>
      <nav>
        <div className="navLeft">
          <button className="hamburgerBtn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>

        <div className="logo">DEZIRE</div>

        <div className="navRightIcons">
          <button className="iconbtn" aria-label="Search">⌕</button>
          <button className="iconbtn" aria-label="Wishlist">♡</button>
          <button className="iconbtn" aria-label="Cart" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"/>
              <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
            </svg>
            <span className="cartCount" id="cartCountTop" style={{ display: 'none' }}>0</span>
          </button>
        </div>
      </nav>

      <div className={`overlay${drawerOpen ? ' show' : ''}`} onClick={() => setDrawerOpen(false)}></div>
      <div className={`drawer${drawerOpen ? ' show' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <div className="logo" style={{ fontSize: 18 }}>DEZIRE</div>
          <button className="close" onClick={() => setDrawerOpen(false)}>×</button>
        </div>
        <a href="#new" onClick={() => setDrawerOpen(false)}>New Arrivals</a>
        <a href="#women" onClick={() => setDrawerOpen(false)}>Women</a>
        <a href="#men" onClick={() => setDrawerOpen(false)}>Men</a>
        <a href="#accessories" onClick={() => setDrawerOpen(false)}>Accessories</a>
        <a href="#new" onClick={() => setDrawerOpen(false)}>Sale</a>
        <a href="#" onClick={() => setDrawerOpen(false)}>About Us</a>
        <a href="#" onClick={() => setDrawerOpen(false)}>Track Order</a>
      </div>
    </>
  )
}
