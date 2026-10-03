import Link from "next/link"
import { supabaseServer as supabase } from "../../lib/supabaseServer"
import ShopBrowser from "../../components/ShopBrowser"
import { FlashBanner } from "../../components/FlashSection"

export const revalidate = 30

export const metadata = {
  title: "Flash Sale - DEZIRE",
  description: "Limited-time flash sale offers from DEZIRE."
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
      <div style={{ padding: "70px 5%", textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>⚡ Flash Sale</h2>
        <p style={{ color: "var(--muted)", marginTop: 10, fontSize: 14 }}>No flash sale is running right now. Check back soon!</p>
        <Link href="/" className="btn" style={{ display: "inline-block", marginTop: 22 }}>SHOP NEW ARRIVALS</Link>
      </div>
    )
  }

  return (
    <div>
      <FlashBanner endsAt={endsAt} />
      <ShopBrowser products={products} heading="Flash Sale" initialGender="ALL" />
    </div>
  )
}
