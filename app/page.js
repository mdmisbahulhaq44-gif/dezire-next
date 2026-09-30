import { supabaseServer as supabase } from "../lib/supabaseServer"
import HeroCarousel from "../components/HeroCarousel"
import CategoryTiles from "../components/CategoryTiles"
import ProductGrid from "../components/ProductGrid"
import PaymentReturnCheck from "../components/PaymentReturnCheck"

// Cache the homepage for a minute (like product pages) instead of
// re-rendering it on every visit.
export const revalidate = 60

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
  let reviews = []

  try {
    // All three queries run at the same time instead of one after another
    const [settingsRes, productsRes, reviewsRes] = await Promise.all([
      supabase.from("settings").select("key,value").in("key", ["hero_slides", "homepage_categories"]),
      supabase
        .from("products")
        .select("id,name,price,old,badge,imgs,stock,created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("reviews")
        .select("name,rating,comment")
        .gte("rating", 4)
        .not("comment", "is", null)
        .neq("comment", "")
        .order("created_at", { ascending: false })
        .limit(3)
    ])

    const settings = settingsRes.data
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

    products = productsRes.data || []
    reviews = reviewsRes.data || []
  } catch (e) {
    console.error("Homepage data fetch failed:", e)
  }

  return (
    <div>
      <PaymentReturnCheck />
      <HeroCarousel slides={heroSlides} />
      <div id="women" style={{ paddingTop: 14, scrollMarginTop: 46 }}>
        <CategoryTiles categories={categories} />
      </div>

      <div id="new" style={{ padding: "30px 5% 10px", scrollMarginTop: 46 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
          New Arrivals
        </h2>
      </div>

      <div style={{ padding: "0 5% 40px" }}>
        <ProductGrid products={products} />
      </div>

      <section className="features">
        <div className="feature">
          <div style={{ fontSize: 25 }}>🚚</div>
          <div>
            <b>Fast Delivery</b>
            <span>Nationwide delivery across Bangladesh.</span>
          </div>
        </div>

        <div className="feature">
          <div style={{ fontSize: 25 }}>↩️</div>
          <div>
            <b>Easy Returns</b>
            <span>Simple return experience for eligible products.</span>
          </div>
        </div>

        <div className="feature">
          <div style={{ fontSize: 25 }}>🔒</div>
          <div>
            <b>Secure Checkout</b>
            <span>Your customer information stays protected.</span>
          </div>
        </div>

        <div className="feature">
          <div style={{ fontSize: 25 }}>💬</div>
          <div>
            <b>Customer Support</b>
            <span>We're here to help with your orders.</span>
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <>
          <section className="section" id="testimonials" style={{ paddingBottom: 0 }}>
            <div className="heading">
              <div>
                <h2>What Our Customers Say</h2>
              </div>
            </div>
            <div id="testimonialsWrap" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {reviews.map((r, i) => {
                const n = Math.round(r.rating)
                return (
                  <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 22 }}>
                    <div style={{ color: "var(--gold)", fontSize: 14, marginBottom: 10 }}>
                      {"★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n)}
                    </div>
                    <p style={{ fontSize: 13, color: "#444", lineHeight: 1.7, marginBottom: 14 }}>{'"' + r.comment + '"'}</p>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{"— " + r.name}</div>
                  </div>
                )
              })}
            </div>
          </section>
          <style>{"@media(max-width:900px){#testimonialsWrap{grid-template-columns:1fr !important}}"}</style>
        </>
      )}
    </div>
  )
}
