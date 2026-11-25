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
          <svg viewBox="0 0 53 53" fill="currentColor"><defs><mask id="hdUserMask"><rect width="53" height="53" fill="#fff" /><circle cx="26.5" cy="14" r="17.75" fill="#000" /></mask></defs><circle cx="26.5" cy="14" r="14" /><path mask="url(#hdUserMask)" d="M1.2 52.5Q0 52.5 0 51.3L0.03 50.14L0.12 48.39L0.26 46.83L0.46 45.38L0.72 44.02L1.04 42.73L1.42 41.50L1.85 40.33L2.34 39.21L2.88 38.14L3.48 37.12L4.13 36.16L4.84 35.24L5.60 34.37L6.42 33.55L7.28 32.78L8.20 32.07L9.18 31.40L10.20 30.78L11.28 30.22L12.41 29.70L13.60 29.24L14.84 28.84L16.14 28.48L17.51 28.18L18.96 27.94L20.49 27.75L22.15 27.61L24 27.53L26.50 27.50L29 27.53L30.85 27.61L32.51 27.75L34.04 27.94L35.49 28.18L36.86 28.48L38.16 28.84L39.40 29.24L40.59 29.70L41.72 30.22L42.80 30.78L43.82 31.40L44.80 32.07L45.72 32.78L46.58 33.55L47.40 34.37L48.16 35.24L48.87 36.16L49.52 37.12L50.12 38.14L50.66 39.21L51.15 40.33L51.58 41.50L51.96 42.73L52.28 44.02L52.54 45.38L52.74 46.83L52.88 48.39L52.97 50.14L53 51.3Q53 52.5 51.8 52.5Z" /></svg>
        </button>
        <button type="button" className="pdTopIc pdTopSearch" onClick={() => { closeDrawer(); openSearch() }} aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"><circle cx="9.65" cy="9.65" r="6.6" strokeWidth="2.7" /><path d="M14.96 15.44L21.66 22.14" strokeWidth="3" strokeLinecap="butt" /></svg>
        </button>
        <button type="button" className={'pdTopMenu' + (drawerOpen ? ' open' : '')} onClick={toggleMenu} aria-label={drawerOpen ? 'Close menu' : 'Open menu'} aria-expanded={drawerOpen}><span /><span /><span /></button>
      </div>
      <NavMenu />
    </nav>
  )
}
