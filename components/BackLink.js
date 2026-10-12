'use client'

import { useRouter } from 'next/navigation'

export default function BackLink({ className, children }) {
  const router = useRouter()
  function onClick(e) {
    e.preventDefault()
    let sameSite = false
    try { sameSite = !!document.referrer && new URL(document.referrer).origin === window.location.origin } catch (err) {}
    const clientNav = (window.__dzNavs || 0) > 1
    if ((sameSite || clientNav) && window.history.length > 1) router.back()
    else router.push('/')
  }
  return <a className={className} href="/" onClick={onClick}>{children}</a>
}
