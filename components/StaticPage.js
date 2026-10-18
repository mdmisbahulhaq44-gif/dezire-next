import BackLink from './BackLink'
import Link from 'next/link'
import T from './T'

export default function StaticPage({ title, updated, children, footerLinks }) {
  return (
    <div className="staticPage">
      <header>
        <BackLink className="back"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></BackLink>
        <span className="spTitle"><T>{title}</T></span>
        <Link className="spHome" href="/" prefetch={false}>HEAVEN</Link>
      </header>

      <main>
        <h1><T>{title}</T></h1>
        {updated && <p className="updated"><T>{updated}</T></p>}
        {children}
      </main>

      <footer><T>{'© 2026 HEAVEN. All rights reserved. ·'}</T> {footerLinks}</footer>

      
    </div>
  )
}
