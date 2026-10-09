'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const WINDOW_DAYS = 14
const STATUS_TEXT = {
  Requested: 'Waiting for our team to review',
  Approved: 'Approved — we will contact you with the next steps',
  Rejected: 'Not approved',
  Completed: 'Completed'
}

export default function ReturnRequest({ order, deliveredAt }) {
  const [req, setReq] = useState(undefined) // undefined = loading, null = none
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('return')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const ref = order.order_ref
  const phone = order.phone

  async function load() {
    const { data } = await supabase.rpc('get_return_request', { p_ref: ref, p_phone: phone })
    setReq((data && data[0]) || null)
  }
  useEffect(() => { setReq(undefined); setOpen(false); setErr(''); if (ref && order.status === 'Delivered') load() }, [ref]) // eslint-disable-line

  if (!ref || order.status !== 'Delivered' || req === undefined) return null

  const ageDays = deliveredAt ? (Date.now() - new Date(deliveredAt).getTime()) / 86400000 : 0
  const inWindow = ageDays <= WINDOW_DAYS
  const reqOpen = req && (req.status === 'Requested' || req.status === 'Approved')

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    const { error } = await supabase.rpc('request_return', { p_ref: ref, p_phone: phone, p_type: type, p_reason: reason })
    setBusy(false)
    if (error) { setErr(error.message || 'Could not send your request. Please try again.'); return }
    setOpen(false); setReason('')
    load()
  }

  return (
    <div style={{ marginTop: 22, border: '1px solid var(--line)', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.5px', marginBottom: 8 }}>RETURN / EXCHANGE</div>

      {req && (
        <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: reqOpen || !inWindow ? 0 : 12 }}>
          <b style={{ textTransform: 'capitalize' }}>{req.type} request</b> · {STATUS_TEXT[req.status] || req.status}
          {req.admin_note ? <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Note from HEAVEN: {req.admin_note}</div> : null}
        </div>
      )}

      {!reqOpen && inWindow && !open && (
        <button type="button" className="btn" style={{ width: '100%' }} onClick={() => setOpen(true)}>
          {req ? 'SEND A NEW REQUEST' : 'REQUEST RETURN OR EXCHANGE'}
        </button>
      )}

      {!req && !inWindow && (
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>The {WINDOW_DAYS}-day return window for this order has passed.</p>
      )}

      {open && (
        <form className="form" onSubmit={submit} style={{ marginTop: 4 }}>
          <label>WHAT WOULD YOU LIKE?</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="return">Return / refund</option>
            <option value="exchange">Exchange (size or product)</option>
          </select>
          <label>REASON</label>
          <textarea required minLength={5} maxLength={500} rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Tell us what went wrong (wrong size, damaged item...)" style={{ width: '100%', boxSizing: 'border-box' }} />
          {err && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 8 }}>{err}</div>}
          <button className="btn" style={{ width: '100%' }} disabled={busy}>{busy ? 'SENDING...' : 'SEND REQUEST'}</button>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Items must be unused with tags attached. See our Return Policy.</p>
        </form>
      )}
    </div>
  )
}
