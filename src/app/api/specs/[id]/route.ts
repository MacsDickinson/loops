import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSpecification, getUserByClerkId } from "@/lib/supabase/helpers";

export const runtime = "nodejs";

/**
 * GET /api/specs/[id]
 *
 * Get a single specification by ID
 * Enforces RLS: users can only access their own specs
 */
export async function GET(
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

    // Get user from database to verify ownership
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

    // Get specification (RLS will enforce user_id match)
    const { data: spec, error } = await getSpecification(specId);

    if (error) {
      console.error("[Specs API] Error fetching spec:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch specification",
          message: error.message,
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

    // Verify user owns this spec (double-check RLS)
    if (spec.user_id !== dbUser.id) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You do not have access to this specification.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(spec);
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
        message: "Failed to fetch specification.",
      },
      { status: 500 }
    );
  }
}
