import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseIdeaRepository } from '@/contexts/product-management/infrastructure/supabase-idea-repository'

export const runtime = 'nodejs'

const ideaRepo = new SupabaseIdeaRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params
  const access = await requireWorkspaceAccess(workspaceId)
  if (access instanceof NextResponse) return access

  const ideas = await ideaRepo.findInbox(workspaceId)
  return NextResponse.json({ ideas })
}
