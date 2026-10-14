'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../lib/supabaseClient'
import { cldOpt } from '../lib/cloudinary'
import { useShop } from './ShopContext'

export default function WishlistPanel() {
  const { activePanel, closePanel, wishlist, removeFromWishlist, cartCount, openCart, openSearch } = useShop()
  const show = activePanel === 'wishlist'
  const [products, setProducts] = useState(null) // null = loading

  const idKey = wishlist.map(w => w.id).join(',')

  // Fresh prices and stock every time the panel opens
  useEffect(() => {
    if (!show) return
    if (!wishlist.length) { setProducts([]); return }
    let alive = true
    supabase
      .from('products')
      .select('id,name,price,old,imgs,stock')
      .in('id', wishlist.map(w => w.id))
      .then(({ data }) => { if (alive) setProducts(data || []) })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, idKey])

  const items = wishlist
    .map(w => {
      const p = (products || []).find(x => x.id === w.id)
      return p ? { ...p, savedPrice: Number(w.price) } : null
    })
    .filter(Boolean)

  return (
    <div className={`panel left${show ? ' show' : ''}`}>
      <div className="panelHead acHead">
        <button type="button" className="acBackBtn" aria-label="Back" onClick={closePanel}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <h2 className="acTitle">Wishlist</h2>
        <div className="acHeadIcons">
          <button type="button" className="acHeadBtn" aria-label="Search" onClick={() => { closePanel(); openSearch() }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          </button>
          <button type="button" className="acHeadBtn" aria-label="Cart" onClick={() => openCart()}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11h10.2L20 8H6.2" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" /></svg>
            {cartCount > 0 && <span className="acBadge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {products === null && wishlist.length > 0 ? (
        <div className="empty">Loading...</div>
      ) : items.length === 0 ? (
        <div className="empty">♡<br /><br />Your wishlist is currently empty.<br /><small>Tap “Add to wishlist” on any product to save it here.</small></div>
      ) : (
        items.map(p => {
          const img = p.imgs ? p.imgs.split(',')[0].trim() : ''
          const soldOut = p.stock !== null && p.stock !== undefined && Number(p.stock) <= 0
          const dropped = p.savedPrice > 0 && Number(p.price) < p.savedPrice
          return (
            <div className="cartItem" key={p.id}>
              <Link href={`/product/${p.id}`} onClick={closePanel} className="cartImg" style={{ position: 'relative' }}>
                {img
                  ? <Image src={cldOpt(img, 200)} alt="" fill sizes="70px" style={{ objectFit: 'cover' }} loading="lazy" quality={75} />
                  : '🛍️'}
              </Link>
              <div className="cartInfo">
                <Link href={`/product/${p.id}`} onClick={closePanel}><h4>{p.name}</h4></Link>
                <small>
                  ৳{Number(p.price).toLocaleString()}
                  {p.old ? <> <s style={{ opacity: 0.6 }}>৳{Number(p.old).toLocaleString()}</s></> : null}
                  {soldOut ? ' • Out of stock' : ''}
                </small>
                {dropped && (
                  <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700, marginTop: 3 }}>
                    ↓ Price dropped from ৳{p.savedPrice.toLocaleString()}
                  </div>
                )}
                <div className="qtyRow">
                  <Link href={`/product/${p.id}`} onClick={closePanel} className="removeBtn" style={{ textDecoration: 'underline', marginRight: 14 }}>View</Link>
                  <button className="removeBtn" onClick={() => removeFromWishlist(p.id)}>Remove</button>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
