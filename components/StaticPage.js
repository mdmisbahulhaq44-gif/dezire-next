export default function StaticPage({ title, updated, children, footerLinks }) {
  return (
    <div className="staticPage">
      <header>
        <a href="/">DEZIRE</a>
        <a className="back" href="/">← Back to shop</a>
      </header>

      <main>
        <h1>{title}</h1>
        {updated && <p className="updated">{updated}</p>}
        {children}
      </main>

      <footer>© 2026 DEZIRE. All rights reserved. · {footerLinks}</footer>

      
    </div>
  )
}
