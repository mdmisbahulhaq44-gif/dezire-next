'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useShop } from './ShopContext'

// Checkout and My Orders load after the page is idle instead of with every page.
// (My Account stays eager: it listens for the password-reset email link on load.)
const CheckoutPanel = dynamic(() => import('./CheckoutPanel'), { ssr: false })
const TrackOrderPanel = dynamic(() => import('./TrackOrderPanel'), { ssr: false })

let idleDone = false

function useIdleReady() {
  const [ready, setReady] = useState(idleDone)
  useEffect(() => {
    if (idleDone) { setReady(true); return }
    const go = () => { idleDone = true; setReady(true) }
    // iOS Safari has no requestIdleCallback, so fall back to a short timer
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(go, { timeout: 3000 })
    else setTimeout(go, 1500)
  }, [])
  return ready
}

// Mount once idle, or right away if the visitor opens it sooner; then it stays mounted
function useGate(names) {
  const { activePanel } = useShop()
  const idle = useIdleReady()
  const opened = useRef(false)
  if (names.includes(activePanel)) opened.current = true
  return idle || opened.current
}

export function LazyCheckoutPanel() {
  // 'success' (order placed / payment return) is rendered by the checkout panel too
  const on = useGate(['checkout', 'success'])
  return on ? <CheckoutPanel /> : null
}

export function LazyTrackOrderPanel() {
  const on = useGate(['track'])
  return on ? <TrackOrderPanel /> : null
}
