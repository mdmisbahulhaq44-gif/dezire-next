import { supabase } from "../../../lib/supabaseClient"
import ProductDetail from "../../../components/ProductDetail"

export default async function ProductPage({ params }) {
  const { id } = await params

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (!product) {
    return (
      <div className="empty" style={{ padding: "80px 20px" }}>
        Product not found.<br /><br />
        <small>id: {id}</small><br />
        <small>error: {error ? error.message : "none"}</small>
      </div>
    )
  }

  const { data: sameCategory } = await supabase
    .from("products")
    .select("id,name,price,old,badge,imgs,stock")
    .eq("cat", product.cat)
    .neq("id", product.id)
    .limit(8)

  const { data: twinRows } = await supabase
    .from("products")
    .select("id,name,price,old,badge,imgs,stock")
    .eq("name", product.name)
    .neq("id", product.id)
    .neq("gender", product.gender)
    .limit(1)

  const twin = twinRows?.[0] || null
  const rest = (sameCategory || []).filter(p => p.id !== twin?.id)
  const related = (twin ? [twin] : []).concat(rest).slice(0, 4)

  return <ProductDetail product={product} related={related} />
}
