'use client'

import { useRouter } from 'next/navigation'
import { useShop } from './ShopContext'
import { usePathname } from 'next/navigation'

// Shop phone / WhatsApp number (same one used on the Contact page)
const SHOP_PHONE = '8801877270165'

export default function BottomNav() {
  const router = useRouter()
  const { openAccount, openTrack } = useShop()
  const pathname = usePathname()
  if (['/contact', '/terms', '/refund-policy', '/privacy'].includes(pathname)) return null

  return (
    <div className="bottomNav">
      <button className="active" onClick={() => { router.push('/'); window.scrollTo(0, 0) }}>
        <span className="bnIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
            <path d="M3 10.5 12 3l9 7.5"/>
            <path d="M5 9.5V21h14V9.5"/>
            <path d="M9.5 21v-6.5h5V21"/>
          </svg>
        </span>
        Home
      </button>
      <button onClick={() => { window.location.href = 'tel:+' + SHOP_PHONE }}>
        <span className="bnIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>
          </svg>
        </span>
        Call
      </button>
      <button onClick={() => window.open('https://wa.me/' + SHOP_PHONE, '_blank', 'noopener')}>
        <span className="bnIcon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="21" height="21">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </span>
        WhatsApp
      </button>
      <button onClick={openTrack}>
        <span className="bnIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
            <path d="M21 8 12 3 3 8l9 5 9-5Z"/>
            <path d="M3 8v8l9 5 9-5V8"/>
            <path d="M12 13v8"/>
          </svg>
        </span>
        Track
      </button>
      <button onClick={openAccount}>
        <span className="bnIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
            <circle cx="12" cy="8" r="3.5"/>
            <path d="M5 20c1.2-3.8 4.2-6 7-6s5.8 2.2 7 6"/>
          </svg>
        </span>
        Login
      </button>
    </div>
  )
}
