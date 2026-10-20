'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useShop } from '../ShopContext'
import { adminHub, joinThread, groupRows } from '../../lib/chatLive'
import '../../app/chat.css'

const dt = d => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const clock = d => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const GAP = 30 * 60 * 1000
const btn = { fontSize: 12, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer' }

export default function AdminInbox() {
  const { showToast } = useShop()
  const [threads, setThreads] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [openHash, setOpenHash] = useState('')
  const [msgs, setMsgs] = useState([])
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [typing, setTyping] = useState(false)
  const listRef = useRef(null)
  const stickRef = useRef(true)
  const liveRef = useRef(null)
  const openRef = useRef(null)
  const typTimer = useRef(null)
  const idleTimer = useRef(null)
  const lastSent = useRef(0)
  openRef.current = openId

  async function loadThreads() {
    const { data } = await supabase.from('chat_threads').select('*').order('last_message_at', { ascending: false }).limit(200)
    setThreads(data || [])
  }

  async function loadMsgs(id) {
    const { data } = await supabase.from('chat_messages').select('*').eq('thread_id', id).order('id', { ascending: true }).limit(500)
    if (openRef.current !== id) return
    const list = data || []
    setMsgs(list)
    if (list.some(m => m.sender === 'customer' && !m.read_at)) {
      await supabase.from('chat_messages').update({ read_at: new Date().toISOString() }).eq('thread_id', id).eq('sender', 'customer').is('read_at', null)
      if (liveRef.current) liveRef.current.send('ping', { read: true })
    }
    await supabase.from('chat_threads').update({ unread_admin: 0 }).eq('id', id).gt('unread_admin', 0)
  }

  useEffect(() => {
    loadThreads()
    const i = setInterval(loadThreads, 15000)
    const stop = adminHub(() => { loadThreads(); if (openRef.current) loadMsgs(openRef.current) })
    return () => { clearInterval(i); stop() }
  }, [])

  useEffect(() => {
    if (!openId) return
    setMsgs([])
    setTyping(false)
    stickRef.current = true
    liveRef.current = joinThread(openHash, {
      ping: () => loadMsgs(openId),
      typing: p => {
        if (p.who !== 'customer') return
        clearTimeout(typTimer.current)
        setTyping(!!p.on)
        if (p.on) typTimer.current = setTimeout(() => setTyping(false), 4000)
      },
    })
    loadMsgs(openId).then(loadThreads)
    const i = setInterval(() => loadMsgs(openId), 6000)
    return () => {
      clearInterval(i)
      if (liveRef.current) liveRef.current.close()
      liveRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, openHash])

  useEffect(() => {
    const el = listRef.current
    if (el && stickRef.current) el.scrollTop = el.scrollHeight
  }, [msgs.length, openId, typing])

  function onScroll() {
    const el = listRef.current
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  function onType(v) {
    setReply(v)
    const live = liveRef.current
    if (!live) return
    const now = Date.now()
    if (v.trim() && now - lastSent.current > 2000) { lastSent.current = now; live.send('typing', { who: 'admin', on: true }) }
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => { lastSent.current = 0; live.send('typing', { who: 'admin', on: false }) }, 2500)
  }

  async function send(e) {
    if (e) e.preventDefault()
    const body = reply.trim()
    if (!body || busy || !openId) return
    setBusy(true)
    const { error } = await supabase.from('chat_messages').insert({ thread_id: openId, sender: 'admin', body })
    setBusy(false)
    if (error) { showToast('Could not send: ' + (error.message || 'Unknown error')); return }
    setReply('')
    clearTimeout(idleTimer.current)
    lastSent.current = 0
    stickRef.current = true
    if (liveRef.current) { liveRef.current.send('typing', { who: 'admin', on: false }); liveRef.current.send('ping', {}) }
    loadMsgs(openId)
    loadThreads()
  }

  const th = (threads || []).find(x => x.id === openId)

  if (openId && th) {
    const wa = th.phone ? 'https://wa.me/88' + th.phone.replace(/\D/g, '').replace(/^88/, '') : ''
    const rows = groupRows(msgs, m => m.sender === 'admin', GAP)
    return (
      <div className="adminTable">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <button type="button" style={btn} onClick={() => { setOpenId(null); loadThreads() }}>← All chats</button>
          <div>
            <b>{th.customer_name || 'Customer'}</b>
            {th.phone ? <span style={{ fontSize: 12, color: 'var(--muted)' }}> · <a href={'tel:' + th.phone}>{th.phone}</a> · <a href={wa} target="_blank" rel="noreferrer">WhatsApp</a></span> : null}
          </div>
        </div>
        <div className="chatList adminChatList grouped ready" ref={listRef} onScroll={onScroll}>
          {rows.map((r, i) => (
            <Fragment key={r.m.id}>
              {r.sep && <div className="chatSep">{dt(r.m.created_at)}</div>}
              <div className={'chatMsg ' + (r.mine ? 'me' : 'them') + (r.jp ? ' jp' : '') + (r.jn ? ' jn' : '')}>
                <div className="chatBubble">{r.m.body}</div>
                {!r.jn && !(r.mine && i === rows.length - 1) && <div className="chatStat">{clock(r.m.created_at)}</div>}
                {r.mine && i === rows.length - 1 && <div className={'chatStat' + (r.m.read_at ? ' seen' : '')}>{r.m.read_at ? 'Seen ' + clock(r.m.read_at) : 'Delivered'}</div>}
              </div>
            </Fragment>
          ))}
          {typing && <div className="chatMsg them typing"><div className="chatBubble"><i /><i /><i /></div></div>}
        </div>
        <form className="chatRow" onSubmit={send} style={{ marginTop: 12 }}>
          <textarea
            rows={2}
            maxLength={1000}
            placeholder="Write a reply..."
            value={reply}
            onChange={e => onType(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && window.matchMedia && window.matchMedia('(pointer:fine)').matches) send(e) }}
          />
          <button type="submit" className="chatSend" disabled={busy || !reply.trim()} aria-label="Send">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></svg>
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="adminTable">
      <h2 style={{ marginBottom: 6 }}>Customer messages</h2>
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 14px' }}>New messages appear here instantly. While this page is open, customers see you as "Active now". Open a chat to read and reply.</p>
      <div style={{ display: 'grid', gap: 10 }}>
        {threads === null && <div>Loading...</div>}
        {threads !== null && threads.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>No messages yet.</div>}
        {(threads || []).map(x => (
          <button key={x.id} type="button" onClick={() => { setOpenHash(x.token_hash); setOpenId(x.id) }} style={{ ...btn, textAlign: 'left', padding: 14, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, fontWeight: x.unread_admin > 0 ? 700 : 400 }}>
            <span>
              {x.customer_name || 'Customer'}{x.phone ? ' · ' + x.phone : ''}
              <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginTop: 3 }}>{dt(x.last_message_at)} · last: {x.last_sender === 'admin' ? 'you' : 'customer'}</span>
            </span>
            {x.unread_admin > 0 && <span className="adminDot">{x.unread_admin}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
