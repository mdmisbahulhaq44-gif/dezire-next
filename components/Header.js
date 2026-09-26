export default function Header() {
  return (
    <nav className="topNav">
      <div className="navLeft">
        <button className="hamburgerBtn" aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="logo">DEZIRE</div>

      <div className="navRightIcons">
        <button className="iconbtn" aria-label="Search">⌕</button>
        <button className="iconbtn" aria-label="Wishlist">♡</button>
        <button className="iconbtn" aria-label="Cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"/>
            <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
          </svg>
          <span className="cartCount" style={{ display: "none" }}>0</span>
        </button>
      </div>
    </nav>
  )
}
