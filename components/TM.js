'use client'

import Link from 'next/link'
import { useShop } from './ShopContext'

// <TM>{"text with **bold** and [link](url)"}</TM> — translated text that keeps bold and links
export default function TM({ children, vars }) {
  const { t } = useShop()
  const s = t(String(children), vars)
  const out = []
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m
  let k = 0
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index))
    if (m[1]) out.push(<strong key={k++}>{m[1]}</strong>)
    else if (m[3].startsWith('/')) out.push(<Link key={k++} href={m[3]}>{m[2]}</Link>)
    else out.push(<a key={k++} href={m[3]} {...(m[3].startsWith('http') && !m[3].includes('wa.me') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{m[2]}</a>)
    last = m.index + m[0].length
  }
  if (last < s.length) out.push(s.slice(last))
  return <>{out}</>
}
