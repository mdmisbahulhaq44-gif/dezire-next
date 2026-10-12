'use client'

// "My Account" home: profile card + list of rows (icon, label, arrow).
const SHOP_PHONE = '8801877270165'

const ICONS = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  orders: 'M21 8l-9-5-9 5v8l9 5 9-5V8z M3 8l9 5 9-5 M12 13v8',
  heart: 'M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 21l7.1-6.7 1.7-1.7a5 5 0 0 0 0-7.1z',
  offers: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z M7.5 7.5h.01',
  gift: 'M20 12v9H4v-9 M2 7h20v5H2z M12 21V7 M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z',
  support: 'M4 14v-2a8 8 0 0 1 16 0v2 M4 14h3v5H5a1 1 0 0 1-1-1v-4z M20 14h-3v5h2a1 1 0 0 0 1-1v-4z M17 19c0 1.5-2 2-5 2',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M3 7l9 6 9-6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 8h.01',
  refund: 'M3 12a9 9 0 1 0 3-6.7 M3 4v5h5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z M9 12l2 2 4-4',
  doc: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z M14 3v5h5 M9 13h6 M9 17h6',
  lock: 'M6 11h12v9H6z M8 11V8a4 4 0 0 1 8 0v3',
  login: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  arrow: 'M9 6l6 6-6 6'
}

function Icon({ name, className = 'acIcon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

function Row({ icon, label, onClick }) {
  return (
    <button type="button" className="acRow" onClick={onClick}>
      <Icon name={icon} />
      <span>{label}</span>
      <Icon name="arrow" className="acArrow" />
    </button>
  )
}

export default function AccountMenu({ session, isAdmin, onLogin, onProfile, onSupport, onOrders, onLogout, go, openPanel, showToast }) {
  const name = session?.user?.user_metadata?.full_name || ''
  const email = session?.user?.email || ''
  const initial = (name || email || '').trim().charAt(0).toUpperCase()
  const avatarUrl = session?.user?.user_metadata?.avatar_url || ''

  return (
    <div>
      <div className="acProfile" role="button" style={{ cursor: 'pointer' }} onClick={session ? onProfile : onLogin}>
        <div className={`acAvatar${session ? ' on' : ''}`}>
          {session && avatarUrl ? <img className="acAvatarImg" src={avatarUrl} alt="" /> : session && initial ? initial : <Icon name="user" className="acAvatarIcon" />}
        </div>
        <div className="acWho">
          {session ? (
            <>
              <div className="acName">{name || 'My Account'}</div>
              <div className="acSub">{email}</div>
            </>
          ) : (
            <>
              <div className="acName">Account</div>
              <button type="button" className="acLoginLink" onClick={onLogin}>Login / Sign up</button>
            </>
          )}
        </div>
        {session && <Icon name="arrow" className="acArrow" />}
      </div>

      <div className="acGroup">
        <Row icon="orders" label="My Orders" onClick={onOrders} />
        <Row icon="heart" label="Wishlist" onClick={() => openPanel('wishlist')} />
        <Row icon="offers" label="Flash Sale / Offers" onClick={() => go('/flash-sale')} />
        <Row icon="gift" label="Refer & Earn" onClick={() => showToast('Refer & Earn is coming soon.')} />
      </div>
      <div className="acGroup">
        <Row icon="support" label="Support" onClick={onSupport} />
        <Row icon="mail" label="Contact Us" onClick={() => go('/contact')} />
        <Row icon="info" label="About Us" onClick={() => openPanel('about')} />
      </div>
      <div className="acGroup">
        <Row icon="refund" label="Return & Refund Policy" onClick={() => go('/refund-policy')} />
        <Row icon="shield" label="Privacy Policy" onClick={() => go('/privacy')} />
        <Row icon="doc" label="Terms & Conditions" onClick={() => go('/terms')} />
      </div>
      <div className="acGroup">
        {isAdmin && <Row icon="lock" label="Admin Panel" onClick={() => go('/admin')} />}
        {session
          ? <Row icon="logout" label="Logout" onClick={onLogout} />
          : <Row icon="login" label="Login" onClick={onLogin} />}
      </div>

      <div className="acFoot">© 2026 HEAVEN</div>
    </div>
  )
}
