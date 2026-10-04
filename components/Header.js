'use client'

import Link from 'next/link'
import { useShop } from './ShopContext'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { cartCount, wishlistCount, openCart, openWishlist, openSearch, drawerOpen, openDrawer, closeDrawer, openTrack, openAbout } = useShop()
  const pathname = usePathname()
  if (['/contact', '/terms', '/refund-policy', '/privacy'].includes(pathname)) return null

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
          <button className="iconbtn" aria-label="Wishlist" onClick={openWishlist} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M12 20.8l-1.2-1.1C5.6 15.1 2.5 12.3 2.5 8.7 2.5 5.9 4.7 3.7 7.5 3.7c1.9 0 3.7.9 4.5 2.3.8-1.4 2.6-2.3 4.5-2.3 2.8 0 5 2.2 5 5 0 3.6-3.1 6.4-8.3 11l-1.2 1.1z"/>
            </svg>
            <span className="cartCount" style={{ display: wishlistCount > 0 ? 'flex' : 'none' }}>{wishlistCount}</span>
          </button>
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
        <Link href="/flash-sale" onClick={closeDrawer}>⚡ Flash Sale</Link>
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
