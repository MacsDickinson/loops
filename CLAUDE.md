# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. Every Claude instance MUST follow these standards — they are non-negotiable.

## Project Overview

Loops is an AI-powered software delivery platform organised around four feedback loops: Discovery, Build, Operationalise, Grow. The first feature being built is the **Discovery Loop Coach** — a conversational AI assistant that turns ambiguous product ideas into precise, testable specifications with BDD acceptance tests.

## Source of Truth

- Feature PRDs live in `docs/product/` — each feature has its own PRD
- The PRD defines what the application does. BDD tests validate that the PRD is implemented correctly.
- If code behaviour contradicts a PRD, the PRD wins (update code, not the PRD — unless explicitly told otherwise)

## Engineering Standards

### TDD — Test-Driven Development (Red, Green, Refactor)

Every piece of logic MUST be test-driven:

1. **Red**: Write a failing unit test that describes the expected behaviour
2. **Green**: Write the minimum code to make the test pass
3. **Refactor**: Clean up — remove duplication, simplify, delete dead code

Rules:
- Unit tests use **Vitest** (config in `src/vitest.config.ts`)
- Test files live next to source files: `foo.ts` → `foo.test.ts`
- Run tests: `npm test` (unit), `npm run test:e2e` (Playwright)
- All tests MUST pass before committing. Run `npm test` and `npm run lint` before every commit.
- After all tests pass, actively look for redundant code, unused imports, and dead paths — remove them.

### BDD — Behaviour-Driven Development

User requirements are expressed as Gherkin scenarios that validate acceptance criteria:

- Feature files live in `src/e2e/features/` as `.feature` files
- Each feature maps to a PRD in `docs/product/`
- BDD tests prevent regression — if a future change breaks an AC, the BDD test catches it
- Write BDD scenarios BEFORE implementation (outside-in)

```gherkin
Feature: Discovery dialogue
  As a Product Manager
  I want to receive AI-guided clarifying questions
  So that my feature spec covers edge cases

  Scenario: Security persona surfaces auth concerns
    Given a PM is describing an SSO login feature
    When the security persona is activated
    Then the AI asks about session timeout policy
    And the AI asks about MFA requirements
```

### DDD — Domain-Driven Design

**Think architecturally before writing code.** For every change, ask:
1. What domain/bounded context does this belong to?
2. Where in the layer should this live?
3. Am I putting business logic in the right place?

#### Bounded Contexts

| Context | Responsibility |
|---------|---------------|
| **Discovery** | AI dialogue, personas, spec generation |
| **User Management** | Auth, profiles, subscriptions |
| **Integrations** | GitHub, Linear, Jira export |
| **Analytics** | Usage patterns, engagement metrics |

#### Layered Architecture

```
Presentation (API routes, UI components)    → Dependencies flow inward
Application (Use cases, orchestration)      → Domain has NO external dependencies
Domain (Entities, value objects, rules)
Infrastructure (DB, external APIs, clients)
```

- **No business logic in API routes or infrastructure layers**
- Domain layer defines interfaces; infrastructure implements them
- Aggregates enforce invariants and are the unit of persistence

#### Ubiquitous Language

Use these terms consistently in code, tests, docs, and conversation:
- `Specification`, `AcceptanceCriteria`, `DiscoverySession`, `Persona`, `DialogueTurn`
- Avoid generic names: `Data`, `Item`, `Process`, `Thing`, `Handler`, `Manager`

### Git Workflow — Branches & Worktrees

**Every task gets its own branch and worktree:**

1. **Branch from main**: `git branch feat/MAC-XX-description main`
2. **Create worktree**: Use the `EnterWorktree` tool or `git worktree add`
3. **Work in isolation**: All changes happen in the worktree
4. **Run checks before committing**: `npm test && npm run lint && npm run build`
5. **Commit frequently**: Commit after each logical unit of work passes checks. Do NOT leave changes uncommitted across sessions.
6. **Push and open PR**: Push branch, create PR against `main`
7. **Clean up**: After merge, remove worktree and branch

**Commit discipline**: Every completed phase or logical milestone MUST be committed before moving on to the next. Never end a session with uncommitted work.

Branch naming: `<type>/MAC-<number>-<short-description>`
- Types: `feat/`, `fix/`, `refactor/`, `test/`, `docs/`, `chore/`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
Include ticket number: `feat(discovery): add persona switching [MAC-15]`

### Testing Coverage Targets

| Layer | Coverage Target | Test Type |
|-------|----------------|-----------|
| Domain logic | 90%+ | Unit tests (Vitest) |
| Application logic | 80%+ | Unit tests (Vitest) |
| Infrastructure | Critical paths | Integration tests |
| User journeys | Acceptance criteria | BDD / E2E (Playwright) |

## Commands

All commands run from `projects/loops/src/`:

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (flat config, v9)
npm test             # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run test:e2e:ui  # E2E tests with UI
```

## Architecture

- **Next.js 16** with App Router (`src/app/`), React 19, TypeScript strict mode
- **Tailwind CSS v4** with `@tailwindcss/postcss` — uses `@import` syntax, not `tailwind.config.js`
- **shadcn/ui** (base-nova style) with `@base-ui/react` primitives — components live in `src/components/ui/`
- **Vercel AI SDK** (`ai` + `@ai-sdk/anthropic`) for Claude API integration
- **Supabase** for PostgreSQL database
- **Clerk** for authentication
- **Zod** for schema validation and structured AI output
- **Vitest** for unit testing

### Path Aliases

`@/*` maps to `src/*` (configured in `tsconfig.json` and `components.json`).

### Key Directories

```
src/
├── app/                    # Next.js pages, layouts, API routes (Presentation layer)
├── components/ui/          # shadcn/ui components (add via `npx shadcn@latest add <component>`)
├── lib/                    # Business logic, domain, infrastructure
│   ├── schemas.ts          # Zod schemas (domain models)
│   ├── utils.ts            # cn() helper for Tailwind class merging
│   ├── analytics/          # Analytics domain
│   └── supabase/           # Database infrastructure
├── e2e/                    # Playwright E2E / BDD tests
docs/
├── product/                # Feature PRDs (source of truth)
├── architecture/           # ADRs, tech stack decisions
├── guides/                 # Setup guides, how-tos
└── research/               # Analysis, evaluations
```

### Styling

Theme uses oklch color space with CSS custom properties defined in `src/app/globals.css`. Light/dark mode supported via `.dark` class.

Font stack: **Geist Sans** (`--font-geist-sans`) and **Geist Mono** (`--font-geist-mono`). Font CSS variables are loaded via Next.js `next/font/google` in the root layout and applied to `<html>`. The `font-sans` utility is set globally in `globals.css` on `html`.

### UI Validation Checklist

After making UI/frontend changes, verify the following before committing:

1. **Build passes**: `npm run build` — catches TypeScript errors, invalid imports, and SSR issues
2. **HTML validity**: Check for invalid nesting (e.g. `<li>` inside `<li>`, `<div>` inside `<p>`, `<a>` inside `<a>`). shadcn/ui components render specific HTML elements — check their source in `src/components/ui/` before nesting them
3. **Hydration safety**: Ensure server and client HTML match. Common causes: invalid HTML nesting, browser auto-correction, conditional rendering based on client-only state
4. **Asset paths**: Images in `src/public/` are served from `/` (e.g. `src/public/logo.png` → `<Image src="/logo.png" />`). Always use `next/image` for static images
5. **Font inheritance**: Fonts are set globally on `<html>` — do NOT add font variable classes to `<body>` or individual components. If fonts appear wrong (e.g. Times/serif), check that CSS variables resolve at the element where the `font-*` utility is applied
6. **Design consistency**: When modifying any page, ensure it uses the same design tokens (colors, spacing, borders, backdrop blur) as the landing page and app shell. The landing page (`src/app/page.tsx`) is the design reference

### Environment Variables

Required keys in `src/.env.local` (see `src/.env.local.example`):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

## Documentation Structure

The `docs/` folder is organised by purpose:

- **`docs/product/`** — PRDs for each feature. These are the source of truth for what the application should do. BDD tests validate these.
- **`docs/architecture/`** — ADRs (Architecture Decision Records), tech stack decisions, system design.
- **`docs/guides/`** — Setup instructions, workflow guides, operational how-tos.
- **`docs/research/`** — Technology evaluations, competitive analysis, strategic research.

When adding documentation:
1. Determine the category
2. Place it in the correct subfolder
3. If it's a feature PRD, ensure corresponding BDD tests exist or are planned
