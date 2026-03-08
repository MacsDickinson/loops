import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/shared/auth/require-auth'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseFeatureRepository } from '@/contexts/product-management/infrastructure/supabase-feature-repository'

export const runtime = 'nodejs'

const featureRepo = new SupabaseFeatureRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const feature = await featureRepo.findById(id)
  if (!feature) {
    return NextResponse.json(
      { error: 'Not found', message: 'Feature not found.' },
      { status: 404 }
    )
  }

  const access = await requireWorkspaceAccess(feature.workspaceId)
  if (access instanceof NextResponse) return access

  return NextResponse.json(feature)
}
