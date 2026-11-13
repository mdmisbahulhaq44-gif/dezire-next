'use client'

import { useShop } from './ShopContext'
import NavMenu from './NavMenu'

// Top bar of the product page, like the reference (gorurghash.com): logo on the left; account, search and the boxed menu button on the right
export default function PdTopBar({ onBack }) {
  const { openSearch, openAccount, openDrawer, closeDrawer, drawerOpen, fadeSwap } = useShop()
  function openMyAccount() {
    closeDrawer()
    const r = document.documentElement
    r.setAttribute('data-instant', '1')
    clearTimeout(window.__dzInstant)
    window.__dzInstant = setTimeout(() => r.removeAttribute('data-instant'), 800)
    fadeSwap(() => openAccount())
  }
  return (
    <div className="pdTopBar">
      <button type="button" className="pdTopBtn" onClick={onBack} aria-label="Back">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <div className="logo">HEAVEN</div>
      <div className="pdTopRight">
        <button type="button" className="pdTopIc" onClick={openMyAccount} aria-label="My account">
          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.2" r="4.7" /><path d="M3.2 21.2c0-4.7 3.8-7.7 8.8-7.7s8.8 3 8.8 7.7c0 .5-.4.8-.8.8H4c-.4 0-.8-.3-.8-.8z" /></svg>
        </button>
        <button type="button" className="pdTopIc pdTopSearch" onClick={() => { closeDrawer(); openSearch() }} aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"><circle cx="10" cy="10" r="7" strokeWidth="2.7" /><path d="M15.2 15.2L21.2 21.2" strokeWidth="3" /></svg>
        </button>
        <button type="button" className={'pdTopMenu' + (drawerOpen ? ' open' : '')} onClick={() => (drawerOpen ? closeDrawer() : openDrawer())} aria-label={drawerOpen ? 'Close menu' : 'Open menu'} aria-expanded={drawerOpen}><span /><span /><span /></button>
      </div>
      <NavMenu />
    </div>
  )
}
