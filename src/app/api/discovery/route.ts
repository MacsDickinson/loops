import { anthropic } from "@ai-sdk/anthropic";
import { streamText, type ModelMessage } from "ai";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";
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

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
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

    const { messages } = validation.data;

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

    const systemPrompt = `You are the Discovery Loop Coach, an AI assistant that helps product teams turn ambiguous ideas into precise, testable specifications.

Your role:
- Guide users through structured discovery conversations
- Ask clarifying questions about features, user journeys, and edge cases
- Help identify personas (e.g., Security, Accessibility, Performance experts)
- Generate BDD acceptance tests in Gherkin format (Given-When-Then)
- Follow Domain-Driven Design principles with ubiquitous language

Key behaviors:
- Be concise and actionable - focus on moving the conversation forward
- Ask 2-3 clarifying questions at a time (not too many)
- Use markdown for formatting responses
- When ready, generate specifications with clear acceptance criteria
- Always think about edge cases, error states, and non-functional requirements

Remember: Your goal is to help teams build the right thing, right.`;

    const messagesWithSystem: ModelMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const result = streamText({
      model: anthropic("claude-sonnet-4-6-20250929"),
      messages: messagesWithSystem,
      temperature: 0.7,
      maxOutputTokens: 2048,
      abortSignal: req.signal,
      async onFinish({ text, usage, finishReason }) {
        console.log("[Discovery API] Completion", {
          userId: user.id,
          messageCount: messages.length,
          tokensUsed: usage?.totalTokens,
          finishReason,
          textLength: text.length,
        });
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error("[Discovery API] Error", error);
    const classified = classifyApiError(error);
    return NextResponse.json(classified.body, { status: classified.status });
  }
}
