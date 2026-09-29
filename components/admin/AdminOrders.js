'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { cldOpt } from '../../lib/cloudinary'
import { useShop } from '../ShopContext'

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

function WalletBadge({ name }) {
  return <span style={{ background: 'transparent', border: '1.5px solid #111', color: '#111', fontWeight: 700, fontSize: 12, padding: '3px 12px', borderRadius: 20, letterSpacing: '.3px', display: 'inline-block' }}>{name}</span>
}

function PaymentCell({ o }) {
  if (!o.payment || o.payment === 'COD') return <>💵 COD</>
  if (o.payment === 'ONLINE') {
    if (o.payment_status !== 'paid') {
      return <><WalletBadge name="Online" /><br /><span style={{ fontSize: 10.5, color: 'var(--red)' }}>Unpaid</span></>
    }
    const wallet = o.payment_wallet || 'Online'
    const details = [
      o.payment_sender_number ? `From: ${o.payment_sender_number}` : '',
      o.payment_transaction_id ? `TrxID: ${o.payment_transaction_id}` : ''
    ].filter(Boolean).join(' • ')
    return <><WalletBadge name={wallet} />{details ? <><br /><span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{details}</span></> : null}</>
  }
  const m = (o.delivery_note || '').match(new RegExp(`${o.payment} TrxID: (\\S+)`))
  if (!m) return <WalletBadge name={o.payment} />
  return <><WalletBadge name={o.payment} /><br /><span style={{ fontSize: 10.5, color: 'var(--muted)' }}>TrxID: {m[1]}</span></>
}

function AddressCell({ o }) {
  const [open, setOpen] = useState(false)
  const line = o.delivery_method === 'pickup'
    ? 'Store Pickup (Mirpur 12)'
    : [o.delivery_address, o.upazila, o.district].filter(Boolean).filter((v, i) => i === 0 || !o.delivery_address || !o.delivery_address.includes(v)).join(', ')

  return (
    <div>
      <button type="button" onClick={() => setOpen(v => !v)} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>
        📍 {open ? 'Hide' : 'View'}
      </button>
      {open && (
        <div style={{ marginTop: 6, fontSize: 11.5, color: '#333', maxWidth: 220, lineHeight: 1.6 }}>
          {line || 'No address on file'}
        </div>
      )}
    </div>
  )
}

function ProductChips({ items, allProducts }) {
  const seen = new Set()
  const unique = (items || []).filter(it => {
    if (!it.product_id || seen.has(it.product_id)) return false
    seen.add(it.product_id)
    return true
  })
  if (!unique.length) return <>—</>
  return (
    <>
      {unique.map(it => {
        const p = allProducts.find(x => x.id === it.product_id)
        const name = p ? p.name : 'Product'
        const img = p ? (p.imgs || '').split(',')[0]?.trim() : ''
        return (
          <div key={it.product_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
            <div style={{ width: 44, height: 52, borderRadius: 6, overflow: 'hidden', background: 'var(--cream)', flexShrink: 0 }}>
              {img ? <img src={cldOpt(img, 100)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
            </div>
            <span style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, lineHeight: 1.3 }}>{name}</span>
          </div>
        )
      })}
    </>
  )
}

export default function AdminOrders() {
  const { showToast } = useShop()
  const [cache, setCache] = useState(null)
  const [search, setSearch] = useState('')
  const [allProducts, setAllProducts] = useState([])

  async function load() {
    const { data, error } = await supabase
      .from('orders')
      .select('id,customer,phone,total_amount,status,created_at,order_ref,rider_name,rider_phone,payment,delivery_note,payment_status,payment_wallet,payment_sender_number,payment_transaction_id,items,product_id,quantity,delivery_address,delivery_method,upazila,district')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) { setCache([]); return }
    setCache(data || [])

    const { data: prods } = await supabase.from('products').select('id,name,imgs')
    setAllProducts(prods || [])
  }

  useEffect(() => { load() }, [])

  const list = useMemo(() => {
    if (!cache) return []
    const q = search.trim().toLowerCase()
    const filtered = q ? cache.filter(o => (o.customer || '').toLowerCase().includes(q) || (o.phone || '').includes(q)) : cache

    const groups = new Map()
    filtered.forEach(o => {
      const key = o.order_ref || ('id_' + o.id)
      if (!groups.has(key)) {
        groups.set(key, { ...o, total_amount: Number(o.total_amount || 0), _items: [{ product_id: o.product_id, qty: o.quantity || 1 }] })
      } else {
        const g = groups.get(key)
        g.total_amount += Number(o.total_amount || 0)
        g._items.push({ product_id: o.product_id, qty: o.quantity || 1 })
      }
    })
    return Array.from(groups.values())
  }, [cache, search])

  async function updateStatus(o, newStatus) {
    const query = supabase.from('orders').update({ status: newStatus })
    const { error } = o.order_ref ? await query.eq('order_ref', o.order_ref) : await query.eq('id', o.id)
    if (error) { showToast('Could not update status: ' + (error.message || 'Unknown error')); return }
    setCache(prev => prev.map(row => (o.order_ref ? row.order_ref === o.order_ref : row.id === o.id) ? { ...row, status: newStatus } : row))
    showToast(`Order ${o.order_ref || '#' + o.id} marked as ${newStatus}`)
  }

  async function setRider(o) {
    const name = prompt('Rider name:', o.rider_name || '')
    if (name === null) return
    const phone = prompt('Rider phone (e.g. 01XXXXXXXXX):', o.rider_phone || '')
    if (phone === null) return

    const query = supabase.from('orders').update({ rider_name: name, rider_phone: phone })
    const { error } = o.order_ref ? await query.eq('order_ref', o.order_ref) : await query.eq('id', o.id)
    if (error) { showToast('Could not save rider info: ' + (error.message || 'Unknown error')); return }
    setCache(prev => prev.map(row => (o.order_ref ? row.order_ref === o.order_ref : row.id === o.id) ? { ...row, rider_name: name, rider_phone: phone } : row))
    showToast('Rider info saved.')
  }

  return (
    <div id="adminOrdersView">
      <div className="adminTable">
        <h2 style={{ marginBottom: 20 }}>All Orders</h2>
        <div className="adminSearchRow">
          <input placeholder="Search orders by customer or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Phone</th><th>Product</th><th>Total</th><th>Payment</th><th>Status</th><th>Rider</th><th>Address</th><th>Date</th></tr>
          </thead>
          <tbody>
            {cache === null && <tr><td colSpan={10}>Loading...</td></tr>}
            {cache !== null && list.length === 0 && <tr><td colSpan={10}>{search ? 'No orders match your search.' : 'No orders yet'}</td></tr>}
            {list.map(o => (
              <tr key={o.order_ref || o.id}>
                <td>{o.order_ref || '#' + o.id}</td>
                <td>{o.customer || '—'}</td>
                <td>{o.phone || '—'}</td>
                <td><ProductChips items={o._items} allProducts={allProducts} /></td>
                <td>৳{Number(o.total_amount || 0).toLocaleString()}</td>
                <td><PaymentCell o={o} /></td>
                <td>
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o, e.target.value)}
                    style={{ fontSize: 11, padding: '5px 8px', borderRadius: 8, border: '1px solid var(--line)', background: '#fff' }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <button type="button" onClick={() => setRider(o)} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {o.rider_name ? `🛵 ${o.rider_name}` : '+ Add Rider'}
                  </button>
                </td>
                <td><AddressCell o={o} /></td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
