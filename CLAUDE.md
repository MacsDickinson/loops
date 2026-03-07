# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Loops is an AI-powered software delivery platform organised around four feedback loops: Discovery, Build, Operationalise, Grow. The first feature being built is the **Discovery Loop Coach** — a conversational AI assistant that turns ambiguous product ideas into precise, testable specifications with BDD acceptance tests.

See `docs/loops-intro.md` for the framework, `PRD.md` for product requirements, and `docs/development-guide.md` for engineering standards.

## Development Standards

- **BDD**: Write Gherkin scenarios (Given-When-Then) before implementation. Outside-in: acceptance tests first, then unit tests, then code.
- **DDD**: Use ubiquitous language (`Specification`, `DiscoverySession`, `Persona`, `DialogueTurn`). Keep business logic in the domain layer, never in API routes or infrastructure.
- **Commits**: Conventional Commits format — `feat(discovery): add persona switching`. Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- **Branches**: Trunk-based. Short-lived feature branches (< 3 days), merge to `main` frequently.
- **Testing**: 90%+ coverage on domain logic, 80%+ on application logic. Integration tests for critical infra paths.
- **Code review**: Required for all production code. Complete within 24 hours.

## Git Workflow

All work must be committed before a task is considered complete. Follow this sequence:

1. **Run tests and lint** before committing — `npm run lint` and `npm run build` must pass. Run any relevant test suites.
2. **Commit with a ticket number** if one exists — include it in the commit footer (e.g. `Closes MAC-15`) or subject (e.g. `feat(discovery): add persona switching [MAC-15]`).
3. **Commit messages** follow Conventional Commits: `<type>(<scope>): <subject>`.
4. **No incomplete work left uncommitted.** If a task produces code changes, they must be committed. Stash or branch partial work — don't leave it in the working tree.

## Commands

All commands run from `projects/loops/src/`:

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint (flat config, v9)
```

## Architecture

- **Next.js 16** with App Router (`src/app/`), React 19, TypeScript strict mode
- **Tailwind CSS v4** with `@tailwindcss/postcss` — uses `@import` syntax, not `tailwind.config.js`
- **shadcn/ui** (base-nova style) with `@base-ui/react` primitives — components live in `src/components/ui/`
- **Vercel AI SDK** (`ai` + `@ai-sdk/anthropic`) for Claude API integration
- **Supabase** for PostgreSQL database
- **Clerk** for authentication
- **Zod** for schema validation and structured AI output

### Path Aliases

`@/*` maps to `src/*` (configured in `tsconfig.json` and `components.json`).

### Key Directories

- `src/app/` — Next.js pages and layouts (App Router)
- `src/components/ui/` — shadcn/ui components (add via `npx shadcn@latest add <component>`)
- `src/lib/utils.ts` — `cn()` helper for Tailwind class merging
- `docs/` — Framework documentation and technical research
- `content/` — Content marketing drafts and strategy

### Styling

Theme uses oklch color space with CSS custom properties defined in `src/app/globals.css`. Light/dark mode supported via `.dark` class. Design tokens cover colors, border radii, and component-specific variables (sidebar, charts).

### Environment Variables

Required keys in `src/.env.local` (see `src/.env.local.example`):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
