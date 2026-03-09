import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/shared/auth/require-auth'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseIdeaRepository } from '@/contexts/product-management/infrastructure/supabase-idea-repository'
import { GraduateIdea } from '@/contexts/product-management/application/graduate-idea'
import { graduateIdeaSchema } from '@/contexts/product-management/schemas'

export const runtime = 'nodejs'

const ideaRepo = new SupabaseIdeaRepository()

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id: ideaId } = await params
  const idea = await ideaRepo.findById(ideaId)
  if (!idea) {
    return NextResponse.json(
      { error: 'Not found', message: 'Idea not found.' },
      { status: 404 }
    )
  }

  const access = await requireWorkspaceAccess(idea.workspaceId, ['owner', 'admin', 'member'])
  if (access instanceof NextResponse) return access

  const body = await req.json()
  const validation = graduateIdeaSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', message: 'Product ID is required for graduation.', details: validation.error.issues },
      { status: 400 }
    )
  }

  try {
    const graduateIdea = new GraduateIdea()
    const result = await graduateIdea.execute({
      ideaId,
      productId: validation.data.productId,
      graduatedBy: access.dbUserId,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Graduation failed'
    return NextResponse.json(
      { error: 'Graduation failed', message },
      { status: 422 }
    )
  }
}
