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
          <svg viewBox="0 0 53 53" fill="currentColor"><defs><mask id="hdUserMask"><rect width="53" height="53" fill="#fff" /><circle cx="26.5" cy="13.75" r="15.75" fill="#000" /></mask></defs><circle cx="26.5" cy="13.75" r="13.75" /><path mask="url(#hdUserMask)" d="M0 51C0 37.5 6.5 27.5 16.5 27.5H36.5C46.5 27.5 53 37.5 53 51C53 51.9 52.4 52.5 51.5 52.5H1.5C.6 52.5 0 51.9 0 51Z" /></svg>
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
