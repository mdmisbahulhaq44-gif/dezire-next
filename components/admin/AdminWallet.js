'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useShop } from '../ShopContext'

const fmt = n => '৳' + Number(n || 0).toLocaleString('en-US')
const dt = d => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const box = { border: '1px solid var(--line)', borderRadius: 12, padding: 14, background: '#fff', marginBottom: 16 }
const h = { fontSize: 12, fontWeight: 700, letterSpacing: '.5px', display: 'block', marginBottom: 10 }
const lbl = { display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }
const KIND = { referral_reward: 'Referral reward', order_payment: 'Used on an order', order_refund: 'Refund to wallet', admin_adjust: 'Admin' }
const STATUS = { pending: 'Waiting', rewarded: 'Rewarded', void: 'Not eligible' }
const STATUS_COLOR = { pending: '#b7791f', rewarded: '#1e8e3e', void: '#888' }

function Who({ u }) {
  if (!u) return <span>—</span>
  return <span><b style={{ fontWeight: 600 }}>{u.name}</b>{u.contact ? <span style={{ color: 'var(--muted)' }}> · {u.contact}</span> : null}</span>
}

// ---------- give money to a customer ----------
function SendMoney({ showToast, onDone }) {
  const [q, setQ] = useState('')
  const [list, setList] = useState(null)
  const [busy, setBusy] = useState(false)
  const [pick, setPick] = useState(null)
  const [mode, setMode] = useState('add')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)

  async function find(e) {
    if (e) e.preventDefault()
    if (q.trim().length < 4) { showToast('Enter a mobile number or an email.'); return }
    setBusy(true); setPick(null)
    const { data, error } = await supabase.rpc('admin_find_customer', { p_q: q.trim() })
    setBusy(false)
    if (error) { showToast('Could not search: ' + (error.message || 'Unknown error')); return }
    setList(data || [])
  }

  async function send() {
    const n = Number(amount)
    if (!(n > 0)) { showToast('Enter an amount.'); return }
    const signed = mode === 'add' ? n : -n
    const ok = window.confirm(mode === 'add'
      ? `Send ${fmt(n)} to ${pick.name} (${pick.contact || 'no contact'})?`
      : `Take back ${fmt(n)} from ${pick.name} (${pick.contact || 'no contact'})?`)
    if (!ok) return
    setSending(true)
    const { data, error } = await supabase.rpc('admin_wallet_adjust', { p_user: pick.id, p_amount: signed, p_note: note.trim() })
    setSending(false)
    if (error) { showToast('Failed: ' + (error.message || 'Unknown error')); return }
    showToast(`Done. ${data.name}'s wallet is now ${fmt(data.balance)}.`)
    setPick({ ...pick, balance: data.balance })
    setList(l => (l || []).map(x => (x.id === pick.id ? { ...x, balance: data.balance } : x)))
    setAmount(''); setNote('')
    onDone && onDone()
  }

  return (
    <div style={box}>
      <b style={h}>SEND MONEY TO A CUSTOMER&apos;S WALLET</b>
      <form onSubmit={find} style={{ display: 'flex', gap: 8 }}>
        <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Mobile number or email" style={{ flex: 1 }} />
        <button className="btn" disabled={busy} style={{ padding: '10px 18px' }}>{busy ? '...' : 'FIND'}</button>
      </form>

      {list && !list.length && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>No account found. Check the number or email (the customer must have an account).</p>}

      {list && list.length > 0 && !pick && (
        <div style={{ marginTop: 10 }}>
          {list.map(u => (
            <button key={u.id} type="button" onClick={() => setPick(u)} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, textAlign: 'left', padding: '10px 12px', marginBottom: 6, border: '1px solid var(--line)', borderRadius: 10, background: '#fff', cursor: 'pointer', font: 'inherit', fontSize: 13 }}>
              <span style={{ flex: 1 }}><Who u={u} /></span>
              <b>{fmt(u.balance)}</b>
            </button>
          ))}
        </div>
      )}

      {pick && (
        <div style={{ marginTop: 12, padding: 12, background: '#faf9f6', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 13 }}>
            <span style={{ flex: 1 }}><Who u={pick} /></span>
            <span style={{ color: 'var(--muted)' }}>Wallet: <b style={{ color: '#111' }}>{fmt(pick.balance)}</b></span>
            <button type="button" onClick={() => setPick(null)} style={{ border: 0, background: 'transparent', fontSize: 12, textDecoration: 'underline', cursor: 'pointer', color: 'var(--muted)' }}>Change</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {[['add', 'Add money'], ['take', 'Take back']].map(([k, t]) => (
              <button key={k} type="button" onClick={() => setMode(k)} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1px solid ' + (mode === k ? '#111' : 'var(--line)'), background: mode === k ? '#111' : '#fff', color: mode === k ? '#fff' : '#111', font: 'inherit', fontSize: 12, cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
          <label style={lbl}>Amount (৳)</label>
          <input type="number" inputMode="decimal" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 100" style={{ marginBottom: 10 }} />
          <label style={lbl}>Message the customer will see (optional)</label>
          <input type="text" value={note} maxLength={120} onChange={e => setNote(e.target.value)} placeholder="e.g. Gift from HEAVEN" style={{ marginBottom: 12 }} />
          <button className="btn" onClick={send} disabled={sending}>{sending ? 'SENDING...' : (mode === 'add' ? 'SEND MONEY' : 'TAKE BACK')}</button>
        </div>
      )}
    </div>
  )
}

// ---------- referral rules ----------
function Rules({ showToast }) {
  const [reward, setReward] = useState('')
  const [minOrder, setMinOrder] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('key,value').in('key', ['referral_reward', 'referral_min_order']).then(({ data }) => {
      const m = {}
      ;(data || []).forEach(r => { m[r.key] = r.value })
      setReward(m.referral_reward || '50')
      setMinOrder(m.referral_min_order || '200')
    })
  }, [])

  async function save() {
    const r = Number(reward), m = Number(minOrder)
    if (!(r >= 0 && r <= 100000) || !(m >= 0 && m <= 1000000)) { showToast('Enter valid amounts.'); return }
    setSaving(true)
    const { error } = await supabase.from('settings').upsert([
      { key: 'referral_reward', value: String(r) },
      { key: 'referral_min_order', value: String(m) }
    ], { onConflict: 'key' })
    setSaving(false)
    if (error) { showToast('Could not save: ' + (error.message || 'Unknown error')); return }
    showToast('Referral rules saved.')
  }

  return (
    <div style={box}>
      <b style={h}>REFERRAL RULES</b>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={lbl}>Reward for the referrer (৳)</label>
          <input type="number" inputMode="decimal" value={reward} onChange={e => setReward(e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Friend&apos;s first order must be above (৳)</label>
          <input type="number" inputMode="decimal" value={minOrder} onChange={e => setMinOrder(e.target.value)} />
        </div>
      </div>
      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '10px 0 12px', lineHeight: 1.6 }}>
        A change applies to friends who join after you save. Friends who already joined keep the rules they signed up with.
      </p>
      <button className="btn" onClick={save} disabled={saving}>{saving ? 'SAVING...' : 'SAVE RULES'}</button>
    </div>
  )
}

// ---------- overview ----------
function Overview({ data, error }) {
  if (error) return <p style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>
  if (!data) return <p style={{ fontSize: 12, color: 'var(--muted)' }}>Loading...</p>
  const cards = [
    ['Money in wallets', fmt(data.wallet_total)],
    ['Spent by customers', fmt(data.spent_total)],
    ['Rewards given', fmt(data.rewarded_total)],
    ['Waiting referrals', data.ref_pending],
    ['Rewarded referrals', data.ref_rewarded],
    ['Not eligible', data.ref_void]
  ]
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 16 }}>
        {cards.map(([l, v]) => (
          <div key={l} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', background: '#fff' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={box}>
        <b style={h}>REFERRALS</b>
        {!data.referrals.length && <p style={{ fontSize: 12, color: 'var(--muted)' }}>No referrals yet.</p>}
        {data.referrals.map(r => (
          <div key={r.id} style={{ padding: '10px 0', borderTop: '1px solid #f0f0f0', fontSize: 12.5, lineHeight: 1.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span><Who u={r.referrer} /></span>
              <b style={{ color: STATUS_COLOR[r.status], whiteSpace: 'nowrap' }}>{STATUS[r.status] || r.status}</b>
            </div>
            <div style={{ color: 'var(--muted)' }}>invited <Who u={r.referred} /></div>
            <div style={{ color: 'var(--muted)', fontSize: 11 }}>
              {dt(r.created_at)}{r.order_ref ? ' · order #' + r.order_ref : ''}{r.status === 'rewarded' ? ' · ' + fmt(r.reward) + ' paid' : ''}
            </div>
          </div>
        ))}
      </div>

      <div style={box}>
        <b style={h}>WALLET ACTIVITY</b>
        {!data.ledger.length && <p style={{ fontSize: 12, color: 'var(--muted)' }}>Nothing yet.</p>}
        {data.ledger.map(l => (
          <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '10px 0', borderTop: '1px solid #f0f0f0', fontSize: 12.5 }}>
            <div>
              <div><Who u={l.user} /></div>
              <div style={{ color: 'var(--muted)', fontSize: 11 }}>
                {KIND[l.kind] || l.kind}{l.note && l.kind === 'admin_adjust' ? ' — ' + l.note : ''}{l.order_ref ? ' · #' + l.order_ref : ''} · {dt(l.created_at)}
              </div>
            </div>
            <b style={{ color: Number(l.amount) < 0 ? '#c0392b' : '#1e8e3e', whiteSpace: 'nowrap' }}>{Number(l.amount) > 0 ? '+' : ''}{fmt(l.amount)}</b>
          </div>
        ))}
      </div>
    </>
  )
}

export default function AdminWallet() {
  const { showToast } = useShop()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  function load() {
    supabase.rpc('admin_wallet_overview').then(({ data: d, error: e }) => {
      if (e) setError('Could not load: ' + (e.message || 'Unknown error') + ' (has the wallet admin SQL been run?)')
      else { setError(''); setData(d) }
    })
  }
  useEffect(load, [])

  return (
    <div style={{ maxWidth: 720 }}>
      <SendMoney showToast={showToast} onDone={load} />
      <Rules showToast={showToast} />
      <Overview data={data} error={error} />
    </div>
  )
}
