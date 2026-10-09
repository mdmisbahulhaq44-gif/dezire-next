import StaticPage from '../../components/StaticPage'

export const metadata = {
  title: 'Contact Us — HEAVEN',
  description: 'Get in touch with HEAVEN — phone, WhatsApp, email, and social media.'
}

export default function ContactPage() {
  return (
    <StaticPage
      title="Get in Touch"
      footerLinks={<><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/refund-policy">Returns</a></>}
    >
      <p className="sub">Questions about an order, a product, or anything else? Reach us any of these ways — we usually reply fastest on WhatsApp.</p>

      <div className="cards">
        <a className="card" href="https://wa.me/8801877270165" target="_blank" rel="noopener noreferrer">
          <div className="icon">💬</div>
          <div><div className="label">WhatsApp</div><div className="value">+880 1877-270165</div></div>
        </a>
        <a className="card" href="tel:+8801877270165">
          <div className="icon">📞</div>
          <div><div className="label">Phone</div><div className="value">+880 1877-270165</div></div>
        </a>
        <a className="card" href="mailto:mdmisbahulhaq44@gmail.com">
          <div className="icon">✉️</div>
          <div><div className="label">Email</div><div className="value">mdmisbahulhaq44@gmail.com</div></div>
        </a>
        <a className="card" href="https://www.facebook.com/profile.php?id=61583860210132" target="_blank" rel="noopener noreferrer">
          <div className="icon">f</div>
          <div><div className="label">Facebook</div><div className="value">HEAVEN Page</div></div>
        </a>
        <a className="card" href="https://www.instagram.com/tanjumishu_2.0" target="_blank" rel="noopener noreferrer">
          <div className="icon">📷</div>
          <div><div className="label">Instagram</div><div className="value">@tanjumishu_2.0</div></div>
        </a>
      </div>

      <div className="addr">
        <h2>Based In</h2>
        <p>Mirpur, Dhaka, Bangladesh</p>
      </div>
    </StaticPage>
  )
}
