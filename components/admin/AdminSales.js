'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useShop } from '../ShopContext'

const fmtDt = iso => new Date(iso).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const toIso = v => new Date(v + ':00+06:00').toISOString()
const COLOR = { scheduled: '#b9770e', active: '#1e8449', ended: '#777', cancelled: '#c0392b' }

export default function AdminSales() {
  const { showToast } = useShop()
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState(null)
  const [picked, setPicked] = useState({})
  const [q, setQ] = useState('')
  const [type, setType] = useState('percent')
  const [value, setValue] = useState('')
  const [starts, setStarts] = useState('')
  const [ends, setEnds] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const [p, s] = await Promise.all([
      supabase.from('products').select('id,name,price').order('name'),
      supabase.from('product_sales').select('*').order('created_at', { ascending: false }).limit(100)
    ])
    setProducts(p.data || [])
    setSales(s.data || [])
  }
  useEffect(() => { load() }, [])

  const names = useMemo(() => Object.fromEntries(products.map(p => [p.id, p.name])), [products])
  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t ? products.filter(p => (p.name || '').toLowerCase().includes(t)) : products
  }, [products, q])
  const ids = Object.keys(picked).filter(k => picked[k]).map(Number)

  async function create(e) {
    e.preventDefault()
    const v = Number(value)
    if (!ids.length) return showToast('Select at least one product')
    if (!(v > 0)) return showToast('Enter the discount')
    if (type === 'percent' && (v < 1 || v > 90)) return showToast('Percent must be 1 to 90')
    if (!ends) return showToast('Choose an end time')
    const st = starts ? new Date(toIso(starts)) : new Date()
    const en = new Date(toIso(ends))
    if (!(en > st)) return showToast('End must be after start')
    if (type === 'price') {
      const bad = products.filter(p => ids.includes(p.id) && v >= Number(p.price))
      if (bad.length) return showToast('Sale price must be lower than the current price: ' + bad[0].name)
    }
    setBusy(true)
    const rows = ids.map(id => ({ product_id: id, discount_type: type, discount_value: v, starts_at: st.toISOString(), ends_at: en.toISOString() }))
    const { error } = await supabase.from('product_sales').insert(rows)
    setBusy(false)
    if (error) return showToast(error.message)
    showToast('Sale scheduled')
    setPicked({}); setValue(''); setStarts(''); setEnds('')
    load()
  }

  async function cancel(id) {
    if (!confirm('Cancel this sale? If it is running, the regular price comes back now.')) return
    const { error } = await supabase.rpc('cancel_product_sale', { p_id: id })
    if (error) return showToast(error.message)
    showToast('Sale cancelled')
    load()
  }

  return (
    <div className="adminTable">
      <h2 style={{ marginBottom: 6 }}>New sale</h2>
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>
        Times are Bangladesh time. Leave Start empty to begin right now. Prices switch within about 1 minute. While a sale runs, change that product's price from here, not from the product form.
      </p>
      <form className="form" onSubmit={create}>
        <label>PRODUCTS ({ids.length} selected)</label>
        <input placeholder="Search products" value={q} onChange={e => setQ(e.target.value)} />
        <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 10, padding: 8 }}>
          {list.map(p => (
            <label key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, padding: '5px 2px', letterSpacing: 0, color: '#111', margin: 0 }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={!!picked[p.id]} onChange={ev => setPicked(s => ({ ...s, [p.id]: ev.target.checked }))} />
              <span>{p.name} — ৳{Number(p.price).toLocaleString()}</span>
            </label>
          ))}
        </div>
        <label>DISCOUNT TYPE</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="percent">Percent off (%)</option>
          <option value="price">New fixed price (৳)</option>
        </select>
        <label>{type === 'percent' ? 'PERCENT (1-90)' : 'SALE PRICE (৳)'}</label>
        <input type="number" inputMode="decimal" value={value} onChange={e => setValue(e.target.value)} placeholder={type === 'percent' ? 'e.g. 20' : 'e.g. 650'} />
        <label>START (optional)</label>
        <input type="datetime-local" value={starts} onChange={e => setStarts(e.target.value)} />
        <label>END</label>
        <input type="datetime-local" value={ends} onChange={e => setEnds(e.target.value)} />
        <button className="btn" type="submit" disabled={busy}>{busy ? 'SAVING...' : 'SCHEDULE SALE'}</button>
      </form>

      <h2 style={{ margin: '28px 0 10px' }}>Sales</h2>
      <table>
        <thead><tr><th>Product</th><th>Discount</th><th>When</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {sales === null && <tr><td colSpan={5}>Loading...</td></tr>}
          {sales !== null && sales.length === 0 && <tr><td colSpan={5}>No sales yet.</td></tr>}
          {(sales || []).map(s => (
            <tr key={s.id}>
              <td>{names[s.product_id] || s.product_id}</td>
              <td>{s.discount_type === 'percent' ? s.discount_value + '%' : '৳' + Number(s.discount_value).toLocaleString()}{s.sale_price ? ` (now ৳${Number(s.sale_price).toLocaleString()})` : ''}</td>
              <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDt(s.starts_at)} → {fmtDt(s.ends_at)}</td>
              <td style={{ color: COLOR[s.status], fontWeight: 700 }}>{s.status}</td>
              <td>{(s.status === 'scheduled' || s.status === 'active') && <button className="btn light" style={{ padding: '6px 14px', fontSize: 10 }} onClick={() => cancel(s.id)}>CANCEL</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
