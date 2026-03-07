import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SpecificationSchema } from "@/lib/schemas";
import { generateMarkdown, generateFilename } from "@/lib/markdown-export";
import { trackServerEvent } from "@/lib/analytics/posthog-server";

export const runtime = "edge";

const RequestSchema = z.object({
  spec: SpecificationSchema,
  format: z.enum(["markdown", "gherkin", "json"]),
  includeMetadata: z.boolean().default(false),
});

/**
 * POST /api/specs/export
 *
 * Exports a specification in the requested format.
 * Supports: Markdown, Gherkin, JSON
 */
export async function POST(req: NextRequest) {
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

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON body",
          message: "Request payload must be valid JSON.",
        },
        { status: 400 }
      );
    }

    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          message: "Please provide a valid specification.",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { spec, format, includeMetadata } = validation.data;

    // Track spec export event
    await trackServerEvent('spec_exported', {
      format,
      specId: spec.title, // TODO: Use actual spec ID when database is implemented
      includeMetadata,
    }, user.id);

    let content: string;
    let filename: string;
    let contentType: string;

    switch (format) {
      case "markdown":
        content = generateMarkdown(spec, includeMetadata);
        filename = generateFilename(spec);
        contentType = "text/markdown";
        break;

      case "gherkin":
        // Generate pure Gherkin feature file
        content = generateGherkin(spec);
        filename = generateFilename(spec).replace(".md", ".feature");
        contentType = "text/plain";
        break;

      case "json":
        content = JSON.stringify(spec, null, 2);
        filename = generateFilename(spec).replace(".md", ".json");
        contentType = "application/json";
        break;

      default:
        return NextResponse.json(
          {
            error: "Invalid format",
            message: "Supported formats: markdown, gherkin, json",
          },
          { status: 400 }
        );
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[Export API] Error", error);

    // Track export error
    await trackServerEvent('api_error', {
      endpoint: '/api/specs/export',
      errorType: 'export_failed',
      statusCode: 500,
    });

    return NextResponse.json(
      {
        error: "Export failed",
        message: error instanceof Error ? error.message : "Failed to export specification",
      },
      { status: 500 }
    );
  }
}

/**
 * Generates a Gherkin feature file from a specification
 */
function generateGherkin(spec: z.infer<typeof SpecificationSchema>): string {
  const lines: string[] = [];

  lines.push(`Feature: ${spec.title}`);
  lines.push(`  ${spec.description}`);
  lines.push("");

  spec.acceptanceTests.forEach((test) => {
    lines.push(`  Scenario: ${test.scenario}`);
    lines.push(`    Given ${test.given}`);
    lines.push(`    When ${test.when}`);
    lines.push(`    Then ${test.then}`);
    lines.push("");
  });

  return lines.join("\n");
}
