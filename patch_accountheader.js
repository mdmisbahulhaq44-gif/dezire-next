// Fixes the header flash/jerk ("jhakuni") every time you leave a My Account sub-page
// (Support, My Orders, Return & Refund Policy, etc.) and land back on the Account menu.
// Root cause: AccountPanel.js's measure() function (changed in the "Category pages: header
// like the product page" commit) now force-sets the data-achead attribute on <html> BEFORE
// measuring, on every single re-measure call -- not just when actually needed for a
// category-page header. On an ordinary page this instantly flips the header's background
// from the blurred/translucent look to solid white (and bumps its z-index), then settles --
// a one-frame flash every time the Account menu re-measures (which happens every time you
// come back to it). This patch only does that pin-before-measure trick when it is truly
// needed (a scrolled-away nav.navShop header that isn't already pinned), so a normal page's
// header is never touched for nothing. Idempotent: safe to run more than once.
const fs = require('fs')
const path = require('path')

function patchFile(file, edits) {
  let src = fs.readFileSync(file, 'utf8')
  let changed = false
  for (const { tag, old, next } of edits) {
    if (src.includes(tag)) continue // already applied
    if (!src.includes(old)) { console.error(`[${path.basename(file)}] pattern not found for "${tag}" — aborting, no changes made.`); process.exit(1) }
    src = src.replace(old, next)
    changed = true
  }
  if (changed) { fs.writeFileSync(file, src); console.log(`Patched ${path.basename(file)}`) }
  else console.log(`${path.basename(file)} already patched, skipping.`)
}

patchFile(path.join(__dirname, 'components', 'AccountPanel.js'), [
  {
    tag: "nav.classList.contains('navShop')",
    old: `    const measure = first => {
      if (!first && document.visibilityState !== 'visible') return
      const had = root.hasAttribute('data-achead')
      root.setAttribute('data-achead', '1') // a header that scrolls away (category pages) sticks to the top while it is measured
      const nav = document.querySelector('nav')
      const r = nav ? nav.getBoundingClientRect() : null
      const ok = !!r && r.height > 0 && r.top > -20 && r.top < 100
      if (!first && !ok) { if (!had) root.removeAttribute('data-achead'); return }
      root.style.setProperty('--acTop', ok ? Math.round(r.bottom) + 'px' : (NO_NAV_ROUTES.includes(pathname) || window.__dzRet ? '46px' : '0px'))
      if (ok) root.setAttribute('data-achead', '1')
      else root.removeAttribute('data-achead')
      setRealHeader(ok)
    }`,
    next: `    const measure = first => {
      if (!first && document.visibilityState !== 'visible') return
      const nav = document.querySelector('nav')
      let r = nav ? nav.getBoundingClientRect() : null
      let ok = !!r && r.height > 0 && r.top > -20 && r.top < 100
      // A category-page header (nav.navShop) scrolls away with the page by design, so it can
      // measure as "not there" even though it really is — pin it just long enough to read its
      // real height. Only do this when it's actually needed and wasn't pinned already, so a
      // normal page's header — already sticky, already measuring fine — is never touched and
      // never flashes its background/z-index on every re-measure for nothing.
      if (!ok && nav && nav.classList.contains('navShop') && !root.hasAttribute('data-achead')) {
        root.setAttribute('data-achead', '1')
        r = nav.getBoundingClientRect()
        ok = !!r && r.height > 0 && r.top > -20 && r.top < 100
        if (!ok) root.removeAttribute('data-achead')
      }
      if (!first && !ok) return
      root.style.setProperty('--acTop', ok ? Math.round(r.bottom) + 'px' : (NO_NAV_ROUTES.includes(pathname) || window.__dzRet ? '46px' : '0px'))
      if (ok) root.setAttribute('data-achead', '1')
      else root.removeAttribute('data-achead')
      setRealHeader(ok)
    }`
  }
])
