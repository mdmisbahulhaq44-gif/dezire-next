'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useShop } from '../ShopContext'

function Chips({ items, onRemove }) {
  if (!items.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
      {items.map(it => (
        <span key={it.key} style={{ background: '#f2f2f2', borderRadius: 14, padding: '4px 10px', fontSize: 12 }}>
          {it.label} <button type="button" onClick={() => onRemove(it.key)} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--red)' }}>×</button>
        </span>
      ))}
    </div>
  )
}

function CouponsEditor({ allProducts, showToast }) {
  const [coupons, setCoupons] = useState(null)
  const [code, setCode] = useState('')
  const [type, setType] = useState('percent')
  const [value, setValue] = useState('')
  const [minorder, setMinorder] = useState('')
  const [expires, setExpires] = useState('')
  const [maxDisc, setMaxDisc] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [perPhone, setPerPhone] = useState('')
  const [firstOnly, setFirstOnly] = useState(false)
  const [cats, setCats] = useState([])
  const [prods, setProds] = useState([])

  const catOptions = Array.from(new Set(allProducts.map(p => (p.cat || '').split('/')[0].trim()).filter(Boolean))).sort()
  const prodOptions = [...allProducts].sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  async function load() {
    const { data, error } = await supabase.from('coupons')
      .select('id,code,type,value,minorder,active,expires,uses,max_uses,per_phone_limit,first_order_only,categories,product_ids,max_discount')
      .order('id', { ascending: false })
    setCoupons(error ? [] : (data || []))
  }
  useEffect(() => { load() }, [])

  async function addCoupon() {
    const c = code.trim().toUpperCase()
    const v = Number(value)
    if (!c) { showToast('Enter a coupon code.'); return }
    if (!v || v <= 0) { showToast('Enter a valid discount value.'); return }
    if (type === 'percent' && v > 100) { showToast('Percentage cannot be more than 100.'); return }

    const { error } = await supabase.from('coupons').insert({
      code: c, type, value: v,
      minorder: minorder ? Number(minorder) : null,
      expires: expires || null,
      max_discount: type === 'percent' && maxDisc ? Number(maxDisc) : null,
      max_uses: maxUses ? Number(maxUses) : null,
      per_phone_limit: perPhone ? Number(perPhone) : null,
      first_order_only: firstOnly,
      categories: cats.length ? cats : null,
      product_ids: prods.length ? prods : null,
      active: true
    })
    if (error) { showToast('Could not save: ' + (error.message || 'Unknown error')); return }
    setCode(''); setValue(''); setMinorder(''); setExpires(''); setMaxDisc(''); setMaxUses(''); setPerPhone(''); setFirstOnly(false); setCats([]); setProds([])
    showToast('Coupon added!')
    load()
  }

  async function toggleActive(id, makeActive) {
    const { error } = await supabase.from('coupons').update({ active: makeActive }).eq('id', id)
    if (error) { showToast('Could not update: ' + (error.message || 'Unknown error')); return }
    load()
  }

  async function del(id) {
    if (!confirm('Delete this coupon?')) return
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) { showToast('Could not delete: ' + (error.message || 'Unknown error')); return }
    showToast('Coupon deleted.')
    load()
  }

  function rules(c) {
    const out = []
    if (c.minorder) out.push(`min ৳${Number(c.minorder).toLocaleString()}`)
    if (c.max_discount) out.push(`max off ৳${Number(c.max_discount).toLocaleString()}`)
    if (c.categories?.length) out.push('categories: ' + c.categories.join(', '))
    if (c.product_ids?.length) out.push(c.product_ids.length + ' selected product(s)')
    if (c.first_order_only) out.push('first order only')
    if (c.per_phone_limit) out.push(`${c.per_phone_limit}x per phone`)
    if (c.expires) out.push(`expires ${c.expires}`)
    out.push(`used ${c.uses || 0}${c.max_uses ? '/' + c.max_uses : ''}`)
    if (!c.active) out.push('inactive')
    return out.join(', ')
  }

  return (
    <div style={{ maxWidth: 640 }} id="couponSettingsAnchor">
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.5px', marginBottom: 8 }}>COUPON CODES</label>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
        Create discount codes customers can enter at checkout. You can limit a coupon to certain categories or products, cap the discount, limit how many times it can be used, or make it first-order only.
      </p>

      <div style={{ marginBottom: 18 }}>
        {coupons === null && <p style={{ fontSize: 12, color: 'var(--muted)' }}>Loading...</p>}
        {coupons !== null && coupons.length === 0 && <p style={{ fontSize: 12, color: 'var(--muted)' }}>No coupons yet.</p>}
        {coupons?.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
            <div>
              <b style={{ fontSize: 13, letterSpacing: '.5px' }}>{c.code}</b>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {' — '}{c.type === 'percent' ? c.value + '%' : '৳' + c.value} off, {rules(c)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button type="button" onClick={() => toggleActive(c.id, !c.active)} style={{ background: 'none', border: 0, color: 'var(--teal)', fontSize: 12, cursor: 'pointer' }}>{c.active ? 'Disable' : 'Enable'}</button>
              <button type="button" onClick={() => del(c.id)} style={{ background: 'none', border: 0, color: 'var(--red)', fontSize: 12, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
        <b style={{ fontSize: 12, letterSpacing: '.5px', display: 'block', marginBottom: 10 }}>ADD NEW COUPON</b>
        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>CODE</label>
        <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. EID20" style={{ marginBottom: 10, textTransform: 'uppercase' }} />
        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>DISCOUNT TYPE</label>
        <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <option value="percent">Percentage (%)</option>
          <option value="fixed">Fixed Amount (৳)</option>
        </select>
        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>VALUE</label>
        <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 20" style={{ marginBottom: 10 }} />
        {type === 'percent' && (
          <>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>MAXIMUM DISCOUNT ৳ (OPTIONAL)</label>
            <input type="number" value={maxDisc} onChange={e => setMaxDisc(e.target.value)} placeholder="e.g. 300" style={{ marginBottom: 10 }} />
          </>
        )}
        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>MINIMUM ORDER (OPTIONAL)</label>
        <input type="number" value={minorder} onChange={e => setMinorder(e.target.value)} placeholder="e.g. 1000" style={{ marginBottom: 10 }} />
        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>EXPIRES ON (OPTIONAL)</label>
        <input type="date" value={expires} onChange={e => setExpires(e.target.value)} style={{ marginBottom: 10 }} />

        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>ONLY FOR THESE CATEGORIES (OPTIONAL)</label>
        <Chips items={cats.map(c => ({ key: c, label: c }))} onRemove={k => setCats(cats.filter(c => c !== k))} />
        <select value="" onChange={e => { const v = e.target.value; if (v && !cats.includes(v)) setCats([...cats, v]) }} style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <option value="">+ Add category</option>
          {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>ONLY FOR THESE PRODUCTS (OPTIONAL)</label>
        <Chips items={prods.map(id => ({ key: id, label: allProducts.find(p => p.id === id)?.name || '#' + id }))} onRemove={k => setProds(prods.filter(id => id !== k))} />
        <select value="" onChange={e => { const v = Number(e.target.value); if (v && !prods.includes(v)) setProds([...prods, v]) }} style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <option value="">+ Add product</option>
          {prodOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>TOTAL USES ALLOWED (OPTIONAL)</label>
        <input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="e.g. 100" style={{ marginBottom: 10 }} />
        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>USES PER CUSTOMER PHONE (OPTIONAL)</label>
        <input type="number" value={perPhone} onChange={e => setPerPhone(e.target.value)} placeholder="e.g. 1" style={{ marginBottom: 10 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 14 }}>
          <input type="checkbox" checked={firstOnly} onChange={e => setFirstOnly(e.target.checked)} style={{ width: 'auto' }} />
          First order only (customers with no earlier order)
        </label>
        <button className="btn" onClick={addCoupon}>ADD COUPON</button>
      </div>
    </div>
  )
}

export default function AdminCoupons() {
  const { showToast } = useShop()
  const [allProducts, setAllProducts] = useState([])

  useEffect(() => {
    supabase.from('products').select('id,name,gender,cat').then(({ data }) => setAllProducts(data || []))
  }, [])

  return (
    <div className="adminTable">
      <CouponsEditor allProducts={allProducts} showToast={showToast} />
    </div>
  )
}
