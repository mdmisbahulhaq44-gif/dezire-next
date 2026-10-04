'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

function parseCatPath(p) {
  return (p.cat || '').split('/').map(s => s.trim()).filter(Boolean)
}

function getSubcategories(allProducts, gender, path) {
  const list = allProducts.filter(p => p.gender === gender || p.gender === 'unisex')
  const seen = new Map()
  list.forEach(p => {
    const segs = parseCatPath(p)
    if (segs.length <= path.length) return
    for (let i = 0; i < path.length; i++) {
      if (segs[i].toLowerCase() !== path[i].toLowerCase()) return
    }
    const next = segs[path.length]
    if (!seen.has(next.toLowerCase())) seen.set(next.toLowerCase(), next)
  })
  return Array.from(seen.values()).map(seg => ({ seg }))
}

function CatBuilder({ allProducts, gender, levels, custom, onChange }) {
  function levelChange(i, value) {
    let nextLevels, nextCustom
    if (value === '__new__') {
      nextCustom = [...custom]; nextCustom[i] = true
      nextLevels = [...levels]; nextLevels[i] = ''
    } else {
      nextCustom = [...custom]; nextCustom[i] = false
      nextLevels = [...levels]; nextLevels[i] = value
    }
    onChange(nextLevels.slice(0, i + 1), nextCustom.slice(0, i + 1))
  }
  function removeLevel(i) {
    onChange(levels.slice(0, i), custom.slice(0, i))
  }
  function setCustomName(i, value) {
    const nextLevels = [...levels]; nextLevels[i] = value
    onChange(nextLevels, custom)
  }
  function addLevel() {
    onChange([...levels, ''], [...custom, false])
  }

  return (
    <div style={{ marginBottom: 8 }}>
      {levels.map((val, i) => {
        const path = levels.slice(0, i)
        const opts = getSubcategories(allProducts, gender, path)
        const isCustom = custom[i]
        return (
          <div key={i}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select
                value={isCustom ? '__new__' : val}
                onChange={e => levelChange(i, e.target.value)}
                style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 8, padding: 9 }}
              >
                <option value="">— Select —</option>
                {opts.map(o => <option key={o.seg} value={o.seg}>{o.seg}</option>)}
                <option value="__new__">+ Add new...</option>
              </select>
              <button type="button" onClick={() => removeLevel(i)} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, width: 38, color: 'var(--red)', cursor: 'pointer' }}>✕</button>
            </div>
            {isCustom && (
              <input
                type="text"
                value={val}
                placeholder={`Type new ${i === 0 ? 'category' : 'subcategory'} name`}
                onChange={e => setCustomName(i, e.target.value)}
                style={{ marginBottom: 8 }}
              />
            )}
          </div>
        )
      })}
      <button
        type="button"
        onClick={addLevel}
        style={{ background: 'none', border: '1px dashed var(--line)', borderRadius: 8, padding: 8, width: '100%', fontSize: 12, letterSpacing: '.5px', cursor: 'pointer' }}
      >
        + {levels.length ? 'ADD SUBCATEGORY LEVEL' : 'CHOOSE CATEGORY'}
      </button>
    </div>
  )
}

const BLANK = {
  id: '', name: '', brand: 'DEZIRE', gender: 'men',
  price: '', old: '', badge: '', stock: '', imgs: '', cost: '',
  fabric: '', description: '', sizes: '', color_name: '', color_group: '', size_chart: ''
}

export default function ProductFormPanel({ open, product, allProducts, onClose, onSaved, showToast }) {
  const [f, setF] = useState(BLANK)
  const [catLevels, setCatLevels] = useState([''])
  const [catCustom, setCatCustom] = useState([false])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    if (product) {
      setF({
        id: product.id,
        name: product.name || '',
        brand: product.brand || '',
        gender: product.gender || 'men',
        price: product.price ?? '',
        old: product.old ?? '',
        badge: product.badge || '',
        stock: product.stock ?? 0,
        imgs: product.imgs || '',
        fabric: product.fabric || '',
        description: product.description || '',
        sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
        color_name: product.color_name || '',
        color_group: product.color_group || '',
        size_chart: (product.size_chart && Object.keys(product.size_chart).length) ? JSON.stringify(product.size_chart) : ''
      })
      const levels = parseCatPath(product)
      setCatLevels(levels.length ? levels : [''])
      setCatCustom((levels.length ? levels : ['']).map(() => false))
    } else {
      setF(BLANK)
      setCatLevels([''])
      setCatCustom([false])
    }
  }, [open, product])

  // private cost price lives in its own admin-only table
  useEffect(() => {
    if (!open || !product || !product.id) return
    supabase.from('product_costs').select('cost_price').eq('product_id', product.id).maybeSingle()
      .then(({ data }) => { if (data) setF(prev => ({ ...prev, cost: data.cost_price })) })
  }, [open, product])

  function set(k, v) { setF(prev => ({ ...prev, [k]: v })) }

  function onGenderChange(g) {
    set('gender', g)
    setCatLevels([''])
    setCatCustom([false])
  }

  async function save(e) {
    e.preventDefault()
    const cat = catLevels.filter(v => v && v.trim()).join('/')
    if (!cat) { showToast('Please choose a category.'); return }

    const sizesArr = f.sizes.split(',').map(s => s.trim()).filter(Boolean)

    let sizeChartObj = {}
    const raw = f.size_chart.trim()
    if (raw) {
      try { sizeChartObj = JSON.parse(raw) }
      catch (err) { showToast("Size chart isn't valid JSON — please check the format."); return }
    }

    const payload = {
      name: f.name.trim(),
      brand: f.brand.trim(),
      cat,
      gender: f.gender,
      price: Number(f.price),
      old: f.old ? Number(f.old) : null,
      badge: f.badge.trim() || null,
      stock: Number(f.stock),
      imgs: f.imgs.trim(),
      fabric: f.fabric.trim() || null,
      description: f.description.trim() || null,
      sizes: sizesArr,
      color_name: f.color_name.trim() || null,
      size_chart: sizeChartObj
    }
    if (f.color_group.trim()) payload.color_group = f.color_group.trim()

    setBusy(true)
    let pid = f.id
    let error
    if (f.id) {
      ;({ error } = await supabase.from('products').update(payload).eq('id', f.id))
    } else {
      const res = await supabase.from('products').insert(payload).select('id').single()
      error = res.error
      pid = res.data && res.data.id
    }
    if (!error && pid) {
      const costNum = f.cost === '' || f.cost === null ? null : Number(f.cost)
      if (costNum !== null && costNum >= 0) {
        const r2 = await supabase.from('product_costs').upsert({ product_id: pid, cost_price: costNum, updated_at: new Date().toISOString() })
        if (r2.error) showToast('Product saved, but cost price failed: ' + r2.error.message)
      } else if (f.id) {
        await supabase.from('product_costs').delete().eq('product_id', pid)
      }
    }
    setBusy(false)

    if (error) {
      showToast('Could not save product: ' + (error.message || 'Unknown error'))
      return
    }
    showToast(f.id ? 'Product updated!' : 'Product added!')
    onSaved()
  }

  async function del() {
    if (!f.id) return
    if (!confirm('Delete this product permanently? This cannot be undone.')) return
    const { error } = await supabase.from('products').delete().eq('id', f.id)
    if (error) {
      showToast('Could not delete product: ' + (error.message || 'Unknown error'))
      return
    }
    showToast('Product deleted.')
    onSaved()
  }

  return (
    <div className={`panel${open ? ' show' : ''}`}>
      <div className="panelHead">
        <h2>{f.id ? 'Edit Product' : 'Add Product'}</h2>
        <button className="close" onClick={onClose}>×</button>
      </div>
      <form className="form" onSubmit={save}>
        <label>PRODUCT NAME</label>
        <input type="text" required value={f.name} onChange={e => set('name', e.target.value)} />

        <label>BRAND</label>
        <input type="text" value={f.brand} onChange={e => set('brand', e.target.value)} />

        <label>CATEGORY</label>
        <CatBuilder
          allProducts={allProducts}
          gender={f.gender}
          levels={catLevels}
          custom={catCustom}
          onChange={(lv, cu) => { setCatLevels(lv); setCatCustom(cu) }}
        />

        <label>GENDER</label>
        <select value={f.gender} onChange={e => onGenderChange(e.target.value)}>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="unisex">Unisex</option>
        </select>

        <label>PRICE (৳)</label>
        <input type="number" required value={f.price} onChange={e => set('price', e.target.value)} />

        <label>COST PRICE (৳) — PRIVATE, ONLY FOR YOUR PROFIT REPORT</label>
        <input type="number" min="0" placeholder="What the product costs you" value={f.cost} onChange={e => set('cost', e.target.value)} />

        <label>OLD PRICE (OPTIONAL, FOR SALE STRIKETHROUGH)</label>
        <input type="number" value={f.old} onChange={e => set('old', e.target.value)} />

        <label>BADGE (OPTIONAL — e.g. New, Sale, Bestseller)</label>
        <input type="text" value={f.badge} onChange={e => set('badge', e.target.value)} />

        <label>STOCK QUANTITY</label>
        <input type="number" required value={f.stock} onChange={e => set('stock', e.target.value)} />

        <label>IMAGE URLS (comma-separated, first = main image)</label>
        <textarea placeholder="https://res.cloudinary.com/.../img1.png, https://.../img2.png" value={f.imgs} onChange={e => set('imgs', e.target.value)} />

        <label>DESCRIPTION (OPTIONAL — shown in the product page tab; use new lines and "• " for bullet points)</label>
        <textarea style={{ minHeight: 150 }} placeholder="Write about the product: fit, fabric, care instructions..." value={f.description} onChange={e => set('description', e.target.value)} />

        <label>FABRIC (OPTIONAL)</label>
        <input type="text" placeholder="e.g. 100% Cotton" value={f.fabric} onChange={e => set('fabric', e.target.value)} />

        <label>AVAILABLE SIZES (comma-separated, OPTIONAL)</label>
        <input type="text" placeholder="S, M, L, XL" value={f.sizes} onChange={e => set('sizes', e.target.value)} />

        <label>COLOR NAME (OPTIONAL — leave blank if this product has no color variants)</label>
        <input type="text" placeholder="e.g. Navy Blue" value={f.color_name} onChange={e => set('color_name', e.target.value)} />

        <label>COLOR GROUP ID (OPTIONAL — use the SAME value on two products to link them as color variants)</label>
        <input type="text" placeholder="e.g. boxy-shirt-01" value={f.color_group} onChange={e => set('color_group', e.target.value)} />

        <label>SIZE CHART (OPTIONAL, ADVANCED — JSON format)</label>
        <textarea placeholder='{"S":{"chest":38,"length":27},"M":{"chest":40,"length":28}}' value={f.size_chart} onChange={e => set('size_chart', e.target.value)} />

        <button className="btn" type="submit" style={{ width: '100%', marginTop: 10 }} disabled={busy}>{busy ? 'SAVING...' : 'SAVE PRODUCT'}</button>
        {f.id ? <button type="button" className="btn light" style={{ width: '100%' }} onClick={del}>DELETE PRODUCT</button> : null}
      </form>
    </div>
  )
}
