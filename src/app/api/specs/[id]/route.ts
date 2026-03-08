import { NextRequest, NextResponse } from "next/server"
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
