import { anthropic } from "@ai-sdk/anthropic";
import { streamText, generateObject, type ModelMessage } from "ai";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { PersonaType } from "@/contexts/discovery/domain/value-objects/persona-type";
import { SupabaseSessionRepository } from "@/contexts/discovery/infrastructure/supabase-session-repository";
import { SupabaseSpecificationRepository } from "@/contexts/discovery/infrastructure/supabase-specification-repository";
import { SupabaseIdeaRepository } from "@/contexts/product-management/infrastructure/supabase-idea-repository";
import { AISpecExtractionSchema } from "@/lib/schemas";
import { trackServerEvent } from "@/lib/analytics/posthog-server";
import { getOrCreateUser, getActivePrompt } from "@/lib/supabase/helpers";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_MESSAGE_LENGTH = 10_000;
const MAX_MESSAGES = 40;
const MAX_TOTAL_DIALOGUE_LENGTH = 50_000;

const RequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
  sessionId: z.string().uuid().optional(),
  personaType: z
    .enum(["product_agent", "security_expert", "ux_analyst", "domain_expert"])
    .default("product_agent"), // Persona selection
});

const DISALLOWED_CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const POTENTIAL_XSS_PATTERN = /<\s*script|javascript:|on\w+\s*=/i;

const RATE_LIMITS = {
  FREE: { max: 10, windowMs: 24 * 60 * 60 * 1000 },
};

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

function checkRateLimit(userId: string, isPro: boolean): RateLimitResult {
  if (isPro) {
    return { allowed: true, remaining: Number.MAX_SAFE_INTEGER, resetAt: 0 };
  }

  const now = Date.now();
  const existing = rateLimitStore.get(userId);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + RATE_LIMITS.FREE.windowMs;
    rateLimitStore.set(userId, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMITS.FREE.max - 1, resetAt };
  }

  if (existing.count < RATE_LIMITS.FREE.max) {
    existing.count += 1;
    return {
      allowed: true,
      remaining: RATE_LIMITS.FREE.max - existing.count,
      resetAt: existing.resetAt,
    };
  }

  return { allowed: false, remaining: 0, resetAt: existing.resetAt };
}

function classifyApiError(error: unknown) {
  if (!(error instanceof Error)) {
    return {
      status: 500,
      body: {
        error: "Internal server error",
        message: "Something went wrong. Please try again.",
        retryable: true,
      },
    };
  }

  const message = error.message.toLowerCase();

  if (message.includes("rate_limit") || message.includes("429")) {
    return {
      status: 429,
      body: {
        error: "AI service is busy",
        message: "The AI service is currently rate limited. Please retry shortly.",
        retryable: true,
      },
    };
  }

  if (message.includes("authentication") || message.includes("api key") || message.includes("unauthorized")) {
    return {
      status: 503,
      body: {
        error: "AI service unavailable",
        message: "The AI service is temporarily unavailable. Please contact support if this persists.",
        retryable: false,
      },
    };
  }

  if (message.includes("timeout") || message.includes("network") || message.includes("fetch failed")) {
    return {
      status: 504,
      body: {
        error: "Request timeout",
        message: "The request took too long due to a network issue. Please try again.",
        retryable: true,
      },
    };
  }

  return {
    status: 500,
    body: {
      error: "Internal server error",
      message: "Something went wrong. Please try again.",
      retryable: true,
    },
  };
}

const sessionRepo = new SupabaseSessionRepository();
const specRepo = new SupabaseSpecificationRepository();
const ideaRepo = new SupabaseIdeaRepository();

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const user = await currentUser();
    if (!user) {
      await trackServerEvent('api_error', {
        endpoint: '/api/discovery',
        errorType: 'unauthorized',
        statusCode: 401,
      });

      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please sign in to continue.",
          retryable: false,
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
          retryable: false,
        },
        { status: 400 }
      );
    }

    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          message: "Please send a non-empty conversation with valid message roles and content.",
          details: validation.error.issues,
          retryable: false,
        },
        { status: 400 }
      );
    }

    const { messages, sessionId, personaType } = validation.data;

    const totalDialogueLength = messages.reduce(
      (sum, msg) => sum + msg.content.length,
      0
    );

    if (totalDialogueLength > MAX_TOTAL_DIALOGUE_LENGTH) {
      return NextResponse.json(
        {
          error: "Conversation too large",
          message: "Please shorten the conversation and try again.",
          retryable: false,
        },
        { status: 400 }
      );
    }

    for (const msg of messages) {
      if (DISALLOWED_CONTROL_CHARACTERS.test(msg.content)) {
        return NextResponse.json(
          {
            error: "Invalid characters in message",
            message: "Please remove unsupported control characters and retry.",
            retryable: false,
          },
          { status: 400 }
        );
      }

      if (POTENTIAL_XSS_PATTERN.test(msg.content)) {
        return NextResponse.json(
          {
            error: "Unsafe content detected",
            message: "Please remove embedded scripts or event handler syntax from your message.",
            retryable: false,
          },
          { status: 400 }
        );
      }
    }

    const rateLimit = checkRateLimit(user.id, false);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "You have reached your daily free-tier limit (10 requests). Please try again tomorrow.",
          retryable: true,
          retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: "AI provider not configured",
          message: "The AI service is not configured. Please contact support.",
          retryable: false,
        },
        { status: 503 }
      );
    }

    // Ensure user exists in DB (for analytics tracking)
    try {
      await getOrCreateUser(
        user.id,
        user.emailAddresses[0]?.emailAddress || '',
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown'
      );
    } catch (error) {
      console.error('[Discovery API] Failed to get/create user:', error);
    }

    // Load active prompt for the selected persona
    let systemPrompt: string;
    try {
      const { data: prompt, error: promptError } = await getActivePrompt(personaType);

      if (promptError || !prompt) {
        console.error('[Discovery API] Failed to load prompt for persona:', personaType, promptError);
        return NextResponse.json(
          {
            error: "Persona not configured",
            message: `The ${personaType} persona is not currently available. Please try another persona or contact support.`,
            retryable: false,
          },
          { status: 503 }
        );
      }

      systemPrompt = prompt;
      console.log(`[Discovery API] Loaded prompt for persona: ${personaType}`);
    } catch (error) {
      console.error('[Discovery API] Error loading prompt:', error);
      return NextResponse.json(
        {
          error: "Failed to load persona",
          message: "Could not load the AI persona configuration. Please try again.",
          retryable: true,
        },
        { status: 500 }
      );
    }

    const messagesWithSystem: ModelMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      messages: messagesWithSystem,
      temperature: 0.7,
      maxOutputTokens: 2048,
      abortSignal: req.signal,
      async onFinish({ text, usage, finishReason }) {
        const latencyMs = Date.now() - startTime;

        console.log("[Discovery API] Completion", {
          userId: user.id,
          personaType,
          messageCount: messages.length,
          tokensUsed: usage?.totalTokens,
          finishReason,
          textLength: text.length,
        });

        // Save dialogue turn if we have a session
        if (sessionId) {
          try {
            const turnOrder = Math.floor(messages.length / 2) + 1;
            const userMessage = messages[messages.length - 1];

            if (userMessage?.role === 'user') {
              await sessionRepo.addDialogueTurn({
                sessionId,
                personaType: personaType as PersonaType,
                question: userMessage.content,
                answer: text,
                turnOrder,
                tokensUsed: usage?.totalTokens ?? null,
                latencyMs,
              });
              console.log('[Discovery API] Saved dialogue turn:', { sessionId, turnOrder, personaType });
            }
          } catch (error) {
            console.error('[Discovery API] Failed to save dialogue turn:', error);
          }
        }

        // Extract spec updates from the latest turn
        if (sessionId) {
          try {
            const session = await sessionRepo.findById(sessionId);
            if (session) {
              const spec = await specRepo.findById(session.specificationId);
              if (spec) {
                const userMessage = messages[messages.length - 1];
                const currentTests = spec.acceptanceTests.map(
                  (t: { scenario: string }) => t.scenario
                ).join('\n');

                const extractionPrompt = `You are analysing a discovery conversation to extract a Product Requirements Document (PRD) and acceptance tests.

**Latest exchange:**
User: ${userMessage?.content ?? ''}
Assistant: ${text}

**Current PRD:**
${spec.prdMarkdown || '(empty — this is the first extraction)'}

**Current test scenarios:**
${currentTests || '(none yet)'}

**Current idea title:** ${spec.title}

Your task:
1. **PRD**: Update the PRD markdown document. Build it incrementally — preserve existing content that is still accurate, refine sections based on new information, and add new sections as topics are discussed. Use these sections as appropriate (only include sections where there is content):
   - **Overview** — what is being built and why
   - **User Stories** — as a [role], I want [goal], so that [benefit]
   - **User Journey** — step-by-step flow of the primary experience
   - **Business Rules** — constraints, validations, domain logic
   - **Security Considerations** — auth, data protection, access control
   - **Performance Requirements** — load, latency, scalability
   - **Out of Scope** — explicitly excluded items
   - **Open Questions** — unresolved decisions

2. **Acceptance Tests**: Identify any NEW BDD acceptance tests implied by the conversation. Return the COMPLETE updated list (existing + new). Do not duplicate existing scenarios.

3. **Title**: If the title is "Untitled Idea" or generic, suggest a better title and one-line description.

Set hasChanges to true only if there are actual updates to the PRD, new tests, or title changes.`;

                const extraction = await generateObject({
                  model: anthropic("claude-sonnet-4-20250514"),
                  schema: AISpecExtractionSchema,
                  prompt: extractionPrompt,
                  temperature: 0.2,
                });

                if (extraction.object.hasChanges) {
                  const { prdMarkdown, acceptanceTests, ideaTitle, ideaDescription } = extraction.object;

                  const updatePayload: Parameters<typeof specRepo.update>[1] = {};

                  if (prdMarkdown) {
                    updatePayload.prdMarkdown = prdMarkdown;
                  }

                  if (acceptanceTests.length > 0) {
                    const existingTestsByScenario = new Map(
                      (spec.acceptanceTests ?? []).map((t) => [t.scenario, t]),
                    );

                    updatePayload.acceptanceTests = acceptanceTests.map((t) => {
                      const existing = existingTestsByScenario.get(t.scenario);

                      return {
                        id: existing?.id ?? crypto.randomUUID(),
                        scenario: t.scenario,
                        given: t.given,
                        when: t.when,
                        then: t.then,
                        linkedRequirementIds: [],
                      };
                    });
                  }

                  if (Object.keys(updatePayload).length > 0) {
                    await specRepo.update(spec.id, updatePayload);
                    console.log('[Discovery API] Spec updated:', {
                      specId: spec.id,
                      hasPrd: !!prdMarkdown,
                      tests: acceptanceTests.length,
                    });
                  }

                  // Update idea title if extracted
                  if (ideaTitle && spec.ideaId && (spec.title === 'Untitled Idea' || !spec.title)) {
                    await ideaRepo.update(spec.ideaId, {
                      name: ideaTitle,
                      description: ideaDescription ?? '',
                    });
                    await specRepo.update(spec.id, {
                      title: ideaTitle,
                      description: ideaDescription ?? '',
                    });
                    console.log('[Discovery API] Idea title updated:', ideaTitle);
                  }
                }
              }
            }
          } catch (extractionError) {
            console.error('[Discovery API] Spec extraction failed:', extractionError);
          }
        }

        // Track dialogue turn performance and token usage
        await trackServerEvent('dialogue_turn_latency', {
          latencyMs,
          sessionId: sessionId || 'unknown',
          messageCount: messages.length,
          personaType,
        }, user.id);

        if (usage?.totalTokens) {
          await trackServerEvent('ai_token_usage', {
            sessionId: sessionId || 'unknown',
            tokens: usage.totalTokens,
            model: 'claude-sonnet-4-6',
            personaType,
          }, user.id);
        }
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-Persona-Type": personaType,
        ...(sessionId ? { "X-Session-Id": sessionId } : {}),
      },
    });
  } catch (error) {
    console.error("[Discovery API] Error", error);
    const classified = classifyApiError(error);

    // Track API errors
    await trackServerEvent('api_error', {
      endpoint: '/api/discovery',
      errorType: classified.body.error,
      statusCode: classified.status,
    });

    return NextResponse.json(classified.body, { status: classified.status });
  }
}
