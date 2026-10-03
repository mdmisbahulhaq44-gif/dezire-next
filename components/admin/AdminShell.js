'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from './AdminDashboard'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminCustomers from './AdminCustomers'
import AdminSettings from './AdminSettings'
import AdminAuditLog from './AdminAuditLog'
import AdminReturns from './AdminReturns'
import AdminStockHistory from './AdminStockHistory'
import AdminBackup from './AdminBackup'
import AdminSales from './AdminSales'
import AdminCoupons from './AdminCoupons'

const SECTIONS = [
  { key: 'dashboard', label: '📊 Dashboard' },
  { key: 'products', label: '🛍️ Products' },
  { key: 'orders', label: '📦 Orders' },
  { key: 'returns', label: '↩️ Returns' },
  { key: 'customers', label: '👥 Customers' },
  { key: 'settings', label: '⚙️ Settings' },
  { key: 'stock', label: '📉 Stock history' },
  { key: 'backup', label: '💾 Backup' },
  { key: 'sales', label: '🏷️ Sales' },
  { key: 'coupons', label: '🎟️ Coupons' },
  { key: 'activity', label: '🕘 Activity log' }
]

const TITLES = {
  dashboard: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  returns: 'Returns',
  customers: 'Customers',
  settings: 'Settings',
  stock: 'Stock history',
  backup: 'Backup',
  sales: 'Sales',
  coupons: 'Coupons',
  activity: 'Activity log'
}

export default function AdminShell() {
  const router = useRouter()
  const [section, setSection] = useState('dashboard')
  const [ordersSearch, setOrdersSearch] = useState('')

  return (
    <div className="admin">
      <aside className="adminSide">
        <div className="adminLogo">DEZIRE ADMIN</div>
        {SECTIONS.map(s => (
          <button
            key={s.key}
            className={section === s.key ? 'active' : ''}
            onClick={() => setSection(s.key)}
          >
            {s.label}
          </button>
        ))}
      </aside>

      <main className="adminMain">
        <div className="adminTop">
          <div>
            <div className="small">ADMINISTRATION</div>
            <h1>{TITLES[section]}</h1>
          </div>
          <button className="adminBack" onClick={() => router.push('/')}>Store</button>
        </div>

        {section === 'dashboard' && <AdminDashboard onNav={setSection} />}
        {section === 'products' && <AdminProducts />}
        {section === 'orders' && <AdminOrders initialSearch={ordersSearch} />}
        {section === 'customers' && <AdminCustomers onViewOrders={phone => { setOrdersSearch(phone); setSection('orders') }} />}
        {section === 'returns' && <AdminReturns onViewOrder={ref => { setOrdersSearch(ref); setSection('orders') }} />}
        {section === 'settings' && <AdminSettings />}
        {section === 'activity' && <AdminAuditLog />}
{section === 'sales' && <AdminSales />}
{section === 'coupons' && <AdminCoupons />}
{section === 'backup' && <AdminBackup />}
{section === 'stock' && <AdminStockHistory />}
      </main>
    </div>
  )
}
