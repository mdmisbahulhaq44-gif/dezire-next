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
import { buildShopPath, capitalize } from "../lib/categories"
import Money from './Money'
import RecentlyViewed from './RecentlyViewed'

const LABELS = { waist: 'Waist', length: 'Length', hip: 'Hip', leg_opening: 'Leg Opening', chest: 'Chest', shoulder: 'Shoulder', sleeve: 'Sleeve' }

const SIZE_NAMES = { XS: 'Extra Small', S: 'Small', M: 'Medium', L: 'Large', XL: 'Extra Large', XXL: 'Double Extra Large', '2XL': 'Double Extra Large' }
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL']
// sizes in the natural order (S, M, L, XL, XXL), not the alphabetical order the database returns (L, M, S, XL, XXL)
function sortSizes(list) {
  const rank = s => SIZE_ORDER.indexOf(String(s).trim().toUpperCase())
  if (list.every(s => rank(s) >= 0)) return [...list].sort((a, b) => rank(a) - rank(b))
  if (list.every(s => !isNaN(parseFloat(s)))) return [...list].sort((a, b) => parseFloat(a) - parseFloat(b))
  return list
}
// bullet "Fit: boxy fit" -> bold label, normal value (like the reference); text that already has **bold** is left alone
function boldLabel(text, k) {
  if (text.includes('**')) return inlineBold(text, k)
  const m = text.match(/^([^:/]{1,32}:)(?!\/)\s*(.*)$/)
  return m ? <><strong>{m[1]}</strong>{m[2] ? ' ' + m[2] : ''}</> : text
}

function fmtWeight(g) {
  const n = Number(g)
  if (!g || !(n > 0)) return 'N/A'
  return n >= 1000 ? String(+(n / 1000).toFixed(2)) + ' kg' : n + ' g'
}

function starString(rating) {
  const r = Math.round(rating)
  return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r)
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Description text -> paragraphs and bullet lists. Blank line = new paragraph, "• " / "- " = bullet, **text** = bold.
function inlineBold(t, k) {
  return t.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <strong key={k + '-' + i}>{p}</strong> : p))
}
function renderDesc(text, tr) {
  const t = (text || '').trim()
  if (!t) return tr ? tr('No description added yet.') : 'No description added yet.'
  const isBullet = l => /^[•\-*·]\s+/.test(l)
  return t.split(/\n\s*\n/).map((block, bi, all) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    const out = []
    let para = []
    let items = []
    const flushPara = () => { if (para.length) { out.push(<p key={bi + 'p' + out.length}>{para.map((l, i) => <span key={i}>{i > 0 && <br />}{inlineBold(l, bi + '-' + i)}</span>)}</p>); para = [] } }
    const flushList = () => { if (items.length) { out.push(<ul key={bi + 'u' + out.length}>{items.map((l, i) => <li key={i}>{boldLabel(l, bi + '-' + i)}</li>)}</ul>); items = [] } }
    lines.forEach(l => {
      if (isBullet(l)) { flushPara(); items.push(l.replace(/^[•\-*·]\s+/, '')) }
      else { flushList(); para.push(l) }
    })
    flushPara(); flushList()
    if (bi < all.length - 1) out.push(<p key={bi + 'sp'} className="rfSp" aria-hidden="true">&nbsp;</p>)
    return out
  })
}

// Full-screen photo viewer like the reference: counter (1 / 13), fullscreen button, close, swipe left/right, every photo in its own ratio
function Lightbox({ images, start, name, onClose }) {
  const [i, setI] = useState(start)
  const [dx, setDx] = useState(0)
  const [drag, setDrag] = useState(false)
  const [fs, setFs] = useState(false)
  const x0 = useRef(0)
  const y0 = useRef(0)
  const horiz = useRef(null)
  const n = images.length

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onFs() { setFs(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFs)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('fullscreenchange', onFs)
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {})
    }
  }, [])

  function go(d) { setI(k => Math.min(n - 1, Math.max(0, k + d))) }
  function ts(e) { x0.current = e.touches[0].clientX; y0.current = e.touches[0].clientY; horiz.current = null; setDrag(true) }
  function tm(e) {
    const mx = e.touches[0].clientX - x0.current
    const my = e.touches[0].clientY - y0.current
    if (horiz.current === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) horiz.current = Math.abs(mx) > Math.abs(my)
    if (horiz.current) setDx(mx)
  }
  function te() {
    setDrag(false)
    if (horiz.current && Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
    setDx(0)
  }
  function toggleFs() {
    if (document.fullscreenElement) { if (document.exitFullscreen) document.exitFullscreen().catch(() => {}) }
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {})
  }

  const iconBtn = { width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 0, color: '#eee', cursor: 'pointer', padding: 0 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,.88)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'calc(44px + var(--sat, 0px))', paddingTop: 'var(--sat, 0px)', paddingLeft: 14, background: 'rgba(0,0,0,.5)', color: '#ddd', fontSize: 14 }}>
        <span>{i + 1} / {n}</span>
        <div style={{ display: 'flex' }}>
          <button type="button" aria-label={fs ? 'Exit full screen' : 'Full screen'} onClick={toggleFs} style={iconBtn}>
            {fs ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
            )}
          </button>
          <button type="button" aria-label="Close" onClick={() => onClose(i)} style={iconBtn}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', touchAction: 'pan-y' }} onTouchStart={ts} onTouchMove={tm} onTouchEnd={te} onTouchCancel={te}>
        <div style={{ display: 'flex', height: '100%', transform: `translateX(calc(-${i * 100}% + ${dx}px))`, transition: drag ? 'none' : 'transform .25s ease' }}>
          {images.map((url, k) => (
            <div key={k} style={{ minWidth: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Math.abs(k - i) <= 1 && (
                <img src={cldOpt(url, 1200)} alt={name} draggable="false" style={{ width: '100%', height: 'auto', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProductDetail({ product, related, saleEndsAt, colors = [] }) {
  const router = useRouter()
  const { addToCart, openMini, openCheckout, openAccount, showToast, wishlist, toggleWishlist, activePanel, drawerOpen, t, lang } = useShop()

  const images = product.imgs ? product.imgs.split(',').map(s => s.trim()).filter(Boolean) : []
  const sizes = Array.isArray(product.sizes) ? product.sizes : []
  const chart = product.size_chart && typeof product.size_chart === 'object' ? product.size_chart : {}
  const chartSizes = sortSizes(Object.keys(chart))
  const hasChart = chartSizes.length > 0

  // category path without the product's own name (some products have it as the last category, which showed the name twice)
  const gender = product.gender === 'women' ? 'women' : 'men'
  const rawCat = (product.cat || '').split('/').map(x => x.trim()).filter(Boolean)
  const catSegs = rawCat.length && rawCat[rawCat.length - 1].toLowerCase() === (product.name || '').trim().toLowerCase() ? rawCat.slice(0, -1) : rawCat

  const shown = true
  const [index, setIndex] = useState(0)
  const [size, setSize] = useState('')
  const [openDesc, setOpenDesc] = useState(true)
  const [openInfo, setOpenInfo] = useState(false)
  const [barOn, setBarOn] = useState(false)
  const [atEnd, setAtEnd] = useState(false)
  const addRef = useRef(null)
  const sizeRef = useRef(null)
  const [qty, setQty] = useState(1)
  const maxQty = Number(product.stock) > 0 ? Number(product.stock) : 99
  const qtyNum = () => Math.min(maxQty, Math.max(1, parseInt(qty, 10) || 1))
  function stepQty(d) {
    const cur = Math.max(1, parseInt(qty, 10) || 1)
    if (d > 0 && cur >= maxQty) { showToast(t('Only {n} left in stock!', { n: maxQty })); return }
    setQty(Math.min(maxQty, Math.max(1, cur + d)))
  }
  const [chartOpen, setChartOpen] = useState(false)
  const [reviews, setReviews] = useState(null) // null = loading, 'error' = failed
  const [session, setSession] = useState(undefined) // undefined = not checked yet
  const [reviewed, setReviewed] = useState(false) // this customer already reviewed this product
  const [rating, setRating] = useState('')
  const [comment, setComment] = useState('')
  const touchStartX = useRef(0)
  const panelRef = useRef(null)
  const thumbsRef = useRef(null)
  const [thumbMore, setThumbMore] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [ratios, setRatios] = useState({})
  const [galAnim, setGalAnim] = useState(false)
  useEffect(() => { const id = setTimeout(() => setGalAnim(true), 700); return () => clearTimeout(id) }, [])
  function setRatio(i, el) {
    if (!el || !el.naturalWidth || !el.naturalHeight) return
    const r = el.naturalWidth / el.naturalHeight
    setRatios(o => (o[i] && Math.abs(o[i] - r) < 0.001 ? o : { ...o, [i]: r }))
  }
  function onThumbScroll() {
    const el = thumbsRef.current
    if (el) setThumbMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }
  function nextThumbs() {
    const el = thumbsRef.current
    if (el) el.scrollBy({ left: el.clientWidth * 0.75, behavior: 'smooth' })
  }
  useEffect(() => { onThumbScroll() }, [images.length]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = thumbsRef.current
    const b = el && el.children[index]
    if (b && el.scrollTo) el.scrollTo({ left: Math.max(0, b.offsetLeft - 8), behavior: 'smooth' })
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps
  useIsoLayoutEffect(() => {
    const info = window.__dzEnter
    window.__dzEnter = null
    const el = panelRef.current
    if (!info || !el) return
    if (performance.now() - info.t > 12000) return
    if (info.still) return
    if (info.mode === 'preview' && document.getElementById('productPreview')) return
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


  // bottom buy bar: appears a little before the Add to cart button leaves the screen and hides again a bit later when scrolling back up (the gap stops flicker)
  useEffect(() => {
    const el = addRef.current
    const root = panelRef.current
    if (!el || !root) return
    function check() {
      const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top
      const h = root.clientHeight
      if (top < h * 0.24) setBarOn(true)
      else if (top > h * 0.30) setBarOn(false)
    }
    check()
    root.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => { root.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
  }, [])

  // hide the buy bar once the footer's copyright row is reached (nothing floats over the footer's end)
  useEffect(() => {
    const root = panelRef.current
    const el = root ? root.querySelector('.pdFooter .gfBottom') : null
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), { root, threshold: 0 })
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
      showToast(t('Please select a size first.'))
      return true
    }
    return false
  }

  function handleAddToCart() {
    if (sizeMissing()) return
    addToCart(product, size || null, qtyNum())
    openMini()
  }

  function handleBuyNow() {
    if (sizeMissing()) return
    if (!inStock) { addToCart(product, size || null, qtyNum()); return }
    addToCart(product, size || null, qtyNum())
    openCheckout()
  }

  function pickSizeFromChart(s) {
    setSize(s)
    setChartOpen(false)
    showToast(t('Size {s} selected', { s }))
  }

  async function submitReview(e) {
    e.preventDefault()
    const { data } = await supabase.auth.getSession()
    const s = data && data.session
    if (!s) { showToast(t('Please login to submit a review.')); return }
    const name = ((s.user.user_metadata && s.user.user_metadata.full_name) || 'HEAVEN Customer').slice(0, 100)
    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      user_id: s.user.id,
      name,
      rating: Number(rating),
      comment: comment.trim().slice(0, 1000)
    })
    if (error) {
      if (error.code === '23505') { setReviewed(true); showToast(t('You have already reviewed this product.')); return }
      showToast(t('Could not submit review: {m}', { m: error.message || 'Unknown error' })); return
    }
    showToast(t('Thank you for your review!'))
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

        <div className="pdGallery" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ aspectRatio: ratios[index] || 1, background: '#fff', transition: galAnim ? 'aspect-ratio .3s ease' : 'none' }}>
          <div className="pdGalleryTrack" style={{ transform: `translateX(-${index * 100}%)` }}>
            {images.length ? images.map((url, i) => (
              <div className="pdSlide" key={i}>
                <img
                  src={cldOpt(url, 900)}
                  alt={product.name}
                  loading={Math.abs(i - index) <= 1 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                  onLoad={e => setRatio(i, e.currentTarget)}
                  ref={el => { if (el && el.complete) setRatio(i, el) }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
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
          <button type="button" className="pdZoomBtn" aria-label="Zoom photo" onClick={() => setZoomOpen(true)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          </button>
          <div className="pdDots">
            {images.length > 1 && images.map((_, i) => <span key={i} className={i === index ? 'active' : ''}></span>)}
          </div>
        </div>

        {images.length > 1 && (
          <div className="pdThumbsWrap">
            <div className="pdThumbs" ref={thumbsRef} onScroll={onThumbScroll}>
              {images.map((url, i) => (<button type="button" key={i} className={`pdThumb${i === index ? ' active' : ''}`} onClick={() => setIndex(i)} aria-label={`Photo ${i + 1}`}>
                <Image src={cldOpt(url, 240)} alt="" fill sizes="25vw" style={{ objectFit: 'cover' }} loading={i < 8 ? 'eager' : 'lazy'} quality={60} />
              </button>
              ))}
            </div>
            {thumbMore && (
              <button type="button" className="pdThumbNext" aria-label="More photos" onClick={nextThumbs}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        )}

        <div style={{ paddingTop: 14 }}>
          <div className="pdCrumb">
            <Link href="/">{t('Home')}</Link>
            <span> / </span><Link href={buildShopPath(gender, [])}>{t(capitalize(gender))}</Link>
            {catSegs.map((c, i) => (
              <span key={i}> / <Link href={buildShopPath(gender, catSegs.slice(0, i + 1))}>{t(c)}</Link></span>
            ))}
            <span> / {product.name}</span>
          </div>
          <h2 className="pdTitle">{product.name}</h2>

          <div className="price" style={{ fontSize: 20 }}>
            <Money n={product.price} />
            {product.old && <> <span className="old"><Money n={product.old} /></span></>}
          </div>
<SaleCountdown productId={product.id} endsAt={saleEndsAt || null} />
          <div className="pdDelivery">{t('Order now and get it in 2–3 days inside Dhaka and 3–5 days outside Dhaka.')}</div>
          <div style={{ fontSize: 12, marginTop: 6, color: !inStock ? 'var(--red)' : lowStock ? 'var(--red)' : '#2a8f4f' }}>
            {!inStock ? t('Out of Stock') : lowStock ? t('Only {n} left in stock!', { n: product.stock }) : '✓ ' + t('In Stock')}
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {product.fabric && <div style={{ marginTop: 4 }}><b>{t('Fabric')}:</b> {product.fabric}</div>}
          </div>

          

          {hasChart && (
            <div className="pdMeasureTop">
              <b>{t('Measurements (in inches):')}</b>
              {chartSizes.map(s => (
                <div key={s}><span>{s}</span> : {Object.entries(chart[s]).map(([k, v]) => `${t(LABELS[k] || k)}- ${v}`).join(' | ')}</div>
              ))}
            </div>
          )}

          {colors.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: 12, letterSpacing: 1, color: 'var(--muted)' }}>{t('COLOR')}</span>
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
                      title={(c.color_name || c.name) + (out ? ' (' + t('sold out') + ')' : '')}
                      data-preview={JSON.stringify({ id: c.id, name: c.name, price: c.price, old: c.old || null, img, all: c.imgs || '' })}
                    >{box}</Link>
                  )
                })}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div ref={sizeRef} style={{ marginTop: 14 }}>
              <span className="pdOptLabel">{catSegs.length ? t(catSegs[catSegs.length - 1]) : t('Size')}</span>
              <select className="pdSizeSelect" value={size} onChange={e => setSize(e.target.value)}>
                <option value="">{t('Choose an option')}</option>
                {sizes.map(s => <option value={s} key={s}>{s}</option>)}
              </select>
              {size && <button type="button" className="pdSizeClear" onClick={() => setSize('')}>{t('Clear')}</button>}
              {measurements.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#333', lineHeight: 1.6 }}>
                  <b>{size}</b>: {measurements.map(([k, v]) => `${t(LABELS[k] || k)}- ${v}`).join(' | ')}
                </div>
              )}
            </div>
          )}

          <div className="pdAvail">{t('Availability:')}</div>
          <div className="pdBuyRow">
            <div className="pdQtyBox">
              <button type="button" aria-label="Decrease quantity" onClick={() => stepQty(-1)}>−</button>
              <input className="pdQty" type="text" inputMode="numeric" pattern="[0-9]*" value={qty} onChange={e => setQty(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))} onBlur={() => setQty(qtyNum())} aria-label="Quantity" />
              <button type="button" aria-label="Increase quantity" onClick={() => stepQty(1)}>+</button>
            </div>
            <button ref={addRef} className="btn pdAddBtn" disabled={!inStock} onClick={handleAddToCart}>
              {inStock ? t('Add to cart') : t('Out of stock')}
            </button>
            <button type="button" className={`pdHeart${wishlist.some(w => w.id === product.id) ? ' on' : ''}`} onClick={() => toggleWishlist(product)} aria-label={wishlist.some(w => w.id === product.id) ? 'Remove from wishlist' : 'Add to wishlist'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlist.some(w => w.id === product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </button>
          </div>

          {product.sku && (
            <div className="pdMeta">
              {product.sku && <div style={{ marginBottom: 0 }}><b>SKU:</b> {product.sku}</div>}
            </div>
          )}


          {(product.description || product.features || product.fabric || product.color_name || sizes.length > 0 || hasChart) && (
            <div className="rfAcc">
              {(product.description || product.features || hasChart) && (
                <div className={`rfTab${openDesc ? ' open' : ''}`}>
                  <button type="button" className="rfHead" aria-expanded={openDesc} onClick={() => setOpenDesc(o => !o)}>
                    <span>{t('Description')}</span>
                    <svg className="rfPlus" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" /></svg>
                    <svg className="rfMinus" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 10h24v4h-24z" /></svg>
                  </button>
                  <div className="rfBody"><div className="rfInner"><div className="rfWrap">
                    <div className="rfDesc">
                      {renderDesc(product.description, t)}
                      {product.description && product.features && <p className="rfSp" aria-hidden="true">&nbsp;</p>}
                      {product.features && renderDesc(product.features.split('\n').filter(Boolean).map(l => '• ' + l.replace(/^[•\-*·]\s*/, '')).join('\n'), t)}
                      {hasChart && (<>
                        <p className="rfSp" aria-hidden="true">&nbsp;</p>
                        <p><strong>{t('Measurements (in inches):')}</strong></p>
                        {chartSizes.map(s => (<p key={s}>{s} : {Object.entries(chart[s]).map(([k, v]) => `${t(LABELS[k] || k)}- ${v}`).join(' | ')}</p>))}
                      </>)}
                    </div>
                  </div></div></div>
                </div>
              )}
              {(
                <div className={`rfTab${openInfo ? ' open' : ''}`}>
                  <button type="button" className="rfHead" aria-expanded={openInfo} onClick={() => setOpenInfo(o => !o)}>
                    <span>{lang === 'bn' ? t('Additional Information') : 'Additional information'}</span>
                    <svg className="rfPlus" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" /></svg>
                    <svg className="rfMinus" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 10h24v4h-24z" /></svg>
                  </button>
                  <div className="rfBody"><div className="rfInner"><div className="rfWrap">
                    <table className="rfAttr"><tbody>
                      <tr><th>{t('Weight')}</th><td><p>{fmtWeight(product.weight_g)}</p></td></tr>
                      {sizes.length > 0 && <tr><th>{catSegs.length ? t(catSegs[catSegs.length - 1]) : t('Size')}</th><td><p>{sortSizes(sizes).join(', ')}</p></td></tr>}
                    </tbody></table>
                  </div></div></div>
                </div>
              )}
            </div>
          )}

          {related.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(0,0,0,.08)', marginTop: 30, paddingTop: 20 }}>
              <div className="pdRelTitle">{t('Related products')}</div>
              <ProductGrid products={related} replaceLinks detailed />
            </div>
          )}

          <RecentlyViewed exclude={product.id} compact />

        </div>
        <div className="pdFooter"><Footer /></div>
      </div>

      {zoomOpen && images.length > 0 && (
        <Lightbox images={images} start={index} name={product.name} onClose={k => { setIndex(k); setZoomOpen(false) }} />
      )}
      <div className={`pdBuyBar${showBar ? ' show' : ''}`} aria-hidden={!showBar}>
        <button type="button" className="btn" tabIndex={showBar ? 0 : -1} disabled={!inStock} onClick={barAction}>
          {!inStock ? t('Out of stock') : (sizes.length && !size) ? t('Select options') : t('Add to cart')}
        </button>
      </div>

      <div className={`panel${chartOpen ? ' show' : ''}`}>
        <div className="panelHead">
          <h2>{t('Size Guide')}</h2>
          <button className="close" onClick={() => setChartOpen(false)}>×</button>
        </div>
        <div style={{ overflow: 'auto' }}>
          {hasChart && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>{t('Size')}</th>
                    {measures.map(m => (
                      <th key={m} style={{ textAlign: 'left', padding: '8px 4px', textTransform: 'capitalize' }}>{lang === 'bn' ? t(LABELS[m] || m) : m}</th>
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
                {t('All measurements in inches.')}{selectable ? ' ' + t('Tap a row to select that size.') : ''}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
