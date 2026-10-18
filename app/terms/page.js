import StaticPage from '../../components/StaticPage'
import T from '../../components/T'
import TM from '../../components/TM'
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
      footerLinks={<><Link href="/privacy"><T>Privacy</T></Link> · <Link href="/refund-policy"><T>Returns</T></Link> · <Link href="/contact"><T>Contact</T></Link></>}
    >
      <p><TM>{"Welcome to HEAVEN. By browsing this website and placing an order, you agree to the terms below."}</TM></p>

      <h2><TM>{"About Us"}</TM></h2>
      <p><TM>{"HEAVEN sells men's and women's clothing online across Bangladesh, based in Mirpur, Dhaka."}</TM></p>

      <h2><TM>{"Orders & Pricing"}</TM></h2>
      <ul>
        <li><TM>{"All prices shown are in Bangladeshi Taka (৳) and include applicable taxes."}</TM></li>
        <li><TM>{"We reserve the right to correct pricing errors and to cancel an order placed at an incorrect price, in which case you will be notified and no charge will be made."}</TM></li>
        <li><TM>{"Product availability is not guaranteed until your order is confirmed — occasionally an item may sell out before your order is processed, in which case we will contact you."}</TM></li>
        <li><TM>{"Product images are for illustration; actual color may vary slightly due to lighting and screen settings."}</TM></li>
      </ul>

      <h2><TM>{"Payment"}</TM></h2>
      <p><TM>{"We currently accept **Cash on Delivery (COD)** — you pay when your order arrives at your doorstep."}</TM></p>

      <h2><TM>{"Delivery"}</TM></h2>
      <table>
        <tbody>
          <tr><th><T>Area</T></th><th><T>Delivery Charge</T></th><th><T>Estimated Time</T></th></tr>
          <tr><td><T>Inside Dhaka</T></td><td>৳{d.dhaka}</td><td><T>2–3 business days</T></td></tr>
          <tr><td><T>Outside Dhaka (nationwide)</T></td><td>৳{d.outside}</td><td><T>3–5 business days</T></td></tr>
        </tbody>
      </table>
      {d.free > 0 && <p><TM vars={{ n: d.free.toLocaleString('en-US') }}>{"Delivery is free on orders of ৳{n} or more."}</TM></p>}
      <p><TM>{"Delivery times are estimates and may vary due to courier delays, weather, or other circumstances outside our control."}</TM></p>

      <h2><TM>{"Returns & Refunds"}</TM></h2>
      <p><TM>{"See our full [Return & Refund Policy](/refund-policy) for details on exchanges and returns."}</TM></p>

      <h2><TM>{"Account Responsibility"}</TM></h2>
      <p><TM>{"If you create an account with us, you're responsible for keeping your login details secure and for all activity under your account."}</TM></p>

      <h2><TM>{"Changes to These Terms"}</TM></h2>
      <p><TM>{"We may update these terms from time to time. Continued use of the site after changes means you accept the updated terms."}</TM></p>

      <h2><TM>{"Contact Us"}</TM></h2>
      <ul>
        <li><TM>{"Phone / WhatsApp: [+880 1877-270165](https://wa.me/8801877270165)"}</TM></li>
        <li><TM>{"Email: [mdmisbahulhaq44@gmail.com](mailto:mdmisbahulhaq44@gmail.com)"}</TM></li>
      </ul>
    </StaticPage>
  )
}
