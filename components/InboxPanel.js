'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { useShop } from './ShopContext'
import { supabase } from '../lib/supabaseClient'
import { chatToken, getChatInfo, saveChatInfo } from '../lib/chat'
import { getSavedOrders } from '../lib/checkout'
import '../app/chat.css'

const loc = lang => (lang === 'bn' ? 'bn-BD-u-nu-latn' : 'en-US')
const fmtSep = (iso, lang) => new Date(iso).toLocaleString(loc(lang), { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
const GAP = 30 * 60 * 1000

export default function InboxPanel() {
  const { activePanel, closePanel, showToast, cartCount, openCart, openSearch, t, lang } = useShop()
  const show = activePanel === 'inbox'
  const [msgs, setMsgs] = useState([])
  const [pending, setPending] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [hasInfo, setHasInfo] = useState(false)
  const panelRef = useRef(null)
  const listRef = useRef(null)
  const taRef = useRef(null)
  const stickRef = useRef(true)
  const firstRef = useRef(true)

  function toBottom(smooth) {
    const el = listRef.current
    if (!el) return
    if (smooth && el.scrollTo) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    else el.scrollTop = el.scrollHeight
  }

  async function load() {
    const tok = chatToken(false)
    if (!tok) { setLoaded(true); return }
    const { data, error } = await supabase.rpc('chat_get', { p_token: tok })
    if (error) return
    const next = data || []
    setMsgs(prev => (prev.length === next.length && (!next.length || prev[prev.length - 1].id === next[next.length - 1].id)) ? prev : next)
    setLoaded(true)
  }

  useEffect(() => {
    if (!show) { firstRef.current = true; stickRef.current = true; return }
    const info = getChatInfo()
    if (info && info.name) { setName(info.name); setPhone(info.phone || ''); setHasInfo(true) }
    else {
      setHasInfo(false)
      const saved = getSavedOrders()
      if (saved.length) setPhone(saved[0].phone)
    }
    load()
    const id = setInterval(() => { if (document.visibilityState === 'visible') load() }, 4000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  // panel always matches the VISIBLE area (keyboard / browser bars) so nothing jumps
  useEffect(() => {
    if (!show) return
    const vv = window.visualViewport
    const apply = () => {
      const el = panelRef.current
      if (!el) return
      el.style.setProperty('--vvh', (vv ? vv.height : window.innerHeight) + 'px')
      el.style.setProperty('--vvt', (vv ? vv.offsetTop : 0) + 'px')
      if (stickRef.current) toBottom(false)
    }
    apply()
    if (vv) { vv.addEventListener('resize', apply); vv.addEventListener('scroll', apply) }
    window.addEventListener('resize', apply)
    return () => {
      if (vv) { vv.removeEventListener('resize', apply); vv.removeEventListener('scroll', apply) }
      window.removeEventListener('resize', apply)
    }
  }, [show])

  const all = [...msgs, ...pending.map(p => ({ id: p.tempId, sender: 'user', body: p.body, created_at: p.created_at, status: p.status, temp: p }))]
  const total = all.length

  useEffect(() => {
    if (!show) return
    if (firstRef.current) {
      if (total || loaded) { toBottom(false); firstRef.current = false }
      return
    }
    const last = all[all.length - 1]
    if (stickRef.current || (last && last.sender !== 'admin')) toBottom(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, show, loaded])

  function onListScroll() {
    const el = listRef.current
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  function grow() {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  async function deliver(p, nm) {
    setPending(l => (l.some(x => x.tempId === p.tempId) ? l.map(x => (x.tempId === p.tempId ? { ...x, status: 'sending' } : x)) : [...l, p]))
    const tok = chatToken(true)
    const { error } = await supabase.rpc('chat_send', { p_token: tok, p_name: nm, p_phone: phone.trim(), p_body: p.body })
    if (error) {
      setPending(l => l.map(x => (x.tempId === p.tempId ? { ...x, status: 'failed' } : x)))
      showToast(error.message || t('Could not send. Please try again.'))
      return
    }
    saveChatInfo({ name: nm, phone: phone.trim() })
    setHasInfo(true)
    await load()
    setPending(l => l.filter(x => x.tempId !== p.tempId))
  }

  function send(e) {
    if (e) e.preventDefault()
    const body = text.trim()
    const nm = name.trim()
    if (!body) return
    if (!nm) { showToast(t('Please enter your name')); return }
    setText('')
    if (taRef.current) { taRef.current.style.height = 'auto'; taRef.current.focus() }
    stickRef.current = true
    deliver({ tempId: 't' + Date.now() + Math.random(), body, created_at: new Date().toISOString(), status: 'sending' }, nm)
  }

  function retry(p) {
    const nm = name.trim() || ((getChatInfo() || {}).name || '')
    if (nm) deliver(p, nm)
  }

  const lastIdx = all.length - 1
  const rows = all.map((m, i) => {
    const prev = all[i - 1]
    const next = all[i + 1]
    const tm = new Date(m.created_at).getTime()
    const sep = !prev || tm - new Date(prev.created_at).getTime() > GAP
    const jp = !sep && prev && prev.sender === m.sender
    const jn = !!next && next.sender === m.sender && new Date(next.created_at).getTime() - tm <= GAP
    const mine = m.sender !== 'admin'
    let stat = null
    if (m.temp) stat = m.status === 'failed' ? 'failed' : 'sending'
    else if (mine && i === lastIdx) stat = 'sent'
    return { m, sep, jp, jn, mine, stat }
  })

  return (
    <div ref={panelRef} className={'panel chatPanel' + (show ? ' show' : '')}>
      <div className="panelHead acHead">
        <button type="button" className="acBackBtn" aria-label="Back" onClick={() => { const st = window.history.state || {}; if (st.dzDepth > 0) window.history.back(); else closePanel() }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <h2 className="acTitle">{t('Inbox')}</h2>
        <div className="acHeadIcons">
          <button type="button" className="acHeadBtn" aria-label="Search" onClick={() => { closePanel(); openSearch() }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          </button>
          <button type="button" className="acHeadBtn" aria-label="Cart" onClick={() => openCart()}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11h10.2L20 8H6.2" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" /></svg>
            {cartCount > 0 && <span className="acBadge">{cartCount}</span>}
          </button>
        </div>
      </div>

      <div className="chatBody">
        <div className="chatList" ref={listRef} onScroll={onListScroll}>
          {loaded && total === 0 && (
            <div className="chatIntro">{t('Send us a message about an order, a product or anything else. Our reply will show up right here.')}</div>
          )}
          {rows.map(r => (
            <Fragment key={r.m.id}>
              {r.sep && <div className="chatSep">{fmtSep(r.m.created_at, lang)}</div>}
              <div className={'chatMsg ' + (r.mine ? 'me' : 'them') + (r.jp ? ' jp' : '') + (r.jn ? ' jn' : '')}>
                {!r.mine && !r.jp && <div className="chatWho">HEAVEN</div>}
                <div className="chatBubble">{r.m.body}</div>
                {r.stat === 'sending' && <div className="chatStat">{t('Sending...')}</div>}
                {r.stat === 'failed' && <div className="chatStat failed" onClick={() => retry(r.m.temp)}>{t('Not sent. Tap to retry')}</div>}
                {r.stat === 'sent' && <div className="chatStat">{t('Sent')}</div>}
              </div>
            </Fragment>
          ))}
        </div>

        <form className="chatBar" onSubmit={send}>
          {!hasInfo && (
            <div className="chatWho2">
              <input type="text" maxLength={100} placeholder={t('Your name')} value={name} onChange={e => setName(e.target.value)} />
              <input type="tel" maxLength={20} placeholder={t('Phone (optional)')} value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          )}
          <div className="chatRow">
            <textarea
              ref={taRef}
              rows={1}
              maxLength={1000}
              placeholder={t('Type your message...')}
              value={text}
              onChange={e => { setText(e.target.value); grow() }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && window.matchMedia && window.matchMedia('(pointer:fine)').matches) send(e) }}
              onFocus={() => setTimeout(() => toBottom(false), 300)}
            />
            <button type="submit" className="chatSend" disabled={!text.trim()} aria-label="Send">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
