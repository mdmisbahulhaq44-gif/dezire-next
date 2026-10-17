'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useShop } from './ShopContext'
import { supabase } from '../lib/supabaseClient'
import { cldOpt } from '../lib/cloudinary'
import Money from './Money'

// Characters that break PostgREST's .or() filter syntax or act as LIKE
// wildcards are turned into spaces. (The original site filtered in the
// browser, so it never had this problem.)
function clean(q) {
  return q.replace(/[,()*%_\\]/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function SearchPanel() {
  const { activePanel, closePanel, hidePanel, showToast } = useShop()
  const pathname = usePathname()
  const pending = useRef(false)
  const clickT = useRef(0)
  const show = activePanel === 'search'

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState(null) // null = nothing typed yet
  const [results, setResults] = useState(null)
  const debounceRef = useRef(null)
  const reqRef = useRef(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (show) { const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 30); return () => clearTimeout(t) }
  }, [show])

  function handleInput(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    const c = clean(q)
    if (c.length < 2) {
      reqRef.current++
      setSuggestions(null)
      return
    }
    debounceRef.current = setTimeout(async () => {
      const id = ++reqRef.current
      const { data } = await supabase
        .from('products')
        .select('id,name,price,imgs')
        .or(`name.ilike.%${c}%,brand.ilike.%${c}%,cat.ilike.%${c}%`)
        .limit(5)
      if (id === reqRef.current) setSuggestions(data || [])
    }, 300)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    reqRef.current++
    setSuggestions(null)
    const c = clean(query)
    if (!c) {
      setResults(null)
      showToast('Enter a product name.')
      return
    }
    const { data } = await supabase
      .from('products')
      .select('id,name,brand,price,old,badge,imgs,stock')
      .or(`name.ilike.%${c}%,brand.ilike.%${c}%`)
      .order('created_at', { ascending: false })
      .limit(1000)
    setResults(data || [])
  }

  // A result was tapped: the search screen stays under the product while it fades in, then hides behind it (Home is never seen)
  function openProduct() {
    pending.current = true
    clickT.current = performance.now()
    document.documentElement.setAttribute('data-sprod', '1')
    setTimeout(() => {
      if (!pending.current) return
      pending.current = false
      document.documentElement.removeAttribute('data-sprod')
      handleClose()
    }, 8000)
  }

  useEffect(() => {
    if (!pending.current || !pathname || !pathname.startsWith('/product/')) return
    pending.current = false
    setTimeout(() => hidePanel(true, true), Math.max(0, 780 - (performance.now() - clickT.current)))
    setTimeout(() => document.documentElement.removeAttribute('data-sprod'), 1200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // search closed for real (not because a product opened): forget the old words and results
  useEffect(() => {
    if (show || pending.current) return
    if (window.location.pathname.startsWith('/product/')) return
    setQuery('')
    setSuggestions(null)
    setResults(null)
  }, [show])

  function handleClose() {
    closePanel()
    setQuery('')
    setSuggestions(null)
    setResults(null)
  }

  return (
    <div className={`searchLayer${show ? ' show' : ''}`}>
      <form className="slBar" onSubmit={handleSubmit}>
        <button type="button" className="slBack" aria-label="Back" onClick={handleClose}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div className="slField">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input ref={inputRef} type="search" enterKeyHint="search" placeholder="Search products" value={query} onChange={handleInput} />
        </div>
      </form>
      <div className="slBody">

      {suggestions !== null && (
        suggestions.length ? (
          <div>
            {suggestions.map(p => (
              <Link
                href={`/product/${p.id}`}
                key={p.id}
                data-preview={JSON.stringify({ id: p.id, name: p.name, price: p.price, old: null, img: p.imgs ? p.imgs.split(',')[0].trim() : '', all: p.imgs || '' })}
                data-hold="800"
                onClick={openProduct}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', borderBottom: '1px solid rgba(0,0,0,.08)', textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ width: 40, height: 50, background: 'var(--cream)', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                  {p.imgs && (
                    <img src={cldOpt(p.imgs.split(',')[0].trim(), 100)} alt={p.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}><Money n={p.price} /></div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--muted)', padding: '10px 4px' }}>No matches</div>
        )
      )}

      {results !== null && (
        <div style={{ marginTop: 20 }}>
          {results.length ? (
            <div className="products" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              {results.map(p => {
                const firstImg = p.imgs ? p.imgs.split(',')[0].trim() : ''
                const lowStock = p.stock !== null && p.stock !== undefined && p.stock > 0 && p.stock <= 5
                return (
                  <Link href={`/product/${p.id}`} className="product" key={p.id} data-preview={JSON.stringify({ id: p.id, name: p.name, price: p.price, old: p.old || null, img: firstImg, all: p.imgs || '' })} data-hold="800" onClick={openProduct}>
                    <div className="productImage">
                      {p.badge && (
                        <span className={`badge ${/sale/i.test(p.badge) ? 'sale' : ''}`}>{p.badge}</span>
                      )}
                      {firstImg ? (
                        <img src={cldOpt(firstImg, 400)} alt={p.name} loading="lazy" decoding="async" />
                      ) : (
                        <div className="placeholder">👕</div>
                      )}
                    </div>
                    <div className="brand">{p.brand || ''}</div>
                    <h3>{p.name}</h3>
                    <div className="price">
                      <Money n={p.price} />{' '}
                      {p.old && <span className="old"><Money n={p.old} /></span>}
                    </div>
                    {lowStock && (
                      <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>Only {p.stock} left</div>
                    )}
                    {p.stock !== null && p.stock !== undefined && Number(p.stock) <= 0 && (
                      <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>Sold out</div>
                    )}
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="empty">No products found for "{query.trim()}"</div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
