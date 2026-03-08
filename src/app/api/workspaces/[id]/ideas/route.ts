import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseIdeaRepository } from '@/contexts/product-management/infrastructure/supabase-idea-repository'
import { SupabaseSpecificationRepository } from '@/contexts/discovery/infrastructure/supabase-specification-repository'
import { SupabaseSessionRepository } from '@/contexts/discovery/infrastructure/supabase-session-repository'
import { CreateIdea } from '@/contexts/product-management/application/create-idea'
import { createIdeaSchema } from '@/contexts/product-management/schemas'

export const runtime = 'nodejs'

const ideaRepo = new SupabaseIdeaRepository()
const specRepo = new SupabaseSpecificationRepository()
const sessionRepo = new SupabaseSessionRepository()

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params
  const access = await requireWorkspaceAccess(workspaceId, ['owner', 'admin', 'member'])
  if (access instanceof NextResponse) return access

  const body = await req.json()
  const validation = createIdeaSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', message: 'Invalid idea data.', details: validation.error.issues },
      { status: 400 }
    )
  }

  const createIdea = new CreateIdea(ideaRepo, specRepo, sessionRepo)
  const result = await createIdea.execute({
    workspaceId,
    name: validation.data.name,
    description: validation.data.description,
    productId: validation.data.productId,
    createdBy: access.dbUserId,
  })

  return NextResponse.json(result, { status: 201 })
}
