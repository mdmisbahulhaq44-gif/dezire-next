'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useShop } from './ShopContext'
import { usePathname } from 'next/navigation'
import DrawerTree from './DrawerTree'
import { NO_NAV_ROUTES } from '../lib/noNavRoutes'
import { CurrencyToggle } from './Money'
import LangToggle from './LangToggle'

export default function Header() {
  const { cartCount, wishlistCount, openCart, openWishlist, openSearch, drawerOpen, openDrawer, closeDrawer, openTrack, openAbout, openAccount, fadeSwap, activePanel, t } = useShop()
  const pathname = usePathname()
  const pendingNav = useRef(null)

  // a menu link to another page: the menu stays until the new page is there, then slides away over it (Home is never seen)
  useEffect(() => {
    if (pendingNav.current && pathname !== pendingNav.current.from) {
      clearTimeout(pendingNav.current.t)
      pendingNav.current = null
      closeDrawer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (NO_NAV_ROUTES.includes(pathname)) return null

  const isShop = pathname.startsWith('/shop')
  // account icon in the shop header: same as the Account tab of the bottom bar
  function openMyAccount() {
    if (activePanel === 'account') { openAccount(); return }
    const r = document.documentElement
    r.setAttribute('data-instant', '1')
    clearTimeout(window.__dzInstant)
    window.__dzInstant = setTimeout(() => r.removeAttribute('data-instant'), 800)
    fadeSwap(() => openAccount())
  }

  // a menu link that leaves the menu closes it at once (no slow slide under the page change); the x / dim area keep the slow slide
  function navClose(e) {
    const link = e && e.currentTarget
    const target = link && link.pathname
    if (target && target !== pathname) {
      if (pendingNav.current) clearTimeout(pendingNav.current.t)
      pendingNav.current = { from: pathname, t: setTimeout(() => { pendingNav.current = null; navClose() }, 4000) }
      return
    }
    const r = document.documentElement
    r.setAttribute('data-dnav', '1')
    clearTimeout(window.__dzDnav)
    window.__dzDnav = setTimeout(() => r.removeAttribute('data-dnav'), 700)
    closeDrawer()
  }

  return (
    <>
      {isShop ? (
        <nav className="navShop">
          <div className="logo">HEAVEN</div>
          <div className="pdTopRight">
            <button type="button" className="pdTopIc" onClick={openMyAccount} aria-label="My account">
              <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.2" r="4.7" /><path d="M3.2 21.2c0-4.7 3.8-7.7 8.8-7.7s8.8 3 8.8 7.7c0 .5-.4.8-.8.8H4c-.4 0-.8-.3-.8-.8z" /></svg>
            </button>
            <button type="button" className="pdTopIc pdTopSearch" onClick={openSearch} aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"><circle cx="10" cy="10" r="7" strokeWidth="2.7" /><path d="M15.2 15.2L21.2 21.2" strokeWidth="3" /></svg>
            </button>
            <button type="button" className="pdTopMenu" onClick={openDrawer} aria-label="Open menu"><span /><span /><span /></button>
          </div>
        </nav>
      ) : (
      <nav>
        <div className="navLeft">
          <button className="hamburgerBtn" onClick={openDrawer} aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>

        <div className="logo">HEAVEN</div>

        <div className="navRightIcons">
          <button className="iconbtn" aria-label="Search" onClick={openSearch}>⌕</button>
          <button className="iconbtn" aria-label="Wishlist" onClick={openWishlist} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M12 20.8l-1.2-1.1C5.6 15.1 2.5 12.3 2.5 8.7 2.5 5.9 4.7 3.7 7.5 3.7c1.9 0 3.7.9 4.5 2.3.8-1.4 2.6-2.3 4.5-2.3 2.8 0 5 2.2 5 5 0 3.6-3.1 6.4-8.3 11l-1.2 1.1z"/>
            </svg>
            <span className="cartCount" style={{ display: wishlistCount > 0 ? 'flex' : 'none' }}>{wishlistCount}</span>
          </button>
          <button className="iconbtn" aria-label="Cart" onClick={openCart} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"/>
              <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
            </svg>
            <span className="cartCount" style={{ display: cartCount > 0 ? 'flex' : 'none' }}>{cartCount}</span>
          </button>
        </div>
      </nav>
      )}

      <div className={`overlay${drawerOpen ? ' show' : ''}`} onClick={closeDrawer}></div>
      <div className={`drawer${drawerOpen ? ' show' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <div className="logo" style={{ fontSize: 18 }}>HEAVEN</div>
          <button className="close" onClick={closeDrawer}>×</button>
        </div>
        <Link href="/flash-sale" onClick={navClose}>⚡ {t('Flash Sale')}</Link>
        <Link href="/#new" onClick={navClose}>{t('New Arrivals')}</Link>
        <DrawerTree gender="women" label="Women" onNavigate={navClose} />
        <DrawerTree gender="men" label="Men" onNavigate={navClose} />
        <Link href="/#women" onClick={navClose}>{t('Accessories')}</Link>
        <Link href="/#new" onClick={navClose}>{t('Sale')}</Link>
        <a href="#" onClick={e => { e.preventDefault(); navClose(); openAbout() }}>{t('About Us')}</a>
        <a href="#" onClick={e => { e.preventDefault(); navClose(); openTrack() }}>{t('Track Order')}</a>
        <CurrencyToggle />
        <LangToggle />
      </div>
    </>
  )
}
