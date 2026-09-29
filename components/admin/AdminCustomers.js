'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminCustomers({ onViewOrders }) {
  const [orders, setOrders] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('orders')
      .select('customer,phone,total_amount,created_at,order_ref,id')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => setOrders(error ? [] : (data || [])))
  }, [])

  const list = useMemo(() => {
    if (!orders) return []
    const byPhone = new Map()
    orders.forEach(o => {
      if (!o.phone) return
      const refKey = o.order_ref || ('id_' + o.id)
      if (!byPhone.has(o.phone)) {
        byPhone.set(o.phone, { phone: o.phone, customer: o.customer, totalSpent: 0, lastOrder: o.created_at, refs: new Set() })
      }
      const c = byPhone.get(o.phone)
      c.totalSpent += Number(o.total_amount || 0)
      c.refs.add(refKey)
      if (new Date(o.created_at) > new Date(c.lastOrder)) { c.lastOrder = o.created_at; c.customer = o.customer }
    })

    const q = search.trim().toLowerCase()
    let result = Array.from(byPhone.values())
    if (q) result = result.filter(c => (c.customer || '').toLowerCase().includes(q) || c.phone.includes(q))
    result.sort((a, b) => new Date(b.lastOrder) - new Date(a.lastOrder))
    return result
  }, [orders, search])

  return (
    <div id="adminCustomersView">
      <div className="adminTable">
        <h2 style={{ marginBottom: 20 }}>Customers</h2>
        <div className="adminSearchRow">
          <input placeholder="Search customers by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table>
          <thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Last Order</th></tr></thead>
          <tbody>
            {orders === null && <tr><td colSpan={5}>Loading...</td></tr>}
            {orders !== null && list.length === 0 && <tr><td colSpan={5}>{search ? 'No customers match your search.' : 'No customers yet.'}</td></tr>}
            {list.map(c => (
              <tr key={c.phone} onClick={() => onViewOrders(c.phone)} style={{ cursor: 'pointer' }}>
                <td>{c.customer || '—'}</td>
                <td>{c.phone}</td>
                <td>{c.refs.size}</td>
                <td>৳{c.totalSpent.toLocaleString()}</td>
                <td>{new Date(c.lastOrder).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
