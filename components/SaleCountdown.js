'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useShop } from './ShopContext'

function fmt(ms, lang) {
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = n => String(n).padStart(2, '0')
  if (d > 0) return lang === 'bn' ? `${d} দিন ${p(h)} ঘণ্টা ${p(m)} মিনিট` : `${d}d ${p(h)}h ${p(m)}m`
  return `${p(h)}:${p(m)}:${p(sec)}`
}

// endsAt comes from the server (so the line is already in the page and nothing
// jumps when it appears). undefined = not provided, ask the database instead.
export default function SaleCountdown({ productId, endsAt }) {
  const { t, lang } = useShop()
  const [end, setEnd] = useState(endsAt ? new Date(endsAt).getTime() : null)
  const [left, setLeft] = useState(0)

  useEffect(() => {
    if (endsAt !== undefined) return
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
  }, [productId, endsAt])

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

  if (!end) return null
  return (
    <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: 'var(--red)', minHeight: 18 }}>
      {left > 0 ? `⚡ ${t('FLASH SALE')} · ${t('ends in {t}', { t: fmt(left, lang) })}` : '\u00A0'}
    </div>
  )
}
