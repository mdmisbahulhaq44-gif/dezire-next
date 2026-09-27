import { supabase } from "../../lib/supabaseClient"
import ProductGrid from "../../components/ProductGrid"

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export default async function ShopPage({ searchParams }) {
  const { gender, cat } = await searchParams

  let query = supabase
    .from("products")
    .select("id,name,price,old,badge,imgs,stock,gender,cat,created_at")
    .order("created_at", { ascending: false })
    .limit(60)

  if (gender) query = query.or(`gender.eq.${gender},gender.eq.unisex`)
  if (cat) query = query.eq("cat", cat)

  const { data: products } = await query

  const heading = cat || (gender ? capitalize(gender) : "New Arrivals")

  return (
    <div>
      <div style={{ padding: "30px 5% 10px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
          {heading}
        </h2>
      </div>
      <div style={{ padding: "0 5% 40px" }}>
        <ProductGrid products={products || []} />
      </div>
    </div>
  )
}
