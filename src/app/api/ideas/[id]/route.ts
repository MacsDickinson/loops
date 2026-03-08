import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/shared/auth/require-auth'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseIdeaRepository } from '@/contexts/product-management/infrastructure/supabase-idea-repository'
import { updateIdeaSchema } from '@/contexts/product-management/schemas'

export const runtime = 'nodejs'

const ideaRepo = new SupabaseIdeaRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const idea = await ideaRepo.findById(id)
  if (!idea) {
    return NextResponse.json(
      { error: 'Not found', message: 'Idea not found.' },
      { status: 404 }
    )
  }

  const access = await requireWorkspaceAccess(idea.workspaceId)
  if (access instanceof NextResponse) return access

  return NextResponse.json(idea)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const idea = await ideaRepo.findById(id)
  if (!idea) {
    return NextResponse.json(
      { error: 'Not found', message: 'Idea not found.' },
      { status: 404 }
    )
  }

  const access = await requireWorkspaceAccess(idea.workspaceId, ['owner', 'admin', 'member'])
  if (access instanceof NextResponse) return access

  const body = await req.json()
  const validation = updateIdeaSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', message: 'Invalid idea data.', details: validation.error.issues },
      { status: 400 }
    )
  }

  const updated = await ideaRepo.update(id, validation.data)
  return NextResponse.json(updated)
}
