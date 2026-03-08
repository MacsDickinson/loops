import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/shared/auth/require-auth'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseFeatureRepository } from '@/contexts/product-management/infrastructure/supabase-feature-repository'
import { TransitionFeatureLifecycle } from '@/contexts/product-management/application/transition-feature-lifecycle'
import { transitionFeatureSchema } from '@/contexts/product-management/schemas'

export const runtime = 'nodejs'

const featureRepo = new SupabaseFeatureRepository()

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id: featureId } = await params
  const feature = await featureRepo.findById(featureId)
  if (!feature) {
    return NextResponse.json(
      { error: 'Not found', message: 'Feature not found.' },
      { status: 404 }
    )
  }

  const access = await requireWorkspaceAccess(feature.workspaceId, ['owner', 'admin', 'member'])
  if (access instanceof NextResponse) return access

  const body = await req.json()
  const validation = transitionFeatureSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', message: 'Invalid lifecycle stage.', details: validation.error.issues },
      { status: 400 }
    )
  }

  try {
    const transition = new TransitionFeatureLifecycle(featureRepo)
    const updated = await transition.execute({
      featureId,
      targetStage: validation.data.targetStage,
    })
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Transition failed'
    return NextResponse.json(
      { error: 'Transition failed', message },
      { status: 422 }
    )
  }
}
