import StaticPage from '../../components/StaticPage'

export const metadata = {
  title: 'Return & Refund Policy — DEZIRE',
  description: "DEZIRE's return and exchange policy — 14 days from delivery."
}

export default function RefundPolicyPage() {
  return (
    <StaticPage
      title="Return & Refund Policy"
      updated="Last updated: September 2026"
      footerLinks={<><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/contact">Contact</a></>}
    >
      <div className="highlight">
        <strong>You can request a return or exchange within 14 days</strong> of receiving your order.
      </div>

      <h2>Return & Exchange Window</h2>
      <p>If you're not satisfied with your order, contact us within <strong>14 days</strong> of the delivery date to request a return or exchange.</p>

      <h2>Conditions for Return/Exchange</h2>
      <ul>
        <li>The item must be unused, unwashed, and in its original condition with tags attached.</li>
        <li>The item must not be damaged or altered in any way.</li>
        <li>Please have your order reference number ready when contacting us.</li>
      </ul>

      <h2>How to Request a Return or Exchange</h2>
      <p>Message us on WhatsApp or Facebook with your order reference number and the reason for the return/exchange. We'll guide you through the next steps.</p>
      <ul>
        <li>WhatsApp: <a href="https://wa.me/8801877270165">+880 1877-270165</a></li>
        <li>Facebook: <a href="https://www.facebook.com/profile.php?id=61583860210132" target="_blank" rel="noopener noreferrer">Message us on Facebook</a></li>
      </ul>

      <h2>Refunds</h2>
      <p>Since orders are paid via Cash on Delivery, approved refunds are processed via bKash/Nagad or bank transfer to the details you provide, once the returned item is received and inspected.</p>

      <h2>Items That Can't Be Returned</h2>
      <ul>
        <li>Items marked as final sale (if any)</li>
        <li>Items that have been worn, washed, or damaged after delivery</li>
      </ul>

      <h2>Wrong or Damaged Item Received</h2>
      <p>If you received the wrong item or it arrived damaged, contact us within 14 days with photos of the item — we'll arrange a free replacement or refund.</p>

      <h2>Contact Us</h2>
      <ul>
        <li>Phone / WhatsApp: <a href="https://wa.me/8801877270165">+880 1877-270165</a></li>
        <li>Email: <a href="mailto:mdmisbahulhaq44@gmail.com">mdmisbahulhaq44@gmail.com</a></li>
      </ul>
    </StaticPage>
  )
}
