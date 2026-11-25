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
          <svg viewBox="0 0 53 53" fill="currentColor"><circle cx="26.5" cy="11.5" r="11.5" /><path d="M0 50.5C0 36 11 26 26.5 26S53 36 53 50.5c0 1.4-1.1 2.5-2.5 2.5h-48C1.1 53 0 51.9 0 50.5z" /></svg>
        </button>
        <button type="button" className="pdTopIc pdTopSearch" onClick={() => { closeDrawer(); openSearch() }} aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"><circle cx="10" cy="10" r="7" strokeWidth="2.7" /><path d="M15.2 15.2L21.2 21.2" strokeWidth="3" /></svg>
        </button>
        <button type="button" className={'pdTopMenu' + (drawerOpen ? ' open' : '')} onClick={toggleMenu} aria-label={drawerOpen ? 'Close menu' : 'Open menu'} aria-expanded={drawerOpen}><span /><span /><span /></button>
      </div>
      <NavMenu />
    </nav>
  )
}
