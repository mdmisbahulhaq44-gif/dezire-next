'use client'

import { useShop } from './ShopContext'

export default function AboutUsPanel() {
  const { activePanel, closePanel, cartCount, openCart, openSearch, t } = useShop()
  const show = activePanel === 'about'

  return (
    <div className={`panel${show ? ' show' : ''}`}>
      <div className="panelHead acHead">
        <button type="button" className="acBackBtn" aria-label="Back" onClick={() => { const st = window.history.state || {}; if (st.dzDepth > 0) window.history.back(); else closePanel() }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <h2 className="acTitle">{t("About Us")}</h2>
        <div className="acHeadIcons">
          <button type="button" className="acHeadBtn" aria-label="Search" onClick={() => { closePanel(); openSearch() }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          </button>
          <button type="button" className="acHeadBtn" aria-label="Cart" onClick={() => openCart()}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11h10.2L20 8H6.2" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" /></svg>
            {cartCount > 0 && <span className="acBadge">{cartCount}</span>}
          </button>
        </div>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.9, color: '#444' }}>
        <p style={{ marginBottom: 16 }}>
          <b>HEAVEN</b> {t("is a Bangladesh-based fashion brand built around clean silhouettes, honest fabric quality and everyday wearability. What started as a small local shop in Mirpur, Dhaka has grown into an online destination for people who want premium clothing without unnecessary noise.")}
        </p>
        <p style={{ marginBottom: 16 }}>
          {t("Every piece we sell is chosen or made with the same question in mind: would we wear this ourselves? That's the standard we hold our shirts, pants and accessories to — considered fits, durable fabric, and prices that make sense for Bangladesh.")}
        </p>
        <p style={{ marginBottom: 16 }}>
          {t("We ship cash-on-delivery to all 64 districts, and our Mirpur store is open for anyone who'd rather see and try before they buy.")}
        </p>
        <p style={{ fontSize: 11, color: 'var(--muted)' }}>
          {t("Want to know more about our story, our factory, or the team behind HEAVEN? Reach out to us on WhatsApp — we'd love to share more.")}
        </p>
      </div>
    </div>
  )
}
