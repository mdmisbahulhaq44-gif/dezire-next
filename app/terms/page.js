import StaticPage from '../../components/StaticPage'

export const metadata = {
  title: 'Terms & Conditions — DEZIRE',
  description: "DEZIRE's terms and conditions — orders, pricing, delivery, and site usage."
}

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms & Conditions"
      updated="Last updated: September 2026"
      footerLinks={<><a href="/privacy">Privacy</a> · <a href="/refund-policy">Returns</a> · <a href="/contact">Contact</a></>}
    >
      <p>Welcome to DEZIRE. By browsing this website and placing an order, you agree to the terms below.</p>

      <h2>About Us</h2>
      <p>DEZIRE sells men's and women's clothing online across Bangladesh, based in Mirpur, Dhaka.</p>

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
          <tr><td>Inside Dhaka</td><td>৳50</td><td>2–3 business days</td></tr>
          <tr><td>Outside Dhaka (nationwide)</td><td>৳80</td><td>3–5 business days</td></tr>
        </tbody>
      </table>
      <p>Delivery times are estimates and may vary due to courier delays, weather, or other circumstances outside our control.</p>

      <h2>Returns & Refunds</h2>
      <p>See our full <a href="/refund-policy">Return & Refund Policy</a> for details on exchanges and returns.</p>

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
