'use client'

import { useEffect, useRef, useState } from 'react'
import { useShop } from './ShopContext'
import { supabase } from '../lib/supabaseClient'
import { chatToken, getChatInfo, saveChatInfo } from '../lib/chat'
import { getSavedOrders } from '../lib/checkout'

const loc = lang => (lang === 'bn' ? 'bn-BD-u-nu-latn' : 'en-US')
const fmtTime = (iso, lang) => new Date(iso).toLocaleString(loc(lang), { month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })

export default function InboxPanel() {
  const { activePanel, closePanel, showToast, cartCount, openCart, openSearch, t, lang } = useShop()
  const show = activePanel === 'inbox'
  const [msgs, setMsgs] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [hasInfo, setHasInfo] = useState(false)
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  async function load() {
    const tok = chatToken(false)
    if (!tok) { setLoaded(true); return }
    const { data, error } = await supabase.rpc('chat_get', { p_token: tok })
    if (error) return
    setMsgs(data || [])
    setLoaded(true)
  }

  useEffect(() => {
    if (!show) return
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

  useEffect(() => {
    if (show && endRef.current && endRef.current.scrollIntoView) endRef.current.scrollIntoView({ block: 'end' })
  }, [msgs.length, show])

  async function send(e) {
    e.preventDefault()
    const body = text.trim()
    const nm = name.trim()
    if (!body || busy) return
    if (!nm) { showToast(t('Please enter your name')); return }
    setBusy(true)
    const tok = chatToken(true)
    const { error } = await supabase.rpc('chat_send', { p_token: tok, p_name: nm, p_phone: phone.trim(), p_body: body })
    setBusy(false)
    if (error) { showToast(error.message || t('Could not send. Please try again.')); return }
    saveChatInfo({ name: nm, phone: phone.trim() })
    setHasInfo(true)
    setText('')
    load()
  }

  return (
    <div className={'panel' + (show ? ' show' : '')}>
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
        <div className="chatList">
          {loaded && msgs.length === 0 && (
            <div className="chatIntro">{t('Send us a message about an order, a product or anything else. Our reply will show up right here.')}</div>
          )}
          {msgs.map(m => (
            <div key={m.id} className={'chatMsg ' + (m.sender === 'admin' ? 'them' : 'me')}>
              {m.sender === 'admin' && <div className="chatWho">HEAVEN</div>}
              <div className="chatBubble">{m.body}</div>
              <div className="chatTime">{fmtTime(m.created_at, lang)}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form className="chatBar" onSubmit={send}>
          {!hasInfo && (
            <div className="chatWho2">
              <input type="text" maxLength={100} placeholder={t('Your name')} value={name} onChange={e => setName(e.target.value)} />
              <input type="tel" maxLength={20} placeholder={t('Phone (optional)')} value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          )}
          <div className="chatRow">
            <textarea rows={1} maxLength={1000} placeholder={t('Type your message...')} value={text} onChange={e => setText(e.target.value)} />
            <button type="submit" className="chatSend" disabled={busy || !text.trim()} aria-label="Send">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
