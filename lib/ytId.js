// Takes a YouTube link in any form (or just the 11-letter id) and returns the id, or '' if it is not valid
export function ytId(input) {
  const s = String(input || '').trim()
  if (!s) return ''
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  let m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/)
  if (m) return m[1]
  m = s.match(/(?:youtu\.be\/|\/embed\/|\/shorts\/|\/live\/|\/v\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : ''
}
