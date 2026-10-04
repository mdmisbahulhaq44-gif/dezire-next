'use client'

import { useShop } from './ShopContext'
import { usePathname } from 'next/navigation'

export default function CartFab() {
  const { cartCount, openCart, closeMini, activePanel, drawerOpen, miniOpen } = useShop()
  const pathname = usePathname()
  if (['/contact', '/terms', '/refund-policy', '/privacy'].includes(pathname)) return null
  if (pathname && pathname.startsWith('/admin')) return null
  if (activePanel || drawerOpen) return null

  return (
    <button type="button" className={`pdCartFab${miniOpen ? ' withMini' : ''}`} onClick={miniOpen ? closeMini : openCart} title="View cart" aria-label="View cart">
      <svg viewBox="0 0 24 24" width="34" height="34" fill="none">
        <path d="M8.4 10 12 4.4l3.6 5.6" stroke="#111" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.8 10.2h18.4l-2.6 8.2a2.2 2.2 0 0 1-2.1 1.6H7.5a2.2 2.2 0 0 1-2.1-1.6L2.8 10.2Z" fill="#111" stroke="#111" strokeWidth="1" strokeLinejoin="round" />
        <circle cx="12" cy="15.2" r="1.6" fill="#fff" />
      </svg>
      {cartCount > 0 && <span className="fabCount">{cartCount}</span>}
    </button>
  )
}
