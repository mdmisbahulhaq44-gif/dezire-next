'use client'

import { useShop } from './ShopContext'

// A price that follows the visitor's chosen currency (BDT / USD)
export default function Money({ n }) {
  const { money } = useShop()
  return <>{money(n)}</>
}

// "Charged in ৳X at checkout" reminder, shown only while prices are displayed in USD
export function CurNote({ n }) {
  const { currency, t } = useShop()
  if (currency !== 'USD') return null
  return <div className="curNote">{t('Charged in ৳{n} (BDT) at checkout', { n: Number(n || 0).toLocaleString('en-US') })}</div>
}

export function CurrencyToggle() {
  const { currency, setCurrency, t } = useShop()
  return (
    <div className="curToggle" role="group" aria-label="Currency">
      <span>{t('Currency')}</span>
      <button type="button" className={currency === 'BDT' ? 'on' : ''} onClick={() => setCurrency('BDT')}>৳ BDT</button>
      <button type="button" className={currency === 'USD' ? 'on' : ''} onClick={() => setCurrency('USD')}>$ USD</button>
    </div>
  )
}
