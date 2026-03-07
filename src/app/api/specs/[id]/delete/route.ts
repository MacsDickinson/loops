import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getSpecification,
  archiveSpecification,
  getUserByClerkId,
} from "@/lib/supabase/helpers";

export const runtime = "nodejs";

/**
 * DELETE /api/specs/[id]/delete
 *
 * Archive (soft delete) a specification
 * Sets status to 'archived' instead of hard deleting
 * Enforces RLS: users can only archive their own specs
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please sign in to continue.",
        },
        { status: 401 }
      );
    }

    const { id: specId } = await params;

    if (!specId) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Specification ID is required.",
        },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: dbUser, error: userError } = await getUserByClerkId(user.id);
    if (userError || !dbUser) {
      return NextResponse.json(
        {
          error: "User not found",
          message: "Could not verify user identity.",
        },
        { status: 403 }
      );
    }

    // Verify spec exists and user owns it
    const { data: spec, error: getError } = await getSpecification(specId);

    if (getError) {
      console.error("[Specs API] Error fetching spec:", getError);
      return NextResponse.json(
        {
          error: "Failed to fetch specification",
          message: getError.message,
        },
        { status: 500 }
      );
    }

    if (!spec) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Specification not found or access denied.",
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (spec.user_id !== dbUser.id) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You do not have permission to delete this specification.",
        },
        { status: 403 }
      );
    }

    // Archive the spec (soft delete)
    const { data: archivedSpec, error: archiveError } =
      await archiveSpecification(specId);

    if (archiveError) {
      console.error("[Specs API] Error archiving spec:", archiveError);
      return NextResponse.json(
        {
          error: "Failed to archive specification",
          message: archiveError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Specification archived successfully",
      spec: archivedSpec,
    });
  } catch (error) {
    console.error("[Specs API] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Request failed",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to archive specification.",
      },
      { status: 500 }
    );
  }
}
