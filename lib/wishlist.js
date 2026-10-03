// Wishlist lives on the customer's device: [{ id, price }] where price is the
// price when the product was saved, so the panel can show "price dropped".
export const WISHLIST_KEY = "lf_wishlist"

export function getWishlist() {
  if (typeof window === "undefined") return []
  try {
    const v = JSON.parse(localStorage.getItem(WISHLIST_KEY))
    return Array.isArray(v) ? v.filter(w => w && w.id) : []
  } catch (e) { return [] }
}

export function saveWishlist(list) {
  try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(list.slice(0, 100))) } catch (e) {}
}
