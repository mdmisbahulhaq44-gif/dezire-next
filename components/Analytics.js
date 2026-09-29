'use client'

import { useEffect } from 'react'

// Google Analytics + Meta (Facebook) Pixel — deferred, same as the original
// site: only loaded on the first sign of real engagement (scroll, touch,
// pointer move, key press) or after a short idle fallback, so it never
// competes with real page content for the main thread on first paint.
export default function Analytics() {
  useEffect(() => {
    function loadAnalyticsAndPixel() {
      if (window.__analyticsLoaded) return
      window.__analyticsLoaded = true

      const ga = document.createElement('script')
      ga.async = true
      ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-X8PZ8E98GH'
      document.head.appendChild(ga)
      window.dataLayer = window.dataLayer || []
      window.gtag = function () { window.dataLayer.push(arguments) }
      window.gtag('js', new Date())
      window.gtag('config', 'G-X8PZ8E98GH')

      ;(function (f, b, e, v, n, t, s) {
        if (f.fbq) return
        n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }
        if (!f._fbq) f._fbq = n
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []
        t = b.createElement(e); t.async = true; t.src = v
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
      window.fbq('init', '2395583730972279')
      window.fbq('track', 'PageView')
    }

    const events = ['scroll', 'touchstart', 'mousemove', 'keydown']
    events.forEach(evt => window.addEventListener(evt, loadAnalyticsAndPixel, { passive: true, once: true }))
    const timer = setTimeout(loadAnalyticsAndPixel, 3500)

    return () => {
      events.forEach(evt => window.removeEventListener(evt, loadAnalyticsAndPixel))
      clearTimeout(timer)
    }
  }, [])

  return null
}
