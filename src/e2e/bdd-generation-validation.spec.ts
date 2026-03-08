import { test, expect } from "@playwright/test";
import {
  AIGeneratedTestsSchema,
  AcceptanceTestSchema,
  RequirementSchema,
  type AcceptanceTest,
  type Requirement,
} from "@/lib/schemas";
import { generateMarkdown } from "@/lib/markdown-export";

const requirementAId = "123e4567-e89b-12d3-a456-426614174010";
const requirementBId = "123e4567-e89b-12d3-a456-426614174011";

function validateTraceability(requirements: Requirement[], tests: AcceptanceTest[]) {
  const requirementIds = new Set(requirements.map((r) => r.id));
  const linkedIds = new Set(tests.flatMap((t) => t.linkedRequirementIds));

  const everyRequirementHasTest = requirements.every((req) => linkedIds.has(req.id));
  const everyTestLinkIsValid = [...linkedIds].every((id) => requirementIds.has(id));

  return {
    everyRequirementHasTest,
    everyTestLinkIsValid,
  };
}

test.describe("BDD generation validation contracts", () => {
  test("accepts valid AI generated BDD payload shape", () => {
    const payload = {
      tests: [
        {
          scenario: "Successful login",
          given: 'a user account with email "test@example.com" exists',
          when: "the user enters valid credentials",
          then: "the user is redirected to the dashboard",
        },
      ],
      reasoning: "Derived from authentication and session requirements.",
    };

    const parsed = AIGeneratedTestsSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  test("rejects AI generated test payload missing Given/When/Then fields", () => {
    const payload = {
      tests: [
        {
          scenario: "Missing then clause",
          given: "a valid user exists",
          when: "the user signs in",
        },
      ],
    };

    const parsed = AIGeneratedTestsSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  test("rejects acceptance tests with invalid traceability ids", () => {
    const parsed = AcceptanceTestSchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174020",
      scenario: "Reject invalid linkage",
      given: "a requirement exists",
      when: "test links use malformed id",
      then: "validation fails",
      linkedRequirementIds: ["not-a-uuid"],
    });

    expect(parsed.success).toBe(false);
  });

  test("validates one-to-many and many-to-one requirement/test traceability", () => {
    const requirements = [
      RequirementSchema.parse({
        id: requirementAId,
        text: "System validates login credentials",
        category: "functional",
        priority: "high",
        linkedTestIds: [],
      }),
      RequirementSchema.parse({
        id: requirementBId,
        text: "System rate-limits repeated failed attempts",
        category: "security",
        priority: "critical",
        linkedTestIds: [],
      }),
    ];

    const tests = [
      AcceptanceTestSchema.parse({
        id: "123e4567-e89b-12d3-a456-426614174021",
        scenario: "Login succeeds with valid credentials",
        given: "a registered user is on the sign-in form",
        when: "they submit valid email and password",
        then: "they access the dashboard",
        linkedRequirementIds: [requirementAId],
      }),
      AcceptanceTestSchema.parse({
        id: "123e4567-e89b-12d3-a456-426614174022",
        scenario: "Rate-limit triggers after repeated failures",
        given: "a user has five failed attempts in one minute",
        when: "they attempt another login",
        then: "the request is blocked with a retry window",
        linkedRequirementIds: [requirementAId, requirementBId],
      }),
    ];

    const traceability = validateTraceability(requirements, tests);
    expect(traceability.everyRequirementHasTest).toBe(true);
    expect(traceability.everyTestLinkIsValid).toBe(true);
  });

  test("renders valid Gherkin blocks for each generated acceptance test", () => {
    const spec = {
      id: "123e4567-e89b-12d3-a456-426614174030",
      userId: "123e4567-e89b-12d3-a456-426614174031",
      title: "Authentication BDD Coverage",
      description: "Validate BDD formatting and export consistency.",
      requirements: [
        {
          id: requirementAId,
          text: "System validates credentials",
          category: "functional",
          priority: "high",
          linkedTestIds: [],
        },
      ],
      acceptanceTests: [
        {
          id: "123e4567-e89b-12d3-a456-426614174032",
          scenario: "Valid login",
          given: "a registered user exists",
          when: "the user submits valid credentials",
          then: "the user reaches the dashboard",
          linkedRequirementIds: [requirementAId],
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174033",
          scenario: "Invalid login",
          given: "a registered user exists",
          when: "the user submits an incorrect password",
          then: "an authentication error is shown",
          linkedRequirementIds: [requirementAId],
        },
      ],
      status: "complete" as const,
      metadata: {
        dialogueTurnCount: 4,
        personasUsed: ["product_agent"] as const,
      },
      createdAt: new Date("2026-03-07T00:00:00.000Z"),
      updatedAt: new Date("2026-03-07T00:10:00.000Z"),
    };

    const markdown = generateMarkdown(spec);

    expect(markdown).toContain("## Acceptance Tests");
    expect(markdown).toContain("Scenario: Valid login");
    expect(markdown).toContain("Given a registered user exists");
    expect(markdown).toContain("When the user submits valid credentials");
    expect(markdown).toContain("Then the user reaches the dashboard");
    expect(markdown).toContain("Scenario: Invalid login");
  });
});
