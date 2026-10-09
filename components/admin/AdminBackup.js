'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { stamp } from '../../lib/exportCsv'

const TABLES = [
  'products', 'orders', 'customers', 'coupons', 'settings', 'reviews',
  'return_requests', 'customer_notes', 'product_costs', 'order_line_costs',
  'order_status_history', 'stock_history', 'audit_log', 'newsletter_subscribers'
]
const ORDER_BY = { product_costs: 'product_id', customer_notes: 'phone', order_line_costs: 'order_id' }
const KEY = 'dz_last_backup'

async function fetchAll(table) {
  const size = 1000
  const col = ORDER_BY[table] || 'id'
  let from = 0
  let all = []
  for (;;) {
    const { data, error } = await supabase.from(table).select('*').order(col).range(from, from + size - 1)
    if (error) throw error
    all = all.concat(data || [])
    if (!data || data.length < size) break
    from += size
  }
  return all
}

export default function AdminBackup() {
  const [busy, setBusy] = useState(false)
  const [report, setReport] = useState(null)
  const [last, setLast] = useState(null)

  useEffect(() => {
    try { const v = localStorage.getItem(KEY); if (v) setLast(Number(v)) } catch (e) {}
  }, [])

  async function run() {
    setBusy(true)
    setReport(null)
    const out = {}
    const rows = []
    for (const t of TABLES) {
      try {
        const data = await fetchAll(t)
        out[t] = data
        rows.push({ t, n: data.length, ok: true })
      } catch (e) {
        rows.push({ t, n: 0, ok: false, msg: e.message || 'error' })
      }
    }
    const blob = new Blob([JSON.stringify({ created_at: new Date().toISOString(), tables: out }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heaven-backup-${stamp()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    const now = Date.now()
    try { localStorage.setItem(KEY, String(now)) } catch (e) {}
    setLast(now)
    setReport(rows)
    setBusy(false)
  }

  const days = last ? Math.floor((Date.now() - last) / 86400000) : null

  return (
    <div className="adminTable">
      <h2 style={{ marginBottom: 6 }}>Backup</h2>
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>
        Downloads all store data in one file. Keep it private: it contains customer names, phones and addresses.
      </p>
      <p style={{ fontSize: 13, margin: '0 0 14px' }}>
        {last
          ? `Last backup on this device: ${days === 0 ? 'today' : days + ' day(s) ago'}`
          : 'No backup taken on this device yet.'}
      </p>
      <button onClick={run} disabled={busy} style={{ padding: '11px 20px', border: 0, background: '#111', color: '#fff', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
        {busy ? 'Preparing...' : '⬇ Download full backup'}
      </button>
      {report && (
        <table style={{ marginTop: 18 }}>
          <thead><tr><th>Table</th><th>Rows</th><th>Status</th></tr></thead>
          <tbody>
            {report.map(r => (
              <tr key={r.t}>
                <td>{r.t}</td>
                <td>{r.n}</td>
                <td style={{ color: r.ok ? '#1e8449' : '#c0392b' }}>{r.ok ? 'OK' : r.msg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
