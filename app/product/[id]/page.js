import { supabase } from "../../../lib/supabaseClient"
import ProductView from "../../../components/ProductView"
import { cldOpt } from "../../../lib/cloudinary"

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data: p } = await supabase
    .from("products")
    .select("id,name,brand,price,stock,imgs")
    .eq("id", id)
    .maybeSingle()
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
