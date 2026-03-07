import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable'
  )
}

/**
 * Supabase client for server-side operations with service role key
 * Use this for admin operations that bypass RLS
 * WARNING: Never expose this client to the browser
 */
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Supabase client for server-side operations with anon key
 * Respects RLS policies
 */
export const supabaseServer = createClient<Database>(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
