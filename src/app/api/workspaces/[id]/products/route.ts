import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseProductRepository } from '@/contexts/product-management/infrastructure/supabase-product-repository'
import { createProductSchema } from '@/contexts/product-management/schemas'

export const runtime = 'nodejs'

const productRepo = new SupabaseProductRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params
  const access = await requireWorkspaceAccess(workspaceId)
  if (access instanceof NextResponse) return access

  const products = await productRepo.findByWorkspace(workspaceId)
  return NextResponse.json({ products })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params
  const access = await requireWorkspaceAccess(workspaceId, ['owner', 'admin', 'member'])
  if (access instanceof NextResponse) return access

  const body = await req.json()
  const validation = createProductSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', message: 'Invalid product data.', details: validation.error.issues },
      { status: 400 }
    )
  }

  const product = await productRepo.create({
    workspaceId,
    name: validation.data.name,
    description: validation.data.description,
    lifecycleStage: validation.data.lifecycleStage,
    createdBy: access.dbUserId,
  })

  return NextResponse.json(product, { status: 201 })
}
