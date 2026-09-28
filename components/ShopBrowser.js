'use client'

import { useState, useMemo } from 'react'
import ProductGrid from './ProductGrid'

function sizesOf(p) {
  if (Array.isArray(p.sizes)) return p.sizes
  if (typeof p.sizes === 'string' && p.sizes.trim()) {
    return p.sizes.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}

const EMPTY = { min: '', max: '', sizes: [], inStock: false }

const pillStyle = {
  border: '1px solid var(--line)',
  borderRadius: 30,
  padding: '9px 14px',
  fontSize: 11,
  background: 'white'
}

export default function ShopBrowser({ products, heading, initialGender, hideGenderTabs, breadcrumb }) {
  const [gender, setGender] = useState(initialGender || 'ALL')
  const [sort, setSort] = useState('newest')
  const [boxOpen, setBoxOpen] = useState(false)
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)

  const byGender = useMemo(
    () => products.filter(p => gender === 'ALL' || p.gender === gender || p.gender === 'unisex'),
    [products, gender]
  )

  const allSizes = useMemo(() => {
    const set = new Set()
    byGender.forEach(p => sizesOf(p).forEach(s => set.add(s)))
    return [...set]
  }, [byGender])

  const visible = useMemo(() => {
    let list = byGender.filter(p => {
      const price = Number(p.price)
      if (applied.min !== '' && price < Number(applied.min)) return false
      if (applied.max !== '' && price > Number(applied.max)) return false
      if (applied.sizes.length && !sizesOf(p).some(s => applied.sizes.includes(s))) return false
      if (applied.inStock && !(Number(p.stock) > 0)) return false
      return true
    })
    if (sort === 'price_low') list = [...list].sort((a, b) => Number(a.price) - Number(b.price))
    if (sort === 'price_high') list = [...list].sort((a, b) => Number(b.price) - Number(a.price))
    return list
  }, [byGender, applied, sort])

  const activeCount =
    (applied.min !== '' || applied.max !== '' ? 1 : 0) +
    (applied.sizes.length ? 1 : 0) +
    (applied.inStock ? 1 : 0)

  function toggleBox() {
    if (!boxOpen) setDraft(applied)
    setBoxOpen(o => !o)
  }

  function toggleSize(s) {
    setDraft(d => ({
      ...d,
      sizes: d.sizes.includes(s) ? d.sizes.filter(x => x !== s) : [...d.sizes, s]
    }))
  }

  function applyFilters() {
    setApplied(draft)
    setBoxOpen(false)
  }

  function clearFilters() {
    setDraft(EMPTY)
    setApplied(EMPTY)
    setBoxOpen(false)
  }

  return (
    <div>
      <div style={{ padding: '30px 5% 10px' }}>
        {breadcrumb}
        <h2 style={{ fontSize: 24, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
          {heading}
        </h2>
      </div>

      <div style={{ padding: '0 5% 40px' }}>
        <div className="filters" style={{ marginBottom: 16, display: hideGenderTabs ? "none" : undefined }}>
          {[['ALL', 'ALL'], ['men', 'MEN'], ['women', 'WOMEN']].map(([val, label]) => (
            <button
              key={val}
              className={`filter${gender === val ? ' active' : ''}`}
              onClick={() => setGender(val)}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
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
              <input
                type="number"
                placeholder="Min"
                value={draft.min}
                onChange={e => setDraft(d => ({ ...d, min: e.target.value }))}
                style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}
              />
              <span style={{ color: 'var(--muted)' }}>—</span>
              <input
                type="number"
                placeholder="Max"
                value={draft.max}
                onChange={e => setDraft(d => ({ ...d, max: e.target.value }))}
                style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}
              />
            </div>

            {allSizes.length > 0 && (
              <>
                <div style={{ marginBottom: 6 }}>
                  <strong style={{ fontSize: 12, letterSpacing: '.5px' }}>SIZE</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                  {allSizes.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`filter${draft.sizes.includes(s) ? ' active' : ''}`}
                      onClick={() => toggleSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 20, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={draft.inStock}
                onChange={e => setDraft(d => ({ ...d, inStock: e.target.checked }))}
                style={{ width: 16, height: 16 }}
              />
              In Stock Only
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={clearFilters}
                style={{ flex: 1, padding: 11, border: '1px solid var(--black)', borderRadius: 30, background: 'white', fontSize: 12, letterSpacing: '.5px', cursor: 'pointer' }}
              >
                CLEAR
              </button>
              <button
                onClick={applyFilters}
                style={{ flex: 1, padding: 11, border: 0, borderRadius: 30, background: 'var(--black)', color: 'white', fontSize: 12, letterSpacing: '.5px', cursor: 'pointer' }}
              >
                APPLY
              </button>
            </div>
          </div>
        )}

        <ProductGrid products={visible} />
      </div>
    </div>
  )
}
