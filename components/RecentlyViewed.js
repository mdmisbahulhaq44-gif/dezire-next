'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getRecent } from '../lib/recent'
import ProductGrid from './ProductGrid'

export default function RecentlyViewed() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const ids = getRecent().slice(0, 4)
    if (!ids.length) return
    let alive = true
    supabase
      .from('products')
      .select('id,name,price,old,badge,imgs,stock')
      .in('id', ids)
      .then(({ data }) => {
        if (!alive || !data) return
        const sorted = ids.map(id => data.find(p => p.id === id)).filter(Boolean)
        setProducts(sorted)
      })
    return () => { alive = false }
  }, [])

  if (!products.length) return null

  return (
    <>
      <div style={{ padding: '10px 5% 10px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
          Recently Viewed
        </h2>
      </div>
      <div style={{ padding: '0 5% 40px' }}>
        <ProductGrid products={products} />
      </div>
    </>
  )
}
