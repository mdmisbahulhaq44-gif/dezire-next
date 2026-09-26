import { supabase } from "../lib/supabaseClient"
import HeroCarousel from "../components/HeroCarousel"
import CategoryTiles from "../components/CategoryTiles"
import ProductGrid from "../components/ProductGrid"

const DEFAULT_HERO_SLIDES = [
  { image: "https://res.cloudinary.com/dtdztxbfg/image/upload/v1789381873/IMG_20260914_161653_hbvxqq.png" }
]

const DEFAULT_HOME_CATEGORIES = [
  { name: "Women", subtitle: "Discover Collection", image: "" },
  { name: "Men", subtitle: "Shop Men", image: "" },
  { name: "New In", subtitle: "Latest Arrivals", image: "" },
  { name: "Accessories", subtitle: "Complete Your Look", image: "" }
]

export default async function HomePage() {
  let heroSlides = DEFAULT_HERO_SLIDES
  let categories = DEFAULT_HOME_CATEGORIES
  let products = []

  try {
    const { data: settings } = await supabase
      .from("settings")
      .select("key,value")
      .in("key", ["hero_slides", "homepage_categories"])

    const heroRow = settings?.find(s => s.key === "hero_slides")
    const catRow = settings?.find(s => s.key === "homepage_categories")

    if (heroRow?.value) {
      try {
        const parsed = JSON.parse(heroRow.value)
        if (Array.isArray(parsed) && parsed.length) heroSlides = parsed
      } catch (e) {}
    }
    if (catRow?.value) {
      try {
        const parsed = JSON.parse(catRow.value)
        if (Array.isArray(parsed) && parsed.length) categories = parsed
      } catch (e) {}
    }

    const { data: productRows } = await supabase
      .from("products")
      .select("id,name,price,old,badge,imgs,stock,created_at")
      .order("created_at", { ascending: false })
      .limit(8)

    products = productRows || []
  } catch (e) {
    console.error("Homepage data fetch failed:", e)
  }

  return (
    <div>
      <HeroCarousel slides={heroSlides} />
      <div style={{ paddingTop: 14 }}>
        <CategoryTiles categories={categories} />
      </div>

      <div style={{ padding: "30px 5% 10px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
          New Arrivals
        </h2>
      </div>

      <div style={{ padding: "0 5% 40px" }}>
        <ProductGrid products={products} />
      </div>
    </div>
  )
                   }
