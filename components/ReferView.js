'use client'

import { useEffect, useState } from 'react'
import { getWallet, refreshWallet, subscribeWallet } from '../lib/walletCache'

const SITE = 'https://heaven-bd.vercel.app'

function money(n) {
  const v = Number(n || 0)
  return '৳' + (Number.isInteger(v) ? v : v.toFixed(2))
}

function kindLabel(k) {
  return ({ referral_reward: 'Referral reward', order_payment: 'Used on an order', order_refund: 'Refund to wallet', admin_adjust: 'Adjustment' })[k] || 'Wallet'
}

const EMPTY = { code: '······', balance: 0, invited: 0, rewarded: 0, pending: 0, earned: 0, reward: 50, min_order: 200, history: [] }

export default function ReferView({ showToast, uid }) {
  const [d, setD] = useState(() => getWallet(uid))
  const [err, setErr] = useState('')
  const loading = !d

  useEffect(() => {
    let live = true
    const off = subscribeWallet((u, data) => { if (live && u === uid) setD(data) })
    refreshWallet(uid).then(data => { if (live && !data && !getWallet(uid)) setErr('Could not load. Please try again.') })
    return () => { live = false; off() }
  }, [uid])

  async function copy() {
    if (loading) return
    try { await navigator.clipboard.writeText(d.code); showToast('Code copied') } catch (e) { showToast('Your code: ' + d.code) }
  }

  async function share() {
    if (loading) return
    const text = `Join HEAVEN with my link and my referral code ${d.code} is added for you: ${SITE}/?ref=${d.code}`
    try {
      if (navigator.share) await navigator.share({ title: 'HEAVEN', text })
      else { await navigator.clipboard.writeText(text); showToast('Invite message copied') }
    } catch (e) {}
  }

  if (err) return <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>{err}</div>
  const x = d || EMPTY

  const card = { background: '#fff', border: '1px solid var(--line)', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,.05)', padding: 16, marginBottom: 14 }

  return (
    <div style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .3s ease' }}>
      <div style={{ ...card, background: '#111', color: '#fff', border: 0 }}>
        <div style={{ fontSize: 12, opacity: .7, letterSpacing: 1 }}>WALLET BALANCE</div>
        <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{money(x.balance)}</div>
        <div style={{ fontSize: 11, opacity: .65, marginTop: 6 }}>Use your balance when you shop.</div>
      </div>

      <div style={card}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Your referral code</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, fontSize: 26, fontWeight: 700, letterSpacing: 6 }}>{x.code}</div>
          <button type="button" onClick={copy} style={{ border: '1px solid #ddd', background: '#fff', borderRadius: 10, padding: '9px 14px', font: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>COPY</button>
        </div>
        <button type="button" className="btn" style={{ marginTop: 14, width: '100%' }} onClick={share}>SHARE WITH FRIENDS</button>
      </div>

      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>How it works</div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#444', lineHeight: 1.7 }}>
          <li>Share your code. Your friend enters it when creating an account with a mobile number.</li>
          <li>Your friend&apos;s first order must be above {money(x.min_order)}.</li>
          <li>When that order is delivered, you get {money(x.reward)} in your wallet.</li>
        </ol>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>You can invite as many friends as you like. The reward is for each friend&apos;s first order only.</div>
      </div>

      <div style={{ ...card, display: 'flex', textAlign: 'center' }}>
        {[['Invited', x.invited], ['Rewarded', x.rewarded], ['Waiting', x.pending], ['Earned', money(x.earned)]].map(([l, v]) => (
          <div key={l} style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {x.history && x.history.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Wallet history</div>
          {x.history.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: i ? '1px solid #f0f0f0' : 0, fontSize: 13 }}>
              <div>
                <div>{h.kind === 'admin_adjust' && h.note ? h.note : kindLabel(h.kind)}</div>
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
