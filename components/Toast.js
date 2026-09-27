'use client'

import { useShop } from './ShopContext'

export default function Toast() {
  const { toastMsg, toastShow } = useShop()
  return <div className={`toast${toastShow ? ' show' : ''}`}>{toastMsg}</div>
}
