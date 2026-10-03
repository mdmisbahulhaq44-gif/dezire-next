'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../lib/supabaseClient'
import { cldOpt } from '../lib/cloudinary'
import { useShop } from './ShopContext'

export default function WishlistPanel() {
  const { activePanel, closePanel, wishlist, removeFromWishlist } = useShop()
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
      <div className="panelHead">
        <h2>Wishlist</h2>
        <button className="close" onClick={closePanel}>×</button>
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
