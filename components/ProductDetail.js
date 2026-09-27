'use client'

import { useState, useRef } from 'react'
import { useShop } from './ShopContext'
import ProductGrid from './ProductGrid'
import { cldOpt } from '../lib/cloudinary'

export default function ProductDetail({ product, related }) {
  const { addToCart, openCart, showToast } = useShop()
  const images = product.imgs ? product.imgs.split(',').map(s => s.trim()).filter(Boolean) : []
  const sizes = Array.isArray(product.sizes) ? product.sizes : []

  const [index, setIndex] = useState(0)
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const touchStartX = useRef(0)

  const inStock = Number(product.stock) > 0
  const lowStock = inStock && Number(product.stock) <= 5

  function slide(dir) {
    if (!images.length) return
    setIndex(i => (i + dir + images.length) % images.length)
  }

  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 40) slide(delta > 0 ? -1 : 1)
  }

  function changeQty(delta) {
    setQty(q => Math.max(1, q + delta))
  }

  function validateSize() {
    if (sizes.length && !size) {
      showToast('Please select a size first.')
      return false
    }
    return true
  }

  function handleAddToCart() {
    if (!validateSize()) return
    for (let i = 0; i < qty; i++) addToCart(product, size || null)
  }

  function handleBuyNow() {
    if (!validateSize()) return
    for (let i = 0; i < qty; i++) addToCart(product, size || null)
    openCart()
  }

  return (
    <div style={{ padding: '16px 5% 60px' }}>
      <div className="pdGallery" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="pdGalleryTrack" style={{ transform: `translateX(-${index * 100}%)` }}>
          {images.length ? images.map((url, i) => (
            <div className="pdSlide" key={i}>
              <img src={cldOpt(url, 900)} alt={product.name} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
            </div>
          )) : (
            <div className="pdSlide">👕</div>
          )}
        </div>
        {images.length > 1 && (
          <>
            <button className="pdArrow pdArrowLeft" onClick={() => slide(-1)}>‹</button>
            <button className="pdArrow pdArrowRight" onClick={() => slide(1)}>›</button>
            <div className="pdDots">
              {images.map((_, i) => <span key={i} className={i === index ? 'active' : ''}></span>)}
            </div>
          </>
        )}
      </div>

      <div style={{ paddingTop: 18 }}>
        {product.brand && <div className="brand">{product.brand}</div>}
        <h2 style={{ margin: '6px 0 10px', fontSize: 22 }}>{product.name}</h2>
        <div className="price" style={{ fontSize: 20 }}>
          ৳{Number(product.price).toLocaleString()}
          {product.old && <span className="old">৳{Number(product.old).toLocaleString()}</span>}
        </div>
        <div style={{ fontSize: 12, marginTop: 6, color: !inStock ? 'var(--red)' : lowStock ? 'var(--red)' : '#2a8f4f' }}>
          {!inStock ? 'Out of Stock' : lowStock ? `Only ${product.stock} left in stock!` : '✓ In Stock'}
        </div>

        {product.fabric && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}><b>Fabric:</b> {product.fabric}</div>
        )}

        {sizes.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <span style={{ fontSize: 12, letterSpacing: 1, color: 'var(--muted)' }}>SELECT SIZE</span>
            <select className="pdSizeSelect" value={size} onChange={e => setSize(e.target.value)}>
              <option value="">Choose an option</option>
              {sizes.map(s => <option value={s} key={s}>{s}</option>)}
            </select>
            {size && <button type="button" className="pdSizeClear" onClick={() => setSize('')}>Clear</button>}
          </div>
        )}

        <div className="qtyRow" style={{ marginTop: 18, gap: 14 }}>
          <span style={{ fontSize: 12, letterSpacing: 1, color: 'var(--muted)' }}>QUANTITY</span>
          <button className="qtyBtn" onClick={() => changeQty(-1)}>−</button>
          <span>{qty}</span>
          <button className="qtyBtn" onClick={() => changeQty(1)}>+</button>
        </div>

        <button className="btn" style={{ width: '100%', marginTop: 20 }} disabled={!inStock} onClick={handleAddToCart}>
          {inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
        </button>
        <button className="btn light" style={{ width: '100%', marginTop: 10 }} disabled={!inStock} onClick={handleBuyNow}>
          BUY NOW
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginTop: 18, textAlign: 'center' }}>
          <div style={{ flex: 1, fontSize: 9, color: 'var(--muted)' }}><div style={{ fontSize: 18 }}>🔒</div>Secure Checkout</div>
          <div style={{ flex: 1, fontSize: 9, color: 'var(--muted)' }}><div style={{ fontSize: 18 }}>💵</div>Cash on Delivery</div>
          <div style={{ flex: 1, fontSize: 9, color: 'var(--muted)' }}><div style={{ fontSize: 18 }}>↩️</div>Easy Return</div>
        </div>

        {related.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,.08)', marginTop: 30, paddingTop: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--muted)', marginBottom: 14 }}>YOU MAY ALSO LIKE</div>
            <ProductGrid products={related} />
          </div>
        )}
      </div>
    </div>
  )
          }
