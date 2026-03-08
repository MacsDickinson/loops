import { NextResponse } from 'next/server'
import { requireAuth } from '@/shared/auth/require-auth'
import { getDefaultWorkspaceId } from '@/shared/auth/workspace-context'
import { getOrCreateUser } from '@/lib/supabase/helpers'

export const runtime = 'nodejs'

export async function GET() {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const { clerkUserId, email, name } = authResult

  // Ensure user + workspace exist in DB
  const { data: userId, error } = await getOrCreateUser(clerkUserId, email, name)
  if (error || !userId) {
    console.error('[/api/me] getOrCreateUser failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to resolve user',
        message: error?.message || 'Could not set up your account.',
      },
      { status: 500 }
    )
  }

  const workspaceId = await getDefaultWorkspaceId(clerkUserId)
  if (!workspaceId) {
    return NextResponse.json(
      { error: 'No workspace', message: 'No workspace found for your account.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ userId, workspaceId })
}
