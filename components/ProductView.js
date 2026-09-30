import { supabaseServer as supabase } from "../lib/supabaseServer"
import { getProduct } from "../lib/getProduct"
import ProductDetail from "./ProductDetail"
import { cldOpt } from "../lib/cloudinary"

const CARD_FIELDS = "id,name,brand,price,old,badge,imgs,stock,color_name,color_group"

export default async function ProductView({ id }) {
  const product = await getProduct(id)

  if (!product) {
    return <div className="empty" style={{ padding: "80px 20px" }}>Product not found.</div>
  }

  const [{ data: sameCategory }, { data: twinRows }] = await Promise.all([
    supabase.from("products").select(CARD_FIELDS).eq("cat", product.cat).neq("id", product.id).order("created_at", { ascending: false }).limit(12),
    supabase.from("products").select(CARD_FIELDS).eq("name", product.name).neq("id", product.id).neq("gender", product.gender).limit(1)
  ])

  const twin = twinRows?.[0] || null
  const rest = (sameCategory || []).filter(p => p.id !== twin?.id)
  const related = (twin ? [twin] : []).concat(rest).slice(0, 4)

  const images = (product.imgs ? product.imgs.split(",").map(s => s.trim()).filter(Boolean) : []).map(u => cldOpt(u, 1200))
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    brand: { "@type": "Brand", name: product.brand || "DEZIRE" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: String(product.price),
      availability: Number(product.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      ...(process.env.NEXT_PUBLIC_SITE_URL ? { url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.id}` } : {})
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetail key={product.id} product={product} related={related} />
    </>
  )
}
