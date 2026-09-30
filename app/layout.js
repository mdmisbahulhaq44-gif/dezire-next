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

export const metadata = {
  title: "DEZIRE - Premium Fashion in Bangladesh",
  description: "DEZIRE - Premium men's and women's clothing in Bangladesh.",
  manifest: "/manifest.json"
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
