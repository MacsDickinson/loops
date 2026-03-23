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
 * Looks up workspace membership for a clerk user in a single query
 * by joining users and memberships tables.
 */
export async function findWorkspaceMembership(
  clerkUserId: string,
  workspaceId: string
): Promise<{ userId: string; role: WorkspaceRole } | null> {
  const { data, error } = await supabaseServer
    .from('memberships')
    .select('user_id, role, users!user_id!inner(clerk_user_id)')
    .eq('users.clerk_user_id', clerkUserId)
    .eq('workspace_id', workspaceId)
    .single()

  if (error || !data) return null

  return {
    userId: data.user_id as string,
    role: data.role as WorkspaceRole,
  }
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

  const membership = await findWorkspaceMembership(user.clerkUserId, workspaceId)

  if (!membership) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'You do not have access to this workspace.' },
      { status: 403 }
    )
  }

  if (requiredRoles && !requiredRoles.includes(membership.role)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Insufficient permissions for this action.' },
      { status: 403 }
    )
  }

  return {
    clerkUserId: user.clerkUserId,
    dbUserId: membership.userId,
    workspaceId,
    role: membership.role,
  }
}

/**
 * Gets the user's default (personal) workspace ID.
 */
export async function getDefaultWorkspaceId(
  clerkUserId: string
): Promise<string | null> {
  const workspace = await getDefaultWorkspace(clerkUserId)
  return workspace?.workspaceId ?? null
}

/**
 * Gets the user's default workspace context (userId, workspaceId, role)
 * in a single query. For use in server components (no NextResponse dependency).
 */
export async function getDefaultWorkspace(
  clerkUserId: string
): Promise<{ userId: string; workspaceId: string; role: WorkspaceRole } | null> {
  const { data, error } = await supabaseServer
    .from('memberships')
    .select('user_id, workspace_id, role, users!user_id!inner(clerk_user_id)')
    .eq('users.clerk_user_id', clerkUserId)
    .eq('role', 'owner')
    .limit(1)
    .single()

  if (error || !data) return null

  return {
    userId: data.user_id as string,
    workspaceId: data.workspace_id as string,
    role: data.role as WorkspaceRole,
  }
}
