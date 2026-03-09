import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/shared/auth/require-auth'
import { SupabaseSessionRepository } from '@/contexts/discovery/infrastructure/supabase-session-repository'
import { SupabaseSpecificationRepository } from '@/contexts/discovery/infrastructure/supabase-specification-repository'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'

export const runtime = 'nodejs'

const sessionRepo = new SupabaseSessionRepository()
const specRepo = new SupabaseSpecificationRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id: sessionId } = await params

  const session = await sessionRepo.findById(sessionId)
  if (!session) {
    return NextResponse.json(
      { error: 'Not found', message: 'Session not found.' },
      { status: 404 }
    )
  }

  // Validate workspace access via session → spec → workspace
  const spec = await specRepo.findById(session.specificationId)
  if (!spec) {
    return NextResponse.json(
      { error: 'Not found', message: 'Specification not found.' },
      { status: 404 }
    )
  }

  const access = await requireWorkspaceAccess(spec.workspaceId)
  if (access instanceof NextResponse) return access

  const turns = await sessionRepo.getDialogueTurns(sessionId)

  return NextResponse.json({ turns })
}
