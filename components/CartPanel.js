'use client'

import { useShop } from './ShopContext'
import { cldOpt } from '../lib/cloudinary'
import Image from 'next/image'
import BagCount from './BagCount'
import Money, { CurNote } from './Money'

export default function CartPanel() {
  const { cart, cartCount, cartSubtotal, activePanel, closePanel, changeQty, removeFromCart, openCheckout, t } = useShop()
  const show = activePanel === 'cart'

  return (
    <div className={`panel${show ? ' show' : ''}`}>
      <div className="panelHead">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><BagCount count={cartCount} />{t('Your Cart')}</h2>
        <button className="close" onClick={closePanel}>×</button>
      </div>

      <div>
        {cart.length === 0 ? (
          <div className="empty">🛒<br /><br />{t('Your cart is empty.')}</div>
        ) : (
          cart.map((i, idx) => (
            <div className="cartItem" key={idx}>
              <div className="cartImg" style={{ position: 'relative' }}>
                {i.imgs
                  ? <Image src={cldOpt(i.imgs.split(',')[0].trim(), 200)} alt="" fill sizes="70px" style={{ objectFit: 'cover' }} loading="lazy" quality={75} />
                  : '🛍️'}
              </div>
              <div className="cartInfo">
                <h4>{i.name}</h4>
                <small><Money n={i.price} /> {t('each')}{i.size ? ` • ${t('Size')}: ${i.size}` : ''}</small>
                <div className="qtyRow">
                  <button className="qtyBtn" onClick={() => changeQty(i.id, i.size, -1)}>−</button>
                  <span>{i.qty}</span>
                  <button className="qtyBtn" onClick={() => changeQty(i.id, i.size, 1)}>+</button>
                  <button className="removeBtn" onClick={() => removeFromCart(i.id, i.size)}>{t('Remove')}</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <div className="summaryRow total" style={{ textAlign: 'left' }}>
          <b>{t('Total')}</b>
          <b><Money n={cartSubtotal} /></b>
        </div>
        <CurNote n={cartSubtotal} />
        <button className="btn light" type="button" style={{ width: '100%', border: '1.5px solid #111', marginBottom: 10 }} onClick={closePanel}>
          {t('CONTINUE SHOPPING')}
        </button>
        <button className="btn light" style={{ border: '1.5px solid #111', padding: '14px 46px' }} disabled={cart.length === 0} onClick={openCheckout}>
          {t('CHECKOUT')}
        </button>
      </div>
    </div>
  )
}
