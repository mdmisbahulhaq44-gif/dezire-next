import ProductView from "../../../components/ProductView"
import { getProduct } from "../../../lib/getProduct"
import { cldOpt } from "../../../lib/cloudinary"

// Cache each product page at the edge for a minute. Product data (price,
// stock, etc.) rarely changes second-to-second, so this trades a small,
// bounded staleness window for near-zero load time on repeat visits —
// exactly the "instant" feel the original SPA had, without giving up
// server-rendered, always-correct-on-first-load pages.
export const revalidate = 60

export async function generateMetadata({ params }) {
  const { id } = await params
  const p = await getProduct(id)
  if (!p) return { title: "Product not found — DEZIRE" }

  const firstImg = p.imgs ? p.imgs.split(",")[0].trim() : ""
  const title = `${p.name} — DEZIRE`
  const description = `${p.name}${p.brand ? " by " + p.brand : ""} — ৳${Number(p.price).toLocaleString()} at DEZIRE. ${Number(p.stock) > 0 ? "In stock now" : "Currently out of stock"}, nationwide cash-on-delivery in Bangladesh.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(firstImg ? { images: [cldOpt(firstImg, 1200)] } : {})
    }
  }
}

export default async function ProductPage({ params }) {
  const { id } = await params
  return <ProductView id={id} />
}
