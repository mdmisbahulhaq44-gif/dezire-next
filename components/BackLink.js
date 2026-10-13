'use client'

import { useRouter } from 'next/navigation'

export default function BackLink({ className, children }) {
  const router = useRouter()
  function onClick(e) {
    e.preventDefault()
    let sameSite = false
    try { sameSite = !!document.referrer && new URL(document.referrer).origin === window.location.origin } catch (err) {}
    const fromAccount = window.__dzFromAccount === window.location.pathname
    if ((sameSite || fromAccount) && window.history.length > 1) router.back()
    else router.push('/')
  }
  return <a className={className} href="/" onClick={onClick} aria-label="Back">{children}</a>
}
