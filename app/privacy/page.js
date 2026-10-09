import StaticPage from '../../components/StaticPage'

export const metadata = {
  title: 'Privacy Policy — HEAVEN',
  description: "HEAVEN's privacy policy — how we collect, use, and protect your information."
}

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      updated="Last updated: September 2026"
      footerLinks={<><a href="/terms">Terms</a> · <a href="/refund-policy">Returns</a> · <a href="/contact">Contact</a></>}
    >
      <p>HEAVEN ("we", "us", "our") operates this website to sell clothing and fashion products in Bangladesh. This page explains what information we collect from you, how we use it, and the choices you have.</p>

      <h2>Information We Collect</h2>
      <p>When you browse, create an account, or place an order with us, we may collect:</p>
      <ul>
        <li>Your name, phone number, and delivery address</li>
        <li>Your email address (if you create an account)</li>
        <li>Order history and items in your cart or wishlist</li>
        <li>Basic browsing information (pages viewed, device type) via Google Analytics</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To process and deliver your orders</li>
        <li>To contact you about your order via phone, WhatsApp, or email</li>
        <li>To send you order confirmations and delivery updates</li>
        <li>To improve our website and product selection</li>
      </ul>

      <h2>Sharing Your Information</h2>
      <p>We do not sell your personal information to anyone. We only share your name, phone number, and address with our delivery partners so they can deliver your order to you. We use Google Analytics and Meta (Facebook) Pixel to understand how visitors use our site — these services may collect anonymous browsing data as described in their own privacy policies.</p>

      <h2>Data Security</h2>
      <p>Your account information and order data are stored securely. We take reasonable steps to protect your information from unauthorized access.</p>

      <h2>Your Choices</h2>
      <p>You can review or update your account information at any time by logging into your account. If you'd like your account and data removed, contact us using the details below.</p>

      <h2>Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, reach out to us:</p>
      <ul>
        <li>Phone / WhatsApp: <a href="https://wa.me/8801877270165">+880 1877-270165</a></li>
        <li>Email: <a href="mailto:mdmisbahulhaq44@gmail.com">mdmisbahulhaq44@gmail.com</a></li>
        <li>Facebook: <a href="https://www.facebook.com/profile.php?id=61583860210132" target="_blank" rel="noopener noreferrer">HEAVEN on Facebook</a></li>
      </ul>
    </StaticPage>
  )
}
