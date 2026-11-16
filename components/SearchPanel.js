'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useShop } from './ShopContext'
import { supabase } from '../lib/supabaseClient'
import { cldOpt } from '../lib/cloudinary'
import Money from './Money'

function clean(q) {
  return q.replace(/[,()*%_\\]/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function SearchPanel() {
  const { activePanel, closePanel, hidePanel, showToast, t } = useShop()
  const pathname = usePathname()
  const router = useRouter()
  const pending = useRef(false)
  const failTimer = useRef(null)
  const show = activePanel === 'search'

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState(null)
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

  // opened fresh: keyboard up. Coming back: the words are still there, no keyboard, the suggestions return.
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

  // the next page is on its way: header + grey page show at once, like the reference
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
  function arrived() {
    if (!pending.current) return
    pending.current = false
    clearTimeout(failTimer.current)
    hidePanel(true, true)
    setTimeout(() => document.documentElement.removeAttribute('data-sprod'), 400)
  }

  // Enter: the results page opens (one column of products, like the reference)
  function handleSubmit(e) {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    reqRef.current++
    setSuggestions(null)
    const c = clean(query)
    if (!c) { showToast(t('Enter a product name.')); return }
    if (inputRef.current) inputRef.current.blur()
    begin()
    window.__dzEnter = null
    router.push('/search?q=' + encodeURIComponent(c))
  }

  // a suggestion was tapped: no fade, the product page replaces the search screen at once
  function openProduct() {
    window.__dzEnter = null
    begin()
  }

  useEffect(() => {
    if (!pathname || !(pathname.startsWith('/product/') || pathname.startsWith('/search'))) return
    arrived()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // the results page tells us it is on screen (also when searching again while already on it)
  useEffect(() => {
    window.addEventListener('dz-search-ready', arrived)
    return () => window.removeEventListener('dz-search-ready', arrived)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidePanel])

  // search closed for real (not because a page opened): forget the old words
  useEffect(() => {
    if (show || pending.current) return
    const p = window.location.pathname
    if (p.startsWith('/product/') || p.startsWith('/search')) return
    setQuery('')
    setSuggestions(null)
  }, [show])

  function handleClose() {
    closePanel()
    setQuery('')
    setSuggestions(null)
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
