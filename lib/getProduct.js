import { cache } from "react"
import { supabase } from "./supabaseClient"

// Wrapped in React's cache() so, within a single request, generateMetadata()
// and the page body share ONE database round-trip for the same product
// instead of two. Combined with the route's `revalidate` export, the
// rendered page itself is also cached at the edge, so most visitors don't
// hit the database at all — this is what brings product pages back to the
// near-instant, app-like feel the original site had.
export const getProduct = cache(async (id) => {
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle()
  return data
})
