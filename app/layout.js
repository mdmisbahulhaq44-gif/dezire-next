import "./globals.css"

export const metadata = {
  title: "DEZIRE",
  description: "Fashion, reimagined."
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
