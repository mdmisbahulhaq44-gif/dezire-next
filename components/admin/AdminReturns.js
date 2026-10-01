'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useShop } from '../ShopContext'

const STATUSES = ['Requested', 'Approved', 'Rejected', 'Completed']
const dt = d => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const btn = { fontSize: 12, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer' }

function Row({ r, onSaved, onViewOrder }) {
  const { showToast } = useShop()
  const [status, setStatus] = useState(r.status)
  const [note, setNote] = useState(r.admin_note || '')
  const [busy, setBusy] = useState(false)
  const dirty = status !== r.status || note.trim() !== (r.admin_note || '')

  async function save() {
    setBusy(true)
    const { error } = await supabase.from('return_requests').update({ status, admin_note: note.trim() || null, updated_at: new Date().toISOString() }).eq('id', r.id)
    setBusy(false)
    if (error) { showToast('Could not save: ' + (error.message || 'Unknown error')); return }
    onSaved(r.id, status, note.trim() || null)
    showToast('Request updated.')
  }

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 14, background: '#fff', display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <b>{r.order_ref}</b> · <span style={{ textTransform: 'capitalize' }}>{r.type}</span>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{dt(r.created_at)} · {r.phone}</div>
        </div>
        <button type="button" style={btn} onClick={() => onViewOrder(r.order_ref)}>View order →</button>
      </div>
      <div style={{ fontSize: 13, background: '#faf9f6', borderRadius: 10, padding: '8px 10px' }}>{r.reason}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)' }}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <input value={note} maxLength={500} onChange={e => setNote(e.target.value)} placeholder="Message shown to the customer (optional)" style={{ flex: 1, minWidth: 160, padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)' }} />
        <button type="button" style={{ ...btn, background: '#111', color: '#fff', borderColor: '#111' }} disabled={!dirty || busy} onClick={save}>{busy ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  )
}

export default function AdminReturns({ onViewOrder }) {
  const [rows, setRows] = useState(null)
  const [filter, setFilter] = useState('open')

  useEffect(() => {
    supabase.from('return_requests').select('*').order('created_at', { ascending: false }).limit(300).then(({ data }) => setRows(data || []))
  }, [])

  const shown = (rows || []).filter(r => filter === 'all' || (filter === 'open' ? ['Requested', 'Approved'].includes(r.status) : true))
  const patch = (id, status, admin_note) => setRows(rs => rs.map(r => (r.id === id ? { ...r, status, admin_note } : r)))

  return (
    <div className="adminTable">
      <h2 style={{ marginBottom: 6 }}>Return &amp; exchange requests</h2>
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 14px' }}>
        When you receive the item back, also set the order itself to <b>Returned</b> in Orders — the stock is restored automatically.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[['open', 'Open'], ['all', 'All']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setFilter(k)} style={{ ...btn, padding: '6px 12px', background: filter === k ? '#111' : '#fff', color: filter === k ? '#fff' : 'inherit', borderColor: filter === k ? '#111' : 'var(--line)' }}>{l}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {rows === null && <div>Loading...</div>}
        {rows !== null && shown.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>{filter === 'open' ? 'No open requests.' : 'No requests yet.'}</div>}
        {shown.map(r => <Row key={r.id + r.status} r={r} onSaved={patch} onViewOrder={onViewOrder} />)}
      </div>
    </div>
  )
}
