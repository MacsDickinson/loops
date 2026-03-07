/**
 * Supabase Helper Functions
 *
 * Type-safe helper functions for common database operations
 */

import { supabase } from './client'
import { supabaseServer } from './server'
import type {
  User,
  Specification,
  DialogueTurn,
  SpecAnalytics,
  PersonaType,
  SpecificationInsert,
  SpecificationUpdate,
  DialogueTurnInsert,
  SpecAnalyticsInsert,
} from '@/lib/database.types'

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Get or create a user from Clerk user ID
 * Uses the database helper function for atomicity
 */
export async function getOrCreateUser(
  clerkUserId: string,
  email: string,
  name: string
): Promise<{ data: string | null; error: Error | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseServer as any).rpc('get_or_create_user', {
      p_clerk_user_id: clerkUserId,
      p_email: email,
      p_name: name,
    })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get user by Clerk user ID
 */
export async function getUserByClerkId(
  clerkUserId: string
): Promise<{ data: User | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// ============================================================================
// SPECIFICATION OPERATIONS
// ============================================================================

/**
 * Create a new specification
 */
export async function createSpecification(
  spec: SpecificationInsert
): Promise<{ data: Specification | null; error: Error | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase
      .from('specifications')
      .insert(spec as any)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get specification by ID
 */
export async function getSpecification(
  specId: string
): Promise<{ data: Specification | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('specifications')
      .select('*')
      .eq('id', specId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get all specifications for a user
 */
export async function getUserSpecifications(
  userId: string,
  status?: string
): Promise<{ data: Specification[] | null; error: Error | null }> {
  try {
    let query = supabase
      .from('specifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update specification
 */
export async function updateSpecification(
  specId: string,
  updates: SpecificationUpdate
): Promise<{ data: Specification | null; error: Error | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase
      .from('specifications')
      .update(updates as any)
      .eq('id', specId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Archive (soft delete) a specification
 */
export async function archiveSpecification(
  specId: string
): Promise<{ data: Specification | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('specifications')
      .update({ status: 'archived' })
      .eq('id', specId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// ============================================================================
// DIALOGUE TURN OPERATIONS
// ============================================================================

/**
 * Create a new dialogue turn
 */
export async function createDialogueTurn(
  turn: DialogueTurnInsert
): Promise<{ data: DialogueTurn | null; error: Error | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase
      .from('dialogue_turns')
      .insert(turn as any)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get all dialogue turns for a specification
 */
export async function getDialogueTurns(
  specId: string
): Promise<{ data: DialogueTurn[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('dialogue_turns')
      .select('*')
      .eq('spec_id', specId)
      .order('turn_order', { ascending: true })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// ============================================================================
// PROMPT TEMPLATE OPERATIONS
// ============================================================================

/**
 * Get active prompt for a persona type
 */
export async function getActivePrompt(
  personaType: PersonaType
): Promise<{ data: string | null; error: Error | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseServer as any).rpc('get_active_prompt', {
      p_persona_type: personaType,
    })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// ============================================================================
// ANALYTICS OPERATIONS
// ============================================================================

/**
 * Create spec analytics record
 */
export async function createSpecAnalytics(
  analytics: SpecAnalyticsInsert
): Promise<{ data: SpecAnalytics | null; error: Error | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await supabase
      .from('spec_analytics')
      .insert(analytics as any)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get analytics for a specification
 */
export async function getSpecAnalytics(
  specId: string
): Promise<{ data: SpecAnalytics | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('spec_analytics')
      .select('*')
      .eq('spec_id', specId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// ============================================================================
// SEARCH OPERATIONS
// ============================================================================

/**
 * Full-text search on specifications
 */
export async function searchSpecifications(
  userId: string,
  searchQuery: string
): Promise<{ data: Specification[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('specifications')
      .select('*')
      .eq('user_id', userId)
      .textSearch('title', searchQuery, {
        type: 'websearch',
        config: 'english',
      })
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
