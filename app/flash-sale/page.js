import Link from "next/link"
import { supabaseServer as supabase } from "../../lib/supabaseServer"
import ShopBrowser from "../../components/ShopBrowser"
import { FlashBanner } from "../../components/FlashSection"
import BackLink from "../../components/BackLink"
import T from "../../components/T"

export const revalidate = 30

export const metadata = {
  title: "Flash Sale - HEAVEN",
  description: "Limited-time flash sale offers from HEAVEN."
}

function FlashHead() {
  return (
    <div className="fsHead">
      <BackLink className="back"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></BackLink>
      <span className="spTitle"><T>Flash Sale</T></span>
      <Link className="spHome" href="/" prefetch={false}>HEAVEN</Link>
    </div>
  )
}

export default async function FlashSalePage() {
  let products = []
  let endsAt = null

  try {
    const { data: sales } = await supabase
      .from("product_sales")
      .select("product_id,ends_at")
      .eq("status", "active")
      .gt("ends_at", new Date().toISOString())
      .order("ends_at", { ascending: true })

    if (sales && sales.length) {
      endsAt = sales[0].ends_at
      const { data } = await supabase
        .from("products")
        .select("id,name,price,old,badge,imgs,stock,gender,cat,sizes,created_at")
        .in("id", sales.map(s => s.product_id))
      products = data || []
    }
  } catch (e) {
    console.error("Flash sale fetch failed:", e)
  }

  if (!products.length) {
    return (
      <div>
        <FlashHead />
        <div className="fsEmpty">
          <h2><T>No flash sale right now</T></h2>
          <p><T>New offers will appear here. Please check back soon.</T></p>
          <Link href="/" className="btn"><T>SHOP NEW ARRIVALS</T></Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <FlashHead />
      <FlashBanner endsAt={endsAt} />
      <ShopBrowser products={products} heading="Flash Sale" initialGender="ALL" />
    </div>
  )
}
