'use client'

import { useShop } from './ShopContext'
import { usePathname } from 'next/navigation'

export default function CartFab() {
  const { cartCount, openCart, activePanel, drawerOpen, miniOpen } = useShop()
  const pathname = usePathname()
  if (['/contact', '/terms', '/refund-policy', '/privacy'].includes(pathname)) return null
  if (pathname && pathname.startsWith('/admin')) return null
  if (activePanel || drawerOpen || miniOpen) return null
  return (
    <button type="button" className="pdCartFab" onClick={openCart} title="View cart" aria-label="View cart">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path d="M9 9V7a3 3 0 0 1 6 0v2" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 9h15l-1.1 9.3a2 2 0 0 1-2 1.7H7.6a2 2 0 0 1-2-1.7L4.5 9Z" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      {cartCount > 0 && <span className="fabCount">{cartCount}</span>}
    </button>
  )
}
