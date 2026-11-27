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
          <svg viewBox="0 0 53 53" fill="currentColor"><defs><mask id="hdUserMask"><rect x="-2" y="-2" width="58" height="58" fill="#fff" /><circle cx="26.23" cy="14.25" r="17.6" fill="#000" /></mask></defs><circle cx="26.5" cy="14.25" r="14.25" /><path transform="translate(.27 0)" mask="url(#hdUserMask)" d="M1.2 52.5Q0 52.5 0 51.3L0.04 50.96L0.14 49.48L0.32 48.03L0.57 46.60L0.88 45.20L1.27 43.82L1.72 42.47L2.24 41.15L2.82 39.87L3.47 38.62L4.18 37.41L4.95 36.24L5.78 35.12L6.66 34.05L7.6 33.03L8.59 32.06L9.63 31.15L10.72 30.30L11.85 29.51L13.02 28.77L14.24 28.11L15.48 27.51L16.76 26.97L18.07 26.50L19.41 26.11L20.78 25.78L22.16 25.53L23.57 25.35L25.01 25.24L26.5 25.20L27.99 25.24L29.43 25.35L30.84 25.53L32.22 25.78L33.59 26.11L34.93 26.50L36.24 26.97L37.52 27.51L38.76 28.11L39.98 28.77L41.15 29.51L42.28 30.30L43.37 31.15L44.41 32.06L45.4 33.03L46.34 34.05L47.22 35.12L48.05 36.24L48.82 37.41L49.53 38.62L50.18 39.87L50.76 41.15L51.28 42.47L51.73 43.82L52.12 45.20L52.43 46.60L52.68 48.03L52.86 49.48L52.96 50.96L53 51.3Q53 52.5 51.8 52.5Z" /></svg>
        </button>
        <button type="button" className="pdTopIc pdTopSearch" onClick={() => { closeDrawer(); openSearch() }} aria-label="Search">
          <span className="astraSearch" aria-hidden="true" />
        </button>
        <button type="button" className={'pdTopMenu' + (drawerOpen ? ' open' : '')} onClick={() => (drawerOpen ? closeDrawer() : openDrawer())} aria-label={drawerOpen ? 'Close menu' : 'Open menu'} aria-expanded={drawerOpen}><span /><span /><span /></button>
      </div>
      <NavMenu />
    </div>
  )
}
