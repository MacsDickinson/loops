import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseIdeaRepository } from '@/contexts/product-management/infrastructure/supabase-idea-repository'
import { SupabaseSpecificationRepository } from '@/contexts/discovery/infrastructure/supabase-specification-repository'
import { SupabaseSessionRepository } from '@/contexts/discovery/infrastructure/supabase-session-repository'
import type { PersonaType } from '@/contexts/discovery/domain/value-objects/persona-type'

export const runtime = 'nodejs'

const ideaRepo = new SupabaseIdeaRepository()
const specRepo = new SupabaseSpecificationRepository()
const sessionRepo = new SupabaseSessionRepository()

const CreateSessionSchema = z.object({
  agentType: z
    .enum(['product_agent', 'security_expert', 'ux_analyst', 'domain_expert', 'architecture_expert'])
    .default('product_agent'),
})

export async function POST(
  req: NextRequest,
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

  // Parse request body for agent type
  let agentType: PersonaType = 'product_agent'

  const rawBody = await req.text()
  if (rawBody.trim() !== '') {
    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Request body must be valid JSON.' },
        { status: 400 }
      )
    }

    const parsed = CreateSessionSchema.safeParse(body)
    if (parsed.success) {
      agentType = parsed.data.agentType
    } else {
      const hasAgentType =
        typeof body === 'object' && body !== null && 'agentType' in body
      if (hasAgentType) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid agentType provided.' },
          { status: 400 }
        )
      }
      // If agentType is not present, keep default product_agent
    }
  }

  // Pause any currently active session
  const activeSession = await sessionRepo.findActiveBySpec(specification.id)
  if (activeSession) {
    await sessionRepo.updateStatus(activeSession.id, 'paused')
  }

  // Create new active session with specified agent type
  const session = await sessionRepo.create({
    specificationId: specification.id,
    startedBy: access.dbUserId,
    status: 'active',
    agentType,
    personasUsed: [agentType],
  })

  return NextResponse.json({ session }, { status: 201 })
}
