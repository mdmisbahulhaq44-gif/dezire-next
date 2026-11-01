// Remembers the last wallet summary so My Account and Refer & Earn open with data already in place (no pop-in, no jump).
import { supabase } from './supabaseClient'

let cache = { uid: null, data: null }
let inflight = null
const subs = new Set()

export function getWallet(uid) {
  return cache.uid === uid ? cache.data : null
}

export function subscribeWallet(fn) {
  subs.add(fn)
  return () => subs.delete(fn)
}

export function clearWallet() {
  cache = { uid: null, data: null }
}

export function refreshWallet(uid) {
  if (inflight && inflight.uid === uid) return inflight.p
  const p = supabase.rpc('my_wallet_summary').then(({ data, error }) => {
    inflight = null
    if (error || !data) return null
    cache = { uid, data }
    subs.forEach(f => { try { f(uid, data) } catch (e) {} })
    return data
  })
  inflight = { uid, p }
  return p
}
