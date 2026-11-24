// From an article link, work out the website name (host) and an icon automatically
export function siteInfo(url, name, logo) {
  let host = ''
  try {
    const u = new URL(String(url || '').trim())
    if (/^https?:$/.test(u.protocol)) host = u.hostname.replace(/^www\./, '')
  } catch (e) {}
  const custom = String(logo || '').trim()
  return {
    host,
    name: String(name || '').trim() || host,
    icon: /^https?:\/\//i.test(custom) ? custom : (host ? 'https://www.google.com/s2/favicons?domain=' + host + '&sz=128' : '')
  }
}
