'use client'

import { useShop } from './ShopContext'

export default function WishlistPanel() {
  const { activePanel, closePanel } = useShop()
  const show = activePanel === 'wishlist'
  return (
    <div className={`panel left${show ? ' show' : ''}`}>
      <div className="panelHead">
        <h2>Wishlist</h2>
        <button className="close" onClick={closePanel}>×</button>
      </div>
      <div className="empty">♡<br /><br />Your wishlist is currently empty.</div>
    </div>
  )
}
