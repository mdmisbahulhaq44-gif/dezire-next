'use client'

import { useShop } from './ShopContext'

export default function BottomNav() {
  const { cartCount, openCart } = useShop()

  return (
    <div className="bottomNav">
      <button className="active">
        <span className="bnIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
            <path d="M3 10.5 12 3l9 7.5"/>
            <path d="M5 9.5V21h14V9.5"/>
            <path d="M9.5 21v-6.5h5V21"/>
          </svg>
        </span>
        Home
      </button>
      <button>
        <span className="bnIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
            <rect x="3.5" y="3.5" width="7" height="7" rx="1"/>
            <rect x="13.5" y="3.5" width="7" height="7" rx="1"/>
            <rect x="3.5" y="13.5" width="7" height="7" rx="1"/>
            <rect x="13.5" y="13.5" width="7" height="7" rx="1"/>
          </svg>
        </span>
        Category
      </button>
      <button onClick={openCart}>
        <span className="bnIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
            <path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"/>
            <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
          </svg>
          <span className="cartCount" style={{ display: cartCount > 0 ? "flex" : "none" }}>{cartCount}</span>
        </span>
        Cart
      </button>
      <button>
        <span className="bnIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
            <path d="M21 8 12 3 3 8l9 5 9-5Z"/>
            <path d="M3 8v8l9 5 9-5V8"/>
            <path d="M12 13v8"/>
          </svg>
        </span>
        Track
      </button>
      <button>
        <span className="bnIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
            <circle cx="12" cy="8" r="3.5"/>
            <path d="M5 20c1.2-3.8 4.2-6 7-6s5.8 2.2 7 6"/>
          </svg>
        </span>
        Login
      </button>
    </div>
  )
          }
