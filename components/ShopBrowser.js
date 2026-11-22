'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import ProductGrid from './ProductGrid'
import ShopAside from './ShopAside'
import { useShop } from './ShopContext'

const PER_PAGE = 50

function sizesOf(p) {
  if (Array.isArray(p.sizes)) return p.sizes
  if (typeof p.sizes === 'string' && p.sizes.trim()) {
    return p.sizes.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}

// 1 2 3 … 5 style page list: first, last and the pages around the current one
function pageList(cur, total) {
  const set = new Set([1, total, cur - 1, cur, cur + 1])
  if (cur <= 2) set.add(3)
  const nums = [...set].filter(n => n >= 1 && n <= total).sort((a, b) => a - b)
  const out = []
  nums.forEach((n, i) => {
    if (i > 0) {
      const gap = n - nums[i - 1]
      if (gap === 2) out.push(n - 1)
      else if (gap > 2) out.push('...')
    }
    out.push(n)
  })
  return out
}

const pagerBtn = {
  background: 'none',
  border: 0,
  padding: 0,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontWeight: 300,
  color: '#555',
  lineHeight: 1.4
}

const EMPTY = { min: '', max: '', sizes: [], inStock: false }

const pillStyle = {
  border: '1px solid var(--line)',
  borderRadius: 30,
  padding: '9px 14px',
  fontSize: 11,
  background: 'white'
}

function SortMenu({ value, onChange, t }) {
  const [open, setOpen] = useState(false)
  const opts = [['newest', 'Newest First'], ['price_low', 'Price: Low to High'], ['price_high', 'Price: High to Low']]
  const cur = opts.find(o => o[0] === value) || opts[0]
  return (
    <div className="sortWrap">
      <button type="button" className={`sortBtn${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{t(cur[1])}</span>
        <svg viewBox="0 0 12 8" fill="none" stroke="#111" strokeWidth="1.6" aria-hidden="true"><path d="M1 1l5 5 5-5" /></svg>
      </button>
      {open && <div className="sortBg" onClick={() => setOpen(false)} />}
      {open && (
        <div className="sortList" role="listbox">
          {opts.map(o => (
            <button type="button" key={o[0]} role="option" aria-selected={o[0] === value} className={o[0] === value ? 'on' : ''} onClick={() => { onChange(o[0]); setOpen(false) }}>
              <span>{t(o[1])}</span><i />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ShopBrowser({ products, heading, initialGender, hideGenderTabs, breadcrumb }) {
  const { t } = useShop()
  const [gender, setGender] = useState(initialGender || 'ALL')
  const [sort, setSort] = useState('newest')
  const [boxOpen, setBoxOpen] = useState(false)
  const [draft, setDraft] = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)
  const [page, setPage] = useState(1)
  const gridTop = useRef(null)

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

  // filters, gender tab or sorting changed: back to page 1
  useEffect(() => { setPage(1) }, [gender, sort, applied])

  const totalPages = Math.max(1, Math.ceil(visible.length / PER_PAGE))
  const cur = Math.min(page, totalPages)
  const pageItems = visible.slice((cur - 1) * PER_PAGE, cur * PER_PAGE)

  function goPage(n) {
    setPage(n)
    // bring the top of the product list into view
    setTimeout(() => {
      const el = gridTop.current
      if (!el) return
      const y = el.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({ top: Math.max(0, y), behavior: 'auto' })
    }, 0)
  }

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
          {t(heading)}
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
              {t(label)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={toggleBox} className="filterBtnOff"
            style={{ ...pillStyle, padding: '9px 16px', letterSpacing: '.5px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            {t('FILTER')}{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
          <SortMenu value={sort} onChange={setSort} t={t} />
        </div>

        {boxOpen && (
          <div style={{ background: '#faf9f6', border: '1px solid var(--line)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <strong style={{ fontSize: 12, letterSpacing: '.5px' }}>{t('PRICE RANGE (৳)')}</strong>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}>
              <input
                type="number"
                placeholder={t('Min')}
                value={draft.min}
                onChange={e => setDraft(d => ({ ...d, min: e.target.value }))}
                style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}
              />
              <span style={{ color: 'var(--muted)' }}>—</span>
              <input
                type="number"
                placeholder={t('Max')}
                value={draft.max}
                onChange={e => setDraft(d => ({ ...d, max: e.target.value }))}
                style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px', fontSize: 13 }}
              />
            </div>

            {allSizes.length > 0 && (
              <>
                <div style={{ marginBottom: 6 }}>
                  <strong style={{ fontSize: 12, letterSpacing: '.5px' }}>{t('SIZE')}</strong>
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
              {t('In Stock Only')}
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={clearFilters}
                style={{ flex: 1, padding: 11, border: '1px solid var(--black)', borderRadius: 30, background: 'white', fontSize: 12, letterSpacing: '.5px', cursor: 'pointer' }}
              >
                {t('CLEAR')}
              </button>
              <button
                onClick={applyFilters}
                style={{ flex: 1, padding: 11, border: 0, borderRadius: 30, background: 'var(--black)', color: 'white', fontSize: 12, letterSpacing: '.5px', cursor: 'pointer' }}
              >
                {t('APPLY')}
              </button>
            </div>
          </div>
        )}

        <div ref={gridTop} />
        <ProductGrid products={pageItems} noPreview tiles />

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, margin: '34px 0 6px' }}
          >
            {cur > 1 && (
              <button type="button" onClick={() => goPage(cur - 1)} style={{ ...pagerBtn, fontSize: 17 }}>
                ← {t('Previous')}
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              {pageList(cur, totalPages).map((n, i) =>
                n === '...' ? (
                  <span key={'d' + i} style={{ ...pagerBtn, cursor: 'default', width: 40, textAlign: 'center', fontSize: 15 }}>…</span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    onClick={() => n !== cur && goPage(n)}
                    aria-current={n === cur ? 'page' : undefined}
                    style={{ ...pagerBtn, width: 40, textAlign: 'center', fontSize: 15, color: n === cur ? '#111' : '#555', cursor: n === cur ? 'default' : 'pointer' }}
                  >
                    {n}
                  </button>
                )
              )}
            </div>
            {cur < totalPages && (
              <button type="button" onClick={() => goPage(cur + 1)} style={{ ...pagerBtn, fontSize: 17 }}>
                {t('Next')} →
              </button>
            )}
          </nav>
        )}

        {breadcrumb && <ShopAside />}
      </div>
    </div>
  )
}
