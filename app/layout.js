import { Quicksand } from "next/font/google"
import "./globals.css"
import Header from "../components/Header"
import BottomNav from "../components/BottomNav"
import Footer from "../components/Footer"
import { ShopProvider } from "../components/ShopContext"
import CartFab from "../components/CartFab"
import CartPanel from "../components/CartPanel"
import CheckoutPanel from "../components/CheckoutPanel"
import WishlistPanel from "../components/WishlistPanel"
import SearchPanel from "../components/SearchPanel"
import AccountPanel from "../components/AccountPanel"
import TrackOrderPanel from "../components/TrackOrderPanel"
import AboutUsPanel from "../components/AboutUsPanel"
import ShopOverlay from "../components/ShopOverlay"
import Toast from "../components/Toast"
import Analytics from "../components/Analytics"
import NavTransition from "../components/NavTransition"
import ProductPreview from "../components/ProductPreview"
import NoZoom from "../components/NoZoom"
import ServiceWorkerRegister from "../components/ServiceWorkerRegister"

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
})

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://dezire-next.vercel.app").replace(/\/$/, "")

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DEZIRE - Premium Fashion in Bangladesh",
  description: "DEZIRE - Premium men's and women's clothing in Bangladesh.",
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "DEZIRE",
    locale: "en_BD",
    title: "DEZIRE - Premium Fashion in Bangladesh",
    description: "Premium men's and women's clothing with nationwide cash-on-delivery in Bangladesh."
  },
  twitter: { card: "summary_large_image" }
}

const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#org",
      name: "DEZIRE",
      url: SITE_URL,
      logo: SITE_URL + "/icon-512.png",
      contactPoint: { "@type": "ContactPoint", telephone: "+8801877270165", contactType: "customer service", areaServed: "BD", availableLanguage: ["en", "bn"] }
    },
    { "@type": "WebSite", "@id": SITE_URL + "/#site", url: SITE_URL, name: "DEZIRE", publisher: { "@id": SITE_URL + "/#org" } }
  ]
}

// Pinch / double-tap zoom is turned off so accidental touches can't zoom the store
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export default function RootLayout({ children, modal }) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }}
        />
        <ShopProvider>
          <Header />
          <main id="main-content">
            {children}
            {modal}
          </main>
          <Footer />
          <BottomNav />
          <CartFab />
          <ShopOverlay />
          <CartPanel />
          <CheckoutPanel />
          <WishlistPanel />
          <SearchPanel />
          <AccountPanel />
          <TrackOrderPanel />
          <AboutUsPanel />
          <Toast />
          <Analytics />
          <NavTransition />
          <ProductPreview />
          <NoZoom />
          <ServiceWorkerRegister />
        </ShopProvider>
      </body>
    </html>
  )
}
