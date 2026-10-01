'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShop } from './ShopContext'
import { supabase } from '../lib/supabaseClient'
import { cldOpt } from '../lib/cloudinary'
import Image from 'next/image'
import { getSavedOrders, saveOrder, clearSavedOrders } from '../lib/checkout'

const ACTIVE_ORDER_STATUSES = new Set(['pending', 'processing', 'shipped'])

function groupRows(data) {
  const groups = {}
  data.forEach(r => {
    const key = r.order_ref || ('#' + r.id)
    if (!groups[key]) groups[key] = []
    groups[key].push(r)
  })
  return groups
}

function sortOrderRefEntries(groups) {
  const entries = Object.entries(groups)
  entries.sort((a, b) => {
    const aActive = ACTIVE_ORDER_STATUSES.has((a[1][0].status || '').toLowerCase()) ? 0 : 1
    const bActive = ACTIVE_ORDER_STATUSES.has((b[1][0].status || '').toLowerCase()) ? 0 : 1
    if (aActive !== bActive) return aActive - bActive
    return new Date(b[1][0].created_at) - new Date(a[1][0].created_at)
  })
  return entries
}

function StatusBadge({ status }) {
  const s = (status || 'pending').toLowerCase()
  const label = s.charAt(0).toUpperCase() + s.slice(1)
  return <span className={`statusBadge ${s}`}>{label}</span>
}

const fmtDate = iso => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
const fmtTime = iso => new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })

export default function TrackOrderPanel() {
  const router = useRouter()
  const { activePanel, closePanel, showToast } = useShop()
  const show = activePanel === 'track'

  // listState: none | loading | error | emptyProfile | groups | verifying | nomatch
  const [listState, setListState] = useState('none')
  const [listSource, setListSource] = useState('phone')
  const [groups, setGroups] = useState({})
  const [manualOpen, setManualOpen] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [receiptRows, setReceiptRows] = useState(null)
  const [imgById, setImgById] = useState({})
  const [history, setHistory] = useState({})
  const [copiedPhone, setCopiedPhone] = useState(false)
  const resultRef = useRef(null)

  // openTrackOrder
  useEffect(() => {
    if (show) runOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  // when each status happened (customers can read this only with order number + phone)
  useEffect(() => {
    setHistory({})
    if (!receiptRows || !receiptRows[0].order_ref) return
    const o = receiptRows[0]
    supabase.rpc('track_order_history', { p_ref: o.order_ref, p_phone: o.phone }).then(({ data }) => {
      const map = {}
      ;(data || []).forEach(h => {
        const k = (h.status || '').toLowerCase()
        if (!map[k]) map[k] = h.changed_at
      })
      setHistory(map)
    })
  }, [receiptRows])

  // product images for the receipt
  useEffect(() => {
    if (!receiptRows) return
    const ids = [...new Set(receiptRows.map(r => r.product_id).filter(Boolean))]
    if (!ids.length) { setImgById({}); return }
    supabase.from('products').select('id,imgs').in('id', ids).then(({ data }) => {
      const map = {}
      ;(data || []).forEach(p => { map[p.id] = (p.imgs || '').split(',')[0]?.trim() })
      setImgById(map)
    })
  }, [receiptRows])

  async function runOpen() {
    setReceiptRows(null)
    const saved = getSavedOrders()
    if (saved.length) {
      setManualOpen(false)
      setListState('loading')
      await loadSavedOrders(saved)
      return
    }
    setListState('none')
    setManualOpen(true)
  }

  // Each order is read with its own order number + phone (track_order),
  // so nobody can list orders by guessing a phone number or customer id.
  async function loadSavedOrders(saved) {
    const results = await Promise.all(
      saved.slice(0, 20).map(s => supabase.rpc('track_order', { p_ref: s.ref, p_phone: s.phone }))
    )
    const rows = []
    let failed = false
    results.forEach(r => {
      if (r.error) failed = true
      else if (r.data) rows.push(...r.data)
    })
    if (!rows.length) {
      setListState(failed ? 'error' : 'emptyProfile')
      return false
    }
    setGroups(groupRows(rows))
    setListSource('phone')
    setListState('groups')
    return true
  }

  function clearSavedTrackPhone() {
    clearSavedOrders()
    setListState('none')
    setReceiptRows(null)
    setManualOpen(true)
    setOrderId('')
    setPhone('')
  }

  function switchAccount() {
    clearSavedOrders()
    try { localStorage.removeItem('lf_customer') } catch (e) {}
    showToast('Switched — enter an Order ID and phone to look up an order.')
    runOpen()
  }

  // The ONLY entry point that accepts a phone typed fresh by the visitor —
  // requires the matching Order ID too.
  async function submitTrackOrder(e) {
    e.preventDefault()
    const ref = orderId.trim()
    const ph = phone.trim()
    setListState('verifying')

    const { data, error } = await supabase.rpc('track_order', { p_ref: ref, p_phone: ph })

    if (error || !data || !data.length) {
      setListState('nomatch')
      return
    }

    saveOrder(ref, ph)
    await loadSavedOrders(getSavedOrders())
    setManualOpen(false)
  }

  function viewOrderGroup(rows) {
    setReceiptRows(rows)
    setTimeout(() => resultRef.current?.scrollIntoView?.({ behavior: 'smooth' }), 60)
  }

  async function copyRiderPhone(p) {
    try {
      await navigator.clipboard.writeText(p)
    } catch (e) {
      const temp = document.createElement('textarea')
      temp.value = p
      temp.style.position = 'fixed'
      temp.style.opacity = '0'
      document.body.appendChild(temp)
      temp.select()
      try { document.execCommand('copy') } catch (e2) {}
      document.body.removeChild(temp)
    }
    showToast('Phone number copied!')
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 1500)
  }

  function renderList() {
    if (listState === 'loading') return <div className="empty" style={{ padding: '20px 10px' }}>Loading your orders...</div>
    if (listState === 'verifying') return <div className="empty" style={{ padding: '20px 10px' }}>Verifying...</div>
    if (listState === 'nomatch') return <div className="empty" style={{ padding: '20px 10px' }}>No matching order found. Please check the Order ID and phone number.</div>
    if (listState === 'error') return <div className="empty" style={{ padding: '20px 10px' }}>Could not load your orders. Please try again.</div>
    if (listState === 'emptyProfile') {
      return (
        <div className="empty" style={{ padding: '30px 10px' }}>
          You haven't placed any orders yet with this name/phone.<br /><br />
          <a href="#" onClick={e => { e.preventDefault(); switchAccount() }} style={{ color: 'var(--gold)', textDecoration: 'underline', fontSize: 12 }}>Not you? Look up an order manually</a>
        </div>
      )
    }
    if (listState !== 'groups') return null

    const entries = sortOrderRefEntries(groups)
    let sawHistoryHeading = false
    const out = []
    entries.forEach(([ref, rows], idx) => {
      const o = rows[0]
      const isActive = ACTIVE_ORDER_STATUSES.has((o.status || '').toLowerCase())
      if (!isActive && !sawHistoryHeading) {
        out.push(
          <div key={'h' + idx} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', color: 'var(--muted)', margin: `${out.length ? '18px' : '0'} 0 8px` }}>RECENT ORDERS</div>
        )
        sawHistoryHeading = true
      }
      const total = rows.reduce((s, r) => s + Number(r.total_amount || 0), 0)
      const itemCount = rows.reduce((s, r) => s + Number(r.quantity || 1), 0)
      out.push(
        <div key={ref} className="pickerRow" style={{ border: '1px solid var(--line)', marginBottom: 10, padding: 16 }} onClick={() => viewOrderGroup(rows)}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{ref}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{fmtDate(o.created_at)} · {itemCount} item{itemCount > 1 ? 's' : ''} · ৳{total.toLocaleString()}</div>
          </div>
          <StatusBadge status={o.status} />
        </div>
      )
    })

    out.push(
      <div key="switch" style={{ textAlign: 'center', marginTop: 14 }}>
        {listSource === 'profile'
          ? <a href="#" onClick={e => { e.preventDefault(); switchAccount() }} style={{ color: 'var(--muted)', textDecoration: 'underline', fontSize: 11 }}>Not you? Switch account</a>
          : <a href="#" onClick={e => { e.preventDefault(); clearSavedTrackPhone() }} style={{ color: 'var(--muted)', textDecoration: 'underline', fontSize: 11 }}>Not your number? Search a different one</a>}
      </div>
    )
    return out
  }

  function renderReceipt() {
    if (!receiptRows) return null
    const rows = receiptRows
    const o = rows[0]

    const st = (o.status || '').toLowerCase()
    if (st === 'cancelled' || st === 'returned') {
      const cancelled = st === 'cancelled'
      return (
        <div style={{ background: cancelled ? '#fde0e0' : '#eceff1', borderRadius: 12, padding: 18, color: cancelled ? '#c0392b' : '#455a64', fontWeight: 700, textAlign: 'center' }}>
          Order {o.order_ref || '#' + o.id} was {cancelled ? 'cancelled' : 'returned'}
          {history[st] ? <div style={{ fontWeight: 400, fontSize: 11, marginTop: 4 }}>{fmtTime(history[st])}</div> : null}
        </div>
      )
    }

    const order = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']
    const currentIdx = Math.max(0, order.indexOf(st === 'processing' ? 'confirmed' : st))

    const steps = [
      { key: 'pending', title: 'Order Placed (COD)', desc: `Your order ${o.order_ref || '#' + o.id} was successfully placed.`, time: o.created_at },
      { key: 'confirmed', title: 'Confirmed', desc: 'Our team has confirmed your order.' },
      { key: 'packed', title: 'Packed', desc: 'Your order is packed and ready for the rider.' },
      {
        key: 'shipped', title: 'Shipped',
        desc: o.rider_name ? (
          <>
            {`Rider (${o.rider_name}) has picked up your order for delivery.`}
            {o.rider_phone && (
              <div className="riderPhoneRow">
                <a href={`tel:${o.rider_phone}`} className="riderPhoneNum">{o.rider_phone}</a>
                <button type="button" className="copyIconBtn" onClick={() => copyRiderPhone(o.rider_phone)} aria-label="Copy phone number">
                  {copiedPhone ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M20 6 9 17l-5-5" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
                  )}
                </button>
              </div>
            )}
          </>
        ) : 'Your order has been handed to our delivery rider.'
      },
      { key: 'delivered', title: 'Delivered', desc: 'You have received your order. Thank you for shopping with us!' }
    ]

    const grandTotal = rows.reduce((s, r) => s + Number(r.total_amount || 0), 0)

    const addressLine = o.delivery_method === 'pickup'
      ? 'Store Pickup (Mirpur 12)'
      : [o.delivery_address, o.upazila, o.district]
          .filter(Boolean)
          .filter((v, i) => i === 0 || !o.delivery_address || !o.delivery_address.includes(v))
          .join(', ')

    return (
      <>
        <button type="button" onClick={() => setReceiptRows(null)} style={{ background: 'none', border: 0, color: 'var(--muted)', fontSize: 12, marginBottom: 14, cursor: 'pointer' }}>← Back to my orders</button>

        {steps.map((s, i) => {
          const state = i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'pending'
          const isLast = i === steps.length - 1
          const time = history[s.key] || (i === currentIdx ? o.status_updated_at : s.time)
          return (
            <div className={`trackStep ${state}`} key={s.key}>
              <div className="trackStepCol">
                <div className="trackDot">{state === 'pending' ? (i + 1) : '✓'}</div>
                {!isLast && <div className="trackLine"></div>}
              </div>
              <div className="trackStepBody">
                <div className="trackTitle" style={{ color: state === 'pending' ? '#aaa' : '#111' }}>{s.title}</div>
                <div className="trackDesc">{s.desc}</div>
                {time ? <div className="trackTime">{fmtTime(time)}</div> : null}
              </div>
            </div>
          )
        })}

        <div style={{ background: 'var(--cream)', borderRadius: 12, padding: 18, marginTop: 6, marginBottom: 16 }}>
          <div className="summaryRow"><span>Order ID</span><b>{o.order_ref || '#' + o.id}</b></div>
          <div className="summaryRow" style={{ marginBottom: 0 }}><span>Delivery</span><b style={{ textAlign: 'right', maxWidth: '65%' }}>{o.delivery_method === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</b></div>
        </div>

        <h3 style={{ fontSize: 13, letterSpacing: '0.5px', marginBottom: 4 }}>ITEMS</h3>
        {rows.map((r, idx) => {
          const label = (r.items || '').split(',')[0]?.trim() || 'Item'
          const img = imgById[r.product_id]
          return (
            <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,.08)', cursor: 'pointer' }}
              onClick={() => { closePanel(); router.push(`/product/${r.product_id}`) }}>
              <div style={{ width: 52, height: 62, background: 'var(--cream)', borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                {img ? <Image src={cldOpt(img, 150)} alt="" fill sizes="52px" style={{ objectFit: 'cover' }} loading="lazy" quality={75} /> : null}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Qty: {r.quantity || 1} × ৳{Number(r.unit_price || 0).toLocaleString()}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>৳{Number((r.unit_price || 0) * (r.quantity || 1)).toLocaleString()}</div>
            </div>
          )
        })}
        <div className="summaryRow total" style={{ marginTop: 14 }}><span>Total</span><span>৳{grandTotal.toLocaleString()}</span></div>

        <h3 style={{ fontSize: 13, letterSpacing: '0.5px', marginTop: 20, marginBottom: 8 }}>DELIVERY ADDRESS</h3>
        <p style={{ fontSize: 13, color: '#333', lineHeight: 1.6 }}>{addressLine || '—'}</p>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{o.customer || ''} · {o.phone || ''}</p>

        <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 20 }}>
          Any query? Message us on <a href="https://wa.me/8801877270165" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>WhatsApp</a>.
        </p>
      </>
    )
  }

  return (
    <div className={`panel${show ? ' show' : ''}`}>
      <div className="panelHead">
        <h2>My Orders</h2>
        <button className="close" onClick={closePanel}>×</button>
      </div>

      <div>{renderList()}</div>

      {manualOpen && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>
            Enter your Order ID (from your order confirmation) and phone number once to verify it's really you — after that, this device will remember you and show all your orders automatically.
          </p>
          <form className="form" onSubmit={submitTrackOrder}>
            <label>ORDER ID</label>
            <input type="text" placeholder="e.g. VN12345678" required value={orderId} onChange={e => setOrderId(e.target.value)} />
            <label>PHONE NUMBER USED FOR THE ORDER</label>
            <input type="tel" placeholder="01XXXXXXXXX" required value={phone} onChange={e => setPhone(e.target.value)} />
            <button className="btn" style={{ width: '100%' }}>VERIFY & TRACK ORDER</button>
          </form>
        </div>
      )}

      <div ref={resultRef} style={{ marginTop: 20 }}>{renderReceipt()}</div>
    </div>
  )
}
