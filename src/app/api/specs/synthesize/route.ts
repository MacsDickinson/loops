import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AIGeneratedRequirementsSchema,
  AIGeneratedTestsSchema,
} from "@/lib/schemas";
import {
  getOrCreateUser,
  createSpecification,
  updateSpecification,
  createSpecAnalytics,

} from "@/lib/supabase/helpers";

export const runtime = "nodejs";
export const maxDuration = 30;

const RequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1),
      })
    )
    .min(2), // At least user + assistant exchange
  title: z.string().min(1).max(200).optional(),
  specId: z.string().uuid().optional(), // Optional spec ID for updating existing spec
});

/**
 * POST /api/specs/synthesize
 *
 * Synthesizes a structured specification from a discovery dialogue.
 * Takes conversation history and generates:
 * - Structured requirements with categories and priorities
 * - BDD acceptance tests in Given-When-Then format
 * - Traceability between requirements and tests
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
          message: "Please provide a valid conversation history.",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { messages, title, specId } = validation.data;
    const startTime = Date.now();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: "AI provider not configured",
          message: "The AI service is not configured. Please contact support.",
        },
        { status: 503 }
      );
    }

    // Get or create user for persistence
    let userId: string | null = null;
    try {
      const { data, error } = await getOrCreateUser(
        user.id,
        user.emailAddresses[0]?.emailAddress || '',
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown'
      );
      if (!error && data) {
        userId = data;
      }
    } catch (error) {
      console.error('[Synthesize API] Failed to get/create user:', error);
      // Continue without persistence
    }

    // Build conversation context for requirements generation
    const conversationSummary = messages
      .map((msg) => `${msg.role === "user" ? "PM" : "Coach"}: ${msg.content}`)
      .join("\n\n");

    // Step 1: Generate structured requirements
    const requirementsPrompt = `Based on this discovery dialogue, extract structured requirements.

${conversationSummary}

Analyze the conversation and identify all requirements discussed. For each requirement:
- Extract the specific functionality or constraint
- Categorize it (functional, non_functional, security, performance, ux, business_rule)
- Assign priority (critical, high, medium, low)

Focus on:
- Explicit requirements stated by the PM
- Implicit requirements from discussed edge cases
- Security, performance, and UX requirements mentioned
- Error handling and validation requirements

Be precise and actionable. Use the exact terminology from the conversation.`;

    const requirementsResult = await generateObject({
      model: anthropic("claude-sonnet-4-6-20250929"),
      schema: AIGeneratedRequirementsSchema,
      prompt: requirementsPrompt,
      temperature: 0.3, // Lower temperature for more consistent extraction
    });

    const requirements = requirementsResult.object;

    // Step 2: Generate BDD acceptance tests
    const testsPrompt = `Based on this discovery dialogue and the extracted requirements, generate BDD acceptance tests.

${conversationSummary}

**Requirements identified:**
${requirements.requirements.map((req, i) => `${i + 1}. ${req.text}`).join("\n")}

Generate comprehensive BDD tests in Given-When-Then format that cover:
- Happy path scenarios
- Edge cases discussed
- Error scenarios mentioned
- Security and validation requirements

Each test should:
- Have a clear scenario name
- Use specific, testable conditions
- Be independent and atomic
- Map to one or more requirements

Follow BDD best practices:
- Given: Setup/preconditions
- When: Action/trigger
- Then: Expected outcome

Be specific with data (e.g., "user with email 'test@example.com'" not just "a user").`;

    const testsResult = await generateObject({
      model: anthropic("claude-sonnet-4-6-20250929"),
      schema: AIGeneratedTestsSchema,
      prompt: testsPrompt,
      temperature: 0.3,
    });

    const tests = testsResult.object;

    // Step 3: Extract feature title from conversation if not provided
    const featureTitle =
      title ||
      messages[0]?.content.slice(0, 100) ||
      "Untitled Specification";

    // Step 4: Persist specification to database
    let finalSpecId = specId;
    let savedSpec = null;

    if (userId) {
      try {
        const mapToRequirement = (req: any, category: string) => ({
          id: crypto.randomUUID(),
          category,
          description: req.text,
          priority: req.priority as 'must-have' | 'should-have' | 'nice-to-have',
          acceptance_criteria: [],
        });

        const requirementsJSON = {
          functional: requirements.requirements
            .filter(r => r.category === 'functional')
            .map(r => mapToRequirement(r, 'Functional')),
          security: requirements.requirements
            .filter(r => r.category === 'security')
            .map(r => mapToRequirement(r, 'Security')),
          performance: requirements.requirements
            .filter(r => r.category === 'performance')
            .map(r => mapToRequirement(r, 'Performance')),
          ux: requirements.requirements
            .filter(r => r.category === 'ux')
            .map(r => mapToRequirement(r, 'UX')),
          other: requirements.requirements
            .filter(r => !['functional', 'security', 'performance', 'ux'].includes(r.category))
            .map(r => mapToRequirement(r, 'Other')),
        };

        const acceptanceTestsJSON = tests.tests.map((test) => ({
          scenario: test.scenario,
          given: test.given,
          when: test.when,
          then: test.then,
        }));

        if (finalSpecId) {
          // Update existing spec
          const { data, error } = await updateSpecification(finalSpecId, {
            title: featureTitle,
            requirements_json: requirementsJSON,
            acceptance_tests_json: acceptanceTestsJSON,
            status: 'complete',
          });

          if (error) {
            console.error('[Synthesize API] Failed to update spec:', error);
          } else {
            savedSpec = data;
            console.log('[Synthesize API] Updated spec:', finalSpecId);
          }
        } else {
          // Create new spec
          const { data, error } = await createSpecification({
            user_id: userId,
            title: featureTitle,
            description: null,
            requirements_json: requirementsJSON,
            acceptance_tests_json: acceptanceTestsJSON,
            status: 'complete',
            linked_github_pr: null,
            linked_linear_issue: null,
          });

          if (error) {
            console.error('[Synthesize API] Failed to create spec:', error);
          } else {
            savedSpec = data;
            finalSpecId = data?.id;
            console.log('[Synthesize API] Created new spec:', finalSpecId);
          }
        }

        // Save analytics if spec was saved
        if (finalSpecId && savedSpec) {
          const dialogueTurnCount = Math.floor(messages.length / 2);
          const timeToCompleteSec = Math.floor((Date.now() - startTime) / 1000);

          await createSpecAnalytics({
            spec_id: finalSpecId,
            time_to_complete_sec: timeToCompleteSec,
            dialogue_turns: dialogueTurnCount,
            ai_tokens_used: 0, // Will be tracked separately via analytics events
            user_satisfaction_score: null,
          });

          console.log('[Synthesize API] Saved analytics for spec:', finalSpecId);
        }
      } catch (error) {
        console.error('[Synthesize API] Persistence error:', error);
        // Continue and return spec data even if persistence fails
      }
    }

    // Return structured specification data
    return NextResponse.json({
      title: featureTitle,
      specId: finalSpecId, // Include specId in response
      requirements: requirements.requirements.map((req) => ({
        text: req.text,
        category: req.category,
        priority: req.priority,
      })),
      acceptanceTests: tests.tests.map((test) => ({
        scenario: test.scenario,
        given: test.given,
        when: test.when,
        then: test.then,
      })),
      metadata: {
        dialogueTurnCount: Math.floor(messages.length / 2),
        personasUsed: ["product_coach"],
      },
      reasoning: {
        requirements: requirements.reasoning,
        tests: tests.reasoning,
      },
    });
  } catch (error) {
    console.error("[Synthesize API] Error", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Synthesis failed",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to synthesize specification. Please try again.",
      },
      { status: 500 }
    );
  }
}
