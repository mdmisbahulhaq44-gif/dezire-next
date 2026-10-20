'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useShop } from '../ShopContext'

const dt = d => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const btn = { fontSize: 12, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer' }

export default function AdminInbox() {
  const { showToast } = useShop()
  const [threads, setThreads] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  async function loadThreads() {
    const { data } = await supabase.from('chat_threads').select('*').order('last_message_at', { ascending: false }).limit(200)
    setThreads(data || [])
  }

  async function loadMsgs(id) {
    const { data } = await supabase.from('chat_messages').select('*').eq('thread_id', id).order('id', { ascending: true }).limit(500)
    setMsgs(data || [])
    await supabase.from('chat_threads').update({ unread_admin: 0 }).eq('id', id).gt('unread_admin', 0)
  }

  useEffect(() => {
    loadThreads()
    const i = setInterval(loadThreads, 8000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    if (!openId) return
    setMsgs([])
    loadMsgs(openId).then(loadThreads)
    const i = setInterval(() => loadMsgs(openId), 4000)
    return () => clearInterval(i)
  }, [openId])

  useEffect(() => {
    if (endRef.current && endRef.current.scrollIntoView) endRef.current.scrollIntoView({ block: 'end' })
  }, [msgs.length, openId])

  async function send(e) {
    e.preventDefault()
    const body = reply.trim()
    if (!body || busy || !openId) return
    setBusy(true)
    const { error } = await supabase.from('chat_messages').insert({ thread_id: openId, sender: 'admin', body })
    setBusy(false)
    if (error) { showToast('Could not send: ' + (error.message || 'Unknown error')); return }
    setReply('')
    loadMsgs(openId)
    loadThreads()
  }

  const th = (threads || []).find(x => x.id === openId)

  if (openId && th) {
    const wa = th.phone ? 'https://wa.me/88' + th.phone.replace(/\D/g, '').replace(/^88/, '') : ''
    return (
      <div className="adminTable">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <button type="button" style={btn} onClick={() => { setOpenId(null); loadThreads() }}>← All chats</button>
          <div>
            <b>{th.customer_name || 'Customer'}</b>
            {th.phone ? <span style={{ fontSize: 12, color: 'var(--muted)' }}> · <a href={'tel:' + th.phone}>{th.phone}</a> · <a href={wa} target="_blank" rel="noreferrer">WhatsApp</a></span> : null}
          </div>
        </div>
        <div className="chatList adminChatList">
          {msgs.map(m => (
            <div key={m.id} className={'chatMsg ' + (m.sender === 'admin' ? 'me' : 'them')}>
              <div className="chatBubble">{m.body}</div>
              <div className="chatTime">{dt(m.created_at)}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form className="chatRow" onSubmit={send} style={{ marginTop: 12 }}>
          <textarea rows={2} maxLength={1000} placeholder="Write a reply..." value={reply} onChange={e => setReply(e.target.value)} />
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
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 14px' }}>New messages appear here by themselves. Open a chat to read and reply. Customers see your reply in their Inbox.</p>
      <div style={{ display: 'grid', gap: 10 }}>
        {threads === null && <div>Loading...</div>}
        {threads !== null && threads.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>No messages yet.</div>}
        {(threads || []).map(x => (
          <button key={x.id} type="button" onClick={() => setOpenId(x.id)} style={{ ...btn, textAlign: 'left', padding: 14, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, fontWeight: x.unread_admin > 0 ? 700 : 400 }}>
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
