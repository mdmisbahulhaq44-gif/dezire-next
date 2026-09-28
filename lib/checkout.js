import { supabase } from "./supabaseClient"

export const DHAKA_CITY = "DHAKA_CITY"
export const PROFILE_KEY = "lf_customer"

export const DEFAULT_SETTINGS = {
  delivery_charge_dhaka: 50,
  delivery_charge_outside: 60,
  free_delivery_threshold: 1000,
  pickup_available: true,
  pickup_address: "Mirpur 12, Dhaka",
  pickup_charge: 0,
  whatsapp_number: "8801877270165",
  payment_logos: []
}

function num(v, fallback) {
  const n = Number(v)
  return Number.isNaN(n) ? fallback : n
}

export async function fetchDeliverySettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("key,value")
    .in("key", [
      "delivery_charge_dhaka", "delivery_charge_outside",
      "free_delivery_threshold", "pickup_available",
      "pickup_address", "pickup_charge", "whatsapp_number", "payment_logos"
    ])
  if (error || !data || !data.length) return DEFAULT_SETTINGS
  const map = {}
  data.forEach(r => { map[r.key] = r.value })
  let logos = []
  try { logos = JSON.parse(map.payment_logos || "[]") } catch (e) { logos = [] }
  return {
    delivery_charge_dhaka: num(map.delivery_charge_dhaka, 50),
    delivery_charge_outside: num(map.delivery_charge_outside, 60),
    free_delivery_threshold: num(map.free_delivery_threshold, 1000),
    pickup_available: map.pickup_available === "true",
    pickup_address: map.pickup_address || "Mirpur 12, Dhaka",
    pickup_charge: num(map.pickup_charge, 0),
    whatsapp_number: map.whatsapp_number || "8801877270165",
    payment_logos: Array.isArray(logos) ? logos : []
  }
}

// Same rules as the original site (including its exact "Dhaka" match).
export function deliveryFor(settings, subtotal, method, city) {
  if (method === "pickup") {
    return { charge: settings.pickup_charge, label: "Store Pickup", isFree: true }
  }
  const cityForPricing = city === DHAKA_CITY ? "Dhaka" : city
  const isDhaka = (cityForPricing || "").trim().toLowerCase() === "dhaka"
  let charge = isDhaka ? settings.delivery_charge_dhaka : settings.delivery_charge_outside
  const isFree = subtotal >= settings.free_delivery_threshold
  if (isFree) charge = 0
  return {
    charge,
    label: isFree ? "Free Delivery" : (isDhaka ? "Dhaka Delivery" : "Outside Dhaka Delivery"),
    isFree
  }
}

export function couponDiscount(coupon, subtotal) {
  if (!coupon) return 0
  const raw = coupon.type === "percent"
    ? subtotal * Number(coupon.value) / 100
    : Number(coupon.value)
  return Math.min(raw, subtotal)
}

export function getProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) } catch (e) { return null }
}

export function setProfile(p) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)) } catch (e) {}
}
