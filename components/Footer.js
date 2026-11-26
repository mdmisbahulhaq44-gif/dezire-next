"use client"

import Link from "next/link"
import { useShop } from "./ShopContext"
import { usePathname } from "next/navigation"
import PaymentStrip from "./PaymentStrip"

export default function Footer() {
  const { openTrack, t } = useShop()
  const pathname = usePathname()
  const tt = (s) => { const r = t(s); return r || s }
  if (["/contact", "/terms", "/refund-policy", "/privacy"].includes(pathname)) return null
  return (
    <>
    <PaymentStrip />
    <footer className="gf">
      <div className="gfTop">
        <div className="gfRow">
          <div className="gfCol"><div className="gfIn">
            <h4 className="gfHead">{tt('Pages')}</h4>
            <ul className="gfList">
              <li><Link href="/">{tt('Home')}</Link></li>
              <li><Link href="/about">{tt('About Us')}</Link></li>
              <li><Link href="/shop/women">{tt('Women')}</Link></li>
              <li><Link href="/shop/men">{tt('Men')}</Link></li>
              <li><Link href="/shop?cat=Accessories">{tt('Accessories')}</Link></li>
            </ul>
          </div></div>

          <div className="gfCol"><div className="gfIn">
            <h4 className="gfHead">{tt('Help')}</h4>
            <ul className="gfList">
              <li><a href="/privacy">{tt('Privacy Policy')}</a></li>
              <li><a href="/refund-policy">{tt('Returns')}</a></li>
              <li><a href="/contact">{tt('Contact Us')}</a></li>
              <li><a href="/terms">{tt('Terms & Conditions')}</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); openTrack() }}>{tt('Track Order')}</a></li>
            </ul>
          </div></div>

          <div className="gfCol"><div className="gfIn">
            <h4 className="gfHead">{tt('Follow')}</h4>
            <ul className="gfList">
              <li><a href="https://www.facebook.com/profile.php?id=61583860210132" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://www.instagram.com/tanjumishu_2.0" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            </ul>
          </div></div>
        </div>
      </div>

      <div className="gfBottom">
        <div className="gfBRow">
          <div className="gfBHalf">{tt('© 2026 HEAVEN. All rights reserved.')}</div>
        </div>
      </div>
    </footer>
    </>
  )
}
