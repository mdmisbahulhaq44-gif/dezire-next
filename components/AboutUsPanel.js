'use client'

import { useShop } from './ShopContext'

export default function AboutUsPanel() {
  const { activePanel, closePanel } = useShop()
  const show = activePanel === 'about'

  return (
    <div className={`panel${show ? ' show' : ''}`}>
      <div className="panelHead">
        <h2>About Us</h2>
        <button className="close" onClick={closePanel}>×</button>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.9, color: '#444' }}>
        <p style={{ marginBottom: 16 }}>
          <b>HEAVEN</b> is a Bangladesh-based fashion brand built around clean silhouettes, honest fabric quality and everyday wearability. What started as a small local shop in Mirpur, Dhaka has grown into an online destination for people who want premium clothing without unnecessary noise.
        </p>
        <p style={{ marginBottom: 16 }}>
          Every piece we sell is chosen or made with the same question in mind: would we wear this ourselves? That's the standard we hold our shirts, pants and accessories to — considered fits, durable fabric, and prices that make sense for Bangladesh.
        </p>
        <p style={{ marginBottom: 16 }}>
          We ship cash-on-delivery to all 64 districts, and our Mirpur store is open for anyone who'd rather see and try before they buy.
        </p>
        <p style={{ fontSize: 11, color: 'var(--muted)' }}>
          Want to know more about our story, our factory, or the team behind HEAVEN? Reach out to us on WhatsApp — we'd love to share more.
        </p>
      </div>
    </div>
  )
}
