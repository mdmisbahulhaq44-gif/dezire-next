'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { cldOpt } from '../../lib/cloudinary'
import StatusBadge from './StatusBadge'
import DashboardInsights from './DashboardInsights'

export default function AdminDashboard({ onNav }) {
  const [state, setState] = useState('loading') // loading | error | ready
  const [stats, setStats] = useState({ sales: 0, orderCount: 0, customerCount: 0, productCount: 0 })
  const [recent, setRecent] = useState([])
  const [summary, setSummary] = useState(null)
  const [imgById, setImgById] = useState({})

  useEffect(() => { load() }, [])

  async function load() {
    setState('loading')

    const { count: productCount } = await supabase
      .from('products').select('id', { count: 'exact', head: true })

    // totals, charts and lists are computed by the database (exact, any number of orders)
    const [{ data: sum }, { data: allOrders, error }] = await Promise.all([
      supabase.rpc('admin_dashboard_summary'),
      supabase
        .from('orders')
        .select('id,customer,phone,total_amount,status,created_at,order_ref,product_id,quantity')
        .order('created_at', { ascending: false })
        .limit(80)
    ])
    setSummary(sum || null)

    if (error) {
      setState('error')
      return
    }

    const orders = allOrders || []
    const isLive = o => !['cancelled', 'returned'].includes((o.status || '').toLowerCase())
    const total = orders.filter(isLive).reduce((s, o) => s + Number(o.total_amount || 0), 0)

    const groups = new Map()
    orders.forEach(o => {
      const key = o.order_ref || ('id_' + o.id)
      if (!groups.has(key)) {
        groups.set(key, { ...o, total_amount: Number(o.total_amount || 0), _items: [{ product_id: o.product_id, qty: o.quantity || 1 }] })
      } else {
        const g = groups.get(key)
        g.total_amount += Number(o.total_amount || 0)
        g._items.push({ product_id: o.product_id, qty: o.quantity || 1 })
      }
    })
    const groupedOrders = Array.from(groups.values())
    const uniqueCustomers = new Set(orders.map(o => o.phone).filter(Boolean))
    const recentOrders = groupedOrders.slice(0, 10)

    const ids = [...new Set(recentOrders.flatMap(o => o._items.map(i => i.product_id)).filter(Boolean))]
    let map = {}
    if (ids.length) {
      const { data: prods } = await supabase.from('products').select('id,name,imgs').in('id', ids)
      ;(prods || []).forEach(p => { map[p.id] = p })
    }
    setImgById(map)

    setStats({
      sales: sum ? Number(sum.all.sales) : total,
      orderCount: sum ? Number(sum.all.orders) : groupedOrders.filter(isLive).length,
      customerCount: sum ? Number(sum.all.customers) : uniqueCustomers.size,
      productCount: productCount || 0
    })
    setRecent(recentOrders)
    setState('ready')
  }

  return (
    <div id="adminDashboardView">
      <div className="dashboard">
        <div className="stat" onClick={() => onNav('orders')} style={{ cursor: 'pointer' }}>
          <div className="statIcon" style={{ background: '#e8f5ea', color: '#1c8a45' }}>৳</div>
          <div><small>TOTAL SALES</small><h2>৳{stats.sales.toLocaleString()}</h2></div>
        </div>
        <div className="stat" onClick={() => onNav('orders')} style={{ cursor: 'pointer' }}>
          <div className="statIcon" style={{ background: '#e6eefd', color: '#1a5bb8' }}>📦</div>
          <div><small>ORDERS</small><h2>{stats.orderCount}</h2></div>
        </div>
        <div className="stat" onClick={() => onNav('customers')} style={{ cursor: 'pointer' }}>
          <div className="statIcon" style={{ background: '#fbeadd', color: '#c9701f' }}>👥</div>
          <div><small>CUSTOMERS</small><h2>{stats.customerCount}</h2></div>
        </div>
        <div className="stat" onClick={() => onNav('products')} style={{ cursor: 'pointer' }}>
          <div className="statIcon" style={{ background: '#f1e9fb', color: '#6934c9' }}>🛍️</div>
          <div><small>PRODUCTS</small><h2>{stats.productCount}</h2></div>
        </div>
      </div>

      <DashboardInsights summary={summary} onNav={onNav} />

      <div className="adminTable dashRecentOrders">
        <h2 style={{ marginBottom: 20 }}>Recent Orders</h2>
        <table>
          <thead><tr><th>Customer</th><th>Product</th><th>Total</th></tr></thead>
          <tbody>
            {state === 'loading' && <tr><td colSpan={3}>Loading...</td></tr>}
            {state === 'error' && <tr><td colSpan={3}>Could not load orders (are you logged in as admin?)</td></tr>}
            {state === 'ready' && recent.length === 0 && <tr><td colSpan={3}>No orders yet</td></tr>}
            {state === 'ready' && recent.map(o => (
              <tr key={o.order_ref || o.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{o.customer || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{o.order_ref || '#' + o.id}</div>
                </td>
                <td>
                  {o._items.map((it, i) => {
                    const p = imgById[it.product_id]
                    return (
                      <a
                        key={i}
                        href={it.product_id ? `/product/${it.product_id}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View product (opens in a new tab)"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 8, textDecoration: 'none', color: 'inherit' }}
                      >
                        <span style={{ width: 24, height: 30, background: 'var(--cream)', borderRadius: 6, overflow: 'hidden', display: 'inline-block' }}>
                          {p?.imgs ? <img src={cldOpt(p.imgs.split(',')[0].trim(), 80)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                        </span>
                        <span style={{ fontSize: 11, textDecoration: 'underline', textDecorationColor: 'var(--line)' }}>{p?.name || '—'}{it.qty > 1 ? ` ×${it.qty}` : ''}</span>
                      </a>
                    )
                  })}
                </td>
                <td>
                  <div>৳{Number(o.total_amount || 0).toLocaleString()}</div>
                  <div style={{ marginTop: 4 }}><StatusBadge status={o.status} /></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
