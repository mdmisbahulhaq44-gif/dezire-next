import { supabase } from './supabaseClient'

export async function hashToken(tok) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tok))
    return Array.from(new Uint8Array(buf), b => ('0' + b.toString(16)).slice(-2)).join('')
  } catch (e) { return '' }
}

// live channel of ONE conversation (typing + "new message" pings)
export function joinThread(hash, handlers) {
  if (!hash) return { send() {}, close() {} }
  const ch = supabase.channel('chat:' + hash)
  ch.on('broadcast', { event: 'ping' }, p => handlers.ping && handlers.ping((p && p.payload) || {}))
  ch.on('broadcast', { event: 'typing' }, p => handlers.typing && handlers.typing((p && p.payload) || {}))
  let ready = false
  ch.subscribe(s => { ready = s === 'SUBSCRIBED' })
  return {
    send(event, payload) { if (ready) ch.send({ type: 'broadcast', event, payload }) },
    close() { supabase.removeChannel(ch) },
  }
}

// customer side: sees if admin is online, can tell admin "new message"
export function customerHub(cb) {
  const ch = supabase.channel('dz-chat-admin')
  let ready = false
  ch.on('presence', { event: 'sync' }, () => cb(Object.keys(ch.presenceState()).length > 0))
  ch.subscribe(s => { ready = s === 'SUBSCRIBED' })
  return {
    notify() { if (ready) ch.send({ type: 'broadcast', event: 'new', payload: {} }) },
    close() { supabase.removeChannel(ch) },
  }
}

// admin side: shows as online, hears "new message" from any customer
export function adminHub(onNew) {
  const ch = supabase.channel('dz-chat-admin')
  ch.on('broadcast', { event: 'new' }, () => onNew())
  ch.subscribe(async s => { if (s === 'SUBSCRIBED') await ch.track({ admin: true }) })
  return () => supabase.removeChannel(ch)
}

export function groupRows(list, mineOf, gap) {
  return list.map((m, i) => {
    const prev = list[i - 1]
    const next = list[i + 1]
    const tm = new Date(m.created_at).getTime()
    const sep = !prev || tm - new Date(prev.created_at).getTime() > gap
    const jp = !sep && !!prev && mineOf(prev) === mineOf(m)
    const jn = !!next && mineOf(next) === mineOf(m) && new Date(next.created_at).getTime() - tm <= gap
    return { m, sep, jp, jn, mine: mineOf(m) }
  })
}
