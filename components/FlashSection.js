'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useShop } from './ShopContext'

function fmtLeft(ms, lang) {
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = n => String(n).padStart(2, '0')
  if (d > 0) return lang === 'bn' ? `${d} দিন ${p(h)} ঘণ্টা ${p(m)} মিনিট` : `${d}d ${p(h)}h ${p(m)}m`
  return `${p(h)}:${p(m)}:${p(sec)}`
}

// Milliseconds left until endsAt (null until the browser has started counting)
function useLeft(endsAt) {
  const [left, setLeft] = useState(null)
  useEffect(() => {
    if (!endsAt) return
    const end = new Date(endsAt).getTime()
    const tick = () => setLeft(Math.max(0, end - Date.now()))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [endsAt])
  return left
}

// Homepage strip: title + countdown + "View all", products passed as children.
// Disappears by itself when the countdown reaches zero.
export default function FlashSection({ endsAt, children }) {
  const left = useLeft(endsAt)
  const { t, lang } = useShop()
  if (left === 0) return null

  return (
    <section style={{ padding: '26px 5% 6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>⚡ {t('Flash Sale')}</h2>
          {left !== null && (
            <span style={{ background: 'var(--red)', color: '#fff', borderRadius: 20, padding: '5px 11px', fontSize: 11, fontWeight: 700, letterSpacing: '.5px', fontVariantNumeric: 'tabular-nums' }}>
              {t('Ends in {t}', { t: fmtLeft(left, lang) })}
            </span>
          )}
        </div>
        <Link href="/flash-sale" style={{ fontSize: 12, textDecoration: 'underline' }}>{t('View all →')}</Link>
      </div>
      {children}
    </section>
  )
}

// Banner for the /flash-sale page
export function FlashBanner({ endsAt }) {
  const left = useLeft(endsAt)
  const { t, lang } = useShop()
  return (
    <div style={{ background: '#111', color: '#fff', padding: '18px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.7 }}>{t('LIMITED TIME')}</div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>⚡ {lang === 'bn' ? t('Flash Sale') : 'FLASH SALE'}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.7 }}>{t('ENDS IN')}</div>
        <div style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
          {left === null ? '—' : left > 0 ? fmtLeft(left, lang) : t('ENDED')}
        </div>
      </div>
    </div>
  )
}
