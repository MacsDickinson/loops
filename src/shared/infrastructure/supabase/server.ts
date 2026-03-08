import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable'
  )
}

/**
 * Supabase client for server-side admin operations.
 * Uses service role key — bypasses RLS.
 * WARNING: Never expose this client to the browser.
 */
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Supabase client for server-side operations.
 *
 * Uses service role key (bypasses RLS) when available, falls back to anon key.
 * Since this app uses Clerk for auth (not Supabase auth), RLS policies that
 * check auth.jwt() will always fail with the anon key. Server-side code
 * should use the service role key and enforce access control at the
 * application layer via Clerk.
 */
export const supabaseServer = supabaseAdmin ?? createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
