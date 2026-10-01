'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from './AdminDashboard'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminCustomers from './AdminCustomers'
import AdminSettings from './AdminSettings'
import AdminAuditLog from './AdminAuditLog'

const SECTIONS = [
  { key: 'dashboard', label: '📊 Dashboard' },
  { key: 'products', label: '🛍️ Products' },
  { key: 'orders', label: '📦 Orders' },
  { key: 'customers', label: '👥 Customers' },
  { key: 'settings', label: '⚙️ Settings' },
  { key: 'activity', label: '🕘 Activity log' }
]

const TITLES = {
  dashboard: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  customers: 'Customers',
  settings: 'Settings',
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
        {section === 'settings' && <AdminSettings />}
        {section === 'activity' && <AdminAuditLog />}
      </main>
    </div>
  )
}
