import StaticPage from '../../components/StaticPage'
import T from '../../components/T'
import TM from '../../components/TM'
import Link from 'next/link'

export const metadata = {
  title: 'Return & Refund Policy — HEAVEN',
  description: "HEAVEN's return and exchange policy — 14 days from delivery."
}

export default function RefundPolicyPage() {
  return (
    <StaticPage
      title="Return & Refund Policy"
      updated="Last updated: September 2026"
      footerLinks={<><Link href="/privacy"><T>Privacy</T></Link> · <Link href="/terms"><T>Terms</T></Link> · <Link href="/contact"><T>Contact</T></Link></>}
    >
      <div className="highlight"><TM>{"**You can request a return or exchange within 14 days** of receiving your order."}</TM></div>

      <h2><TM>{"Return & Exchange Window"}</TM></h2>
      <p><TM>{"If you're not satisfied with your order, contact us within **14 days** of the delivery date to request a return or exchange."}</TM></p>

      <h2><TM>{"Conditions for Return/Exchange"}</TM></h2>
      <ul>
        <li><TM>{"The item must be unused, unwashed, and in its original condition with tags attached."}</TM></li>
        <li><TM>{"The item must not be damaged or altered in any way."}</TM></li>
        <li><TM>{"Please have your order reference number ready when contacting us."}</TM></li>
      </ul>

      <h2><TM>{"How to Request a Return or Exchange"}</TM></h2>
      <p><TM>{"Message us on WhatsApp or Facebook with your order reference number and the reason for the return/exchange. We'll guide you through the next steps."}</TM></p>
      <ul>
        <li><TM>{"WhatsApp: [+880 1877-270165](https://wa.me/8801877270165)"}</TM></li>
        <li><TM>{"Facebook: [Message us on Facebook](https://www.facebook.com/profile.php?id=61583860210132)"}</TM></li>
      </ul>

      <h2><TM>{"Refunds"}</TM></h2>
      <p><TM>{"Since orders are paid via Cash on Delivery, approved refunds are processed via bKash/Nagad or bank transfer to the details you provide, once the returned item is received and inspected."}</TM></p>

      <h2><TM>{"Items That Can't Be Returned"}</TM></h2>
      <ul>
        <li><TM>{"Items marked as final sale (if any)"}</TM></li>
        <li><TM>{"Items that have been worn, washed, or damaged after delivery"}</TM></li>
      </ul>

      <h2><TM>{"Wrong or Damaged Item Received"}</TM></h2>
      <p><TM>{"If you received the wrong item or it arrived damaged, contact us within 14 days with photos of the item — we'll arrange a free replacement or refund."}</TM></p>

      <h2><TM>{"Contact Us"}</TM></h2>
      <ul>
        <li><TM>{"Phone / WhatsApp: [+880 1877-270165](https://wa.me/8801877270165)"}</TM></li>
        <li><TM>{"Email: [mdmisbahulhaq44@gmail.com](mailto:mdmisbahulhaq44@gmail.com)"}</TM></li>
      </ul>
    </StaticPage>
  )
}
