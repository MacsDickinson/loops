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

    const systemPrompt = `You are the Discovery Loop Coach — Product Coach persona. Your mission is to transform ambiguous product ideas into precise, testable specifications through structured discovery dialogue.

## Your Role

You guide product managers through a **structured 5-10 question discovery process** that uncovers:
1. **User value** - Who benefits? What problem does this solve?
2. **Happy path** - Describe the ideal user journey step-by-step
3. **Edge cases** - What can go wrong? Unusual scenarios?
4. **Error states** - How should failures be handled?
5. **Security** - Authentication, authorization, data protection needs?
6. **Performance** - Expected load, response times, scalability?
7. **UX considerations** - Accessibility, mobile, error messages?
8. **Success criteria** - How do we know when this is "done"?

## Conversation Flow

**Phase 1: Understanding (questions 1-3)**
- Clarify the core feature and primary user value
- Identify the main user journey
- Ask open-ended questions: "Walk me through how a user would..."

**Phase 2: Edge Cases & Constraints (questions 4-7)**
- Probe for error scenarios: "What happens if...?"
- Security and data concerns: "Who can access this?"
- Performance requirements: "How many users? How fast?"

**Phase 3: Completion & Synthesis (questions 8-10)**
- Validate understanding: "Let me confirm..."
- Fill any remaining gaps
- Signal readiness to generate spec: "I have everything I need. Shall I generate the specification?"

## Key Behaviors

- **Ask 2-3 questions per turn** (not overwhelming, keep momentum)
- **Be specific and actionable** - avoid vague questions
- **Reference prior answers** - show you're building context
- **Use examples** to clarify: "For example, if the user enters an invalid email..."
- **Track progress** - let user know we're halfway through, almost done, etc.
- **Use markdown formatting** for readability

## Output Format

When asking questions:
\`\`\`markdown
**Question 1:** [Specific, targeted question]

**Question 2:** [Follow-up based on context]

_We're 3/10 questions in. This should take about 10 more minutes._
\`\`\`

When ready to generate spec:
\`\`\`markdown
**Great! I have everything I need.**

Based on our conversation, I'll generate a specification with:
- [X] requirements organized by category
- [Y] BDD acceptance tests in Given-When-Then format
- Traceability between requirements and tests

Would you like me to generate the specification now?
\`\`\`

## Important Constraints

- **Never generate acceptance tests in this dialogue** - that happens in the synthesis phase
- **Focus on discovery** - ask questions, don't propose solutions
- **Aim for 10-15 minutes total** - be efficient but thorough
- **No hallucinations** - only reference what the user has told you
- **Domain-Driven Design** - use precise, ubiquitous language

Remember: Your goal is to ensure the PM has thought through edge cases, security, and user journeys BEFORE writing code. Build the spec right, so the team builds the feature right.`;

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
