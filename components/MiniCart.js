'use client'

import Image from 'next/image'
import { useShop } from './ShopContext'
import { cldOpt } from '../lib/cloudinary'
import BagCount from './BagCount'

// Slide-in cart that opens from the left right after "Add to cart"
export default function MiniCart() {
  const { cart, cartCount, cartSubtotal, miniOpen, closeMini, removeFromCart, openCart, openCheckout } = useShop()
  const items = [...cart].reverse()

  function goCart() { closeMini(); openCart() }
  function goCheckout() { closeMini(); openCheckout() }

  return (
    <>
      <div className={`miniOverlay${miniOpen ? ' show' : ''}`} onClick={closeMini}></div>
      <aside className={`miniCart${miniOpen ? ' show' : ''}`} aria-hidden={!miniOpen}>
        <div className="miniHead">
          <BagCount count={cartCount} />
          <h2>Your Cart</h2>
          <button className="close" onClick={closeMini} aria-label="Close">×</button>
        </div>

        <div className="miniBody">
          {items.length === 0 ? (
            <div className="empty" style={{ padding: '40px 10px' }}>Your cart is empty.</div>
          ) : items.map((i, idx) => (
            <div className="miniItem" key={i.id + '-' + (i.size || '') + '-' + idx}>
              <div className="cartImg" style={{ position: 'relative' }}>
                {i.imgs
                  ? <Image src={cldOpt(i.imgs.split(',')[0].trim(), 200)} alt="" fill sizes="70px" style={{ objectFit: 'cover' }} loading="lazy" quality={75} />
                  : '🛍️'}
              </div>
              <div className="miniInfo">
                <h4>{i.name}</h4>
                {i.size && <small>Size: {i.size}</small>}
                <div className="miniPrice">{i.qty} × ৳{Number(i.price).toLocaleString()}</div>
              </div>
              <button className="miniDel" onClick={() => removeFromCart(i.id, i.size)} aria-label="Remove item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="miniFoot">
          <div className="miniSub"><span>Subtotal</span><span>৳{cartSubtotal.toLocaleString()}</span></div>
          <button className="btn light" type="button" style={{ width: '100%', border: '1.5px solid #111', marginBottom: 8 }} onClick={closeMini}>CONTINUE SHOPPING</button>
          <button className="btn light" type="button" style={{ width: '100%', border: '1.5px solid #111', marginBottom: 8 }} onClick={goCart}>VIEW CART</button>
          <button className="btn" type="button" style={{ width: '100%' }} disabled={cart.length === 0} onClick={goCheckout}>CHECKOUT</button>
        </div>
      </aside>
    </>
  )
}
