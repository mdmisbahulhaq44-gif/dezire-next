'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { parseCatPath, buildShopPath } from '../lib/categories'

// Menu tree for Men / Women: every category row has a + at its side; the + opens the rows inside it
// (categories, then sub-categories, then products). The name itself opens that category's page.
// The products are loaded once, the first time a section is opened.
const cache = {}

function buildTree(products) {
  const root = { kids: new Map(), items: [] }
  products.forEach(p => {
    let node = root
    parseCatPath(p).forEach(seg => {
      const key = seg.toLowerCase()
      if (!node.kids.has(key)) node.kids.set(key, { name: seg, kids: new Map(), items: [] })
      node = node.kids.get(key)
    })
    node.items.push(p)
  })
  return root
}

function Plus({ open }) {
  return (
    <svg className={'dtPlusIc' + (open ? ' open' : '')} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path className="dtV" d="M12 5v14" />
    </svg>
  )
}

function Collapse({ open, children }) {
  return <div className={'dtWrap' + (open ? ' open' : '')}><div>{children}</div></div>
}

function ProductRow({ p, onNavigate }) {
  const img = p.imgs ? p.imgs.split(',')[0].trim() : ''
  return (
    <Link
      className="dtProd"
      href={'/product/' + p.id}
      prefetch={false}
      onClick={onNavigate}
      data-preview={JSON.stringify({ id: p.id, name: p.name, price: p.price, old: p.old || null, img })}
    >
      <span className="dtProdName">{p.name}</span>
      <span className="dtProdPrice">৳{Number(p.price).toLocaleString()}</span>
    </Link>
  )
}

function Row({ label, href, open, onToggle, onNavigate }) {
  return (
    <div className="dtRowWrap">
      <Link className="dtLink" href={href} onClick={onNavigate}>{label}</Link>
      <button type="button" className="dtPlus" aria-expanded={open} aria-label={(open ? 'Close ' : 'Open ') + label} onClick={onToggle}>
        <Plus open={open} />
      </button>
    </div>
  )
}

function Node({ node, gender, path, onNavigate }) {
  const [open, setOpen] = useState(false)
  const here = [...path, node.name]
  return (
    <div className="dtNode">
      <Row label={node.name} href={buildShopPath(gender, here)} open={open} onToggle={() => setOpen(o => !o)} onNavigate={onNavigate} />
      <Collapse open={open}>
        <div>
          {Array.from(node.kids.values()).map(k => <Node key={k.name.toLowerCase()} node={k} gender={gender} path={here} onNavigate={onNavigate} />)}
          {node.items.map(p => <ProductRow key={p.id} p={p} onNavigate={onNavigate} />)}
        </div>
      </Collapse>
    </div>
  )
}

export default function DrawerTree({ gender, label, onNavigate }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState(cache[gender] ? 'ok' : 'idle')

  function load() {
    if (cache[gender]) { setState('ok'); return }
    setState('loading')
    supabase
      .from('products')
      .select('id,name,price,old,imgs,gender,cat')
      .in('gender', [gender, 'unisex'])
      .order('created_at', { ascending: false })
      .limit(1000)
      .then(({ data, error }) => {
        if (error || !data) { setState('error'); return }
        cache[gender] = buildTree(data)
        setState('ok')
      }, () => setState('error'))
  }

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && state !== 'ok' && state !== 'loading') load()
  }

  const tree = cache[gender]
  const empty = tree && !tree.kids.size && !tree.items.length

  return (
    <div className="dtNode dtTop">
      <Row label={label} href={buildShopPath(gender, [])} open={open} onToggle={toggle} onNavigate={onNavigate} />
      <Collapse open={open}>
        <div>
          {state === 'loading' && <div className="dtNote">Loading...</div>}
          {state === 'error' && <button type="button" className="dtNote dtRetry" onClick={load}>Could not load. Tap to try again</button>}
          {state === 'ok' && tree && (empty
            ? <div className="dtNote">Nothing here yet</div>
            : <>
                {Array.from(tree.kids.values()).map(k => <Node key={k.name.toLowerCase()} node={k} gender={gender} path={[]} onNavigate={onNavigate} />)}
                {tree.items.map(p => <ProductRow key={p.id} p={p} onNavigate={onNavigate} />)}
              </>)}
        </div>
      </Collapse>
    </div>
  )
}
