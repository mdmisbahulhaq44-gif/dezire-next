const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://dezire-next.vercel.app").replace(/\/$/, "")

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: SITE + "/sitemap.xml"
  }
}
