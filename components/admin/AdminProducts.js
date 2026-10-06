'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { cldOpt } from '../../lib/cloudinary'
import ProductFormPanel from './ProductFormPanel'
import { useShop } from '../ShopContext'

export default function AdminProducts() {
  const { showToast } = useShop()
  const [products, setProducts] = useState(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  async function load() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  useEffect(() => { load() }, [])

  const list = useMemo(() => {
    if (!products) return []
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(p => (p.name || '').toLowerCase().includes(q) || (p.cat || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q))
  }, [products, search])

  function openAdd() { setEditing(null); setFormOpen(true) }
  function openEdit(p) { setEditing(p); setFormOpen(true) }
  function onSaved() { setFormOpen(false); load() }

  return (
    <>
      <div id="adminProductsView">
        <div className="adminTable">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2>All Products</h2>
            <button className="btn" onClick={openAdd}>+ ADD PRODUCT</button>
          </div>
          <div className="adminSearchRow">
            <input placeholder="Search products by name, category or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <table>
            <thead>
              <tr><th>Image</th><th>Name</th><th>Category</th><th>Gender</th><th>Price</th><th>Stock</th><th>Color</th><th></th></tr>
            </thead>
            <tbody>
              {products === null && <tr><td colSpan={8}>Loading...</td></tr>}
              {products !== null && list.length === 0 && <tr><td colSpan={8}>{search ? 'No products match your search.' : 'No products yet.'}</td></tr>}
              {list.map(p => (
                <tr key={p.id}>
                  <td><div style={{ width: 36, height: 44, background: 'var(--cream)', borderRadius: 10, overflow: 'hidden' }}>{p.imgs ? <img src={cldOpt(p.imgs.split(',')[0].trim(), 100)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}</div></td>
                  <td>{p.name}</td>
                  <td>{p.cat || '—'}</td>
                  <td>{p.gender || '—'}</td>
                  <td>৳{Number(p.price).toLocaleString()}</td>
                  <td>{p.stock}</td>
                  <td>{p.color_name || '—'}</td>
                  <td><button className="btn light" style={{ padding: '6px 14px', fontSize: 10 }} onClick={() => openEdit(p)}>EDIT</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormPanel open={formOpen} product={editing} allProducts={products || []} onClose={() => setFormOpen(false)} onSaved={onSaved} showToast={showToast} />
    </>
  )
}
