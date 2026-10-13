import StaticPage from '../../components/StaticPage'
import Link from 'next/link'
import { supabaseServer as supabase } from '../../lib/supabaseServer'

// Delivery charges come from the same settings table the checkout uses, so this page can never disagree with it
async function getDelivery() {
  const fallback = { dhaka: 50, outside: 60, free: 1000 }
  try {
    const { data, error } = await supabase.from('settings').select('key,value').in('key', ['delivery_charge_dhaka', 'delivery_charge_outside', 'free_delivery_threshold'])
    if (error || !data || !data.length) return fallback
    const m = {}
    data.forEach(r => { m[r.key] = r.value })
    const n = (v, d) => (v === undefined || v === null || v === '' || Number.isNaN(Number(v))) ? d : Number(v)
    return { dhaka: n(m.delivery_charge_dhaka, fallback.dhaka), outside: n(m.delivery_charge_outside, fallback.outside), free: n(m.free_delivery_threshold, fallback.free) }
  } catch (e) {
    return fallback
  }
}

export const metadata = {
  title: 'Terms & Conditions — HEAVEN',
  description: "HEAVEN's terms and conditions — orders, pricing, delivery, and site usage."
}

export default async function TermsPage() {
  const d = await getDelivery()
  return (
    <StaticPage
      title="Terms & Conditions"
      updated="Last updated: September 2026"
      footerLinks={<><Link href="/privacy">Privacy</Link> · <Link href="/refund-policy">Returns</Link> · <Link href="/contact">Contact</Link></>}
    >
      <p>Welcome to HEAVEN. By browsing this website and placing an order, you agree to the terms below.</p>

      <h2>About Us</h2>
      <p>HEAVEN sells men's and women's clothing online across Bangladesh, based in Mirpur, Dhaka.</p>

      <h2>Orders & Pricing</h2>
      <ul>
        <li>All prices shown are in Bangladeshi Taka (৳) and include applicable taxes.</li>
        <li>We reserve the right to correct pricing errors and to cancel an order placed at an incorrect price, in which case you will be notified and no charge will be made.</li>
        <li>Product availability is not guaranteed until your order is confirmed — occasionally an item may sell out before your order is processed, in which case we will contact you.</li>
        <li>Product images are for illustration; actual color may vary slightly due to lighting and screen settings.</li>
      </ul>

      <h2>Payment</h2>
      <p>We currently accept <strong>Cash on Delivery (COD)</strong> — you pay when your order arrives at your doorstep.</p>

      <h2>Delivery</h2>
      <table>
        <tbody>
          <tr><th>Area</th><th>Delivery Charge</th><th>Estimated Time</th></tr>
          <tr><td>Inside Dhaka</td><td>৳{d.dhaka}</td><td>2–3 business days</td></tr>
          <tr><td>Outside Dhaka (nationwide)</td><td>৳{d.outside}</td><td>3–5 business days</td></tr>
        </tbody>
      </table>
      {d.free > 0 && <p>Delivery is free on orders of ৳{d.free.toLocaleString('en-US')} or more.</p>}
      <p>Delivery times are estimates and may vary due to courier delays, weather, or other circumstances outside our control.</p>

      <h2>Returns & Refunds</h2>
      <p>See our full <Link href="/refund-policy">Return & Refund Policy</Link> for details on exchanges and returns.</p>

      <h2>Account Responsibility</h2>
      <p>If you create an account with us, you're responsible for keeping your login details secure and for all activity under your account.</p>

      <h2>Changes to These Terms</h2>
      <p>We may update these terms from time to time. Continued use of the site after changes means you accept the updated terms.</p>

      <h2>Contact Us</h2>
      <ul>
        <li>Phone / WhatsApp: <a href="https://wa.me/8801877270165">+880 1877-270165</a></li>
        <li>Email: <a href="mailto:mdmisbahulhaq44@gmail.com">mdmisbahulhaq44@gmail.com</a></li>
      </ul>
    </StaticPage>
  )
}
