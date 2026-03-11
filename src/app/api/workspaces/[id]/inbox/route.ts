import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseIdeaRepository } from '@/contexts/product-management/infrastructure/supabase-idea-repository'

export const runtime = 'nodejs'

const ideaRepo = new SupabaseIdeaRepository()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params
  const access = await requireWorkspaceAccess(workspaceId)
  if (access instanceof NextResponse) return access

  const url = req.nextUrl
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '25', 10) || 25, 1), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0', 10) || 0, 0)

  const { items, total } = await ideaRepo.findInboxPaginated(workspaceId, { limit, offset })
  return NextResponse.json({ ideas: items, total, limit, offset })
}
