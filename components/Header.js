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
          <svg viewBox="0 0 53 53" fill="currentColor"><defs><mask id="hdUserMask"><rect x="-2" y="-2" width="58" height="58" fill="#fff" /><circle cx="26.23" cy="14.25" r="17.6" fill="#000" /></mask></defs><circle cx="26.5" cy="14.25" r="14.25" /><path transform="translate(.27 0)" mask="url(#hdUserMask)" d="M1.2 52.5Q0 52.5 0 51.3L0.04 50.96L0.14 49.48L0.32 48.03L0.57 46.60L0.88 45.20L1.27 43.82L1.72 42.47L2.24 41.15L2.82 39.87L3.47 38.62L4.18 37.41L4.95 36.24L5.78 35.12L6.66 34.05L7.6 33.03L8.59 32.06L9.63 31.15L10.72 30.30L11.85 29.51L13.02 28.77L14.24 28.11L15.48 27.51L16.76 26.97L18.07 26.50L19.41 26.11L20.78 25.78L22.16 25.53L23.57 25.35L25.01 25.24L26.5 25.20L27.99 25.24L29.43 25.35L30.84 25.53L32.22 25.78L33.59 26.11L34.93 26.50L36.24 26.97L37.52 27.51L38.76 28.11L39.98 28.77L41.15 29.51L42.28 30.30L43.37 31.15L44.41 32.06L45.4 33.03L46.34 34.05L47.22 35.12L48.05 36.24L48.82 37.41L49.53 38.62L50.18 39.87L50.76 41.15L51.28 42.47L51.73 43.82L52.12 45.20L52.43 46.60L52.68 48.03L52.86 49.48L52.96 50.96L53 51.3Q53 52.5 51.8 52.5Z" /></svg>
        </button>
        <button type="button" className="pdTopIc pdTopSearch" onClick={() => { closeDrawer(); openSearch() }} aria-label="Search">
          <svg viewBox="0 0 57 57" fill="currentColor" fillRule="evenodd"><path d="M50.35 54.32L49.73 54.34L49.36 54.19L49.12 54.01L47.52 52.37L44.75 49.73L41.61 46.52L39.52 44.53L38.65 43.60L37.55 42.59L36.93 41.85L36.19 41.14L35.89 40.75L35.71 40.25L35.75 39.02L35.67 38.53L35.45 38.22L35.08 37.98L34.59 37.87L34.10 37.99L31.59 39.76L30.41 40.22L29.29 40.87L27.58 41.31L26.59 41.80L24.25 41.95L22.28 41.89L21.42 41.77L17.12 40.93L16.56 40.75L15.52 40.26L14.16 39.90L13.23 39.27L12.14 38.78L10.48 37.30L9.59 36.68L8.62 35.58L7.25 33.85L6.65 32.63L6.01 31.64L5.14 29.67L4.35 27.21L4.19 26.35L4.04 23.27L4.07 21.67L4.23 20.44L4.25 19.45L4.39 18.84L4.85 17.73L5.29 16.25L6.64 13.67L7.39 12.56L8.26 11.45L8.75 10.96L9.24 10.22L9.98 9.61L11.26 8.38L11.94 7.88L12.56 7.33L13.79 6.81L14.65 6.23L17.61 5.24L18.59 5.03L21.92 4.61L23.39 4.59L27.53 5.18L30.53 6.23L32.75 7.41L34.82 9.12L36.13 10.47L38.22 13.18L39.86 16.13L40.38 18.08L40.88 19.58L41.10 21.79L41.12 24.13L40.99 25.98L40.87 26.63L40.49 27.82L40.04 29.67L39.81 30.28L38.65 32.68L38.10 33.61L37.21 34.72L37.04 35.21L37.06 35.58L37.28 35.95L37.55 36.13L38.04 36.27L39.39 36.43L40.67 37.18L42.20 38.78L43.70 40.17L44.18 40.75L44.75 41.24L46.16 42.73L46.78 43.23L47.28 43.82L48.75 45.21L49.36 45.91L50.82 47.27L51.33 47.87L52.09 48.50L53.56 50.10L53.71 50.47L53.71 50.72L53.42 51.32L52.19 52.60L51.45 53.23L50.81 54.04ZM23.15 36.32L26.10 35.93L26.89 35.70L28.68 34.85L30.26 33.85L31.97 32.38L32.67 31.39L33.50 30.53L34.33 29.18L34.56 28.68L35.20 26.47L35.60 24.13L35.66 23.27L35.14 19.58L34.73 18.35L33.74 16.50L32.81 15.15L32.30 14.53L31.18 13.42L29.67 12.25L28.68 11.77L27.95 11.26L27.58 11.10L24.38 10.23L23.27 10.15L21.79 10.15L19.82 10.42L18.84 10.91L17.48 11.21L16.76 11.70L15.88 12.09L15.53 12.32L14.28 13.30L13.42 14.10L12.36 15.27L11.21 16.97L10.27 18.84L9.71 21.55L9.58 23.02L9.57 23.88L9.97 26.22L10.54 28.44L11.45 30.11L12.69 31.64L13.67 32.72L14.51 33.36L15.16 33.98L16.30 34.72L18.47 35.75L19.08 35.89L22.28 36.32Z" /></svg>
        </button>
        <button type="button" className={'pdTopMenu' + (drawerOpen ? ' open' : '')} onClick={toggleMenu} aria-label={drawerOpen ? 'Close menu' : 'Open menu'} aria-expanded={drawerOpen}><span /><span /><span /></button>
      </div>
      <NavMenu />
    </nav>
  )
}
