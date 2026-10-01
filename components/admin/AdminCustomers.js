'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { downloadCsv, stamp } from '../../lib/exportCsv'
import { useShop } from '../ShopContext'

const DEAD = ['Cancelled', 'Returned']
const fmt = n => '৳' + Number(n || 0).toLocaleString('en-US')
const dt = d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const btn = { fontSize: 12, padding: '9px 14px', borderRadius: 10, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }

async function fetchAll(table, cols, order) {
  const all = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(cols).order(order, { ascending: false }).range(from, from + 999)
    if (error) return null
    all.push(...(data || []))
    if (!data || data.length < 1000) break
  }
  return all
}

function Detail({ c, note, onSaved, onViewOrders }) {
  const { showToast } = useShop()
  const [text, setText] = useState(note || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const { error } = await supabase.from('customer_notes').upsert({ phone: c.phone, note: text.trim(), updated_at: new Date().toISOString() })
    setSaving(false)
    if (error) { showToast('Could not save note: ' + (error.message || 'Unknown error')); return }
    onSaved(c.phone, text.trim())
    showToast('Note saved.')
  }

  return (
    <div style={{ display: 'grid', gap: 14, padding: '6px 4px 14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
        {[
          ['Orders', c.refs.size],
          ['Total spent', fmt(c.totalSpent)],
          ['Avg. order', fmt(c.refs.size - c.deadRefs.size > 0 ? c.totalSpent / (c.refs.size - c.deadRefs.size) : 0)],
          ['First order', dt(c.firstOrder)],
          ['Cancelled / returned', c.deadRefs.size]
        ].map(([l, v]) => (
          <div key={l} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px', background: '#fff' }}>
            <div style={{ fontSize: 10, letterSpacing: '.5px', color: '#888', textTransform: 'uppercase' }}>{l}</div>
            <div style={{ fontWeight: 700, marginTop: 3 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid var(--line)', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
        {c.history.map((h, i) => (
          <div key={h.ref} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '9px 12px', borderTop: i ? '1px solid #f0eee9' : 'none', fontSize: 12 }}>
            <span><b>{h.ref}</b> · {dt(h.date)}</span>
            <span style={{ color: DEAD.includes(h.status) ? 'var(--red)' : 'inherit', whiteSpace: 'nowrap' }}>{h.status} · {fmt(h.total)}</span>
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Private note (only you can see this)</div>
        <textarea
          value={text}
          maxLength={2000}
          onChange={e => setText(e.target.value)}
          placeholder="e.g. prefers evening delivery, size M, always returns..."
          style={{ width: '100%', minHeight: 70, padding: 10, borderRadius: 10, border: '1px solid var(--line)', font: 'inherit', fontSize: 13, boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button type="button" style={{ ...btn, background: '#111', color: '#fff', borderColor: '#111' }} onClick={save} disabled={saving || text.trim() === (note || '')}>
            {saving ? 'Saving...' : 'Save note'}
          </button>
          <button type="button" style={btn} onClick={() => onViewOrders(c.phone)}>View all orders →</button>
          <a style={{ ...btn, textDecoration: 'none', color: 'inherit' }} href={`tel:${c.phone}`}>📞 Call</a>
        </div>
      </div>
    </div>
  )
}

export default function AdminCustomers({ onViewOrders }) {
  const [orders, setOrders] = useState(null)
  const [notes, setNotes] = useState({})
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | repeat | noted
  const [open, setOpen] = useState(null)

  useEffect(() => {
    fetchAll('orders', 'customer,phone,total_amount,created_at,order_ref,id,status', 'created_at').then(d => setOrders(d || []))
    supabase.from('customer_notes').select('phone,note').then(({ data }) => {
      const m = {}
      ;(data || []).forEach(n => { if (n.note) m[n.phone] = n.note })
      setNotes(m)
    })
  }, [])

  const list = useMemo(() => {
    if (!orders) return []
    const byPhone = new Map()
    orders.forEach(o => {
      if (!o.phone) return
      const ref = o.order_ref || ('id_' + o.id)
      if (!byPhone.has(o.phone)) {
        byPhone.set(o.phone, { phone: o.phone, customer: o.customer, totalSpent: 0, lastOrder: o.created_at, firstOrder: o.created_at, refs: new Set(), deadRefs: new Set(), orderMap: new Map() })
      }
      const c = byPhone.get(o.phone)
      const dead = DEAD.includes(o.status)
      if (!dead) c.totalSpent += Number(o.total_amount || 0)
      c.refs.add(ref)
      if (dead) c.deadRefs.add(ref)
      const h = c.orderMap.get(ref) || { ref, date: o.created_at, status: o.status, total: 0 }
      h.total += Number(o.total_amount || 0)
      c.orderMap.set(ref, h)
      if (new Date(o.created_at) > new Date(c.lastOrder)) { c.lastOrder = o.created_at; c.customer = o.customer }
      if (new Date(o.created_at) < new Date(c.firstOrder)) c.firstOrder = o.created_at
    })

    const q = search.trim().toLowerCase()
    let result = Array.from(byPhone.values()).map(c => ({
      ...c,
      history: Array.from(c.orderMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date))
    }))
    if (q) result = result.filter(c => (c.customer || '').toLowerCase().includes(q) || c.phone.includes(q))
    if (filter === 'repeat') result = result.filter(c => c.refs.size - c.deadRefs.size >= 2)
    if (filter === 'noted') result = result.filter(c => notes[c.phone])
    result.sort((a, b) => new Date(b.lastOrder) - new Date(a.lastOrder))
    return result
  }, [orders, search, filter, notes])

  return (
    <div id="adminCustomersView">
      <div className="adminTable">
        <h2 style={{ marginBottom: 20 }}>Customers</h2>
        <div className="adminSearchRow" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input placeholder="Search customers by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
          <button
            type="button"
            onClick={() => downloadCsv(`dezire-customers-${stamp()}.csv`, ['Customer', 'Phone', 'Orders', 'Total spent', 'Last order', 'Note'], list.map(c => [c.customer, c.phone, c.refs.size, c.totalSpent, c.lastOrder, notes[c.phone] || '']))}
            style={btn}
          >
            ⬇ Export CSV
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, margin: '0 0 14px', flexWrap: 'wrap' }}>
          {[['all', 'All'], ['repeat', 'Repeat customers'], ['noted', 'With notes']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} style={{ ...btn, padding: '6px 12px', background: filter === k ? '#111' : '#fff', color: filter === k ? '#fff' : 'inherit', borderColor: filter === k ? '#111' : 'var(--line)' }}>{l}</button>
          ))}
        </div>
        <table>
          <thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Last Order</th></tr></thead>
          <tbody>
            {orders === null && <tr><td colSpan={5}>Loading...</td></tr>}
            {orders !== null && list.length === 0 && <tr><td colSpan={5}>{search || filter !== 'all' ? 'No customers match.' : 'No customers yet.'}</td></tr>}
            {list.map(c => {
              const live = c.refs.size - c.deadRefs.size
              return (
                <Fragment key={c.phone}>
                  <tr onClick={() => setOpen(open === c.phone ? null : c.phone)} style={{ cursor: 'pointer' }}>
                    <td>
                      {c.customer || '—'}
                      {live >= 2 && <span style={{ marginLeft: 6, fontSize: 10, padding: '2px 7px', borderRadius: 20, background: '#111', color: '#fff' }}>Repeat</span>}
                      {notes[c.phone] && <span title="Has a note" style={{ marginLeft: 6 }}>📝</span>}
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.refs.size}</td>
                    <td>{fmt(c.totalSpent)}</td>
                    <td>{dt(c.lastOrder)}</td>
                  </tr>
                  {open === c.phone && (
                    <tr><td colSpan={5} style={{ background: '#faf9f6' }}>
                      <Detail c={c} note={notes[c.phone]} onSaved={(p, n) => setNotes(m => ({ ...m, [p]: n }))} onViewOrders={onViewOrders} />
                    </td></tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
