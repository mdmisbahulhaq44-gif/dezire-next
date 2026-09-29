import { createClient } from "@supabase/supabase-js"

// Server-only client: explicit revalidate so Next can cache the page
// (supabase-js sends an Authorization header, which Next otherwise treats as uncacheable)
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60 } }) }
  }
)
