export const CART_KEY = "venom_cart"

export function getCart() {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] }
  catch (e) { return [] }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function cartCount(cart) {
  return cart.reduce((s, i) => s + i.qty, 0)
}

export function cartSubtotal(cart) {
  return cart.reduce((s, i) => s + i.price * i.qty, 0)
}
