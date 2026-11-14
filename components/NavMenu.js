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
  return (
    <div className={'navMenu' + (drawerOpen ? ' show' : '')} aria-hidden={!drawerOpen}>
      <div className="nmInner">
        <Link className={cls('/')} href="/" onClick={close}>{t('Home')}</Link>
        <Link className={cls('/flash-sale')} href="/flash-sale" onClick={close}>{t('Flash Sale')}</Link>
        <Link className="nmLink" href="/#new" onClick={close}>{t('New Arrivals')}</Link>
        <DrawerTree gender="women" label="Women" onNavigate={close} />
        <DrawerTree gender="men" label="Men" onNavigate={close} />
        <Link className="nmLink" href="/#women" onClick={close}>{t('Accessories')}</Link>
        <Link className="nmLink" href="/#new" onClick={close}>{t('Sale')}</Link>
        <a className="nmLink" href="#" onClick={e => { e.preventDefault(); close(); openAbout() }}>{t('About Us')}</a>
      </div>
    </div>
  )
}
