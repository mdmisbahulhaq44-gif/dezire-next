import BackLink from './BackLink'

export default function StaticPage({ title, updated, children, footerLinks }) {
  return (
    <div className="staticPage">
      <header>
        <a href="/">HEAVEN</a>
        <BackLink className="back">← Back</BackLink>
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
