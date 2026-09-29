'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import AdminShell from '../../components/admin/AdminShell'

const ADMIN_EMAIL = "mdmisbahulhaq44@gmail.com"

export default function AdminPage() {
  const router = useRouter()
  const [state, setState] = useState('checking') // checking | denied | ok

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email?.toLowerCase()
      if (email === ADMIN_EMAIL) setState('ok')
      else setState('denied')
    })
  }, [])

  if (state === 'checking') return <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>

  if (state === 'denied') {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>You need to be logged in as an admin to view this page.</p>
        <button className="btn" onClick={() => router.push('/')}>BACK TO STORE</button>
      </div>
    )
  }

  return <AdminShell />
}
