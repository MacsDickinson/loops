import { anthropic } from "@ai-sdk/anthropic";
import { streamText, type ModelMessage } from "ai";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Edge Runtime for global performance
export const runtime = "edge";

// Maximum duration for Edge Runtime (30s max for Vercel free tier)
export const maxDuration = 30;

// Request schema validation
const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1),
    })
  ),
});

// Rate limiting store (in-memory for MVP, should use Redis/KV in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Rate limit configuration
const RATE_LIMITS = {
  FREE: { max: 10, window: 24 * 60 * 60 * 1000 }, // 10 requests per day
  PRO: { max: Infinity, window: 0 }, // Unlimited
};

/**
 * Check rate limit for a user
 * Returns true if request is allowed, false if rate limited
 */
function checkRateLimit(userId: string, isPro: boolean): boolean {
  // Pro users have no limits
  if (isPro) return true;

  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  // No existing limit or expired
  if (!userLimit || now > userLimit.resetAt) {
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMITS.FREE.window,
    });
    return true;
  }

  // Check if under limit
  if (userLimit.count < RATE_LIMITS.FREE.max) {
    userLimit.count++;
    return true;
  }

  // Rate limited
  return false;
}

/**
 * Discovery Loop Coach API endpoint
 * Handles AI-powered discovery sessions with Claude
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { messages } = validation.data;

    // Input sanitization - already done by Zod schema
    // Additional check: prevent excessively long messages
    const MAX_MESSAGE_LENGTH = 10000;
    for (const msg of messages) {
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json(
          {
            error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`,
          },
          { status: 400 }
        );
      }
    }

    // Rate limiting
    // TODO: In production, check user's subscription tier from database
    const isPro = false; // Hardcoded for MVP
    const isAllowed = checkRateLimit(user.id, isPro);

    if (!isAllowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message:
            "You've reached your daily limit of 10 requests. Upgrade to Pro for unlimited access.",
        },
        { status: 429 }
      );
    }

    // System prompt for Discovery Loop Coach
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

    // Prepare messages with system prompt
    const messagesWithSystem: ModelMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Call Claude API with streaming
    const result = streamText({
      model: anthropic("claude-sonnet-4-6-20250929"), // Claude Sonnet 4.6 as specified in requirements
      messages: messagesWithSystem,
      temperature: 0.7, // Balanced creativity and consistency
      maxOutputTokens: 2048, // Reasonable limit for responses
      async onFinish({ text, usage, finishReason }) {
        // Log completion for observability (in production, send to analytics)
        console.log("[Discovery API] Completion:", {
          userId: user.id,
          messageCount: messages.length,
          tokensUsed: usage?.totalTokens,
          finishReason,
          textLength: text.length,
        });
      },
    });

    // Return streaming response
    return result.toTextStreamResponse({
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // Error handling with retry hints
    console.error("[Discovery API] Error:", error);

    // Anthropic API errors
    if (error instanceof Error) {
      // Rate limit from Anthropic
      if (error.message.includes("rate_limit")) {
        return NextResponse.json(
          {
            error: "AI service rate limit exceeded",
            message: "Please try again in a few moments.",
            retryable: true,
          },
          { status: 429 }
        );
      }

      // Invalid API key
      if (error.message.includes("authentication")) {
        return NextResponse.json(
          {
            error: "AI service configuration error",
            message: "Please contact support.",
            retryable: false,
          },
          { status: 500 }
        );
      }

      // Timeout or network errors
      if (
        error.message.includes("timeout") ||
        error.message.includes("network")
      ) {
        return NextResponse.json(
          {
            error: "Connection timeout",
            message: "The request took too long. Please try again.",
            retryable: true,
          },
          { status: 504 }
        );
      }
    }

    // Generic error fallback
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Something went wrong. Please try again.",
        retryable: true,
      },
      { status: 500 }
    );
  }
}
