'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from './AdminDashboard'
import AdminProducts from './AdminProducts'

const SECTIONS = [
  { key: 'dashboard', label: '📊 Dashboard' },
  { key: 'products', label: '🛍️ Products' },
  { key: 'orders', label: '📦 Orders' },
  { key: 'customers', label: '👥 Customers' },
  { key: 'settings', label: '⚙️ Settings' }
]

const TITLES = {
  dashboard: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  customers: 'Customers',
  settings: 'Settings'
}

export default function AdminShell() {
  const router = useRouter()
  const [section, setSection] = useState('dashboard')

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
        {section === 'orders' && <div className="adminTable"><h2>Orders</h2><p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Coming next.</p></div>}
        {section === 'customers' && <div className="adminTable"><h2>Customers</h2><p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Coming next.</p></div>}
        {section === 'settings' && <div className="adminTable"><h2>Site Settings</h2><p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Coming next.</p></div>}
      </main>
    </div>
  )
}
