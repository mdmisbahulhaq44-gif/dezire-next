'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const IGNORE = /ResizeObserver|Script error|Non-Error promise rejection/i

export default function ErrorReporter() {
  useEffect(() => {
    let sent = 0
    function send(msg) {
      msg = String(msg || '')
      if (!msg || IGNORE.test(msg) || sent >= 5) return
      sent++
      try {
        supabase.rpc('log_client_error', {
          p_message: msg.slice(0, 300),
          p_page: window.location.pathname,
          p_ua: navigator.userAgent
        }).then(() => {}, () => {})
      } catch (e) {}
    }
    function onErr(e) {
      send((e.message || 'error') + (e.filename ? ' @ ' + String(e.filename).split('/').pop() + ':' + e.lineno : ''))
    }
    function onRej(e) {
      const r = e && e.reason
      send('Unhandled: ' + (r && r.message ? r.message : String(r)))
    }
    let cspSent = 0
    function onCsp(e) {
      if (cspSent >= 8) return
      cspSent++
      const blocked = String(e.blockedURI || '').slice(0, 120)
      try {
        supabase.rpc('log_client_error', {
          p_message: ('CSP ' + e.effectiveDirective + ' blocked=' + (blocked || 'inline') + (e.disposition === 'report' ? ' [report-only]' : '')).slice(0, 300),
          p_page: window.location.pathname,
          p_ua: navigator.userAgent
        }).then(() => {}, () => {})
      } catch (err) {}
    }
    document.addEventListener('securitypolicyviolation', onCsp)
    window.addEventListener('error', onErr)
    window.addEventListener('unhandledrejection', onRej)
    return () => {
      document.removeEventListener('securitypolicyviolation', onCsp)
      window.removeEventListener('error', onErr)
      window.removeEventListener('unhandledrejection', onRej)
    }
  }, [])
  return null
}
