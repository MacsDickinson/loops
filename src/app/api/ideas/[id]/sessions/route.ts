import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseIdeaRepository } from '@/contexts/product-management/infrastructure/supabase-idea-repository'
import { SupabaseSpecificationRepository } from '@/contexts/discovery/infrastructure/supabase-specification-repository'
import { SupabaseSessionRepository } from '@/contexts/discovery/infrastructure/supabase-session-repository'

export const runtime = 'nodejs'

const ideaRepo = new SupabaseIdeaRepository()
const specRepo = new SupabaseSpecificationRepository()
const sessionRepo = new SupabaseSessionRepository()

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const specification = await specRepo.findByIdea(ideaId)
  if (!specification) {
    return NextResponse.json(
      { error: 'Not found', message: 'No specification found for this idea.' },
      { status: 404 }
    )
  }

  // Pause any currently active session
  const activeSession = await sessionRepo.findActiveBySpec(specification.id)
  if (activeSession) {
    await sessionRepo.updateStatus(activeSession.id, 'paused')
  }

  // Create new active session
  const session = await sessionRepo.create({
    specificationId: specification.id,
    startedBy: access.dbUserId,
    status: 'active',
    personasUsed: [],
  })

  return NextResponse.json({ session }, { status: 201 })
}
