import StaticPage from '../../components/StaticPage'
import T from '../../components/T'
import TM from '../../components/TM'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — HEAVEN',
  description: "HEAVEN's privacy policy — how we collect, use, and protect your information."
}

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      updated="Last updated: September 2026"
      footerLinks={<><Link href="/terms"><T>Terms</T></Link> · <Link href="/refund-policy"><T>Returns</T></Link> · <Link href="/contact"><T>Contact</T></Link></>}
    >
      <p><TM>{"HEAVEN operates this website to sell clothing and fashion products in Bangladesh. This page explains what information we collect from you, how we use it, and the choices you have."}</TM></p>

      <h2><TM>{"Information We Collect"}</TM></h2>
      <p><TM>{"When you browse, create an account, or place an order with us, we may collect:"}</TM></p>
      <ul>
        <li><TM>{"Your name, phone number, and delivery address"}</TM></li>
        <li><TM>{"Your email address (if you create an account)"}</TM></li>
        <li><TM>{"Order history and items in your cart or wishlist"}</TM></li>
        <li><TM>{"Basic browsing information (pages viewed, device type) via Google Analytics"}</TM></li>
      </ul>

      <h2><TM>{"How We Use Your Information"}</TM></h2>
      <ul>
        <li><TM>{"To process and deliver your orders"}</TM></li>
        <li><TM>{"To contact you about your order via phone, WhatsApp, or email"}</TM></li>
        <li><TM>{"To send you order confirmations and delivery updates"}</TM></li>
        <li><TM>{"To improve our website and product selection"}</TM></li>
      </ul>

      <h2><TM>{"Sharing Your Information"}</TM></h2>
      <p><TM>{"We do not sell your personal information to anyone. We only share your name, phone number, and address with our delivery partners so they can deliver your order to you. We use Google Analytics and Meta (Facebook) Pixel to understand how visitors use our site — these services may collect anonymous browsing data as described in their own privacy policies."}</TM></p>

      <h2><TM>{"Data Security"}</TM></h2>
      <p><TM>{"Your account information and order data are stored securely. We take reasonable steps to protect your information from unauthorized access."}</TM></p>

      <h2><TM>{"Your Choices"}</TM></h2>
      <p><TM>{"You can review or update your account information at any time by logging into your account. If you'd like your account and data removed, contact us using the details below."}</TM></p>

      <h2><TM>{"Contact Us"}</TM></h2>
      <p><TM>{"If you have any questions about this Privacy Policy, reach out to us:"}</TM></p>
      <ul>
        <li><TM>{"Phone / WhatsApp: [+880 1877-270165](https://wa.me/8801877270165)"}</TM></li>
        <li><TM>{"Email: [mdmisbahulhaq44@gmail.com](mailto:mdmisbahulhaq44@gmail.com)"}</TM></li>
        <li><TM>{"Facebook: [HEAVEN on Facebook](https://www.facebook.com/profile.php?id=61583860210132)"}</TM></li>
      </ul>
    </StaticPage>
  )
}
