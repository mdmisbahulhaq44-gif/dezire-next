import { notFound, redirect } from "next/navigation"
import { supabaseServer as supabase } from "../../../../lib/supabaseServer"
import { capitalize, getSubcategories, getProductsAtPath, buildShopPath } from "../../../../lib/categories"
import Breadcrumb from "../../../../components/Breadcrumb"
import CategoryHub from "../../../../components/CategoryHub"
import ShopBrowser from "../../../../components/ShopBrowser"
export const revalidate = 60
export function generateStaticParams() { return [{ gender: "men", path: [] }, { gender: "women", path: [] }] }

function dec(s) {
  try { return decodeURIComponent(s) } catch (e) { return s }
}

export async function generateMetadata({ params }) {
  const { gender, path } = await params
  const segs = (path || []).map(dec)
  const heading = segs.length ? segs[segs.length - 1] : capitalize(gender)
  return {
    title: `${heading} — DEZIRE`,
    description: `Shop ${heading} for ${gender === "women" ? "women's" : "men's"} fashion at DEZIRE — premium quality, nationwide cash-on-delivery in Bangladesh.`
  }
}

export default async function CategoryPage({ params }) {
  const { gender, path } = await params
  if (gender !== "men" && gender !== "women") notFound()
  const segs = (path || []).map(dec)

  const { data: products } = await supabase
    .from("products")
    .select("id,name,price,old,badge,imgs,stock,gender,cat,sizes,created_at")
    .in("gender", [gender, "unisex"])
    .order("created_at", { ascending: false })
    .limit(1000)

  let categoryImages = {}
  try {
    const { data: row } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "category_images")
      .maybeSingle()
    if (row && row.value) categoryImages = JSON.parse(row.value)
  } catch (e) {}

  const list = products || []
  const heading = segs.length ? segs[segs.length - 1] : capitalize(gender)

  const subs = getSubcategories(list, gender, segs, categoryImages)
  if (subs.length) {
    return <CategoryHub gender={gender} path={segs} heading={heading} subs={subs} />
  }

  const leaf = getProductsAtPath(list, segs)
  if (leaf.length === 1) redirect(`/product/${leaf[0].id}`)
  if (!leaf.length) {
    if (segs.length) redirect(buildShopPath(gender, segs.slice(0, -1)))
    return <CategoryHub gender={gender} path={segs} heading={heading} subs={[]} />
  }

  return (
    <ShopBrowser
      products={leaf}
      heading={heading}
      initialGender={gender}
      hideGenderTabs
      breadcrumb={<Breadcrumb gender={gender} path={segs} />}
    />
  )
}
