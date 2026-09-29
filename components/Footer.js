"use client"

import Link from "next/link"
import { useShop } from "./ShopContext"
import { usePathname } from "next/navigation"

// Static pages (contact / terms / refund / privacy) still live on the old
// GitHub Pages site until they are migrated, so link there for now.
const OLD = "https://mdmisbahulhaq44-gif.github.io"

export default function Footer() {
  const { openAbout, openTrack } = useShop()
  const pathname = usePathname()
  if (["/contact", "/terms", "/refund-policy", "/privacy"].includes(pathname)) return null
  return (
    <footer>
      <div className="footergrid">
        <div>
          <h3>DEZIRE</h3>
          <p>
            Modern fashion with timeless elegance.
            Discover our latest collections and find
            your signature style.
          </p>
          <p><a href="#" onClick={e => { e.preventDefault(); openAbout() }}>About Us</a></p>
        </div>

        <div>
          <h3>SHOP</h3>
          <p><Link href="/shop/women">Women</Link></p>
          <p><Link href="/shop/men">Men</Link></p>
          <p><Link href="/shop?cat=Accessories">Accessories</Link></p>
          <p><Link href="/#new">Sale</Link></p>
        </div>

        <div>
          <h3>HELP</h3>
          <p><a href="/contact">Contact Us</a></p>
          <p><a href="/terms">Shipping</a></p>
          <p><a href="/refund-policy">Returns</a></p>
          <p onClick={openTrack} style={{ cursor: "pointer" }}>Track Order</p>
        </div>

        <div>
          <h3>FOLLOW</h3>
          <p><a href="https://www.facebook.com/profile.php?id=61583860210132" target="_blank" rel="noopener noreferrer">Facebook</a></p>
          <p><a href="https://www.instagram.com/tanjumishu_2.0" target="_blank" rel="noopener noreferrer">Instagram</a></p>
          <p>TikTok</p>
        </div>
      </div>

      <div className="copy">
        © 2026 DEZIRE. All rights reserved. ·{" "}
        <a href="/privacy" style={{ color: "#999" }}>Privacy Policy</a> ·{" "}
        <a href="/terms" style={{ color: "#999" }}>Terms &amp; Conditions</a>
      </div>
    </footer>
  )
}
