'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function fmt(ms) {
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = n => String(n).padStart(2, '0')
  if (d > 0) return `${d}d ${p(h)}h ${p(m)}m`
  return `${p(h)}:${p(m)}:${p(sec)}`
}

export default function SaleCountdown({ productId }) {
  const [end, setEnd] = useState(null)
  const [left, setLeft] = useState(0)

  useEffect(() => {
    let alive = true
    supabase
      .from('product_sales')
      .select('ends_at')
      .eq('product_id', productId)
      .eq('status', 'active')
      .limit(1)
      .then(({ data }) => {
        if (!alive || !data || !data[0]) return
        setEnd(new Date(data[0].ends_at).getTime())
      })
    return () => { alive = false }
  }, [productId])

  useEffect(() => {
    if (!end) return
    const tick = () => {
      const l = end - Date.now()
      if (l <= 0) { setEnd(null); return }
      setLeft(l)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [end])

  if (!end || left <= 0) return null
  return (
    <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>
      ⚡ FLASH SALE · ends in {fmt(left)}
    </div>
  )
}
