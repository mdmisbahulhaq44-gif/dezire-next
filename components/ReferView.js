'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const SITE = 'https://heaven-bd.vercel.app'

function money(n) {
  const v = Number(n || 0)
  return '৳' + (Number.isInteger(v) ? v : v.toFixed(2))
}

function kindLabel(k) {
  return ({ referral_reward: 'Referral reward', order_payment: 'Used on an order', order_refund: 'Refund to wallet', admin_adjust: 'Adjustment' })[k] || 'Wallet'
}

export default function ReferView({ showToast }) {
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let live = true
    supabase.rpc('my_wallet_summary').then(({ data, error }) => {
      if (!live) return
      if (error || !data) setErr('Could not load. Please try again.')
      else setD(data)
    })
    return () => { live = false }
  }, [])

  async function copy() {
    try { await navigator.clipboard.writeText(d.code); showToast('Code copied') } catch (e) { showToast('Your code: ' + d.code) }
  }

  async function share() {
    const text = `Join HEAVEN with my referral code ${d.code} when you create your account, and shop your favourites! ${SITE}`
    try {
      if (navigator.share) await navigator.share({ title: 'HEAVEN', text })
      else { await navigator.clipboard.writeText(text); showToast('Invite message copied') }
    } catch (e) {}
  }

  if (err) return <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>{err}</div>
  if (!d) return <div style={{ padding: 24, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading...</div>

  const card = { background: '#fff', border: '1px solid var(--line)', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,.05)', padding: 16, marginBottom: 14 }

  return (
    <div>
      <div style={{ ...card, background: '#111', color: '#fff', border: 0 }}>
        <div style={{ fontSize: 12, opacity: .7, letterSpacing: 1 }}>WALLET BALANCE</div>
        <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{money(d.balance)}</div>
        <div style={{ fontSize: 11, opacity: .65, marginTop: 6 }}>Use your balance when you shop.</div>
      </div>

      <div style={card}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Your referral code</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, fontSize: 26, fontWeight: 700, letterSpacing: 6 }}>{d.code}</div>
          <button type="button" onClick={copy} style={{ border: '1px solid #ddd', background: '#fff', borderRadius: 10, padding: '9px 14px', font: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>COPY</button>
        </div>
        <button type="button" className="btn" style={{ marginTop: 14, width: '100%' }} onClick={share}>SHARE WITH FRIENDS</button>
      </div>

      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>How it works</div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#444', lineHeight: 1.7 }}>
          <li>Share your code. Your friend enters it when creating an account with a mobile number.</li>
          <li>Your friend&apos;s first order must be above {money(d.min_order)}.</li>
          <li>When that order is delivered, you get {money(d.reward)} in your wallet.</li>
        </ol>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>You can invite as many friends as you like. The reward is for each friend&apos;s first order only.</div>
      </div>

      <div style={{ ...card, display: 'flex', textAlign: 'center' }}>
        {[['Invited', d.invited], ['Rewarded', d.rewarded], ['Waiting', d.pending], ['Earned', money(d.earned)]].map(([l, v]) => (
          <div key={l} style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {d.history && d.history.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Wallet history</div>
          {d.history.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: i ? '1px solid #f0f0f0' : 0, fontSize: 13 }}>
              <div>
                <div>{kindLabel(h.kind)}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(h.at).toLocaleDateString()}{h.order_ref ? ' · ' + h.order_ref : ''}</div>
              </div>
              <div style={{ fontWeight: 700, color: Number(h.amount) < 0 ? '#c0392b' : '#1e8e3e' }}>{Number(h.amount) > 0 ? '+' : ''}{money(h.amount)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
