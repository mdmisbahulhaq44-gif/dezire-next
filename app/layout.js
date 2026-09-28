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
import ShopOverlay from "../components/ShopOverlay"
import Toast from "../components/Toast"

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
})

export const metadata = {
  title: "DEZIRE - Premium Fashion in Bangladesh",
  description: "DEZIRE - Premium men's and women's clothing in Bangladesh."
}

export default function RootLayout({ children, modal }) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <ShopProvider>
          <Header />
          {children}
          {modal}
          <Footer />
          <BottomNav />
          <CartFab />
          <ShopOverlay />
          <CartPanel />
          <CheckoutPanel />
          <WishlistPanel />
          <SearchPanel />
          <Toast />
        </ShopProvider>
      </body>
    </html>
  )
}
