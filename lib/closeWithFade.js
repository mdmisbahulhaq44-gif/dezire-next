// Closes the product panel (router.back()) with the browser's native
// cross-fade. The fade waits until the panel has really left the page,
// with a hard cap so a slow network can never freeze the screen.
export function closeWithFade(router) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduced) {
    router.back()
    return
  }

  const start = location.pathname
  document.startViewTransition(() => new Promise(resolve => {
    router.back()
    const t0 = performance.now()
    let changedAt = 0
    const tick = () => {
      const now = performance.now()
      if (!changedAt && location.pathname !== start) changedAt = now
      const panelGone = !document.getElementById('productPanel')
      if (changedAt && (panelGone || now - changedAt > 150)) return resolve()
      if (now - t0 > 600) return resolve()
      setTimeout(tick, 16)
    }
    setTimeout(tick, 16)
  }))
}
