import { supabaseServer as supabase } from "../lib/supabaseServer"
import { getProduct } from "../lib/getProduct"
import ProductDetail from "./ProductDetail"
import TrackView from "./TrackView"
import { cldOpt } from "../lib/cloudinary"
import { parseCatPath, buildShopPath, capitalize } from "../lib/categories"

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://dezire-next.vercel.app").replace(/\/$/, "")

const CARD_FIELDS = "id,name,brand,price,old,badge,imgs,stock,color_name,color_group"

export default async function ProductView({ id }) {
  const product = await getProduct(id)

  if (!product) {
    return <div className="empty" style={{ padding: "80px 20px" }}>Product not found.</div>
  }

  const [{ data: sameCategory }, { data: twinRows }, { data: saleRows }] = await Promise.all([
    supabase.from("products").select(CARD_FIELDS).eq("cat", product.cat).neq("id", product.id).order("created_at", { ascending: false }).limit(12),
    supabase.from("products").select(CARD_FIELDS).eq("name", product.name).neq("id", product.id).neq("gender", product.gender).limit(1),
    supabase.from("product_sales").select("ends_at").eq("product_id", product.id).eq("status", "active").gt("ends_at", new Date().toISOString()).limit(1)
  ])

  const saleEndsAt = saleRows?.[0]?.ends_at || null
  const twin = twinRows?.[0] || null
  const rest = (sameCategory || []).filter(p => p.id !== twin?.id)
  const related = (twin ? [twin] : []).concat(rest).slice(0, 4)

  const images = (product.imgs ? product.imgs.split(",").map(s => s.trim()).filter(Boolean) : []).map(u => cldOpt(u, 1200))
  const g = product.gender === "women" ? "women" : "men"
  const catParts = parseCatPath(product)
  const crumbs = [
    { name: "Home", url: SITE + "/" },
    { name: capitalize(g), url: SITE + buildShopPath(g, []) },
    ...catParts.map((c, i) => ({ name: c, url: SITE + buildShopPath(g, catParts.slice(0, i + 1)) })),
    { name: product.name, url: `${SITE}/product/${product.id}` }
  ]
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url }))
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    sku: String(product.id),
    name: product.name,
    image: images,
    brand: { "@type": "Brand", name: product.brand || "DEZIRE" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: String(product.price),
      availability: Number(product.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE}/product/${product.id}`
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }}
      />
<TrackView id={product.id} />
      <ProductDetail key={product.id} product={product} related={related} saleEndsAt={saleEndsAt} />
    </>
  )
}
