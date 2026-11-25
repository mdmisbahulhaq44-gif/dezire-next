'use client'

import { useEffect } from 'react'
import { useShop } from './ShopContext'
import { usePathname } from 'next/navigation'
import { NO_NAV_ROUTES } from '../lib/noNavRoutes'
import NavMenu from './NavMenu'

export default function Header() {
  const { drawerOpen, openDrawer, closeDrawer, openSearch, openAccount, fadeSwap, activePanel } = useShop()
  const pathname = usePathname()

  // the menu closes whenever the page changes
  useEffect(() => { closeDrawer() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  if (NO_NAV_ROUTES.includes(pathname)) return null

  const isShop = pathname.startsWith('/shop')

  // account icon: same as the Account tab of the bottom bar
  function openMyAccount() {
    closeDrawer()
    if (activePanel === 'account') { openAccount(); return }
    const r = document.documentElement
    r.setAttribute('data-instant', '1')
    clearTimeout(window.__dzInstant)
    window.__dzInstant = setTimeout(() => r.removeAttribute('data-instant'), 800)
    fadeSwap(() => openAccount())
  }

  // opening the menu first brings the page to the top, so the menu is always right under the header
  function toggleMenu() {
    if (drawerOpen) { closeDrawer(); return }
    try { window.scrollTo({ top: 0, behavior: 'instant' }) } catch (e) { window.scrollTo(0, 0) }
    openDrawer()
  }

  return (
    <nav className={isShop ? 'navShop navGrey' : 'navShop'}>
      <div className="logo">HEAVEN</div>
      <div className="pdTopRight">
        <button type="button" className="pdTopIc" onClick={openMyAccount} aria-label="My account">
          <svg viewBox="0 0 53 53" fill="currentColor"><defs><mask id="hdUserMask"><rect width="53" height="53" fill="#fff" /><circle cx="26.5" cy="14.25" r="17.6" fill="#000" /></mask></defs><circle cx="26.5" cy="14.25" r="14.25" /><path mask="url(#hdUserMask)" d="M1.2 52.5Q0 52.5 0 51.3L0.04 50.96L0.14 49.48L0.32 48.03L0.57 46.60L0.88 45.20L1.27 43.82L1.72 42.47L2.24 41.15L2.82 39.87L3.47 38.62L4.18 37.41L4.95 36.24L5.78 35.12L6.66 34.05L7.6 33.03L8.59 32.06L9.63 31.15L10.72 30.30L11.85 29.51L13.02 28.77L14.24 28.11L15.48 27.51L16.76 26.97L18.07 26.50L19.41 26.11L20.78 25.78L22.16 25.53L23.57 25.35L25.01 25.24L26.5 25.20L27.99 25.24L29.43 25.35L30.84 25.53L32.22 25.78L33.59 26.11L34.93 26.50L36.24 26.97L37.52 27.51L38.76 28.11L39.98 28.77L41.15 29.51L42.28 30.30L43.37 31.15L44.41 32.06L45.4 33.03L46.34 34.05L47.22 35.12L48.05 36.24L48.82 37.41L49.53 38.62L50.18 39.87L50.76 41.15L51.28 42.47L51.73 43.82L52.12 45.20L52.43 46.60L52.68 48.03L52.86 49.48L52.96 50.96L53 51.3Q53 52.5 51.8 52.5Z" /></svg>
        </button>
        <button type="button" className="pdTopIc pdTopSearch" onClick={() => { closeDrawer(); openSearch() }} aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"><circle cx="9.65" cy="9.65" r="6.6" strokeWidth="2.7" /><path d="M15.15 15.43L21.76 22.04" strokeWidth="3" strokeLinecap="butt" /></svg>
        </button>
        <button type="button" className={'pdTopMenu' + (drawerOpen ? ' open' : '')} onClick={toggleMenu} aria-label={drawerOpen ? 'Close menu' : 'Open menu'} aria-expanded={drawerOpen}><span /><span /><span /></button>
      </div>
      <NavMenu />
    </nav>
  )
}
