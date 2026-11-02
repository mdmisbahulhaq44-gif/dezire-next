'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { COUNTRIES, findCountry, flagOf, nationalDigits, validatePhone, phoneEmail } from '../lib/countries'

// Mobile-number sign-up / login for My Account. The existing email screens are passed in as children
// and stay exactly as they were; this only adds the "Mobile" side next to them.

const MODE_KEY = 'dz_auth_mode'

function readMode() {
  try { return localStorage.getItem(MODE_KEY) === 'email' ? 'email' : 'mobile' } catch (e) { return 'mobile' }
}

// keep the field being typed in visible above the keyboard, without a jump
function keepVisible(e) {
  const el = e.currentTarget
  setTimeout(() => { try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }) } catch (err) {} }, 300)
}

async function fnError(error) {
  try {
    if (error && error.context && typeof error.context.json === 'function') {
      const j = await error.context.json()
      if (j && j.error) return j.error
    }
  } catch (e) {}
  return 'Could not create account. Please try again.'
}

const CSS = `
.phTabs{display:flex;background:#f1efea;border-radius:14px;padding:3px;margin-bottom:14px}
.phTabs button{flex:1;border:0;background:transparent;border-radius:11px;padding:10px 0;font:inherit;font-size:13px;font-weight:600;color:#777;cursor:pointer;transition:background .2s,color .2s,box-shadow .2s}
.phTabs button.on{background:#fff;color:#111;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.phRow{display:flex;gap:8px;align-items:stretch}
.phCc{flex:0 0 auto;display:flex;align-items:center;gap:6px;padding:0 12px;border:1px solid #ddd;border-radius:14px;background:#fff;font:inherit;font-size:13px;color:#111;cursor:pointer;white-space:nowrap}
.phCc:active{background:#f6f6f6}
.phCc .fl{font-size:19px;line-height:1}
.phCc .ar{width:10px;height:10px;opacity:.5}
.phRow input{flex:1;min-width:0}
.phHint{font-size:11px;color:#c0392b;margin:-4px 2px 0}
.phPw{position:relative}
.phPw input{padding-right:62px}
.phPw button{position:absolute;right:6px;top:50%;transform:translateY(-50%);border:0;background:transparent;font:inherit;font-size:11px;font-weight:700;color:#666;padding:8px;cursor:pointer}
.phRefLink{align-self:flex-start;border:0;background:transparent;padding:2px 2px;font:inherit;font-size:12px;color:#111;text-decoration:underline;cursor:pointer}
.phRef{overflow:hidden;max-height:0;opacity:0;transition:max-height .28s ease,opacity .22s ease}
.phRef.open{max-height:64px;opacity:1}
.phRef input{padding:9px 14px;font-size:13px;letter-spacing:3px;text-transform:uppercase;border-radius:11px}
.phSheetBg{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.4);display:flex;align-items:flex-end;justify-content:center;animation:phFade .18s ease}
.phSheet{background:#fff;width:100%;max-width:520px;max-height:82vh;border-radius:20px 20px 0 0;display:flex;flex-direction:column;animation:phUp .24s cubic-bezier(.22,.61,.36,1)}
.phSheetHead{padding:14px 16px 8px;display:flex;align-items:center;gap:10px}
.phSheetHead b{font-size:15px;flex:1}
.phSheetHead button{border:0;background:transparent;font-size:22px;line-height:1;color:#666;padding:4px 8px;cursor:pointer}
.phSheet .phSearch{margin:0 16px 8px;padding:11px 14px;border:1px solid #ddd;border-radius:12px;font:inherit;font-size:14px;outline:none}
.phList{overflow:auto;-webkit-overflow-scrolling:touch;padding:0 6px 14px;overscroll-behavior:contain}
.phItem{display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;text-align:left;padding:12px 12px;font:inherit;font-size:14px;color:#111;border-radius:10px;cursor:pointer}
.phItem:active{background:#f4f4f4}
.phItem .fl{font-size:22px;line-height:1}
.phItem .nm{flex:1}
.phItem .dl{color:#777;font-size:13px}
@keyframes phFade{from{opacity:0}to{opacity:1}}
@keyframes phUp{from{transform:translateY(40px);opacity:.6}to{transform:none;opacity:1}}
`

function CountrySheet({ current, onPick, onClose }) {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const s = q.trim().toLowerCase().replace(/^\+/, '')
    if (!s) return COUNTRIES
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(s) || c.iso.toLowerCase() === s || c.dial.startsWith(s))
  }, [q])
  return (
    <div className="phSheetBg" onClick={onClose}>
      <div className="phSheet" onClick={e => e.stopPropagation()}>
        <div className="phSheetHead"><b>Select country</b><button type="button" aria-label="Close" onClick={onClose}>×</button></div>
        <input className="phSearch" placeholder="Search country or code" value={q} onChange={e => setQ(e.target.value)} enterKeyHint="search" autoComplete="off" />
        <div className="phList">
          {list.map(c => (
            <button type="button" key={c.iso} className="phItem" style={c.iso === current.iso ? { background: '#f4f4f4' } : null} onClick={() => onPick(c)}>
              <span className="fl">{flagOf(c.iso)}</span>
              <span className="nm">{c.name}</span>
              <span className="dl">+{c.dial}</span>
            </button>
          ))}
          {!list.length && <div style={{ padding: 20, textAlign: 'center', color: '#888', fontSize: 13 }}>No country found</div>}
        </div>
      </div>
    </div>
  )
}

function PhoneField({ country, setCountry, value, setValue, inputRef, onEnter, error }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="phRow">
        <button type="button" className="phCc" onClick={() => setOpen(true)} aria-label="Choose country">
          <span className="fl">{flagOf(country.iso)}</span>
          <span>+{country.dial}</span>
          <svg className="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          enterKeyHint="next"
          placeholder={country.iso === 'BD' ? '01XXXXXXXXX' : 'Mobile number'}
          value={value}
          maxLength={20}
          onFocus={keepVisible}
          onChange={e => setValue(e.target.value.replace(/[^\d\s-]/g, ''))}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onEnter && onEnter() } }}
        />
      </div>
      {error ? <div className="phHint">{error}</div> : null}
      {open && <CountrySheet current={country} onClose={() => setOpen(false)} onPick={c => { setCountry(c); setOpen(false) }} />}
    </>
  )
}

function PasswordField({ value, setValue, placeholder, inputRef, onEnter, autoComplete, enterKeyHint }) {
  const [show, setShow] = useState(false)
  return (
    <div className="phPw">
      <input
        ref={inputRef}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint || 'done'}
        value={value}
        onFocus={keepVisible}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter() } }}
      />
      <button type="button" onClick={() => setShow(s => !s)}>{show ? 'HIDE' : 'SHOW'}</button>
    </div>
  )
}

function useCountry() {
  const [country, setCountry] = useState(findCountry('BD'))
  return [country, setCountry]
}

function PhoneLogin({ showToast, onDone, onGoSignup }) {
  const [country, setCountry] = useCountry()
  const [num, setNum] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const pwRef = useRef(null)

  async function submit(e) {
    if (e && e.preventDefault) e.preventDefault()
    const bad = validatePhone(country, num)
    if (bad) { showToast(bad); return }
    if (!pw) { showToast('Please enter your password.'); return }
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email: phoneEmail(country, num), password: pw })
    setBusy(false)
    if (error) { showToast('Wrong mobile number or password.'); return }
    showToast('Welcome back!')
    onDone && onDone()
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <PhoneField country={country} setCountry={setCountry} value={num} setValue={setNum} onEnter={() => pwRef.current && pwRef.current.focus()} />
      <PasswordField value={pw} setValue={setPw} placeholder="Password" inputRef={pwRef} autoComplete="current-password" onEnter={submit} />
      <button className="btn" disabled={busy}>{busy ? 'LOGGING IN...' : 'LOGIN'}</button>
      <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 2 }}>Forgot your password? Please contact Support and we will help you.</p>
      <div style={{ textAlign: 'center', marginTop: 8, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,.08)' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Don&apos;t have an account?{' '}</span>
        <a href="#" onClick={e => { e.preventDefault(); onGoSignup && onGoSignup() }} style={{ fontSize: 12, color: '#111', fontWeight: 700, textDecoration: 'underline' }}>Create one</a>
      </div>
    </form>
  )
}

function PhoneSignup({ showToast, onDone, onGoLogin }) {
  const [name, setName] = useState('')
  const [country, setCountry] = useCountry()
  const [num, setNum] = useState('')
  const [pw, setPw] = useState('')
  const [ref, setRef] = useState(() => { try { const c = localStorage.getItem('dz_ref') || ''; return /^[A-Z0-9]{6}$/.test(c) ? c : '' } catch (e) { return '' } })
  const [refOpen, setRefOpen] = useState(() => { try { return /^[A-Z0-9]{6}$/.test(localStorage.getItem('dz_ref') || '') } catch (e) { return false } })
  const [busy, setBusy] = useState(false)
  const numRef = useRef(null)
  const pwRef = useRef(null)
  const refInput = useRef(null)

  function openRef() {
    setRefOpen(o => !o)
    setTimeout(() => { if (refInput.current) refInput.current.focus() }, 120)
  }

  async function submit(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (busy) return
    const nm = name.trim()
    if (nm.length < 2) { showToast('Please enter your name.'); return }
    const bad = validatePhone(country, num)
    if (bad) { showToast(bad); return }
    if (pw.length < 8 || !/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) { showToast('Password: at least 8 characters with a small letter, a CAPITAL letter and a number.'); return }
    const code = ref.trim().toUpperCase()
    if (code && !/^[A-Z0-9]{6}$/.test(code)) { showToast('A referral code has 6 letters/numbers.'); return }

    setBusy(true)
    const national = nationalDigits(num)
    const { error } = await supabase.functions.invoke('phone-signup', { body: { name: nm, dial: country.dial, national, password: pw } })
    if (error) {
      setBusy(false)
      showToast(await fnError(error))
      return
    }
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email: phoneEmail(country, num), password: pw })
    if (loginErr) {
      setBusy(false)
      showToast('Account created. Please log in.')
      onGoLogin && onGoLogin()
      return
    }
    let msg = 'Welcome to HEAVEN!'
    if (code) {
      try {
        const { data } = await supabase.rpc('register_referral', { p_code: code })
        if (data && data.ok) { msg = 'Welcome to HEAVEN! Referral code added.'; try { localStorage.removeItem('dz_ref') } catch (e) {} }
        else if (data && data.error) msg = 'Welcome to HEAVEN! (' + data.error + ')'
      } catch (err) {}
    }
    setBusy(false)
    showToast(msg)
    onDone && onDone()
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <input type="text" placeholder="Full name" autoComplete="name" enterKeyHint="next" value={name} onFocus={keepVisible} onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); numRef.current && numRef.current.focus() } }} />
      <PhoneField country={country} setCountry={setCountry} value={num} setValue={setNum} inputRef={numRef} onEnter={() => pwRef.current && pwRef.current.focus()} />
      <button type="button" className="phRefLink" onClick={openRef}>Have a referral code?</button>
      <div className={`phRef${refOpen ? ' open' : ''}`}>
        <input ref={refInput} type="text" placeholder="CODE" maxLength={6} autoComplete="off" autoCapitalize="characters" spellCheck={false} enterKeyHint="next" value={ref}
          onFocus={keepVisible} onChange={e => setRef(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); pwRef.current && pwRef.current.focus() } }} />
      </div>
      <PasswordField value={pw} setValue={setPw} placeholder="Create password (Aa + 1 number, min 8)" inputRef={pwRef} autoComplete="new-password" onEnter={submit} />
      <button className="btn" disabled={busy}>{busy ? 'CREATING...' : 'CREATE ACCOUNT'}</button>
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        <a href="#" onClick={e => { e.preventDefault(); onGoLogin && onGoLogin() }} style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}>Back to login</a>
      </div>
    </form>
  )
}

// kind: 'login' | 'signup'. children = the existing email form.
export default function AuthSwitch({ kind, children, showToast, onDone, onGoSignup, onGoLogin }) {
  const [mode, setMode] = useState('mobile')
  useEffect(() => {
    let hasRef = false
    try { hasRef = kind === 'signup' && /^[A-Z0-9]{6}$/.test(localStorage.getItem('dz_ref') || '') } catch (e) {}
    setMode(hasRef ? 'mobile' : readMode())
  }, [kind])
  function pick(m) {
    setMode(m)
    try { localStorage.setItem(MODE_KEY, m) } catch (e) {}
  }
  return (
    <div>
      <style>{CSS}</style>
      <div className="phTabs" role="tablist">
        <button type="button" className={mode === 'mobile' ? 'on' : ''} onClick={() => pick('mobile')}>Mobile number</button>
        <button type="button" className={mode === 'email' ? 'on' : ''} onClick={() => pick('email')}>Email</button>
      </div>
      {mode === 'mobile'
        ? (kind === 'login'
          ? <PhoneLogin showToast={showToast} onDone={onDone} onGoSignup={onGoSignup} />
          : <PhoneSignup showToast={showToast} onDone={onDone} onGoLogin={onGoLogin} />)
        : children}
    </div>
  )
}
