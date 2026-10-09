'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShop } from './ShopContext'
import { supabase } from '../lib/supabaseClient'

const ADMIN_EMAIL = "mdmisbahulhaq44@gmail.com"

function readableError(err) {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err
  if (err.message) return err.message
  try { return JSON.stringify(err) } catch (e) { return String(err) }
}

export default function AccountPanel() {
  const router = useRouter()
  const { activePanel, closePanel, showToast, openReset, openTrack } = useShop()
  const showAccount = activePanel === 'account'
  const showReset = activePanel === 'reset'

  const [view, setView] = useState('login')
  const [session, setSession] = useState(null)
  const [orders, setOrders] = useState(null)
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
      setView(data.session ? 'loggedIn' : 'login')
    })
  }, [showAccount])

  // loadAccountOrders
  useEffect(() => {
    if (!showAccount || !session) return
    setOrders(null)
    supabase
      .from('orders')
      .select('id,items,total_amount,status,created_at,product_id')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        setOrders(error || !data ? [] : data)
      })
  }, [showAccount, session])

  async function login(e) {
    e.preventDefault()
    const email = loginEmail.trim()
    const { error } = await supabase.auth.signInWithPassword({ email, password: loginPassword })
    if (error) {
      showToast('Login failed: ' + readableError(error))
      return
    }
    showToast('Welcome back!')
    closePanel()
    if (email.toLowerCase() === ADMIN_EMAIL) router.push('/admin')
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
    setView('signup2')
  }

  async function verifySignupOtp(e) {
    e.preventDefault()
    if (!pendingSignup) {
      showToast('Please start again — enter your email.')
      setView('signup1')
      return
    }
    const token = suOtp.trim()
    if (token.length !== 6) {
      showToast('Please enter the 6-digit code.')
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

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  return (
    <>
      <div className={`panel${showAccount ? ' show' : ''}`}>
        <div className="panelHead">
          <h2>My Account</h2>
          <button className="close" onClick={closePanel}>×</button>
        </div>

        {view === 'login' && (
          <form className="form" onSubmit={login}>
            <input type="email" placeholder="Email address" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            <input type="password" placeholder="Password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            <button className="btn">LOGIN</button>
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <a href="#" onClick={e => { e.preventDefault(); setView('forgot') }} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}>Forgot password?</a>
            </div>
            <div style={{ textAlign: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,.08)' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Don't have an account? </span>
              <a href="#" onClick={e => { e.preventDefault(); setView('signup1') }} style={{ fontSize: 12, color: '#111', fontWeight: 700, textDecoration: 'underline' }}>Create one</a>
            </div>
          </form>
        )}

        {view === 'signup1' && (
          <form className="form" onSubmit={sendSignupOtp}>
            <input type="text" placeholder="Full name" required value={suName} onChange={e => setSuName(e.target.value)} />
            <input type="email" placeholder="Email address" required value={suEmail} onChange={e => setSuEmail(e.target.value)} />
            <input type="tel" placeholder="Phone number (optional)" value={suPhone} onChange={e => setSuPhone(e.target.value)} />
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: -6 }}>We'll send a 6-digit code to your email to verify it's you — no password needed.</p>
            <button className="btn" disabled={busy}>{busy ? 'SENDING...' : 'SEND CODE'}</button>
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <a href="#" onClick={e => { e.preventDefault(); setView('login') }} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}>Back to login</a>
            </div>
          </form>
        )}

        {view === 'signup2' && (
          <form className="form" onSubmit={verifySignupOtp}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>Enter the 6-digit code we sent to</p>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{pendingSignup?.email}</p>
            <input type="text" placeholder="000000" inputMode="numeric" maxLength={6} required autoFocus value={suOtp} onChange={e => setSuOtp(e.target.value)} style={{ textAlign: 'center', letterSpacing: 8, fontSize: 20, fontWeight: 700 }} />
            <button className="btn" disabled={busy}>{busy ? 'VERIFYING...' : 'VERIFY & CREATE ACCOUNT'}</button>
            <div style={{ textAlign: 'center', marginTop: 14, display: 'flex', justifyContent: 'center', gap: 18 }}>
              <a href="#" onClick={e => { e.preventDefault(); sendSignupOtp(e) }} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}>Resend code</a>
              <a href="#" onClick={e => { e.preventDefault(); setView('signup1') }} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}>Change email</a>
            </div>
          </form>
        )}

        {view === 'forgot' && (
          <form className="form" onSubmit={e => e.preventDefault()}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Enter your account email and we'll send you a password reset link.</p>
            <input type="email" placeholder="Email address" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
            <button className="btn" type="button" onClick={sendPasswordReset}>SEND RESET LINK</button>
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <a href="#" onClick={e => { e.preventDefault(); setView('login') }} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}>Back to login</a>
            </div>
          </form>
        )}

        {view === 'loggedIn' && session && (
          <div>
            <div style={{ background: 'var(--cream)', borderRadius: 12, padding: 18, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{session.user.user_metadata?.full_name || 'My Account'}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{session.user.email}</div>
            </div>
            {isAdmin && (
              <button className="btn" style={{ width: '100%', marginBottom: 16 }} onClick={() => { closePanel(); router.push('/admin') }}>ADMIN PANEL</button>
            )}

            <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--muted)', marginBottom: 12 }}>MY ORDERS</div>
            <div>
              {orders === null ? (
                <div className="empty" style={{ padding: '30px 10px' }}>Loading...</div>
              ) : orders.length === 0 ? (
                <div className="empty" style={{ padding: '30px 10px' }}>No orders yet.</div>
              ) : (
                orders.map(o => (
                  <div key={o.id} onClick={() => { closePanel(); if (openTrack) openTrack() }} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14, marginBottom: 10, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
                      <span>#{o.id}</span><span>{o.status}</span>
                    </div>
                    <div style={{ fontSize: 13, margin: '6px 0' }}>{o.items || ''}</div>
                    <div style={{ fontWeight: 700 }}>৳{Number(o.total_amount || 0).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>

            <button className="btn light" style={{ width: '100%', marginTop: 20 }} onClick={logout}>LOGOUT</button>
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
