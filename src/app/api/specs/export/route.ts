import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { generateMarkdown, generateFilename } from '@/lib/markdown-export';
import { SpecificationSchema } from '@/lib/schemas';

export const runtime = 'edge';

/**
 * Export Specification API Endpoint
 *
 * POST /api/specs/export
 *
 * Exports a specification to Markdown format.
 * Currently accepts the spec in the request body.
 * TODO: When database is implemented, fetch spec by ID from DB.
 *
 * Request Body:
 * {
 *   "spec": Specification,
 *   "format": "markdown" | "gherkin" | "json",
 *   "includeMetadata": boolean
 * }
 *
 * Response:
 * - For format=markdown: Returns Markdown text with Content-Disposition header for download
 * - For format=json: Returns the spec as JSON
 * - For format=gherkin: Returns Gherkin-only format (tests only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Please sign in to export specifications.',
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
          error: 'Invalid JSON body',
          message: 'Request payload must be valid JSON.',
        },
        { status: 400 }
      );
    }

    // Validate request structure
    const validation = SpecificationSchema.safeParse(
      (body as { spec?: unknown })?.spec
    );

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid specification format',
          message: 'The provided specification is invalid.',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const spec = validation.data;
    const format = (body as { format?: string })?.format || 'markdown';
    const includeMetadata = Boolean(
      (body as { includeMetadata?: boolean })?.includeMetadata
    );

    // Handle different export formats
    switch (format) {
      case 'markdown': {
        const markdown = generateMarkdown(spec, includeMetadata);
        const filename = generateFilename(spec);

        return new NextResponse(markdown, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-cache',
          },
        });
      }

      case 'json': {
        return NextResponse.json(spec, {
          headers: {
            'Content-Disposition': `attachment; filename="${generateFilename(spec).replace('.md', '.json')}"`,
          },
        });
      }

      case 'gherkin': {
        // Export only the acceptance tests in Gherkin format
        const gherkin = spec.acceptanceTests
          .map((test) => {
            return `Feature: ${spec.title}

Scenario: ${test.scenario}
  Given ${test.given}
  When ${test.when}
  Then ${test.then}
`;
          })
          .join('\n---\n\n');

        const filename = generateFilename(spec).replace('.md', '.feature');

        return new NextResponse(gherkin, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-cache',
          },
        });
      }

      default:
        return NextResponse.json(
          {
            error: 'Invalid format',
            message: 'Format must be one of: markdown, gherkin, json',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Export API] Error', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to export specification. Please try again.',
      },
      { status: 500 }
    );
  }
}
