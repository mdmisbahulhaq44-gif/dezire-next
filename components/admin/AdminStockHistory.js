'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const PAGE = 50

export default function AdminStockHistory() {
  const [rows, setRows] = useState(null)
  const [more, setMore] = useState(false)
  const [busy, setBusy] = useState(false)
  const [q, setQ] = useState('')

  async function load(from, search) {
    setBusy(true)
    let query = supabase.from('stock_history').select('*').order('at', { ascending: false }).range(from, from + PAGE - 1)
    if (search) query = query.ilike('product_name', '%' + search + '%')
    const { data } = await query
    const list = data || []
    setRows(prev => (from === 0 ? list : [...(prev || []), ...list]))
    setMore(list.length === PAGE)
    setBusy(false)
  }
  useEffect(() => {
    const t = setTimeout(() => load(0, q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="adminTable">
      <h2 style={{ marginBottom: 6 }}>Stock history</h2>
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>Every stock change: who, when and why.</p>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search product name"
        style={{ width: '100%', maxWidth: 320, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 10, marginBottom: 14 }}
      />
      <table>
        <thead><tr><th>When</th><th>Product</th><th>Change</th><th>Stock</th><th>Reason</th></tr></thead>
        <tbody>
          {rows === null && <tr><td colSpan={5}>Loading...</td></tr>}
          {rows !== null && rows.length === 0 && <tr><td colSpan={5}>No stock changes recorded yet.</td></tr>}
          {(rows || []).map(r => (
            <tr key={r.id}>
              <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
              <td>{r.product_name || r.product_id}</td>
              <td style={{ fontWeight: 600, color: Number(r.delta) < 0 ? '#c0392b' : '#1e8449' }}>{Number(r.delta) > 0 ? '+' : ''}{r.delta}</td>
              <td>{r.old_stock === null ? '—' : r.old_stock} → {r.new_stock === null ? '—' : r.new_stock}</td>
              <td style={{ fontSize: 12, color: 'var(--muted)' }}>{r.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {more && (
        <button onClick={() => load(rows.length, q.trim())} disabled={busy} style={{ marginTop: 14, padding: '9px 18px', border: '1px solid var(--line)', background: '#fff', borderRadius: 10, cursor: 'pointer' }}>
          {busy ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
