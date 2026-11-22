'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getRecent } from '../lib/recent'
import ProductGrid from './ProductGrid'
import T from './T'

export default function RecentlyViewed({ exclude, compact }) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const ids = getRecent().filter(x => String(x) !== String(exclude)).slice(0, 4)
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

  if (compact) {
    return (
      <div style={{ borderTop: '1px solid rgba(0,0,0,.08)', marginTop: 30, paddingTop: 20 }}>
        <div className="pdRelTitle"><T>Recently Viewed Products</T></div>
        <ProductGrid products={products} noPreview />
      </div>
    )
  }

  return (
    <>
      <div style={{ padding: '10px 5% 10px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
          <T>Recently Viewed</T>
        </h2>
      </div>
      <div style={{ padding: '0 5% 40px' }}>
        <ProductGrid products={products} noPreview />
      </div>
    </>
  )
}
