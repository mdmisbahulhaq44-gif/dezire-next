// Anonymous chat identity for this device: a random secret kept in localStorage.
// Only its SHA-256 hash is stored in the database, so nobody else can read this chat.
const TOKEN_KEY = 'dz_chat_token'
const INFO_KEY = 'dz_chat_info'
let memToken = ''

export function chatToken(create) {
  let t = ''
  try { t = localStorage.getItem(TOKEN_KEY) || '' } catch (e) {}
  if (!t) t = memToken
  if (!t && create) {
    const a = new Uint8Array(24)
    try { crypto.getRandomValues(a) } catch (e) { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256) }
    t = Array.from(a, b => ('0' + b.toString(16)).slice(-2)).join('')
    memToken = t
    try { localStorage.setItem(TOKEN_KEY, t) } catch (e) {}
  }
  return t
}

export function getChatInfo() {
  try {
    const v = JSON.parse(localStorage.getItem(INFO_KEY))
    return v && typeof v === 'object' ? v : null
  } catch (e) { return null }
}

export function saveChatInfo(info) {
  try { localStorage.setItem(INFO_KEY, JSON.stringify(info)) } catch (e) {}
}
