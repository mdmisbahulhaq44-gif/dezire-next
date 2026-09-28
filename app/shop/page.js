import { supabase } from "../../lib/supabaseClient"
import ShopBrowser from "../../components/ShopBrowser"

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export default async function ShopPage({ searchParams }) {
  const { gender, cat } = await searchParams

  let query = supabase
    .from("products")
    .select("id,name,price,old,badge,imgs,stock,gender,cat,sizes,created_at")
    .order("created_at", { ascending: false })
    .limit(200)

  if (cat) query = query.eq("cat", cat)

  const { data: products } = await query

  const initialGender = gender === "men" || gender === "women" ? gender : "ALL"
  const heading = cat || (gender ? capitalize(gender) : "New Arrivals")

  return <ShopBrowser products={products || []} heading={heading} initialGender={initialGender} />
}
