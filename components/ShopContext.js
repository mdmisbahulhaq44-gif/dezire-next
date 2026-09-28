'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { getCart, saveCart, cartCount, cartSubtotal } from '../lib/cart'

const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  const [cart, setCart] = useState([])
  const [activePanel, setActivePanel] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const toastTimer = useRef(null)

  useEffect(() => { setCart(getCart()) }, [])

  useEffect(() => {
    document.body.style.overflow = (activePanel || drawerOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activePanel, drawerOpen])

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

  function addToCart(product, size = null) {
    if (Number(product.stock) <= 0) {
      showToast('This item is out of stock.')
      return
    }
    const existing = cart.find(i => i.id === product.id && (i.size || null) === size)
    let next
    if (existing) {
      next = cart.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i)
    } else {
      next = [...cart, {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        imgs: product.imgs,
        size,
        qty: 1
      }]
    }
    persist(next)
    showToast(product.name + (size ? ` (Size: ${size})` : '') + ' added to cart')
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

  const value = {
    cart,
    cartCount: cartCount(cart),
    cartSubtotal: cartSubtotal(cart),
    activePanel,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    openCart: () => setActivePanel('cart'),
    openWishlist: () => setActivePanel('wishlist'),
    openSearch: () => setActivePanel('search'),
    closePanel: () => setActivePanel(null),
    addToCart,
    changeQty,
    removeFromCart,
    toastMsg,
    toastShow,
    showToast
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  return useContext(ShopContext)
}
