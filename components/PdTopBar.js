'use client'

import { useShop } from './ShopContext'

// Top bar of the product page: back, logo, search, wishlist, bag (same look as the site header)
export default function PdTopBar({ onBack }) {
  const { cartCount, wishlistCount, openCart, openWishlist, openSearch } = useShop()
  return (
    <div className="pdTopBar">
      <button type="button" className="pdTopBtn" onClick={onBack} aria-label="Back">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <div className="logo">HEAVEN</div>
      <div className="pdTopRight">
        <button type="button" className="pdTopBtn" onClick={openSearch} aria-label="Search">⌕</button>
        <button type="button" className="pdTopBtn" onClick={openWishlist} aria-label="Wishlist" style={{ position: 'relative' }}>
          <svg viewBox="0 0 24 24" fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
            <path d="M12 20.8l-1.2-1.1C5.6 15.1 2.5 12.3 2.5 8.7 2.5 5.9 4.7 3.7 7.5 3.7c1.9 0 3.7.9 4.5 2.3.8-1.4 2.6-2.3 4.5-2.3 2.8 0 5 2.2 5 5 0 3.6-3.1 6.4-8.3 11l-1.2 1.1z" />
          </svg>
          <span className="cartCount" style={{ display: wishlistCount > 0 ? 'flex' : 'none' }}>{wishlistCount}</span>
        </button>
        <button type="button" className="pdTopBtn" onClick={openCart} aria-label="Cart" style={{ position: 'relative' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span className="cartCount" style={{ display: cartCount > 0 ? 'flex' : 'none' }}>{cartCount}</span>
        </button>
      </div>
    </div>
  )
}
