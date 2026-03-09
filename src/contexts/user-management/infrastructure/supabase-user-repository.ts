import { supabaseServer } from '@/shared/infrastructure/supabase/server'
import type { IUserRepository } from '../domain/ports/user-repository'
import type { User } from '../domain/entities/user'

function toUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    clerkUserId: row.clerk_user_id as string,
    email: row.email as string,
    name: (row.name as string) ?? null,
    githubAccessToken: (row.github_access_token as string) ?? null,
    linearAccessToken: (row.linear_access_token as string) ?? null,
    subscriptionTier: row.subscription_tier as User['subscriptionTier'],
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    lastActiveAt: row.last_active_at ? new Date(row.last_active_at as string) : null,
  }
}

export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const { data } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return data ? toUser(data) : null
  }

  async findByClerkId(clerkUserId: string): Promise<User | null> {
    const { data } = await supabaseServer
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()
    return data ? toUser(data) : null
  }

  async getOrCreate(clerkUserId: string, email: string, name: string): Promise<string> {
    const { data, error } = await supabaseServer.rpc('get_or_create_user', {
      p_clerk_user_id: clerkUserId,
      p_email: email,
      p_name: name,
    })
    if (error) throw new Error(`Failed to get/create user: ${error.message}`)
    return data as string
  }
}
