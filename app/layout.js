import { Quicksand } from "next/font/google"
import "./globals.css"
import Header from "../components/Header"
import BottomNav from "../components/BottomNav"

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
})

export const metadata = {
  title: "DEZIRE - Premium Fashion in Bangladesh",
  description: "DEZIRE - Premium men's and women's clothing in Bangladesh."
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <Header />
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
