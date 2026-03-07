import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserSpecifications, getUserByClerkId } from "@/lib/supabase/helpers";

export const runtime = "nodejs";

/**
 * GET /api/specs?status=...
 *
 * List all specifications for the current user
 * Optional query params:
 * - status: filter by status (draft, complete, archived)
 */
export async function GET(req: NextRequest) {
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

    // Get optional status filter from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    // Validate status if provided
    if (status && !["draft", "complete", "archived"].includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status",
          message: "Status must be one of: draft, complete, archived",
        },
        { status: 400 }
      );
    }

    // Get user's specifications
    const { data: specs, error } = await getUserSpecifications(
      dbUser.id,
      status
    );

    if (error) {
      console.error("[Specs API] Error fetching specs:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch specifications",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      specs: specs || [],
      count: specs?.length || 0,
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
        message: "Failed to fetch specifications.",
      },
      { status: 500 }
    );
  }
}
