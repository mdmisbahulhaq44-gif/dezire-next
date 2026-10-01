'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const PAGE = 50
const SKIP = new Set(['id', 'created_at'])

function summarize(row) {
  const c = row.changes || {}
  if (row.action === 'INSERT') return 'Created'
  if (row.action === 'DELETE') return 'Deleted'
  return Object.keys(c).filter(k => !SKIP.has(k)).slice(0, 6).map(k => {
    const v = c[k] || {}
    const f = x => (x === null || x === undefined || x === '' ? '—' : String(x).slice(0, 40))
    return `${k}: ${f(v.from)} → ${f(v.to)}`
  }).join('  ·  ')
}

export default function AdminAuditLog() {
  const [rows, setRows] = useState(null)
  const [more, setMore] = useState(false)
  const [busy, setBusy] = useState(false)

  async function load(from) {
    setBusy(true)
    const { data } = await supabase.from('audit_log').select('*').order('at', { ascending: false }).range(from, from + PAGE - 1)
    const list = data || []
    setRows(prev => (from === 0 ? list : [...(prev || []), ...list]))
    setMore(list.length === PAGE)
    setBusy(false)
  }
  useEffect(() => { load(0) }, [])

  return (
    <div className="adminTable">
      <h2 style={{ marginBottom: 6 }}>Activity log</h2>
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 16px' }}>Every change you make to products, orders, coupons and settings is recorded here.</p>
      <table>
        <thead><tr><th>When</th><th>What</th><th>Item</th><th>Change</th></tr></thead>
        <tbody>
          {rows === null && <tr><td colSpan={4}>Loading...</td></tr>}
          {rows !== null && rows.length === 0 && <tr><td colSpan={4}>No changes recorded yet.</td></tr>}
          {(rows || []).map(r => (
            <tr key={r.id}>
              <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
              <td>{r.action === 'INSERT' ? 'Added' : r.action === 'DELETE' ? 'Deleted' : 'Edited'} {r.table_name.replace(/s$/, '')}</td>
              <td>{r.label || r.row_id || '—'}</td>
              <td style={{ fontSize: 12, color: 'var(--muted)' }}>{summarize(r)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {more && (
        <button onClick={() => load(rows.length)} disabled={busy} style={{ marginTop: 14, padding: '9px 18px', border: '1px solid var(--line)', background: '#fff', borderRadius: 10, cursor: 'pointer' }}>
          {busy ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
