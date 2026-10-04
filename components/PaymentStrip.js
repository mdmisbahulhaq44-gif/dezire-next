'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

let cached = null

// "Pay With" row above the footer. Uses the same payment logos that the admin manages in
// Settings → Payment method logos (also shown at checkout). Shows nothing until logos are added.
export default function PaymentStrip() {
  const [logos, setLogos] = useState(cached || [])
  useEffect(() => {
    if (cached) return
    supabase.from('settings').select('value').eq('key', 'payment_logos').maybeSingle().then(({ data }) => {
      let list = []
      try { list = JSON.parse((data && data.value) || '[]') } catch (e) { list = [] }
      cached = Array.isArray(list) ? list.filter(Boolean) : []
      setLogos(cached)
    })
  }, [])
  if (!logos.length) return null
  return (
    <div className="payStrip">
      <span className="payStripLabel">Pay With</span>
      <div className="payStripLogos">
        {logos.map((url, i) => (
          <img key={i} src={url} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }} />
        ))}
      </div>
    </div>
  )
}
