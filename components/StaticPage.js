import BackLink from './BackLink'

export default function StaticPage({ title, updated, children, footerLinks }) {
  return (
    <div className="staticPage">
      <header>
        <BackLink className="back"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></BackLink>
        <span className="spTitle">{title}</span>
        <a className="spHome" href="/">HEAVEN</a>
      </header>

      <main>
        <h1>{title}</h1>
        {updated && <p className="updated">{updated}</p>}
        {children}
      </main>

      <footer>© 2026 HEAVEN. All rights reserved. · {footerLinks}</footer>

      
    </div>
  )
}
