import { supabaseServer as supabase } from "../lib/supabaseServer"

export const revalidate = 3600

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://dezire-next.vercel.app").replace(/\/$/, "")

export default async function sitemap() {
  const { data } = await supabase
    .from("products")
    .select("id,created_at")
    .order("id", { ascending: true })
    .limit(5000)

  const now = new Date()
  const fixed = ["", "/flash-sale", "/shop/men", "/shop/women", "/contact", "/privacy", "/terms", "/refund-policy"].map(p => ({
    url: SITE + p,
    lastModified: now
  }))
  const products = (data || []).map(p => ({
    url: `${SITE}/product/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : now
  }))
  return [...fixed, ...products]
}
