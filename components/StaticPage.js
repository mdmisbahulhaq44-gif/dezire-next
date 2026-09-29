'use client'

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

      <style jsx>{`
        .staticPage {
          --black: #111;
          --white: #fff;
          --cream: #faf9f6;
          --line: #e9e7e2;
          --muted: #777;
          --gold: #b89545;
          font-family: Jost, Arial, sans-serif;
          color: var(--black);
          background: var(--cream);
          line-height: 1.7;
          min-height: 100vh;
        }
        header {
          padding: 18px 6%;
          background: var(--black);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        header a {
          color: var(--white);
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 3px;
          font-size: 18px;
        }
        header .back {
          font-size: 12px;
          letter-spacing: 1px;
          color: #ccc;
          font-weight: 400;
        }
        main {
          max-width: 760px;
          margin: 0 auto;
          padding: 40px 6% 80px;
        }
        main :global(h1) {
          font-size: 26px;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        main :global(.updated) {
          color: var(--muted);
          font-size: 12px;
          margin-bottom: 32px;
        }
        main :global(.sub) {
          color: var(--muted);
          font-size: 14px;
          margin-bottom: 32px;
        }
        main :global(h2) {
          font-size: 16px;
          margin: 32px 0 10px;
          color: var(--black);
          border-left: 3px solid var(--gold);
          padding-left: 10px;
        }
        main :global(p),
        main :global(li) {
          font-size: 14.5px;
          color: #333;
          margin-bottom: 10px;
        }
        main :global(ul) {
          padding-left: 20px;
          margin-bottom: 10px;
        }
        main :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 14px 0;
          font-size: 14px;
        }
        main :global(td),
        main :global(th) {
          border: 1px solid var(--line);
          padding: 8px 12px;
          text-align: left;
        }
        main :global(th) {
          background: #f1efe9;
        }
        main :global(a) {
          color: var(--gold);
        }
        main :global(.highlight) {
          background: #fff;
          border: 1px solid var(--line);
          border-left: 4px solid var(--gold);
          padding: 16px 18px;
          margin: 20px 0;
          border-radius: 4px;
        }
        main :global(.highlight strong) {
          color: var(--black);
        }
        main :global(.addr) {
          margin-top: 32px;
          padding: 20px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 8px;
        }
        main :global(.addr h2) {
          font-size: 14px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
          border-left: none;
          padding-left: 0;
        }
        main :global(.cards) {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 600px) {
          main :global(.cards) {
            grid-template-columns: 1fr 1fr;
          }
        }
        main :global(.card) {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 20px;
          text-decoration: none;
          color: var(--black);
          display: flex;
          gap: 14px;
          align-items: center;
        }
        main :global(.card .icon) {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--gold);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        main :global(.card .label) {
          font-size: 12px;
          letter-spacing: 1px;
          color: var(--muted);
          text-transform: uppercase;
        }
        main :global(.card .value) {
          font-size: 15px;
          font-weight: 600;
        }
        footer {
          text-align: center;
          padding: 30px 6%;
          color: var(--muted);
          font-size: 12px;
          border-top: 1px solid var(--line);
        }
        footer :global(a) {
          color: var(--gold);
        }
      `}</style>
    </div>
  )
}
