import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseWorkspaceRepository } from '@/contexts/product-management/infrastructure/supabase-workspace-repository'
import { updateWorkspaceSchema } from '@/contexts/product-management/schemas'

export const runtime = 'nodejs'

const workspaceRepo = new SupabaseWorkspaceRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const access = await requireWorkspaceAccess(id)
  if (access instanceof NextResponse) return access

  const workspace = await workspaceRepo.findById(id)
  if (!workspace) {
    return NextResponse.json(
      { error: 'Not found', message: 'Workspace not found.' },
      { status: 404 }
    )
  }

  return NextResponse.json(workspace)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const access = await requireWorkspaceAccess(id, ['owner', 'admin'])
  if (access instanceof NextResponse) return access

  const body = await req.json()
  const validation = updateWorkspaceSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', message: 'Invalid workspace data.', details: validation.error.issues },
      { status: 400 }
    )
  }

  const workspace = await workspaceRepo.update(id, validation.data)
  return NextResponse.json(workspace)
}
