import { NextResponse } from 'next/server'
import { supabaseServer } from '@/shared/infrastructure/supabase/server'
import { requireAuth, type AuthenticatedUser } from './require-auth'

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface WorkspaceAccess {
  clerkUserId: string
  dbUserId: string
  workspaceId: string
  role: WorkspaceRole
}

/**
 * Requires workspace access for the current user.
 * Validates authentication and workspace membership.
 * Returns WorkspaceAccess or a NextResponse error.
 */
export async function requireWorkspaceAccess(
  workspaceId: string,
  requiredRoles?: WorkspaceRole[]
): Promise<WorkspaceAccess | NextResponse> {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const user = authResult as AuthenticatedUser

  // Look up membership
  const { data: membership, error } = await supabaseServer
    .from('memberships')
    .select('user_id, role')
    .eq('workspace_id', workspaceId)
    .eq(
      'user_id',
      (
        await supabaseServer
          .from('users')
          .select('id')
          .eq('clerk_user_id', user.clerkUserId)
          .single()
      ).data?.id || ''
    )
    .single()

  if (error || !membership) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'You do not have access to this workspace.' },
      { status: 403 }
    )
  }

  const role = membership.role as WorkspaceRole

  if (requiredRoles && !requiredRoles.includes(role)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Insufficient permissions for this action.' },
      { status: 403 }
    )
  }

  return {
    clerkUserId: user.clerkUserId,
    dbUserId: membership.user_id as string,
    workspaceId,
    role,
  }
}

/**
 * Gets the user's default (personal) workspace ID.
 */
export async function getDefaultWorkspaceId(
  clerkUserId: string
): Promise<string | null> {
  const { data: user } = await supabaseServer
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (!user) return null

  const { data: membership } = await supabaseServer
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .limit(1)
    .single()

  return membership?.workspace_id as string | null
}
