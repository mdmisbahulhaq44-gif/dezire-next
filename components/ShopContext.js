'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { getCart, saveCart, cartCount, cartSubtotal } from '../lib/cart'
import { getWishlist, saveWishlist } from '../lib/wishlist'

const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [activePanel, setActivePanel] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [miniOpen, setMiniOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const [lastOrder, setLastOrder] = useState(null)
  const [paymentReturn, setPaymentReturn] = useState(null)
  const toastTimer = useRef(null)
  const prevPanel = useRef(null)
  const fromPop = useRef(false)
  const keepHistory = useRef(false)

  useEffect(() => { setCart(getCart()); setWishlist(getWishlist()) }, [])

  // Panels live in browser history: phone Back closes a panel or returns to the one under it
  useEffect(() => {
    const st0 = window.history.state
    if (st0 && st0.dzPanel) {
      const clean = { ...st0 }
      delete clean.dzPanel
      delete clean.dzDepth
      window.history.replaceState(clean, '')
    }
    function onPop(e) {
      const next = (e.state && e.state.dzPanel) || null
      if (next !== prevPanel.current) {
        fromPop.current = true
        if (next === 'account') {
          const root = document.documentElement
          root.setAttribute('data-instant', '1')
          clearTimeout(window.__dzInstant)
          window.__dzInstant = setTimeout(() => root.removeAttribute('data-instant'), 800)
        }
        setActivePanel(next)
      }
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener('dzrestore', onPop)
    return () => window.removeEventListener('popstate', onPop)
      window.removeEventListener('dzrestore', onPop)
  }, [])

  useEffect(() => {
    const prev = prevPanel.current
    prevPanel.current = activePanel
    if (fromPop.current) { fromPop.current = false; return }
    if (activePanel === prev) return
    const st = window.history.state || {}
    const depth = st.dzDepth || 0
    if (activePanel) {
      const base = { ...st }
      delete base.dzView
      if (activePanel === 'success' && depth > 0) window.history.replaceState({ ...base, dzPanel: 'success', dzDepth: depth }, '')
      else window.history.pushState({ ...base, dzPanel: activePanel, dzDepth: depth + 1 }, '')
    } else if (keepHistory.current) {
      keepHistory.current = false
    } else if (depth > 0) {
      window.history.go(-depth)
    }
  }, [activePanel])

  // Cross (x) buttons act like the phone Back gesture; links inside a panel keep the history entry
  useEffect(() => {
    let timer
    function onClick(e) {
      if (!prevPanel.current) return
      const el = e.target
      if (!el || !el.closest) return
      if (el.closest('.panel .close, .panelHead .close')) {
        const st = window.history.state || {}
        if (st.dzDepth > 0) { e.preventDefault(); e.stopPropagation(); window.history.back() }
        return
      }
      const a = el.closest('a[href]')
      if (a && a.closest('.panel') && a.origin === window.location.origin && a.pathname !== window.location.pathname) {
        keepHistory.current = true
        clearTimeout(timer)
        timer = setTimeout(() => { keepHistory.current = false }, 1500)
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  useEffect(() => {
    document.body.style.overflow = (activePanel || drawerOpen || miniOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activePanel, drawerOpen, miniOpen])

  function persist(next) {
    setCart(next)
    saveCart(next)
  }

  function showToast(message) {
    setToastMsg(message)
    setToastShow(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastShow(false), 2500)
  }

  function addToCart(product, size = null, qty = 1) {
    if (Number(product.stock) <= 0) {
      showToast('This item is out of stock.')
      return
    }
    const existing = cart.find(i => i.id === product.id && (i.size || null) === size)
    let next
    if (existing) {
      next = cart.map(i => i === existing ? { ...i, qty: i.qty + qty } : i)
    } else {
      next = [...cart, {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        imgs: product.imgs,
        size,
        qty
      }]
    }
    persist(next)
    showToast(product.name + (size ? ` (Size: ${size})` : '') + ' added to cart')

    if (typeof window.fbq === 'function') window.fbq('track', 'AddToCart', { content_ids: [String(product.id)], content_type: 'product', content_name: product.name, value: Number(product.price), currency: 'BDT' })
    if (typeof window.gtag === 'function') window.gtag('event', 'add_to_cart', { currency: 'BDT', value: Number(product.price), items: [{ item_id: String(product.id), item_name: product.name, price: Number(product.price) }] })
  }

  function changeQty(id, size, delta) {
    const next = cart
      .map(i => (i.id === id && (i.size || null) === (size || null)) ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    persist(next)
  }

  function removeFromCart(id, size) {
    persist(cart.filter(i => !(i.id === id && (i.size || null) === (size || null))))
  }

  function clearCart() {
    persist([])
  }

  function toggleWishlist(product) {
    const has = wishlist.some(w => w.id === product.id)
    const next = has
      ? wishlist.filter(w => w.id !== product.id)
      : [{ id: product.id, price: Number(product.price) }, ...wishlist]
    setWishlist(next)
    saveWishlist(next)
    showToast(has ? 'Removed from wishlist' : 'Added to wishlist')
  }

  function removeFromWishlist(id) {
    const next = wishlist.filter(w => w.id !== id)
    setWishlist(next)
    saveWishlist(next)
  }

  function flashInstant() {
    const root = document.documentElement
    root.setAttribute('data-instant', '1')
    clearTimeout(window.__dzInstant)
    window.__dzInstant = setTimeout(() => root.removeAttribute('data-instant'), 800)
  }

  function swapPanel(name) {
    if (prevPanel.current === 'account') flashInstant()
    setActivePanel(name)
  }

  const value = {
    cart,
    wishlist,
    wishlistCount: wishlist.length,
    toggleWishlist,
    removeFromWishlist,
    cartCount: cartCount(cart),
    cartSubtotal: cartSubtotal(cart),
    activePanel,
    drawerOpen,
    miniOpen,
    openMini: () => setMiniOpen(true),
    closeMini: () => setMiniOpen(false),
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    openCart: () => setMiniOpen(true),
    openCartFull: () => setActivePanel('cart'),
    openWishlist: () => swapPanel('wishlist'),
    openSearch: () => setActivePanel('search'),
    openCheckout: () => setActivePanel('checkout'),
    openAccount: () => setActivePanel('account'),
    openReset: () => setActivePanel('reset'),
    openTrack: () => swapPanel('track'),
    openAbout: () => swapPanel('about'),
    openSuccess: () => setActivePanel('success'),
    closePanel: () => setActivePanel(null),
    hidePanel: (instant) => { if (prevPanel.current) { keepHistory.current = true; if (instant) flashInstant(); setActivePanel(null) } },
    addToCart,
    changeQty,
    removeFromCart,
    clearCart,
    lastOrder,
    setLastOrder,
    paymentReturn,
    setPaymentReturn,
    toastMsg,
    toastShow,
    showToast
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  return useContext(ShopContext)
}
