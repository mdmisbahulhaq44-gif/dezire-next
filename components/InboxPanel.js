'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { useShop } from './ShopContext'
import { supabase } from '../lib/supabaseClient'
import { chatToken, getChatInfo, saveChatInfo } from '../lib/chat'
import { getSavedOrders } from '../lib/checkout'
import { hashToken, joinThread, customerHub, groupRows } from '../lib/chatLive'
import '../app/chat.css'

const loc = lang => (lang === 'bn' ? 'bn-BD-u-nu-latn' : 'en-US')
const GAP = 30 * 60 * 1000
const clock = (iso, lang) => new Date(iso).toLocaleTimeString(loc(lang), { hour: 'numeric', minute: '2-digit', hour12: true })
function sepLabel(iso, lang) {
  const d = new Date(iso)
  const now = new Date()
  const y = new Date(now)
  y.setDate(now.getDate() - 1)
  const bn = lang === 'bn'
  if (d.toDateString() === now.toDateString()) return (bn ? 'আজ ' : 'Today ') + clock(iso, lang)
  if (d.toDateString() === y.toDateString()) return (bn ? 'গতকাল ' : 'Yesterday ') + clock(iso, lang)
  return d.toLocaleDateString(loc(lang), { month: 'short', day: 'numeric' }) + ', ' + clock(iso, lang)
}
const QUICK = {
  bn: ['আমার অর্ডার কোথায়?', 'সাইজ নিয়ে সাহায্য চাই', 'রিটার্ন / এক্সচেঞ্জ', 'দাম ও ডিসকাউন্ট'],
  en: ['Where is my order?', 'I need help with size', 'Return / exchange', 'Price & discount'],
}
const same = (a, b) => a.length === b.length && (!a.length || a[a.length - 1].id === b[b.length - 1].id) && a.filter(x => x.read_at).length === b.filter(x => x.read_at).length

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
  const [adminTyping, setAdminTyping] = useState(false)
  const [adminOn, setAdminOn] = useState(false)
  const [online, setOnline] = useState(true)
  const [atBottom, setAtBottom] = useState(true)
  const [newCount, setNewCount] = useState(0)
  const [ready, setReady] = useState(false)
  const [openId, setOpenId] = useState(null)
  const panelRef = useRef(null)
  const listRef = useRef(null)
  const taRef = useRef(null)
  const stickRef = useRef(true)
  const firstRef = useRef(true)
  const liveRef = useRef(null)
  const hubRef = useRef(null)
  const typTimer = useRef(null)
  const idleTimer = useRef(null)
  const lastTypeSent = useRef(0)
  const ackRef = useRef(new Set())
  const showRef = useRef(false)
  showRef.current = show

  function toBottom(smooth) {
    const el = listRef.current
    if (!el) return
    if (smooth && el.scrollTo) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    else el.scrollTop = el.scrollHeight
  }

  async function load() {
    const tok = chatToken(false)
    if (!tok) { setLoaded(true); return }
    const { data, error } = await supabase.rpc('chat_sync', { p_token: tok })
    if (error) return
    const next = data || []
    let fresh = false
    next.forEach(m => { if (m.sender === 'admin' && !ackRef.current.has(m.id)) { ackRef.current.add(m.id); fresh = true } })
    if (fresh && liveRef.current) liveRef.current.send('ping', { read: true })
    setMsgs(prev => (same(prev, next) ? prev : next))
    setLoaded(true)
  }

  async function ensureLive() {
    if (liveRef.current) return
    const tok = chatToken(false)
    if (!tok) return
    liveRef.current = { send() {}, close() {} }
    const h = await hashToken(tok)
    if (!showRef.current) { liveRef.current = null; return }
    liveRef.current = joinThread(h, {
      ping: () => load(),
      typing: p => {
        if (p.who !== 'admin') return
        clearTimeout(typTimer.current)
        setAdminTyping(!!p.on)
        if (p.on) typTimer.current = setTimeout(() => setAdminTyping(false), 4000)
      },
    })
  }

  useEffect(() => {
    if (!show) { firstRef.current = true; stickRef.current = true; setReady(false); setNewCount(0); setAtBottom(true); return }
    const info = getChatInfo()
    if (info && info.name) { setName(info.name); setPhone(info.phone || ''); setHasInfo(true) }
    else {
      setHasInfo(false)
      const saved = getSavedOrders()
      if (saved.length) setPhone(saved[0].phone)
    }
    load()
    ensureLive()
    hubRef.current = customerHub(setAdminOn)
    const id = setInterval(() => { if (document.visibilityState === 'visible') load() }, 6000)
    return () => {
      clearInterval(id)
      if (liveRef.current) liveRef.current.close()
      liveRef.current = null
      if (hubRef.current) hubRef.current.close()
      hubRef.current = null
      setAdminTyping(false)
      setAdminOn(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  useEffect(() => {
    const on = () => { setOnline(true); load() }
    const off = () => setOnline(false)
    setOnline(navigator.onLine !== false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // panel always matches the VISIBLE area (keyboard / browser bars) so nothing jumps
  useEffect(() => {
    if (!show) return
    const vv = window.visualViewport
    const apply = () => {
      const el = panelRef.current
      if (!el) return
      el.style.setProperty('--vvh', (vv ? vv.height : window.innerHeight) + 'px')
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
      if (total || loaded) { toBottom(false); firstRef.current = false; setTimeout(() => setReady(true), 80) }
      return
    }
    const last = all[all.length - 1]
    if (stickRef.current || (last && last.sender !== 'admin')) toBottom(true)
    else if (last && last.sender === 'admin') setNewCount(c => c + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, show, loaded])

  useEffect(() => {
    if (adminTyping && stickRef.current) toBottom(true)
  }, [adminTyping])

  function onListScroll() {
    const el = listRef.current
    if (!el) return
    const nb = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    stickRef.current = nb
    setAtBottom(nb)
    if (nb) setNewCount(0)
  }

  function grow() {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  function onType(v) {
    setText(v)
    grow()
    const live = liveRef.current
    if (!live) return
    const now = Date.now()
    if (v.trim() && now - lastTypeSent.current > 2000) { lastTypeSent.current = now; live.send('typing', { who: 'customer', on: true }) }
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => { lastTypeSent.current = 0; live.send('typing', { who: 'customer', on: false }) }, 2500)
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
    await ensureLive()
    if (liveRef.current) liveRef.current.send('ping', {})
    if (hubRef.current) hubRef.current.notify()
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
    clearTimeout(idleTimer.current)
    lastTypeSent.current = 0
    if (liveRef.current) liveRef.current.send('typing', { who: 'customer', on: false })
    if (taRef.current) { taRef.current.style.height = 'auto'; taRef.current.focus() }
    try { if (navigator.vibrate) navigator.vibrate(8) } catch (err) {}
    stickRef.current = true
    deliver({ tempId: 't' + Date.now() + Math.random(), body, created_at: new Date().toISOString(), status: 'sending' }, nm)
  }

  function retry(p) {
    const nm = name.trim() || ((getChatInfo() || {}).name || '')
    if (nm) deliver(p, nm)
  }

  function jump() {
    stickRef.current = true
    setNewCount(0)
    toBottom(true)
  }

  const bn = lang === 'bn'
  const sub = adminTyping ? t('typing...') : adminOn ? t('Active now') : (bn ? 'আমরা যত দ্রুত সম্ভব উত্তর দিই' : 'We reply as soon as we can')
  const rows = groupRows(all, m => m.sender !== 'admin', GAP)
  const lastIdx = all.length - 1

  return (
    <div ref={panelRef} className={'panel chatPanel' + (show ? ' show' : '')}>
      <div className="panelHead acHead chatHead">
        <button type="button" className="acBackBtn" aria-label="Back" onClick={() => { const st = window.history.state || {}; if (st.dzDepth > 0) window.history.back(); else closePanel() }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div className={'chatAvatar' + (adminOn ? ' on' : '')}>H<i /></div>
        <div className="chatHeadTxt">
          <div className="chatHeadName">HEAVEN</div>
          <div className={'chatHeadSub' + (adminOn || adminTyping ? ' on' : '')}>{sub}</div>
        </div>
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

      {!online && <div className="chatOffline">{bn ? 'ইন্টারনেট সংযোগ নেই' : 'No internet connection'}</div>}

      <div className="chatBody">
        <div className="chatListWrap">
          <div className={'chatList grouped' + (ready ? ' ready' : '')} ref={listRef} onScroll={onListScroll}>
            {loaded && total === 0 && (
              <div className="chatIntro">
                {t('Send us a message about an order, a product or anything else. Our reply will show up right here.')}
                <div className="chatChips">
                  {QUICK[bn ? 'bn' : 'en'].map(q => (
                    <button key={q} type="button" onClick={() => { setText(q); if (taRef.current) taRef.current.focus(); setTimeout(grow, 0) }}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {rows.map((r, i) => {
              const m = r.m
              let stat = null
              if (m.temp) stat = m.status === 'failed' ? 'failed' : 'sending'
              else if (r.mine && i === lastIdx) stat = m.read_at ? 'seen' : 'delivered'
              return (
                <Fragment key={m.id}>
                  {r.sep && <div className="chatSep">{sepLabel(m.created_at, lang)}</div>}
                  <div className={'chatMsg ' + (r.mine ? 'me' : 'them') + (r.jp ? ' jp' : '') + (r.jn ? ' jn' : '') + (m.temp ? ' pend' : '')}>
                    {!r.mine && !r.jp && <div className="chatWho">HEAVEN</div>}
                    <div className="chatBubble" onClick={() => setOpenId(id => (id === m.id ? null : m.id))}>{m.body}</div>
                    {openId === m.id && !m.temp && <div className="chatStat">{clock(m.created_at, lang)}</div>}
                    {stat === 'sending' && <div className="chatStat">{t('Sending...')}</div>}
                    {stat === 'failed' && <div className="chatStat failed" onClick={() => retry(m.temp)}>{t('Not sent. Tap to retry')}</div>}
                    {stat === 'delivered' && <div className="chatStat">{t('Delivered')}</div>}
                    {stat === 'seen' && <div className="chatStat seen">{t('Seen')}</div>}
                  </div>
                </Fragment>
              )
            })}
            {adminTyping && (
              <div className="chatMsg them typing"><div className="chatBubble"><i /><i /><i /></div></div>
            )}
          </div>
          {(!atBottom || newCount > 0) && (
            <button type="button" className="chatJump" aria-label="Latest" onClick={jump}>
              {newCount > 0 && <span>{newCount} {bn ? 'নতুন' : 'new'}</span>}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          )}
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
              onChange={e => onType(e.target.value)}
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
