'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useShop } from '../ShopContext'

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
    const key = next.toLowerCase()
    if (!seen.has(key)) seen.set(key, { seg: next, count: 0 })
    seen.get(key).count++
  })
  return Array.from(seen.values())
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s }

function CategoryLinkPicker({ allProducts, gender, category, onGender, onCategory }) {
  const cats = (gender === 'men' || gender === 'women') ? getSubcategories(allProducts, gender, []) : []
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <select value={gender || ''} onChange={e => onGender(e.target.value)} style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 8, padding: 8 }}>
        <option value="">No link</option>
        <option value="flash">⚡ Flash Sale page</option>
        <option value="ALL">All</option>
        <option value="men">Men</option>
        <option value="women">Women</option>
      </select>
      <select value={category || ''} onChange={e => onCategory(e.target.value)} disabled={gender !== 'men' && gender !== 'women'} style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 8, padding: 8 }}>
        <option value="">Whole {capitalize(gender) || ''} section (hub page)</option>
        {cats.map(c => <option key={c.seg} value={c.seg}>{c.seg} ({c.count})</option>)}
      </select>
    </div>
  )
}

// ---------------- HERO SLIDES ----------------
function HeroSlidesEditor({ allProducts, showToast }) {
  const [slides, setSlides] = useState(null)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'hero_slides').maybeSingle().then(({ data }) => {
      let list = []
      if (data?.value) { try { const p = JSON.parse(data.value); if (Array.isArray(p) && p.length) list = p } catch {} }
      setSlides(list)
    })
  }, [])

  function update(i, field, value) {
    setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }
  function remove(i) { setSlides(prev => prev.filter((_, idx) => idx !== i)) }
  function add() { setSlides(prev => [...prev, { image: '', gender: '', category: '' }]) }

  async function save() {
    const cleaned = (slides || []).map(s => ({ image: (s.image || '').trim(), gender: (s.gender || '').trim(), category: (s.category || '').trim() })).filter(s => s.image)
    if (!cleaned.length) { showToast('Add at least one slide with an image link.'); return }
    const { error } = await supabase.from('settings').upsert({ key: 'hero_slides', value: JSON.stringify(cleaned) }, { onConflict: 'key' })
    if (error) { showToast('Could not save: ' + (error.message || 'Unknown error')); return }
    showToast('Banner slides updated! Refresh your homepage to see it.')
    setSlides(cleaned)
  }

  if (slides === null) return <p style={{ fontSize: 12, color: 'var(--muted)' }}>Loading...</p>

  return (
    <div style={{ maxWidth: 500 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.5px', marginBottom: 8 }}>HOMEPAGE HERO BANNER (SLIDES)</label>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
        Add as many slides as you like — they auto-rotate on your homepage with swipe and arrow navigation, just like the tiles below. Optionally link a slide to Men, Women, or a specific category so tapping it jumps shoppers straight to those products.
      </p>
      {slides.map((s, i) => (
        <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b style={{ fontSize: 12, letterSpacing: '.5px' }}>SLIDE {i + 1}</b>
            <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 0, color: 'var(--red)', fontSize: 12, cursor: 'pointer' }}>Remove</button>
          </div>
          {s.image ? <img src={s.image} style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 10, background: '#f2f2f2' }} /> : null}
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>IMAGE LINK</label>
          <input type="text" value={s.image} onChange={e => update(i, 'image', e.target.value)} placeholder="https://example.com/banner.jpg" style={{ marginBottom: 10 }} />
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>TAP TAKES SHOPPERS TO (OPTIONAL)</label>
          <CategoryLinkPicker
            allProducts={allProducts}
            gender={s.gender}
            category={s.category}
            onGender={g => { update(i, 'gender', g); update(i, 'category', '') }}
            onCategory={c => update(i, 'category', c)}
          />
        </div>
      ))}
      <button type="button" onClick={add} style={{ background: 'none', border: '1px dashed var(--line)', borderRadius: 8, padding: 10, width: '100%', fontSize: 12, letterSpacing: '.5px', cursor: 'pointer', marginBottom: 14 }}>+ ADD BANNER SLIDE</button>
      <button className="btn" onClick={save}>SAVE BANNER SLIDES</button>
    </div>
  )
}

// ---------------- HOMEPAGE CATEGORIES ----------------
function HomeCategoriesEditor({ allProducts, showToast }) {
  const [cats, setCats] = useState(null)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'homepage_categories').maybeSingle().then(({ data }) => {
      let list = []
      if (data?.value) { try { const p = JSON.parse(data.value); if (Array.isArray(p) && p.length) list = p } catch {} }
      setCats(list)
    })
  }, [])

  function update(i, field, value) {
    setCats(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }
  function remove(i) { setCats(prev => prev.filter((_, idx) => idx !== i)) }
  function add() { setCats(prev => [...prev, { name: '', subtitle: '', image: '', gender: '', category: '' }]) }

  async function save() {
    const cleaned = (cats || []).map(c => ({
      name: (c.name || '').trim(), subtitle: (c.subtitle || '').trim(), image: (c.image || '').trim(),
      gender: (c.gender || '').trim(), category: (c.category || '').trim()
    })).filter(c => c.name)
    if (!cleaned.length) { showToast('Add at least one category with a name.'); return }
    const { error } = await supabase.from('settings').upsert({ key: 'homepage_categories', value: JSON.stringify(cleaned) }, { onConflict: 'key' })
    if (error) { showToast('Could not save: ' + (error.message || 'Unknown error')); return }
    showToast('Categories updated! Refresh your homepage to see it.')
    setCats(cleaned)
  }

  if (cats === null) return <p style={{ fontSize: 12, color: 'var(--muted)' }}>Loading...</p>

  return (
    <div style={{ maxWidth: 500 }} id="categorySettingsAnchor">
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.5px', marginBottom: 8 }}>HOMEPAGE CATEGORIES</label>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
        These are the tiles shown below your banner (Women, Men, Sale, etc). Give each one a name, a subtitle, and an image link. Tapping any tile takes shoppers to the shop section — you can group your own products into these categories from the Products page.
      </p>
      {cats.map((c, i) => (
        <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b style={{ fontSize: 12, letterSpacing: '.5px' }}>TILE {i + 1}</b>
            <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 0, color: 'var(--red)', fontSize: 12, cursor: 'pointer' }}>Remove</button>
          </div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>CATEGORY NAME</label>
          <input type="text" value={c.name} onChange={e => update(i, 'name', e.target.value)} placeholder="e.g. Women" style={{ marginBottom: 10 }} />
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>SUBTITLE</label>
          <input type="text" value={c.subtitle} onChange={e => update(i, 'subtitle', e.target.value)} placeholder="e.g. Discover Collection" style={{ marginBottom: 10 }} />
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>IMAGE LINK</label>
          <input type="text" value={c.image} onChange={e => update(i, 'image', e.target.value)} placeholder="https://example.com/photo.jpg" style={{ marginBottom: 10 }} />
          <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>TAP TAKES SHOPPERS TO (OPTIONAL)</label>
          <CategoryLinkPicker
            allProducts={allProducts}
            gender={c.gender}
            category={c.category}
            onGender={g => { update(i, 'gender', g); update(i, 'category', '') }}
            onCategory={cat => update(i, 'category', cat)}
          />
        </div>
      ))}
      <button type="button" onClick={add} style={{ background: 'none', border: '1px dashed var(--line)', borderRadius: 8, padding: 10, width: '100%', fontSize: 12, letterSpacing: '.5px', cursor: 'pointer', marginBottom: 14 }}>+ ADD CATEGORY TILE</button>
      <button className="btn" onClick={save}>SAVE CATEGORIES</button>
    </div>
  )
}

// ---------------- CATEGORY TILE PHOTOS ----------------
function categoryImageKey(gender, path) { return `${gender}::${path.join('/')}` }

function getAllCategoryPaths(allProducts) {
  const results = []
  function walk(gender, path) {
    getSubcategories(allProducts, gender, path).forEach(s => {
      const newPath = [...path, s.seg]
      results.push({ gender, path: newPath, label: `${capitalize(gender)} / ${newPath.join(' / ')}` })
      walk(gender, newPath)
    })
  }
  walk('men', [])
  walk('women', [])
  return results
}

function CategoryImagesEditor({ allProducts, showToast }) {
  const [images, setImages] = useState(null)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'category_images').maybeSingle().then(({ data }) => {
      let obj = {}
      if (data?.value) { try { obj = JSON.parse(data.value) || {} } catch {} }
      setImages(obj)
    })
  }, [])

  function update(key, value) {
    setImages(prev => {
      const next = { ...prev }
      if (value) next[key] = value; else delete next[key]
      return next
    })
  }

  async function save() {
    const { error } = await supabase.from('settings').upsert({ key: 'category_images', value: JSON.stringify(images || {}) }, { onConflict: 'key' })
    if (error) { showToast('Could not save: ' + (error.message || 'Unknown error')); return }
    showToast('Category images updated!')
  }

  if (images === null || !allProducts.length) return <p style={{ fontSize: 12, color: 'var(--muted)' }}>{images === null ? 'Loading...' : 'No categories yet — add products with a Category first.'}</p>

  const paths = getAllCategoryPaths(allProducts)

  return (
    <div style={{ maxWidth: 500 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.5px', marginBottom: 8 }}>CATEGORY TILE PHOTOS</label>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
        By default, a category's tile (Baggy, Shirt, etc — at any depth) uses one of its own product photos. Paste a link here to use a nicer, custom photo instead — this list updates automatically as you add new categories.
      </p>
      {paths.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>No categories yet — add products with a Category first.</p>
      ) : paths.map(p => {
        const key = categoryImageKey(p.gender, p.path)
        const url = images[key] || ''
        return (
          <div key={key} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <b style={{ fontSize: 12, letterSpacing: '.5px', display: 'block', marginBottom: 8 }}>{p.label}</b>
            {url ? <img src={url} style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 10, background: '#f2f2f2' }} /> : null}
            <input type="text" value={url} placeholder="Leave blank to auto-use a product photo" onChange={e => update(key, e.target.value)} />
          </div>
        )
      })}
      <button className="btn" onClick={save}>SAVE CATEGORY PHOTOS</button>
    </div>
  )
}

// ---------------- PAYMENT METHOD LOGOS ----------------
function PaymentLogosEditor({ showToast }) {
  const [logos, setLogos] = useState(null)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'payment_logos').maybeSingle().then(({ data }) => {
      let list = []
      if (data?.value) { try { const p = JSON.parse(data.value); if (Array.isArray(p)) list = p } catch {} }
      setLogos(list)
    })
  }, [])

  function update(i, value) { setLogos(prev => prev.map((u, idx) => idx === i ? value : u)) }
  function remove(i) { setLogos(prev => prev.filter((_, idx) => idx !== i)) }
  function add() { setLogos(prev => [...prev, '']) }

  async function save() {
    const cleaned = (logos || []).map(u => (u || '').trim()).filter(Boolean)
    const { error } = await supabase.from('settings').upsert({ key: 'payment_logos', value: JSON.stringify(cleaned) }, { onConflict: 'key' })
    if (error) { showToast('Could not save: ' + (error.message || 'Unknown error')); return }
    setLogos(cleaned)
    showToast('Payment logos updated!')
  }

  if (logos === null) return <p style={{ fontSize: 12, color: 'var(--muted)' }}>Loading...</p>

  return (
    <div style={{ maxWidth: 500 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.5px', marginBottom: 8 }}>PAYMENT METHOD LOGOS</label>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
        Add as many payment logos as you like (bKash, Nagad, Rocket, card networks, etc.) — they always show under "Pay Online" at checkout. Paste a Cloudinary (or any) image link per row.
      </p>
      {logos.length === 0 ? <p style={{ fontSize: 12, color: 'var(--muted)' }}>No logos added yet.</p> : logos.map((url, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {url ? <img src={url} style={{ width: 36, height: 36, objectFit: 'contain', border: '1px solid var(--line)', borderRadius: 6, background: '#f7f7f5', flexShrink: 0 }} onError={e => { e.currentTarget.style.display = 'none' }} /> : null}
          <input type="text" value={url} onChange={e => update(i, e.target.value)} placeholder="https://res.cloudinary.com/..." style={{ flex: 1 }} />
          <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 0, color: 'var(--red)', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>×</button>
        </div>
      ))}
      <button className="btn light" onClick={add} style={{ marginTop: 6 }}>+ ADD LOGO</button>
      <button className="btn" onClick={save} style={{ marginTop: 10 }}>SAVE PAYMENT LOGOS</button>
    </div>
  )
}

export default function AdminSettings() {
  const { showToast } = useShop()
  const [allProducts, setAllProducts] = useState([])

  useEffect(() => {
    supabase.from('products').select('id,name,gender,cat').then(({ data }) => setAllProducts(data || []))
  }, [])

  return (
    <div id="adminSettingsView">
      <div className="adminTable">
        <h2 style={{ marginBottom: 20 }}>Site Settings</h2>

        <HeroSlidesEditor allProducts={allProducts} showToast={showToast} />
        <hr style={{ margin: '36px 0', border: 0, borderTop: '1px solid var(--line)' }} />
        <HomeCategoriesEditor allProducts={allProducts} showToast={showToast} />
        <hr style={{ margin: '36px 0', border: 0, borderTop: '1px solid var(--line)' }} />
        <CategoryImagesEditor allProducts={allProducts} showToast={showToast} />
        <hr style={{ margin: '36px 0', border: 0, borderTop: '1px solid var(--line)' }} />
        <PaymentLogosEditor showToast={showToast} />
      </div>
    </div>
  )
}
