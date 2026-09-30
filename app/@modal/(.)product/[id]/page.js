import { supabaseServer } from "../../../../lib/supabaseServer"
import ProductView from "../../../../components/ProductView"

// Same edge-caching as the full product page (see app/product/[id]/page.js)
// so opening the quick-preview panel from inside the app is just as fast.
export const revalidate = 60

// Opening a product from inside the app shows it as a panel OVER the page
// you were on (like the original site), instead of replacing that page.
export default async function InterceptedProduct({ params }) {
  const { id } = await params
  return <ProductView id={id} />
}

export async function generateStaticParams() {
  const { data } = await supabaseServer.from("products").select("id").limit(200)
  return (data || []).map(p => ({ id: String(p.id) }))
}
