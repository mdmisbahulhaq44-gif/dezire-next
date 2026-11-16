'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useShop } from './ShopContext'
import DrawerTree from './DrawerTree'

// Menu like the reference (gorurghash.com): a light list that drops down right under the header, over the page (no dimming); rows with a chevron open their categories
export default function NavMenu() {
  const { drawerOpen, closeDrawer, openAbout, t } = useShop()
  const pathname = usePathname()
  const close = () => closeDrawer()
  const cls = p => 'nmLink' + (pathname === p ? ' on' : '')

  // A link to ANOTHER page keeps the menu open (thin loading bar on top) until the new page has arrived; the header then closes the menu by itself.
  // So the old page is never shown for a moment and nothing cross-fades. A link to the page we are already on just closes the menu.
  function go(href) {
    const path = String(href).split('#')[0].split('?')[0] || '/'
    if (path === pathname) { close(); return }
    const root = document.documentElement
    root.setAttribute('data-nav', '1')
    setTimeout(() => root.removeAttribute('data-nav'), 10000)
    if (path.startsWith('/product/')) window.__dzEnter = { t: performance.now(), mode: 'link', still: location.pathname.startsWith('/product/') }
  }

  return (
    <div className={'navMenu' + (drawerOpen ? ' show' : '')} aria-hidden={!drawerOpen}>
      <div className="nmInner">
        <Link className={cls('/')} href="/" data-no-vt="1" onClick={() => go('/')}>{t('Home')}</Link>
        <Link className={cls('/flash-sale')} href="/flash-sale" data-no-vt="1" onClick={() => go('/flash-sale')}>{t('Flash Sale')}</Link>
        <Link className="nmLink" href="/#new" data-no-vt="1" onClick={() => go('/#new')}>{t('New Arrivals')}</Link>
        <DrawerTree gender="women" label="Women" onNavigate={go} />
        <DrawerTree gender="men" label="Men" onNavigate={go} />
        <Link className="nmLink" href="/#women" data-no-vt="1" onClick={() => go('/#women')}>{t('Accessories')}</Link>
        <Link className="nmLink" href="/#new" data-no-vt="1" onClick={() => go('/#new')}>{t('Sale')}</Link>
        <a className="nmLink" href="#" onClick={e => { e.preventDefault(); close(); openAbout() }}>{t('About Us')}</a>
      </div>
    </div>
  )
}
