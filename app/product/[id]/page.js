import { supabaseServer } from "../../../lib/supabaseServer"
import ProductView from "../../../components/ProductView"
import { getProduct } from "../../../lib/getProduct"

// Cache each product page at the edge for a minute. Product data (price,
// stock, etc.) rarely changes second-to-second, so this trades a small,
// bounded staleness window for near-zero load time on repeat visits —
// exactly the "instant" feel the original SPA had, without giving up
// server-rendered, always-correct-on-first-load pages.
export const revalidate = 60

// Share-preview picture: a square crop (1200x1200, subject-aware) so the whole
// garment shows in WhatsApp, Messenger and Facebook cards. Non-Cloudinary or
// already-transformed links are used as they are.
function shareImage(url) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url
  if (url.includes("/upload/w_") || url.includes("/upload/f_") || url.includes("/upload/c_")) return url
  return url.replace("/upload/", "/upload/c_fill,g_auto,w_1200,h_1200,f_jpg,q_auto/")
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const p = await getProduct(id)
  if (!p) return { title: "Product not found — HEAVEN" }

  const firstImg = p.imgs ? p.imgs.split(",")[0].trim() : ""
  const img = firstImg ? shareImage(firstImg) : ""
  const title = `${p.name} — HEAVEN`
  const price = "৳" + Number(p.price).toLocaleString("en-US")
  const stockText = Number(p.stock) > 0 ? "In stock" : "Out of stock"
  const description = `${price} · ${stockText} · Cash on delivery all over Bangladesh. Easy returns. Shop ${p.name} at HEAVEN.`
  return {
    title,
    description,
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      type: "website",
      siteName: "HEAVEN",
      locale: "en_BD",
      url: `/product/${id}`,
      title,
      description,
      ...(img ? { images: [{ url: img, width: 1200, height: 1200, alt: p.name }] } : {})
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(img ? { images: [img] } : {})
    }
  }
}

export default async function ProductPage({ params }) {
  const { id } = await params
  return <ProductView id={id} />
}

export async function generateStaticParams() {
  const { data } = await supabaseServer.from("products").select("id").limit(200)
  return (data || []).map(p => ({ id: String(p.id) }))
}
