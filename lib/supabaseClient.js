import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Same Supabase project as the current site (otdbpahqfsarkzdpzwga) — only
// where and how it's called is changing, not the backend itself.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
