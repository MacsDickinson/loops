import { anthropic } from "@ai-sdk/anthropic";
import { streamText, type ModelMessage } from "ai";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { PersonaType } from "@/contexts/discovery/domain/value-objects/persona-type";
import { SupabaseSessionRepository } from "@/contexts/discovery/infrastructure/supabase-session-repository";
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
    .enum(["product_coach", "security_expert", "ux_analyst", "domain_expert"])
    .default("product_coach"), // Persona selection
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
