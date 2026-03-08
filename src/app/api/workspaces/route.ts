import { NextResponse } from 'next/server'
import { requireAuth } from '@/shared/auth/require-auth'
import { SupabaseWorkspaceRepository } from '@/contexts/product-management/infrastructure/supabase-workspace-repository'
import { SupabaseUserRepository } from '@/contexts/user-management/infrastructure/supabase-user-repository'

export const runtime = 'nodejs'

const workspaceRepo = new SupabaseWorkspaceRepository()
const userRepo = new SupabaseUserRepository()

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const user = await userRepo.findByClerkId(auth.clerkUserId)
  if (!user) {
    return NextResponse.json(
      { error: 'User not found', message: 'User profile not found.' },
      { status: 404 }
    )
  }

  const workspaces = await workspaceRepo.findByOwner(user.id)
  return NextResponse.json({ workspaces })
}
