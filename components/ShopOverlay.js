'use client'

import { useShop } from './ShopContext'

export default function ShopOverlay() {
  const { activePanel, closePanel } = useShop()
  return <div className={`overlay${activePanel ? ' show' : ''}`} onClick={closePanel}></div>
}
