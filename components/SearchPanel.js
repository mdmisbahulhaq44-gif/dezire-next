'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useShop } from './ShopContext'
import { supabase } from '../lib/supabaseClient'
import { cldOpt } from '../lib/cloudinary'
import Money from './Money'

// Characters that break PostgREST's .or() filter syntax or act as LIKE
// wildcards are turned into spaces.
function clean(q) {
  return q.replace(/[,()*%_\\]/g, ' ').replace(/\s+/g, ' ').trim()
}

// the best match for what was typed: the whole phrase in the name first, then a name holding every word, then the newest one
function bestMatch(list, c) {
  const q = c.toLowerCase()
  const words = q.split(' ').filter(Boolean)
  const score = p => {
    const n = String(p.name || '').toLowerCase()
    if (n === q) return 4
    if (n.startsWith(q)) return 3
    if (n.includes(q)) return 2
    return words.every(w => n.includes(w)) ? 1 : 0
  }
  return list.reduce((b, p) => (score(p) > score(b) ? p : b), list[0])
}

export default function SearchPanel() {
  const { activePanel, closePanel, hidePanel, showToast, t } = useShop()
  const pathname = usePathname()
  const router = useRouter()
  const pending = useRef(false)
  const failTimer = useRef(null)
  const show = activePanel === 'search'

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState(null) // null = nothing typed yet
  const [results, setResults] = useState(null)
  const debounceRef = useRef(null)
  const reqRef = useRef(0)
  const inputRef = useRef(null)

  function runSuggest(c) {
    const id = ++reqRef.current
    supabase
      .from('products')
      .select('id,name,price,imgs')
      .or(`name.ilike.%${c}%,brand.ilike.%${c}%,cat.ilike.%${c}%`)
      .limit(5)
      .then(({ data }) => { if (id === reqRef.current) setSuggestions(data || []) }, () => {})
  }

  // opened fresh: keyboard up. Coming back from a product: the words are still there, no keyboard, the suggestions return.
  useEffect(() => {
    if (!show) return
    const tm = setTimeout(() => {
      const el = inputRef.current
      if (!el) return
      if (el.value) { const c = clean(el.value); if (c.length >= 2) runSuggest(c) }
      else el.focus()
    }, 30)
    return () => clearTimeout(tm)
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
    debounceRef.current = setTimeout(() => runSuggest(c), 300)
  }

  // a product is on its way: the header + grey page show at once (like the reference) until the product page arrives
  function begin() {
    pending.current = true
    document.documentElement.setAttribute('data-sprod', '1')
    clearTimeout(failTimer.current)
    failTimer.current = setTimeout(() => { if (pending.current) cancel() }, 10000)
  }
  function cancel() {
    pending.current = false
    clearTimeout(failTimer.current)
    document.documentElement.removeAttribute('data-sprod')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    reqRef.current++
    setSuggestions(null)
    const c = clean(query)
    if (!c) {
      setResults(null)
      showToast(t('Enter a product name.'))
      return
    }
    if (inputRef.current) inputRef.current.blur()
    begin()
    const words = c.toLowerCase().split(' ')
    const key = words.reduce((a, b) => (b.length > a.length ? b : a), words[0])
    const { data, error } = await supabase
      .from('products')
      .select('id,name,brand,cat')
      .or(`name.ilike.%${key}%,brand.ilike.%${key}%,cat.ilike.%${key}%`)
      .order('created_at', { ascending: false })
      .limit(1000)
    if (error) { cancel(); showToast(t('Something went wrong. Please try again.')); return }
    const list = (data || []).filter(p => {
      const hay = [p.name, p.brand, p.cat].join(' ').toLowerCase()
      return words.every(w => hay.includes(w))
    })
    if (!list.length) { cancel(); setResults([]); return }
    const hit = bestMatch(list, c)
    if (pathname === '/product/' + hit.id) { cancel(); handleClose(); return }
    window.__dzEnter = null
    router.push('/product/' + hit.id)
  }

  // a result was tapped: no fade, the product page replaces the search screen at once
  function openProduct() {
    window.__dzEnter = null
    begin()
  }

  useEffect(() => {
    if (!pending.current || !pathname || !pathname.startsWith('/product/')) return
    pending.current = false
    clearTimeout(failTimer.current)
    hidePanel(true, true)
    setTimeout(() => document.documentElement.removeAttribute('data-sprod'), 400)
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
          <input ref={inputRef} type="search" enterKeyHint="search" placeholder={t('Search products')} value={query} onChange={handleInput} />
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
          <div style={{ fontSize: 12, color: 'var(--muted)', padding: '10px 4px' }}>{t('No matches')}</div>
        )
      )}

      {results !== null && (
        <div style={{ marginTop: 20 }}>
          <div className="empty">{t('No products found for "{q}"', { q: query.trim() })}</div>
        </div>
      )}
      </div>

      <div className="slHold" aria-hidden="true">
        <div className="slHoldBar">
          <div className="logo">HEAVEN</div>
          <div className="pdTopRight">
            <span className="pdTopIc"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.2" r="4.7" /><path d="M3.2 21.2c0-4.7 3.8-7.7 8.8-7.7s8.8 3 8.8 7.7c0 .5-.4.8-.8.8H4c-.4 0-.8-.3-.8-.8z" /></svg></span>
            <span className="pdTopIc pdTopSearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"><circle cx="10" cy="10" r="7" strokeWidth="2.7" /><path d="M15.2 15.2L21.2 21.2" strokeWidth="3" /></svg></span>
            <span className="pdTopMenu"><span /><span /><span /></span>
          </div>
        </div>
      </div>
    </div>
  )
}
