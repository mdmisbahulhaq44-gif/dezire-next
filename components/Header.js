'use client'

import Link from 'next/link'
import { useShop } from './ShopContext'

export default function Header() {
  const { cartCount, openCart, openWishlist, openSearch, drawerOpen, openDrawer, closeDrawer, openTrack, openAbout } = useShop()

  return (
    <>
      <nav>
        <div className="navLeft">
          <button className="hamburgerBtn" onClick={openDrawer} aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>

        <div className="logo">DEZIRE</div>

        <div className="navRightIcons">
          <button className="iconbtn" aria-label="Search" onClick={openSearch}>⌕</button>
          <button className="iconbtn" aria-label="Wishlist" onClick={openWishlist}>♡</button>
          <button className="iconbtn" aria-label="Cart" onClick={openCart} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"/>
              <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
            </svg>
            <span className="cartCount" style={{ display: cartCount > 0 ? 'flex' : 'none' }}>{cartCount}</span>
          </button>
        </div>
      </nav>

      <div className={`overlay${drawerOpen ? ' show' : ''}`} onClick={closeDrawer}></div>
      <div className={`drawer${drawerOpen ? ' show' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <div className="logo" style={{ fontSize: 18 }}>DEZIRE</div>
          <button className="close" onClick={closeDrawer}>×</button>
        </div>
        <Link href="/#new" onClick={closeDrawer}>New Arrivals</Link>
        <Link href="/shop/women" onClick={closeDrawer}>Women</Link>
        <Link href="/shop/men" onClick={closeDrawer}>Men</Link>
        <Link href="/#women" onClick={closeDrawer}>Accessories</Link>
        <Link href="/#new" onClick={closeDrawer}>Sale</Link>
        <a href="#" onClick={e => { e.preventDefault(); closeDrawer(); openAbout() }}>About Us</a>
        <a href="#" onClick={e => { e.preventDefault(); closeDrawer(); openTrack() }}>Track Order</a>
      </div>
    </>
  )
}
