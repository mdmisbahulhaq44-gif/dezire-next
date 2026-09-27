'use client'

import { useShop } from './ShopContext'
import { cldOpt } from '../lib/cloudinary'

export default function CartPanel() {
  const { cart, cartSubtotal, activePanel, closePanel, changeQty, removeFromCart } = useShop()
  const show = activePanel === 'cart'

  return (
    <div className={`panel${show ? ' show' : ''}`}>
      <div className="panelHead">
        <h2>Your Cart</h2>
        <button className="close" onClick={closePanel}>×</button>
      </div>

      <div>
        {cart.length === 0 ? (
          <div className="empty">🛒<br /><br />Your cart is empty.</div>
        ) : (
          cart.map((i, idx) => (
            <div className="cartItem" key={idx}>
              <div className="cartImg">
                {i.imgs
                  ? <img src={cldOpt(i.imgs.split(',')[0].trim(), 200)} loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  : '🛍️'}
              </div>
              <div className="cartInfo">
                <h4>{i.name}</h4>
                <small>৳{i.price.toLocaleString()} each{i.size ? ` • Size: ${i.size}` : ''}</small>
                <div className="qtyRow">
                  <button className="qtyBtn" onClick={() => changeQty(i.id, i.size, -1)}>−</button>
                  <span>{i.qty}</span>
                  <button className="qtyBtn" onClick={() => changeQty(i.id, i.size, 1)}>+</button>
                  <button className="removeBtn" onClick={() => removeFromCart(i.id, i.size)}>Remove</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <div className="summaryRow total" style={{ textAlign: 'left' }}>
          <b>Total</b>
          <b>৳{cartSubtotal.toLocaleString()}</b>
        </div>
        <button className="btn light" type="button" style={{ width: '100%', border: '1.5px solid #111', marginBottom: 10 }} onClick={closePanel}>
          CONTINUE SHOPPING
        </button>
        <button className="btn light" style={{ border: '1.5px solid #111', padding: '14px 46px' }} disabled={cart.length === 0}>
          CHECKOUT
        </button>
      </div>
    </div>
  )
}
