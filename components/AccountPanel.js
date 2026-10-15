'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cldOpt } from '../lib/cloudinary'
import { NO_NAV_ROUTES } from '../lib/noNavRoutes'
import { useShop } from './ShopContext'
import { supabase } from '../lib/supabaseClient'
import OtpBoxes from './OtpBoxes'
import AccountMenu from './AccountMenu'
import { ProfileView, EditProfile } from './ProfileView'
import AccountSupport from './AccountSupport'

const ADMIN_EMAIL = "mdmisbahulhaq44@gmail.com"

// Product info for the order photos is kept here so My Orders shows photos at once on reopen
let ORDER_PRODS = {}

// Photo that fades in softly once it has loaded (no grey box, no pop-in)
function FadeImg({ src, alt }) {
  const [on, setOn] = useState(false)
  const ref = useRef(null)
  useEffect(() => { if (ref.current && ref.current.complete && ref.current.naturalWidth) setOn(true) }, [])
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setOn(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: on ? 1 : 0, transform: on ? 'scale(1)' : 'scale(1.06)', transition: 'opacity .4s ease, transform .5s cubic-bezier(.22,.61,.36,1)' }}
    />
  )
}

function readableError(err) {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err
  if (err.message) return err.message
  try { return JSON.stringify(err) } catch (e) { return String(err) }
}

// the page / menu that appears gets a slow soft fade-in (the old one is already gone, so no text overlaps)
function softIn() {
  const r = document.documentElement
  r.setAttribute('data-acin', '1')
  clearTimeout(window.__dzAcin)
  window.__dzAcin = setTimeout(() => r.removeAttribute('data-acin'), 900)
}

export default function AccountPanel() {
  const router = useRouter()
  const pathname = usePathname()
  const navTo = useRef(null)
  const { activePanel, closePanel, hidePanel, showToast, openReset, openTrack, openWishlist, openAbout, openSearch, openCart, cartCount, fadeSwap } = useShop()
  const showAccount = activePanel === 'account'
  const showReset = activePanel === 'reset'

  // Page opened from a menu row: My Account keeps covering the screen until the new page is ready, then hides at once
  useEffect(() => {
    if (navTo.current && pathname === navTo.current) {
      navTo.current = null
      // product opened from My Orders: stay under the product fade, then hide just before the preview goes
      const wait = window.__dzAcHold ? Math.max(0, window.__dzAcHold - performance.now()) : 0
      window.__dzAcHold = 0
      if (wait > 0) setTimeout(() => hidePanel(true, true), wait)
      { softIn(); hidePanel(true, true) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const [view, setView] = useState('menu')

  // Back from a page opened out of My Account (Contact, Privacy, Flash Sale ...) must land on My Account again,
  // even if the browser lost the saved panel state on the way
  const lastPop = useRef(0)
  const apRef = useRef(activePanel)
  apRef.current = activePanel
  useEffect(() => {
    const f = () => { lastPop.current = Date.now() }
    window.addEventListener('popstate', f, true)
    return () => window.removeEventListener('popstate', f, true)
  }, [])
  useEffect(() => {
    const r = window.__dzRet
    if (!r) return
    if (pathname === r.from && Date.now() - lastPop.current < 1500) {
      window.__dzRet = null
      setTimeout(() => {
        if (apRef.current) return
        const st = window.history.state || {}
        const ns = { ...st, dzPanel: 'account', dzView: 'menu', dzDepth: 1 }
        window.history.replaceState(ns, '')
        const ev = new Event('dzrestore')
        ev.state = ns
        window.dispatchEvent(ev)
      }, 150)
    } else if (pathname !== r.to && pathname !== r.from) {
      window.__dzRet = null
    }
  }, [pathname])

  // Load the pages behind the menu rows in the background as soon as the site has settled (not only when My Account opens)
  useEffect(() => {
    const run = () => ['/refund-policy', '/privacy', '/terms', '/contact', '/flash-sale'].forEach(p => { try { router.prefetch(p) } catch (e) {} })
    const id = window.requestIdleCallback ? window.requestIdleCallback(run, { timeout: 4000 }) : setTimeout(run, 2500)
    return () => { if (window.cancelIdleCallback && window.requestIdleCallback) window.cancelIdleCallback(id); else clearTimeout(id) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Warm up the pages behind the menu rows so they open at once, even on a slow connection
  useEffect(() => {
    if (!showAccount) return
    ;['/refund-policy', '/privacy', '/terms', '/contact', '/flash-sale'].forEach(p => { try { router.prefetch(p) } catch (e) {} })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAccount])

  // My Account home keeps the shop's bottom bar visible (like a native app tab); inner pages hide it
  const [realHeader, setRealHeader] = useState(false)
  useLayoutEffect(() => {
    const root = document.documentElement
    if (showAccount && view === 'menu') {
      // the shop's own top bar stays visible above My Account (same header as the home page)
      const nav = document.querySelector('nav')
      const r = nav ? nav.getBoundingClientRect() : null
      const ok = !!r && r.height > 0 && r.top > -20 && r.top < 100
      root.style.setProperty('--acTop', ok ? Math.round(r.bottom) + 'px' : (NO_NAV_ROUTES.includes(pathname) || window.__dzRet ? '46px' : '0px'))
      if (ok) root.setAttribute('data-achead', '1')
      setRealHeader(ok)
      root.setAttribute('data-acmenu', '1')
    } else {
      root.removeAttribute('data-acmenu')
      root.removeAttribute('data-achead')
    }
    return () => { root.removeAttribute('data-acmenu'); root.removeAttribute('data-achead') }
  }, [showAccount, view, pathname])
  // product opened from My Orders: if the visitor leaves the product by a forward link (not Back), My Orders steps aside
  useEffect(() => {
    const root = document.documentElement
    if (!root.hasAttribute('data-acprod') || pathname.startsWith('/product/')) return
    root.removeAttribute('data-acprod')
    if (Date.now() - lastPop.current > 1500 && apRef.current) hidePanel(true, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
  const [session, setSession] = useState(null)
  const [orders, setOrders] = useState(null)
  const [orderQ, setOrderQ] = useState('')
  const [orderProds, setOrderProds] = useState(ORDER_PRODS)
  const ordersUid = useRef(null)
  const [busy, setBusy] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPhone, setSuPhone] = useState('')
  const [suOtp, setSuOtp] = useState('')
  const [pendingSignup, setPendingSignup] = useState(null)
  const [forgotEmail, setForgotEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')

  // keep session in sync + open reset panel when coming from the email link
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null))
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s || null)
      if (event === 'PASSWORD_RECOVERY') openReset()
    })
    return () => sub.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // refreshAccountView: runs whenever the account panel opens
  useEffect(() => {
    if (!showAccount) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null)
      setView((window.history.state && window.history.state.dzView) || 'menu')
    })
  }, [showAccount])

  // loadAccountOrders
  useEffect(() => {
    if (!showAccount || !session) return
    if (ordersUid.current !== session.user.id) setOrders(null)
    supabase
      .from('orders')
      .select('id,items,total_amount,status,created_at,product_id')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        const list = error || !data ? [] : data
        setOrders(list)
        ordersUid.current = session.user.id
        // photos of the ordered products (same public products table the shop uses)
        const ids = [...new Set(list.map(o => o.product_id).filter(Boolean))]
        if (!ids.length) return
        supabase.from('products').select('id,name,price,old,imgs').in('id', ids).then(({ data: ps }) => {
          const map = {}
          ;(ps || []).forEach(p => {
            map[p.id] = { id: p.id, name: p.name, price: p.price, old: p.old || null, img: (p.imgs || '').split(',')[0].trim(), all: p.imgs || '' }
          })
          ORDER_PRODS = { ...ORDER_PRODS, ...map }
          setOrderProds(ORDER_PRODS)
        })
      })
  }, [showAccount, session])

  // Views inside My Account (orders, profile, login ...) are history entries too
  useEffect(() => {
    function onPop(e) {
      const st = e.state
      if (st && st.dzPanel === 'account') { if (apRef.current === 'account') swapView(st.dzView || 'menu'); else setView(st.dzView || 'menu') }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // inside My Account the screens change at once (no cross-fade of old over new); the new one fades in slowly and softly
  const [fadeTick, setFadeTick] = useState(0)
  function swapView(v) { setView(v); setFadeTick(t => t + 1) }
  useEffect(() => { if (!showAccount) setFadeTick(0) }, [showAccount])

  function navView(v) {
    if (v === view) return
    const st = window.history.state || {}
    window.history.pushState({ ...st, dzPanel: 'account', dzView: v, dzDepth: (st.dzDepth || 0) + 1 }, '')
    swapView(v)
  }

  function backView(fallback) {
    const st = window.history.state || {}
    if ((st.dzDepth || 0) > 1 && st.dzView) window.history.back()
    else swapView(fallback)
  }

  async function login(e) {
    e.preventDefault()
    const email = loginEmail.trim()
    const { error } = await supabase.auth.signInWithPassword({ email, password: loginPassword })
    if (error) {
      showToast('Login failed: ' + readableError(error))
      return
    }
    showToast('Welcome back!')
    if (email.toLowerCase() === ADMIN_EMAIL) { hidePanel(); router.push('/admin') } else closePanel()
  }

  async function sendSignupOtp(e) {
    if (e && e.preventDefault) e.preventDefault()
    const name = (pendingSignup && view === 'signup2') ? pendingSignup.name : suName.trim()
    const email = (pendingSignup && view === 'signup2') ? pendingSignup.email : suEmail.trim()
    const phone = (pendingSignup && view === 'signup2') ? pendingSignup.phone : suPhone.trim()

    if (!name || !email) {
      showToast('Please enter your name and email.')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, data: { full_name: name, phone: phone } }
    })
    setBusy(false)

    if (error) {
      showToast('Could not send code: ' + readableError(error))
      return
    }

    setPendingSignup({ name, email, phone })
    showToast('Code sent! Check your email.')
    setSuOtp('')
    navView('signup2')
  }

  async function verifySignupOtp(e) {
    e.preventDefault()
    if (!pendingSignup) {
      showToast('Please start again — enter your email.')
      setView('signup1')
      return
    }
    const token = suOtp.trim()
    if (token.length < 6 || token.length > 10) {
      showToast('Please enter the code from your email.')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.verifyOtp({
      email: pendingSignup.email,
      token,
      type: 'email'
    })
    setBusy(false)

    if (error) {
      showToast('Incorrect or expired code: ' + readableError(error))
      return
    }

    // Make sure name/phone are saved even if the account already existed
    await supabase.auth.updateUser({ data: { full_name: pendingSignup.name, phone: pendingSignup.phone } })

    showToast('Welcome to HEAVEN!')
    setPendingSignup(null)
    closePanel()
  }

  async function sendPasswordReset() {
    const email = forgotEmail.trim()
    if (!email) {
      showToast('Please enter your email address.')
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    })
    if (error) {
      showToast('Could not send reset link: ' + readableError(error))
      return
    }
    showToast('Reset link sent! Check your email.')
    setView('login')
  }

  async function submitNewPassword(e) {
    e.preventDefault()
    if (newPassword !== newPassword2) {
      showToast('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      showToast('Password should be at least 6 characters.')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      showToast('Could not update password: ' + readableError(error))
      return
    }
    showToast("Password updated! You're logged in.")
    setNewPassword('')
    setNewPassword2('')
    closePanel()
  }

  async function logout() {
    await supabase.auth.signOut()
    showToast('Logged out.')
    closePanel()
  }

  // Photo of the ordered product; tapping it opens the product instantly (ProductPreview picks up data-preview)
  function orderThumb(o) {
    const p = o.product_id ? orderProds[o.product_id] : null
    const box = { width: 64, height: 78, borderRadius: 10, overflow: 'hidden', flexShrink: 0, display: 'block', position: 'relative' }
    if (!p || !p.img) return <div style={box} />
    return (
      <Link
        href={'/product/' + p.id}
        style={box}
        aria-label={p.name}
        data-preview={JSON.stringify({ id: p.id, name: p.name, price: p.price, old: p.old, img: p.img, all: p.all || '' })}
        data-hold="400"
        onClick={e => {
          e.stopPropagation()
          // My Orders stays in place under the product, so closing the product shows it again at once (Home is never seen)
          window.__dzFromAccount = '/product/' + p.id
          document.documentElement.setAttribute('data-acprod', '1')
        }}
      >
        <FadeImg src={cldOpt(p.img, 500)} alt={p.name} />
      </Link>
    )
  }

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  return (
    <>
      <div className={`panel${showAccount ? ' show' : ''}${showAccount && view === 'menu' ? ' acMenuOn' : ''}${fadeTick ? (fadeTick % 2 ? ' acFadeA' : ' acFadeB') : ''}`}>
        {(view !== 'menu' || !realHeader) && (
          <div className="panelHead acHead">
            {view !== 'menu' && (
              <button type="button" className="acBackBtn" aria-label="Back" onClick={() => backView({ login: 'menu', signup1: 'login', signup2: 'signup1', forgot: 'login', orders: 'menu', profile: 'menu', editProfile: 'profile', support: 'menu' }[view] || 'menu')}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
              </button>
            )}
            {view === 'menu'
              ? <div className="acBrand">HEAVEN</div>
              : <h2 className="acTitle">{({ login: 'Login', signup1: 'Create Account', signup2: 'Verify Email', forgot: 'Reset Password', orders: 'My Orders', profile: 'Profile', editProfile: 'Update Profile', support: 'Support' })[view] || 'My Account'}</h2>}
            <div className="acHeadIcons">
              {view !== 'menu' && (
                <button type="button" className="acHeadBtn" aria-label="Search" onClick={() => { closePanel(); openSearch() }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                </button>
              )}
              <button type="button" className="acHeadBtn" aria-label="Cart" onClick={() => openCart()}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11h10.2L20 8H6.2" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" /></svg>
                {cartCount > 0 && <span className="acBadge">{cartCount}</span>}
              </button>
            </div>
          </div>
        )}

        {view === 'menu' && (
          <AccountMenu
            session={session}
            isAdmin={isAdmin}
            onLogin={() => navView('login')}
            onProfile={() => navView('profile')}
            onSupport={() => navView('support')}
            onOrders={() => { if (session) navView('orders'); else { closePanel(); if (openTrack) openTrack() } }}
            onLogout={logout}
            go={path => { const target = path.split('?')[0]; navTo.current = target; window.__dzFromAccount = target; window.__dzRet = { from: pathname, to: target }; document.documentElement.setAttribute('data-nav', '1'); router.push(path); setTimeout(() => { if (navTo.current === target) window.location.assign(path) }, 4000) }}
            openPanel={name => { if (name === 'wishlist' && openWishlist) openWishlist(); if (name === 'about' && openAbout) openAbout() }}
            showToast={showToast}
          />
        )}

        {view === 'login' && (
          <form className="form" onSubmit={login}>
            <input type="email" placeholder="Email address" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            <input type="password" placeholder="Password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            <button className="btn">LOGIN</button>
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <a href="#" onClick={e => { e.preventDefault(); navView('forgot') }} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}>Forgot password?</a>
            </div>
            <div style={{ textAlign: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,.08)' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Don't have an account? </span>
              <a href="#" onClick={e => { e.preventDefault(); navView('signup1') }} style={{ fontSize: 12, color: '#111', fontWeight: 700, textDecoration: 'underline' }}>Create one</a>
            </div>
          </form>
        )}

        {view === 'signup1' && (
          <form className="form" onSubmit={sendSignupOtp}>
            <input type="text" placeholder="Full name" required value={suName} onChange={e => setSuName(e.target.value)} />
            <input type="email" placeholder="Email address" required value={suEmail} onChange={e => setSuEmail(e.target.value)} />
            <input type="tel" placeholder="Phone number (optional)" value={suPhone} onChange={e => setSuPhone(e.target.value)} />
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: -6 }}>We'll send a verification code to your email to verify it's you — no password needed.</p>
            <button className="btn" disabled={busy}>{busy ? 'SENDING...' : 'SEND CODE'}</button>
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <a href="#" onClick={e => { e.preventDefault(); backView('login') }} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}>Back to login</a>
            </div>
          </form>
        )}

        {view === 'signup2' && (
          <form className="form" onSubmit={verifySignupOtp}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>Enter the code we sent to</p>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{pendingSignup?.email}</p>
            <OtpBoxes value={suOtp} onChange={setSuOtp} />
            <button className="btn" disabled={busy}>{busy ? 'VERIFYING...' : 'VERIFY & CREATE ACCOUNT'}</button>
            <div style={{ textAlign: 'center', marginTop: 14, display: 'flex', justifyContent: 'center', gap: 18 }}>
              <a href="#" onClick={e => { e.preventDefault(); sendSignupOtp(e) }} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>Resend code</a>
              <a href="#" onClick={e => { e.preventDefault(); setView('signup1') }} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>Change email</a>
            </div>
          </form>
        )}

        {view === 'forgot' && (
          <form className="form" onSubmit={e => e.preventDefault()}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Enter your account email and we'll send you a password reset link.</p>
            <input type="email" placeholder="Email address" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
            <button className="btn" type="button" onClick={sendPasswordReset}>SEND RESET LINK</button>
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <a href="#" onClick={e => { e.preventDefault(); backView('login') }} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}>Back to login</a>
            </div>
          </form>
        )}

        {view === 'support' && <AccountSupport />}
        {view === 'profile' && session && <ProfileView session={session} showToast={showToast} onEdit={() => navView('editProfile')} />}
        {view === 'editProfile' && session && <EditProfile session={session} showToast={showToast} onDone={() => backView('profile')} />}

        {view === 'orders' && session && (
          <div>
            <div className="acSearch">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
              <input type="search" placeholder="Search your orders" value={orderQ} onChange={e => setOrderQ(e.target.value)} />
            </div>
            <div>
              {orders === null ? (
                <div className="empty" style={{ padding: '30px 10px' }}>Loading...</div>
              ) : orders.length === 0 ? (
                <div className="empty" style={{ padding: '30px 10px' }}>No orders yet.</div>
              ) : orders.filter(o => !orderQ.trim() || ((o.items || '') + ' #' + o.id + ' ' + (o.status || '')).toLowerCase().includes(orderQ.trim().toLowerCase())).length === 0 ? (
                <div className="empty" style={{ padding: '30px 10px' }}>No orders match "{orderQ.trim()}"</div>
              ) : (
                orders.filter(o => !orderQ.trim() || ((o.items || '') + ' #' + o.id + ' ' + (o.status || '')).toLowerCase().includes(orderQ.trim().toLowerCase())).map(o => (
                  <div key={o.id} className="acOrder" onClick={() => { closePanel(); if (openTrack) openTrack() }}>
                    <div className="acOrderTop" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {orderThumb(o)}
                      <div className="acOrderInfo" style={{ flex: 1, minWidth: 0 }}>
                        <div className="acOrderId">Order #{o.id}</div>
                        <div className="acOrderItems">{o.items || ''}</div>
                      </div>
                      <div className="acOrderSide" style={{ flexShrink: 0 }}>
                        <span className="acStatus">{o.status}</span>
                        <div className="acOrderTotal">৳{Number(o.total_amount || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    {o.created_at && (
                      <div className="acOrderDate">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18 M8 3v4 M16 3v4" /></svg>
                        <span>Ordered on {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <button className="btn light" style={{ width: '100%', marginTop: 12 }} onClick={() => { closePanel(); if (openTrack) openTrack() }}>TRACK AN ORDER</button>
          </div>
        )}
      </div>

      {/* RESET PASSWORD (opened automatically from email reset link) */}
      <div className={`panel${showReset ? ' show' : ''}`}>
        <div className="panelHead">
          <h2>Set New Password</h2>
          <button className="close" onClick={closePanel}>×</button>
        </div>
        <form className="form" onSubmit={submitNewPassword}>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Choose a new password for your account.</p>
          <input type="password" placeholder="New password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <input type="password" placeholder="Confirm new password" required value={newPassword2} onChange={e => setNewPassword2(e.target.value)} />
          <button className="btn">UPDATE PASSWORD</button>
        </form>
      </div>
    </>
  )
}
