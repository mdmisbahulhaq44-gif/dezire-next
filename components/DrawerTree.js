'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { parseCatPath, buildShopPath } from '../lib/categories'
import { useShop } from './ShopContext'

// Menu tree for Men / Women: categories and sub-categories only (no products).
// A row with deeper sub-categories has an arrow button that opens them; the name itself opens that category's page.
// Rows with nothing deeper have no arrow, they just open their page.
const cache = {}

// A product's own name is often saved as the last part of its category path: that part is the product, not a category.
function catPath(p) {
  const segs = parseCatPath(p)
  const last = segs[segs.length - 1]
  if (segs.length > 1 && last && last.toLowerCase() === String(p.name || '').trim().toLowerCase()) segs.pop()
  return segs
}

function buildTree(products) {
  const root = { kids: new Map() }
  products.forEach(p => {
    let node = root
    catPath(p).forEach(seg => {
      const key = seg.toLowerCase()
      if (!node.kids.has(key)) node.kids.set(key, { name: seg, kids: new Map() })
      node = node.kids.get(key)
    })
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

function Row({ label, href, open, onToggle, onNavigate, expandable }) {
  const { t } = useShop()
  return (
    <div className="dtRowWrap">
      <Link className="dtLink" href={href} onClick={onNavigate}>{t(label)}</Link>
      {expandable && (
        <button type="button" className="dtPlus" aria-expanded={open} aria-label={(open ? 'Close ' : 'Open ') + label} onClick={onToggle}>
          <Plus open={open} />
        </button>
      )}
    </div>
  )
}

function Node({ node, gender, path, onNavigate }) {
  const [open, setOpen] = useState(false)
  const here = [...path, node.name]
  const expandable = node.kids.size > 0
  return (
    <div className="dtNode">
      <Row label={node.name} href={buildShopPath(gender, here)} open={open} expandable={expandable} onToggle={() => setOpen(o => !o)} onNavigate={onNavigate} />
      {expandable && (
        <Collapse open={open}>
          <div>
            {Array.from(node.kids.values()).map(k => <Node key={k.name.toLowerCase()} node={k} gender={gender} path={here} onNavigate={onNavigate} />)}
          </div>
        </Collapse>
      )}
    </div>
  )
}

export default function DrawerTree({ gender, label, onNavigate }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState(cache[gender] ? 'ok' : 'idle')
  const { t, drawerOpen } = useShop()

  function load() {
    if (cache[gender]) { setState('ok'); return }
    setState('loading')
    supabase
      .from('products')
      .select('name,gender,cat')
      .in('gender', [gender, 'unisex'])
      .limit(1000)
      .then(({ data, error }) => {
        if (error || !data) { setState('error'); return }
        cache[gender] = buildTree(data)
        setState('ok')
      }, () => setState('error'))
  }

  // start loading as soon as the menu opens, so the rows are ready before Women / Men is tapped
  useEffect(() => { if (drawerOpen && state === 'idle') load() }, [drawerOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && state !== 'ok' && state !== 'loading') load()
  }

  const tree = cache[gender]
  const empty = tree && !tree.kids.size

  return (
    <div className="dtNode dtTop">
      <Row label={label} href={buildShopPath(gender, [])} open={open} expandable onToggle={toggle} onNavigate={onNavigate} />
      <Collapse open={open}>
        <div>
          {state === 'loading' && <div className="dtNote">{t('Loading...')}</div>}
          {state === 'error' && <button type="button" className="dtNote dtRetry" onClick={load}>{t('Could not load. Tap to try again')}</button>}
          {state === 'ok' && tree && (empty
            ? <div className="dtNote">{t('Nothing here yet')}</div>
            : Array.from(tree.kids.values()).map(k => <Node key={k.name.toLowerCase()} node={k} gender={gender} path={[]} onNavigate={onNavigate} />))}
        </div>
      </Collapse>
    </div>
  )
}
