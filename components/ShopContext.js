'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getCart, saveCart, cartCount, cartSubtotal } from '../lib/cart'

const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  const [cart, setCart] = useState([])
  const [activePanel, setActivePanel] = useState(null) // null | 'cart' | 'wishlist'

  useEffect(() => { setCart(getCart()) }, [])

  useEffect(() => {
    document.body.style.overflow = activePanel ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activePanel])

  function persist(next) {
    setCart(next)
    saveCart(next)
  }

  function addToCart(product, size = null) {
    if (Number(product.stock) <= 0) return
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
    openCart: () => setActivePanel('cart'),
    openWishlist: () => setActivePanel('wishlist'),
    openSearch: () => setActivePanel('search'),
    closePanel: () => setActivePanel(null),
    addToCart,
    changeQty,
    removeFromCart
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  return useContext(ShopContext)
}
