const KEY = 'dz_recent'

export function getRecent() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(a) ? a.filter(n => Number.isFinite(n)) : []
  } catch (e) {
    return []
  }
}

export function addRecent(id) {
  try {
    const n = Number(id)
    if (!Number.isFinite(n)) return
    const a = getRecent().filter(x => x !== n)
    a.unshift(n)
    localStorage.setItem(KEY, JSON.stringify(a.slice(0, 8)))
  } catch (e) {}
}
