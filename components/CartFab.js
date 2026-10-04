'use client'

import { useShop } from './ShopContext'
import { usePathname } from 'next/navigation'

export default function CartFab() {
  const { cartCount, openCart, closeMini, activePanel, drawerOpen, miniOpen } = useShop()
  const pathname = usePathname()
  if (['/contact', '/terms', '/refund-policy', '/privacy'].includes(pathname)) return null
  if (pathname && pathname.startsWith('/admin')) return null
  if (activePanel || drawerOpen) return null

  function onClick() {
    if (miniOpen) closeMini()
    openCart()
  }

  return (
    <button type="button" className={`pdCartFab${miniOpen ? ' withMini' : ''}`} onClick={onClick} title="View cart" aria-label="View cart">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
        <path d="M8.2 9.5 11 4.6M15.8 9.5 13 4.6" stroke="#111" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M2.8 9.5h18.4a.8.8 0 0 1 .8 1l-1.7 8a2 2 0 0 1-2 1.6H5.7a2 2 0 0 1-2-1.6l-1.7-8a.8.8 0 0 1 .8-1Z" fill="#111" />
        <path d="M8.5 12.8v4.4M12 12.8v4.4M15.5 12.8v4.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {cartCount > 0 && <span className="fabCount">{cartCount}</span>}
    </button>
  )
}
