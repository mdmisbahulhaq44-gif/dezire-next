import { supabase } from "../lib/supabaseClient"

export default async function HomePage() {
  let productCount = null
  let errorMessage = null

  try {
    const { data, error } = await supabase.from("products").select("id")
    if (error) throw error
    productCount = data.length
  } catch (e) {
    errorMessage = e.message
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: 28, letterSpacing: 2 }}>DEZIRE</h1>
      <p style={{ color: "#888", marginTop: 4 }}>Next.js Phase 0 checkpoint</p>

      <div style={{ marginTop: 32, padding: 20, border: "1px solid #eee", borderRadius: 12 }}>
        {errorMessage ? (
          <p style={{ color: "crimson" }}>Supabase connection failed: {errorMessage}</p>
        ) : (
          <p>Connected to Supabase - <b>{productCount}</b> products found in the catalog.</p>
        )}
      </div>

      <p style={{ color: "#888", marginTop: 24, fontSize: 14, lineHeight: 1.6 }}>
        If the count above matches the real product catalog, both pieces are working. Phase 1
        replaces this page with the real homepage design.
      </p>
    </main>
  )
}
