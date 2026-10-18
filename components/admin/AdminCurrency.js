'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useShop } from '../ShopContext'
import { USD_RATE } from '../../lib/currency'

function RateEditor({ showToast }) {
  const [saved, setSaved] = useState(null)
  const [rate, setRate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'usd_rate').maybeSingle().then(({ data }) => {
      const r = Number(data?.value)
      const cur = r > 0 ? r : USD_RATE
      setSaved(cur)
      setRate(String(cur))
    })
  }, [])

  const n = Number(rate)
  const valid = n >= 1 && n <= 10000

  async function save() {
    if (!valid) { showToast('Enter a rate between 1 and 10000.'); return }
    setSaving(true)
    const { error } = await supabase.from('settings').upsert({ key: 'usd_rate', value: String(n) }, { onConflict: 'key' })
    setSaving(false)
    if (error) { showToast('Could not save: ' + (error.message || 'Unknown error')); return }
    setSaved(n)
    showToast('Dollar rate saved!')
  }

  function usd(taka) {
    const u = taka / n
    return '$' + (u >= 100 ? Math.round(u).toLocaleString('en-US') : u.toFixed(2).replace(/\.00$/, ''))
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.5px', marginBottom: 8 }}>DOLLAR RATE</label>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
        Customers can switch the site to show prices in dollars ($) from the menu. This rate is used to convert your taka prices. Orders and payments are always in taka (৳).
      </p>

      <div style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', marginBottom: 18 }}>
        <b style={{ fontSize: 13, letterSpacing: '.5px' }}>CURRENT RATE</b>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {' — '}{saved === null ? 'Loading...' : `1 USD = ৳${saved.toLocaleString('en-US')}`}
        </span>
      </div>

      <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
        <b style={{ fontSize: 12, letterSpacing: '.5px', display: 'block', marginBottom: 10 }}>CHANGE RATE</b>
        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>1 USD = ৳ ?</label>
        <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 120" style={{ marginBottom: 10 }} />
        {valid && (
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>
            Preview: ৳1,000 = {usd(1000)}, ৳2,500 = {usd(2500)}
          </p>
        )}
        <button className="btn" onClick={save} disabled={saving || !valid}>{saving ? 'SAVING...' : 'SAVE RATE'}</button>
      </div>
    </div>
  )
}

export default function AdminCurrency() {
  const { showToast } = useShop()
  return (
    <div className="adminTable">
      <RateEditor showToast={showToast} />
    </div>
  )
}
