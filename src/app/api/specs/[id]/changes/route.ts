import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/shared/auth/require-auth'
import { SupabaseChangelogRepository } from '@/contexts/discovery/infrastructure/supabase-changelog-repository'
import { GetSpecificationChangelog } from '@/contexts/discovery/application/get-specification-changelog'

export const runtime = 'nodejs'

const changelogRepo = new SupabaseChangelogRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id: specId } = await params

  const getChangelog = new GetSpecificationChangelog(changelogRepo)
  const changes = await getChangelog.execute(specId)

  return NextResponse.json({ changes })
}
