import Link from "next/link"

export const metadata = { title: "Page not found", robots: { index: false } }

export default function NotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24, gap: 10 }}>
      <div style={{ fontSize: 12, letterSpacing: 2, color: "#888" }}>ERROR 404</div>
      <h1 style={{ fontSize: 26, margin: 0 }}>This page doesn't exist</h1>
      <p style={{ color: "#777", maxWidth: 360, margin: "0 0 12px" }}>The link may be old or the product may no longer be available.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" style={{ padding: "11px 22px", background: "#111", color: "#fff", borderRadius: 999, fontSize: 13 }}>Back to home</Link>
        <Link href="/shop" style={{ padding: "11px 22px", border: "1px solid #ccc", borderRadius: 999, fontSize: 13 }}>Browse shop</Link>
      </div>
    </div>
  )
}
