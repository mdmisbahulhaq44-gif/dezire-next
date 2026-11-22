'use client'

import { useState } from 'react'

const OPTS = [['newest', 'Newest First'], ['price_low', 'Price: Low to High'], ['price_high', 'Price: High to Low']]

export default function SortMenu({ value, onChange, t }) {
  const [open, setOpen] = useState(false)
  const cur = OPTS.find(o => o[0] === value) || OPTS[0]
  return (
    <div className="sortWrap">
      <button type="button" className={`sortBtn${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{t(cur[1])}</span>
        <svg viewBox="0 0 12 8" fill="none" stroke="#111" strokeWidth="1.6" aria-hidden="true"><path d="M1 1l5 5 5-5" /></svg>
      </button>
      {open && <div className="sortBg" onClick={() => setOpen(false)} />}
      {open && (
        <div className="sortList" role="listbox">
          {OPTS.map(o => (
            <button type="button" key={o[0]} role="option" aria-selected={o[0] === value} className={o[0] === value ? 'on' : ''} onClick={() => { onChange(o[0]); setOpen(false) }}>
              <span>{t(o[1])}</span><i />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
