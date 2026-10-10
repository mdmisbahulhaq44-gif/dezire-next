const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://heaven-bd.vercel.app").replace(/\/$/, "")

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: SITE + "/sitemap.xml"
  }
}
