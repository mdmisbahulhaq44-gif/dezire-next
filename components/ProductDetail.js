'use client'

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useShop } from './ShopContext'
import ProductGrid from './ProductGrid'
import { supabase } from '../lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import { cldOpt } from '../lib/cloudinary'
import { closeWithFade } from '../lib/closeWithFade'
import SaleCountdown from "./SaleCountdown"
import Footer from "./Footer"
import PdTopBar from "./PdTopBar"

const LABELS = { waist: 'Waist', length: 'Length', hip: 'Hip', leg_opening: 'Leg Opening', chest: 'Chest', shoulder: 'Shoulder', sleeve: 'Sleeve' }

function starString(rating) {
  const r = Math.round(rating)
  return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r)
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function ProductDetail({ product, related, saleEndsAt, colors = [] }) {
  const router = useRouter()
  const { addToCart, openMini, openCheckout, openAccount, showToast, wishlist, toggleWishlist, activePanel, drawerOpen } = useShop()

  const images = product.imgs ? product.imgs.split(',').map(s => s.trim()).filter(Boolean) : []
  const sizes = Array.isArray(product.sizes) ? product.sizes : []
  const chart = product.size_chart && typeof product.size_chart === 'object' ? product.size_chart : {}
  const chartSizes = Object.keys(chart)
  const hasChart = chartSizes.length > 0

  const shown = true
  const [index, setIndex] = useState(0)
  const [size, setSize] = useState('')
  const [tab, setTab] = useState('desc')
  const [barOn, setBarOn] = useState(false)
  const addRef = useRef(null)
  const sizeRef = useRef(null)
  const [qty, setQty] = useState(1)
  const [chartOpen, setChartOpen] = useState(false)
  const [reviews, setReviews] = useState(null) // null = loading, 'error' = failed
  const [session, setSession] = useState(undefined) // undefined = not checked yet
  const [reviewed, setReviewed] = useState(false) // this customer already reviewed this product
  const [rating, setRating] = useState('')
  const [comment, setComment] = useState('')
  const touchStartX = useRef(0)
  const panelRef = useRef(null)
  useIsoLayoutEffect(() => {
    const info = window.__dzEnter
    window.__dzEnter = null
    const el = panelRef.current
    if (!info || !el) return
    if (performance.now() - info.t > 12000) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let delay = 0
    if (info.mode === 'preview') {
      delay = performance.now() - info.t
      if (delay >= 320) return
    }
    el.style.animation = 'pdFadeIn 320ms cubic-bezier(.22,.61,.36,1) ' + (-delay) + 'ms backwards'
    el.addEventListener('animationend', () => { el.style.animation = '' }, { once: true })
  }, [])

  const inStock = Number(product.stock) > 0
  const lowStock = inStock && Number(product.stock) <= 5
  const measurements = size && chart[size] ? Object.entries(chart[size]) : []

  const loadReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('id,name,rating,comment,created_at')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
    setReviews(error ? 'error' : (data || []))
    const { data: s } = await supabase.auth.getSession()
    const sess = s && s.session ? s.session : null
    setSession(sess)
    if (sess) {
      const { count } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', product.id)
        .eq('user_id', sess.user.id)
      setReviewed((count || 0) > 0)
    } else {
      setReviewed(false)
    }
  }, [product.id])

  useEffect(() => { loadReviews() }, [loadReviews])

  // bottom buy bar: shows once the Add to cart button has scrolled up out of view
  useEffect(() => {
    const el = addRef.current
    const root = panelRef.current
    if (!el || !root || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => {
      const top = e.rootBounds ? e.rootBounds.top : 0
      setBarOn(!e.isIntersecting && e.boundingClientRect.top < top)
    }, { root, threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window.fbq === 'function') window.fbq('track', 'ViewContent', { content_ids: [String(product.id)], content_type: 'product', content_name: product.name, value: Number(product.price), currency: 'BDT' })
    if (typeof window.gtag === 'function') window.gtag('event', 'view_item', { currency: 'BDT', value: Number(product.price), items: [{ item_id: String(product.id), item_name: product.name, price: Number(product.price) }] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  const list = Array.isArray(reviews) ? reviews : null
  const avg = list && list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0

  function closeProduct() {
    // Always use the browser's native back navigation so the shopper
    // returns to exactly where they were (Shop or Home, same scroll
    // position) instead of being redirected to Home. If there's truly no
    // history to go back to (e.g. the product was opened via a shared
    // link in a fresh tab), this is a harmless no-op.
    closeWithFade(router)
  }

  function slide(dir) {
    if (images.length < 2) return
    setIndex(i => (i + dir + images.length) % images.length)
  }

  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 40) slide(delta > 0 ? -1 : 1)
  }

  function sizeMissing() {
    if (sizes.length && !size) {
      showToast('Please select a size first.')
      return true
    }
    return false
  }

  function handleAddToCart() {
    if (sizeMissing()) return
    addToCart(product, size || null, qty)
    openMini()
  }

  function handleBuyNow() {
    if (sizeMissing()) return
    if (!inStock) { addToCart(product, size || null, qty); return }
    addToCart(product, size || null, qty)
    openCheckout()
  }

  function pickSizeFromChart(s) {
    setSize(s)
    setChartOpen(false)
    showToast('Size ' + s + ' selected')
  }

  async function submitReview(e) {
    e.preventDefault()
    const { data } = await supabase.auth.getSession()
    const s = data && data.session
    if (!s) { showToast('Please login to submit a review.'); return }
    const name = ((s.user.user_metadata && s.user.user_metadata.full_name) || 'DEZIRE Customer').slice(0, 100)
    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      user_id: s.user.id,
      name,
      rating: Number(rating),
      comment: comment.trim().slice(0, 1000)
    })
    if (error) {
      if (error.code === '23505') { setReviewed(true); showToast('You have already reviewed this product.'); return }
      showToast('Could not submit review: ' + (error.message || 'Unknown error')); return
    }
    showToast('Thank you for your review!')
    setRating('')
    setComment('')
    loadReviews()
  }

  const measures = hasChart ? Object.keys(chart[chartSizes[0]] || {}) : []
  const showBar = barOn && !chartOpen && !activePanel && !drawerOpen
  useEffect(() => {
    document.body.classList.toggle('pdBarOn', showBar)
    return () => document.body.classList.remove('pdBarOn')
  }, [showBar])
  function barAction() {
    if (sizes.length && !size) {
      if (sizeRef.current) sizeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    handleAddToCart()
  }
  const selectable = sizes.length > 0

  return (
    <>
      <div className={`panel${shown ? ' show' : ''}`} id="productPanel" ref={panelRef} style={{ overscrollBehavior: 'contain' }}>
        <PdTopBar onBack={closeProduct} />

        <div className="pdGallery" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="pdGalleryTrack" style={{ transform: `translateX(-${index * 100}%)` }}>
            {images.length ? images.map((url, i) => (
              <div className="pdSlide" key={i} style={{ position: 'relative' }}>
                <Image
                  src={cldOpt(url, 900)}
                  alt={product.name}
                  fill
                  sizes="(min-width: 901px) 400px, 100vw"
                  style={{ objectFit: 'cover' }}
                  priority={i === 0}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  quality={75}
                />
              </div>
            )) : (
              <div className="pdSlide">👕</div>
            )}
          </div>
          {images.length > 1 && (
            <>
              <button className="pdArrow pdArrowLeft" onClick={() => slide(-1)}>‹</button>
              <button className="pdArrow pdArrowRight" onClick={() => slide(1)}>›</button>
            </>
          )}
          <div className="pdDots">
            {images.length > 1 && images.map((_, i) => <span key={i} className={i === index ? 'active' : ''}></span>)}
          </div>
        </div>

        {images.length > 1 && (
          <div className="pdThumbs">
            {images.map((url, i) => (
              <button type="button" key={i} className={`pdThumb${i === index ? ' active' : ''}`} onClick={() => setIndex(i)} aria-label={`Photo ${i + 1}`}>
                <Image src={cldOpt(url, 240)} alt="" fill sizes="25vw" style={{ objectFit: 'cover' }} loading="lazy" quality={60} />
              </button>
            ))}
          </div>
        )}

        <div style={{ paddingTop: 14 }}>
          <div className="pdCrumb">
            <span>Home</span>{(product.cat || '').split('/').map(x => x.trim()).filter(Boolean).map((c, i) => <span key={i}> / {c}</span>)}<span> / {product.name}</span>
          </div>
          <h2 className="pdTitle">{product.name}</h2>

          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, minHeight: 18 }}>
            {list && list.length > 0 ? (
              <>
                <span style={{ color: 'var(--gold)' }}>{starString(avg)}</span> {avg.toFixed(1)} ({list.length} review{list.length > 1 ? 's' : ''})
              </>
            ) : list ? 'No ratings yet' : ''}
          </div>

          <div className="price" style={{ fontSize: 20 }}>
            ৳{Number(product.price).toLocaleString()}
            {product.old && <> <span className="old">৳{Number(product.old).toLocaleString()}</span></>}
          </div>
<SaleCountdown productId={product.id} endsAt={saleEndsAt || null} />
          <div className="pdDelivery">Order now and get it in 2–3 days inside Dhaka and 3–5 days outside Dhaka.</div>
          <div style={{ fontSize: 12, marginTop: 6, color: !inStock ? 'var(--red)' : lowStock ? 'var(--red)' : '#2a8f4f' }}>
            {!inStock ? 'Out of Stock' : lowStock ? `Only ${product.stock} left in stock!` : '✓ In Stock'}
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {product.fabric && <div style={{ marginTop: 4 }}><b>Fabric:</b> {product.fabric}</div>}
          </div>

          {hasChart && (
            <div className="pdMeasure">
              <b>Measurements (in inches):</b>
              {chartSizes.map(s => (
                <div key={s}><span>{s}</span>: {Object.entries(chart[s]).map(([k, v]) => `${LABELS[k] || k}- ${v}`).join(' | ')}</div>
              ))}
            </div>
          )}

          {hasChart && (
            <button
              type="button"
              onClick={() => setChartOpen(true)}
              style={{ background: 'none', border: 0, textDecoration: 'underline', fontSize: 11, color: 'var(--gold)', padding: 0, marginTop: 6, cursor: 'pointer' }}
            >
              SIZE GUIDE
            </button>
          )}

          {colors.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: 12, letterSpacing: 1, color: 'var(--muted)' }}>COLOR</span>
              <span style={{ fontSize: 12, marginLeft: 8 }}>{product.color_name || product.name}</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {colors.map(c => {
                  const img = c.imgs ? c.imgs.split(',')[0].trim() : ''
                  const active = c.id === product.id
                  const out = Number(c.stock) <= 0
                  const box = (
                    <span style={{ display: 'block', position: 'relative', width: 46, height: 58, borderRadius: 6, overflow: 'hidden', border: active ? '2px solid #111' : '1px solid #ddd', opacity: out ? 0.45 : 1 }}>
                      {img ? <Image src={cldOpt(img, 160)} alt={c.color_name || c.name} fill sizes="46px" style={{ objectFit: 'cover' }} quality={60} /> : null}
                    </span>
                  )
                  return active ? (
                    <span key={c.id} title={c.color_name || c.name}>{box}</span>
                  ) : (
                    <Link
                      key={c.id}
                      href={`/product/${c.id}`}
                      replace
                      data-replace="1"
                      title={(c.color_name || c.name) + (out ? ' (sold out)' : '')}
                      data-preview={JSON.stringify({ id: c.id, name: c.name, price: c.price, old: c.old || null, img })}
                    >{box}</Link>
                  )
                })}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div ref={sizeRef} style={{ marginTop: 14 }}>
              <span className="pdOptLabel">Size</span>
              <select className="pdSizeSelect" value={size} onChange={e => setSize(e.target.value)}>
                <option value="">Choose an option</option>
                {sizes.map(s => <option value={s} key={s}>{s}</option>)}
              </select>
              {size && <button type="button" className="pdSizeClear" onClick={() => setSize('')}>Clear</button>}
              {measurements.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#333', lineHeight: 1.6 }}>
                  <b>{size}</b>: {measurements.map(([k, v]) => `${LABELS[k] || k}- ${v}"`).join(' | ')}
                </div>
              )}
            </div>
          )}

          <div className="qtyRow" style={{ marginTop: 18, gap: 14 }}>
            <span style={{ fontSize: 12, letterSpacing: 1, color: 'var(--muted)' }}>QUANTITY</span>
            <button className="qtyBtn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button className="qtyBtn" onClick={() => setQty(q => q + 1)}>+</button>
          </div>

          <button ref={addRef} className="btn" style={{ width: '100%', marginTop: 20 }} disabled={!inStock} onClick={handleAddToCart}>
            {inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
          </button>
          <button className="btn light" style={{ width: '100%', marginTop: 10 }} onClick={handleBuyNow}>
            BUY NOW
          </button>
          <button type="button" className="btn light" style={{ width: '100%', marginTop: 10 }} onClick={() => toggleWishlist(product)}>
            {wishlist.some(w => w.id === product.id) ? '♥ SAVED IN WISHLIST' : '♡ ADD TO WISHLIST'}
          </button>

          {product.cat && (
            <div className="pdMeta"><b>Categories:</b> {product.cat.split('/').map(x => x.trim()).filter(Boolean).join(', ')}</div>
          )}


          {(product.description || product.fabric || product.color_name || sizes.length > 0) && (
            <div className="pdTabs">
              <div className="pdTabBar">
                <button type="button" className={tab === 'desc' ? 'active' : ''} onClick={() => setTab('desc')}>Description</button>
                <button type="button" className={tab === 'info' ? 'active' : ''} onClick={() => setTab('info')}>Additional Information</button>
              </div>
              {tab === 'desc' ? (
                <div className="pdDesc">{product.description || 'No description added yet.'}</div>
              ) : (
                <table className="pdInfoTable"><tbody>
                  {product.fabric && <tr><th>Fabric</th><td>{product.fabric}</td></tr>}
                  {product.color_name && <tr><th>Color</th><td>{product.color_name}</td></tr>}
                  {sizes.length > 0 && <tr><th>Sizes</th><td>{sizes.join(', ')}</td></tr>}
                  {product.cat && <tr><th>Category</th><td>{product.cat.split('/').map(s => s.trim()).filter(Boolean).join(' › ')}</td></tr>}
                </tbody></table>
              )}
            </div>
          )}

          {related.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(0,0,0,.08)', marginTop: 30, paddingTop: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--muted)', marginBottom: 14 }}>RELATED PRODUCTS</div>
              <ProductGrid products={related} replaceLinks />
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(0,0,0,.08)', marginTop: 30, paddingTop: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--muted)', marginBottom: 14 }}>REVIEWS</div>

            {reviews === null && <div className="empty" style={{ padding: '20px 10px' }}>Loading reviews...</div>}
            {reviews === 'error' && <div className="empty" style={{ padding: '20px 10px' }}>Could not load reviews.</div>}
            {list && list.length === 0 && (
              <div className="empty" style={{ padding: '20px 10px' }}>No reviews yet. Be the first to review!</div>
            )}
            {list && list.map(r => (
              <div key={r.id} style={{ borderBottom: '1px solid rgba(0,0,0,.08)', padding: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: 13 }}>{r.name}</b>
                  <span style={{ color: 'var(--gold)', fontSize: 12 }}>{starString(r.rating)}</span>
                </div>
                {r.comment && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{r.comment}</p>}
              </div>
            ))}

            <div style={{ marginTop: 16 }}>
              {session === undefined ? null : session ? (reviewed ? (
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>✓ You have already reviewed this product. Thank you!</p>
              ) : (
                <form className="form" onSubmit={submitReview}>
                  <label>YOUR RATING</label>
                  <select value={rating} onChange={e => setRating(e.target.value)} required>
                    <option value="">Select rating</option>
                    <option value="5">★★★★★ (5)</option>
                    <option value="4">★★★★ (4)</option>
                    <option value="3">★★★ (3)</option>
                    <option value="2">★★ (2)</option>
                    <option value="1">★ (1)</option>
                  </select>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience with this product (optional)" />
                  <button className="btn light" style={{ width: '100%' }}>SUBMIT REVIEW</button>
                </form>
              )) : (
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                  <a href="#" onClick={e => { e.preventDefault(); openAccount() }} style={{ textDecoration: 'underline' }}>Login</a> to write a review.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="pdFooter"><Footer /></div>
      </div>

      <div className={`pdBuyBar${showBar ? ' show' : ''}`} aria-hidden={!showBar}>
        <button type="button" className="btn" tabIndex={showBar ? 0 : -1} disabled={!inStock} onClick={barAction}>
          {!inStock ? 'Out of stock' : (sizes.length && !size) ? 'Select options' : 'Add to cart'}
        </button>
      </div>

      <div className={`panel${chartOpen ? ' show' : ''}`}>
        <div className="panelHead">
          <h2>Size Guide</h2>
          <button className="close" onClick={() => setChartOpen(false)}>×</button>
        </div>
        <div style={{ overflow: 'auto' }}>
          {hasChart && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Size</th>
                    {measures.map(m => (
                      <th key={m} style={{ textAlign: 'left', padding: '8px 4px', textTransform: 'capitalize' }}>{m}</th>
                    ))}
                  </tr>
                  {chartSizes.map(s => {
                    const isSelected = s === size
                    const canSelect = selectable && sizes.includes(s)
                    return (
                      <tr
                        key={s}
                        className={`${canSelect ? 'sizeChartRow' : ''}${isSelected ? ' selected' : ''}`}
                        style={{ borderBottom: '1px solid var(--line)' }}
                        onClick={canSelect ? () => pickSizeFromChart(s) : undefined}
                      >
                        <td style={{ padding: '8px 4px', fontWeight: 700 }}>{s}{isSelected ? ' ✓' : ''}</td>
                        {measures.map(m => (
                          <td key={m} style={{ padding: '8px 4px' }}>{chart[s][m]}"</td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
                All measurements in inches.{selectable ? ' Tap a row to select that size.' : ''}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
