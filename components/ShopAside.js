'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../lib/supabaseClient'
import { getRecent } from '../lib/recent'
import { cldOpt } from '../lib/cloudinary'
import { useShop } from './ShopContext'

export default function ShopAside() {
  const { openSearch } = useShop()
  const [items, setItems] = useState([])

  useEffect(() => {
    const ids = getRecent().slice(0, 5)
    if (!ids.length) return
    let alive = true
    supabase
      .from('products')
      .select('id,name,price,old,imgs')
      .in('id', ids)
      .then(({ data }) => {
        if (!alive || !data) return
        setItems(ids.map(id => data.find(p => p.id === id)).filter(Boolean))
      })
    return () => { alive = false }
  }, [])

  function go(e) {
    e.preventDefault()
    openSearch()
  }

  return (
    <div className="shopAside">
      <form className="shopSearch" onSubmit={go} role="search">
        <input type="text" placeholder="Search" readOnly onClick={go} aria-label="Search" />
        <button type="submit" aria-label="Search">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="14" cy="10" r="6" /><path d="M9.8 14.2L4 20" /></svg>
        </button>
      </form>
      {items.length > 0 && (
        <>
          <h2>Recently Viewed Products</h2>
          <div className="shopRecent">
            {items.map(p => {
              const img = p.imgs ? p.imgs.split(',')[0].trim() : ''
              return (
                <Link
                  key={p.id}
                  href={'/product/' + p.id}
                  data-preview={JSON.stringify({ id: p.id, name: p.name, price: p.price, old: p.old || null, img })}
                >
                  <span className="rvImg">
                    {img ? <Image src={cldOpt(img, 160)} alt="" fill sizes="65px" style={{ objectFit: 'cover' }} quality={60} /> : null}
                  </span>
                  <span className="rvText">
                    <span className="rvName">{p.name}</span>
                    <span className="rvPrice">৳{Number(p.price).toLocaleString()}{p.old ? <span className="old">৳{Number(p.old).toLocaleString()}</span> : null}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
