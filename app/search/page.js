import { supabaseServer } from '../../lib/supabaseServer'
import SearchResults from '../../components/SearchResults'

export const metadata = { title: 'Search — HEAVEN', robots: { index: false } }

const LABELS = { waist: 'Waist', length: 'Length', hip: 'Hip', leg_opening: 'Leg Opening', chest: 'Chest', shoulder: 'Shoulder', sleeve: 'Sleeve' }
const ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL']

function clean(q) {
  return q.replace(/[,()*%_\\]/g, ' ').replace(/\s+/g, ' ').trim()
}
function sortSizes(list) {
  const rank = s => ORDER.indexOf(String(s).trim().toUpperCase())
  if (list.every(s => rank(s) >= 0)) return [...list].sort((a, b) => rank(a) - rank(b))
  return list
}

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams
  const raw = Array.isArray(sp.q) ? sp.q[0] : (sp.q || '')
  const c = clean(String(raw).slice(0, 80))
  let items = []
  if (c) {
    const phrase = c.toLowerCase()
    const words = phrase.split(' ')
    const key = words.reduce((a, b) => (b.length > a.length ? b : a), words[0])
    const { data } = await supabaseServer
      .from('products')
      .select('id,name,brand,cat,imgs,size_chart')
      .or(`name.ilike.%${key}%,brand.ilike.%${key}%,cat.ilike.%${key}%`)
      .order('created_at', { ascending: false })
      .limit(1000)
    const list = (data || []).filter(p => {
      const hay = [p.name, p.brand, p.cat].join(' ').toLowerCase()
      return words.every(w => hay.includes(w))
    })
    list.sort((a, b) => (String(a.name).toLowerCase().includes(phrase) ? 0 : 1) - (String(b.name).toLowerCase().includes(phrase) ? 0 : 1))
    items = list.slice(0, 30).map(p => {
      const chart = p.size_chart && typeof p.size_chart === 'object' ? p.size_chart : {}
      const lines = sortSizes(Object.keys(chart)).map(s => `${s} : ` + Object.entries(chart[s] || {}).map(([k, v]) => `${LABELS[k] || k}- ${v}`).join(' | '))
      return { id: p.id, name: p.name, img: p.imgs ? p.imgs.split(',')[0].trim() : '', lines }
    })
  }
  return <SearchResults items={items} q={c} />
}
