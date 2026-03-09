import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/shared/auth/require-auth'
import { requireWorkspaceAccess } from '@/shared/auth/workspace-context'
import { SupabaseProductRepository } from '@/contexts/product-management/infrastructure/supabase-product-repository'
import { updateProductSchema } from '@/contexts/product-management/schemas'

export const runtime = 'nodejs'

const productRepo = new SupabaseProductRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const product = await productRepo.findById(id)
  if (!product) {
    return NextResponse.json(
      { error: 'Not found', message: 'Product not found.' },
      { status: 404 }
    )
  }

  const access = await requireWorkspaceAccess(product.workspaceId)
  if (access instanceof NextResponse) return access

  return NextResponse.json(product)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const product = await productRepo.findById(id)
  if (!product) {
    return NextResponse.json(
      { error: 'Not found', message: 'Product not found.' },
      { status: 404 }
    )
  }

  const access = await requireWorkspaceAccess(product.workspaceId, ['owner', 'admin', 'member'])
  if (access instanceof NextResponse) return access

  const body = await req.json()
  const validation = updateProductSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request', message: 'Invalid product data.', details: validation.error.issues },
      { status: 400 }
    )
  }

  const updated = await productRepo.update(id, validation.data)
  return NextResponse.json(updated)
}
