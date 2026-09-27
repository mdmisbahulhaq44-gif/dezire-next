'use client'

import { useState, useRef } from 'react'
import { useShop } from './ShopContext'
import { supabase } from '../lib/supabaseClient'
import { cldOpt } from '../lib/cloudinary'
import Link from 'next/link'

export default function SearchPanel() {
  const { activePanel, closePanel } = useShop()
  const show = activePanel === 'search'

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [results, setResults] = useState(null)
  const debounceRef = useRef(null)

  function handleInput(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    if (q.trim().length < 2) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id,name,price,imgs')
        .or(`name.ilike.%${q.trim()}%,brand.ilike.%${q.trim()}%`)
        .limit(5)
      setSuggestions(data || [])
    }, 300)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSuggestions([])
    const q = query.trim()
    if (!q) return
    const { data } = await supabase
      .from('products')
      .select('id,name,price,old,badge,imgs,stock')
      .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
      .limit(40)
    setResults(data || [])
  }

  function handleClose() {
    closePanel()
    setQuery('')
    setSuggestions([])
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

      {suggestions.length > 0 && (
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
      )}

      {results !== null && (
        <div style={{ marginTop: 20 }}>
          {results.length ? (
            <div className="products" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              {results.map(p => {
                const firstImg = p.imgs ? p.imgs.split(',')[0].trim() : ''
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
                    <h3>{p.name}</h3>
                    <div className="price">
                      ৳{Number(p.price).toLocaleString()}{' '}
                      {p.old && <span className="old">৳{Number(p.old).toLocaleString()}</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="empty">No products found for "{query}"</div>
          )}
        </div>
      )}
    </div>
  )
}
