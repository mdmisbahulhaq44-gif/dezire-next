'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cldOpt } from '../lib/cloudinary'
import { buildShopPath } from '../lib/categories'

// Category page whose tiles are single products: same FILTER + sort as the
// other product listings, tiles keep their look.
const EMPTY = { min: '', max: '', sizes: [], inStock: false }

const pillStyle = {
  border: '1px solid var(--line)',
  borderRadius: 30,
  padding: '9px 14px',
  fontSize: 11,
  background: 'white'
}

const fieldStyle = { width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px', fontSize: 13 }

export default function HubTiles({ gender, path, subs }) {
  const [sort, setSort] = useState('newest')
  const [boxOpen, setBoxOpen] = useState(false)
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)

  const allSizes = useMemo(() => {
    const set = new Set()
    subs.forEach(s => (s.sizes || []).forEach(x => set.add(x)))
    return [...set]
  }, [subs])

  const visible = useMemo(() => {
    let list = subs.filter(s => {
      const price = Number(s.minPrice)
      if (applied.min !== '' && price < Number(applied.min)) return false
      if (applied.max !== '' && price > Number(applied.max)) return false
      if (applied.sizes.length && !(s.sizes || []).some(x => applied.sizes.includes(x))) return false
      if (applied.inStock && !s.inStock) return false
      return true
    })
    if (sort === 'price_low') list = [...list].sort((a, b) => Number(a.minPrice) - Number(b.minPrice))
    if (sort === 'price_high') list = [...list].sort((a, b) => Number(b.minPrice) - Number(a.minPrice))
    return list
  }, [subs, applied, sort])

  const activeCount =
    (applied.min !== '' || applied.max !== '' ? 1 : 0) +
    (applied.sizes.length ? 1 : 0) +
    (applied.inStock ? 1 : 0)

  function toggleBox() {
    if (!boxOpen) setDraft(applied)
    setBoxOpen(o => !o)
  }
  function toggleSize(x) {
    setDraft(d => ({ ...d, sizes: d.sizes.includes(x) ? d.sizes.filter(y => y !== x) : [...d.sizes, x] }))
  }
  function applyFilters() { setApplied(draft); setBoxOpen(false) }
  function clearFilters() { setDraft(EMPTY); setApplied(EMPTY); setBoxOpen(false) }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '4px 0 16px', flexWrap: 'wrap' }}>
        <button
          onClick={toggleBox}
          style={{ ...pillStyle, padding: '9px 16px', letterSpacing: '.5px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          FILTER{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
        <select value={sort} onChange={e => setSort(e.target.value)} style={pillStyle}>
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      {boxOpen && (
        <div style={{ background: '#faf9f6', border: '1px solid var(--line)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <strong style={{ fontSize: 12, letterSpacing: '.5px' }}>PRICE RANGE (৳)</strong>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}>
            <input type="number" placeholder="Min" value={draft.min} onChange={e => setDraft(d => ({ ...d, min: e.target.value }))} style={fieldStyle} />
            <span style={{ color: 'var(--muted)' }}>—</span>
            <input type="number" placeholder="Max" value={draft.max} onChange={e => setDraft(d => ({ ...d, max: e.target.value }))} style={fieldStyle} />
          </div>

          {allSizes.length > 0 && (
            <>
              <div style={{ marginBottom: 6 }}>
                <strong style={{ fontSize: 12, letterSpacing: '.5px' }}>SIZE</strong>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                {allSizes.map(x => (
                  <button
                    key={x}
                    type="button"
                    className={`filter${draft.sizes.includes(x) ? ' active' : ''}`}
                    onClick={() => toggleSize(x)}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 20, cursor: 'pointer' }}>
            <input type="checkbox" checked={draft.inStock} onChange={e => setDraft(d => ({ ...d, inStock: e.target.checked }))} style={{ width: 16, height: 16 }} />
            In Stock Only
          </label>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={clearFilters} style={{ flex: 1, padding: 11, border: '1px solid var(--black)', borderRadius: 30, background: 'white', fontSize: 12, letterSpacing: '.5px', cursor: 'pointer' }}>
              CLEAR
            </button>
            <button onClick={applyFilters} style={{ flex: 1, padding: 11, border: 0, borderRadius: 30, background: 'var(--black)', color: 'white', fontSize: 12, letterSpacing: '.5px', cursor: 'pointer' }}>
              APPLY
            </button>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="empty">No products match these filters.</div>
      ) : (
        <div className="hubTiles">
          {visible.map(s => (
            <Link
              key={s.seg}
              href={s.count === 1 && s.id ? `/product/${s.id}` : buildShopPath(gender, [...path, s.seg])}
              className="category"
              style={
                s.image
                  ? { backgroundImage: `url('${cldOpt(s.image, 700).replace(/'/g, "%27")}')` }
                  : { background: '#1a1a1a' }
              }
            >
              <div className="catText">
                <h3>{s.seg}</h3>
                {s.count === 1
                  ? (s.minPrice !== null ? <span>৳{Number(s.minPrice).toLocaleString()}</span> : null)
                  : <span>{s.count} PRODUCTS{s.minPrice !== null ? ` · FROM ৳${s.minPrice}` : ''}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
