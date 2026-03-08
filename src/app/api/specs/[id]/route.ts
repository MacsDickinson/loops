import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/shared/auth/require-auth"
import { requireWorkspaceAccess } from "@/shared/auth/workspace-context"
import { SupabaseSpecificationRepository } from "@/contexts/discovery/infrastructure/supabase-specification-repository"

export const runtime = "nodejs"

const specRepo = new SupabaseSpecificationRepository()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id: specId } = await params

  const spec = await specRepo.findById(specId)
  if (!spec) {
    return NextResponse.json(
      { error: "Not found", message: "Specification not found." },
      { status: 404 }
    )
  }

  const access = await requireWorkspaceAccess(spec.workspaceId)
  if (access instanceof NextResponse) return access

  return NextResponse.json(spec)
}

const PatchSchema = z.object({
  prdMarkdown: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id: specId } = await params

  const spec = await specRepo.findById(specId)
  if (!spec) {
    return NextResponse.json(
      { error: "Not found", message: "Specification not found." },
      { status: 404 }
    )
  }

  const access = await requireWorkspaceAccess(spec.workspaceId)
  if (access instanceof NextResponse) return access

  const body = await req.json()
  const validation = PatchSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request", details: validation.error.issues },
      { status: 400 }
    )
  }

  const updated = await specRepo.update(specId, validation.data)
  return NextResponse.json(updated)
}
