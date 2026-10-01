'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useShop } from './ShopContext'
import { supabase } from '../lib/supabaseClient'
import { cldOpt } from '../lib/cloudinary'

// Characters that break PostgREST's .or() filter syntax or act as LIKE
// wildcards are turned into spaces. (The original site filtered in the
// browser, so it never had this problem.)
function clean(q) {
  return q.replace(/[,()*%_\\]/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function SearchPanel() {
  const { activePanel, closePanel, showToast } = useShop()
  const show = activePanel === 'search'

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState(null) // null = nothing typed yet
  const [results, setResults] = useState(null)
  const debounceRef = useRef(null)
  const reqRef = useRef(0)

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

  function handleClose() {
    closePanel()
    setQuery('')
    setSuggestions(null)
    setResults(null)
  }

  return (
    <div className={`panel${show ? ' show' : ''}`}>
      <div className="panelHead">
        <h2>Search</h2>
        <button className="close" onClick={handleClose}>×</button>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <input placeholder="Search products..." value={query} onChange={handleInput} />
        <button className="btn">SEARCH</button>
      </form>

      {suggestions !== null && (
        suggestions.length ? (
          <div>
            {suggestions.map(p => (
              <Link
                href={`/product/${p.id}`}
                key={p.id}
                onClick={handleClose}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', borderBottom: '1px solid rgba(0,0,0,.08)', textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ width: 40, height: 50, background: 'var(--cream)', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                  {p.imgs && (
                    <img src={cldOpt(p.imgs.split(',')[0].trim(), 100)} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>৳{Number(p.price).toLocaleString()}</div>
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
                  <Link href={`/product/${p.id}`} className="product" key={p.id} onClick={handleClose}>
                    <div className="productImage">
                      {p.badge && (
                        <span className={`badge ${p.badge.toLowerCase() === 'sale' ? 'sale' : ''}`}>{p.badge}</span>
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
                      ৳{Number(p.price).toLocaleString()}{' '}
                      {p.old && <span className="old">৳{Number(p.old).toLocaleString()}</span>}
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
  )
}
