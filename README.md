# Loops

AI-powered software delivery, organised around feedback loops.

Loops is a platform for teams building software with AI. It reorganises delivery around four feedback loops — **Discovery**, **Build**, **Operationalise**, **Grow** — giving teams the tools to move faster without losing clarity or quality.

The [Loops framework](docs/loops-intro.md) is the underlying thesis: AI is compressing build time, which moves the bottleneck to discovery (understanding *what* to build), operationalisation (making it production-grade), and growth (learning from what's live). Loops provides tooling for each stage.

## Discovery Loop (First Feature)

The first capability shipping is the **Discovery Loop Coach** — a conversational AI assistant that turns ambiguous product ideas into precise, testable specifications.

### The Problem

AI coding tools can build features in hours, but unclear requirements mean building the *wrong* thing fast. The faster you can build, the more expensive ambiguity becomes.

### How It Works

1. **Describe the feature** — Natural language, rough idea ("Add SSO login with Google and Microsoft")
2. **AI asks clarifying questions** — Edge cases, security concerns, user journeys, acceptance criteria
3. **Spec emerges through dialogue** — Natural language requirements + structured BDD acceptance tests
4. **Export and build** — Markdown for your repo, or directly to a GitHub PR

Multiple AI personas participate in the dialogue:
- **Product Coach** — Probes for user value, edge cases, journeys
- **Security Expert** — Reviews for vulnerabilities, compliance requirements
- **UX Analyst** — Questions accessibility, user flows, error states
- **Domain Expert** — Validates business rules (configurable per team)

## Roadmap

| Loop | Purpose | Status |
|------|---------|--------|
| **Discovery** | Turn ideas into precise, testable specs | In development |
| **Build** | Turn specs into working software with AI coding agents | Planned |
| **Operationalise** | Graduate validated software to production quality | Planned |
| **Grow** | Measure, learn, and feed evidence back into Discovery | Planned |

## Tech Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **AI:** Anthropic Claude API via [Vercel AI SDK](https://sdk.vercel.ai)
- **Database:** PostgreSQL (Supabase)
- **Auth:** Clerk
- **Hosting:** Vercel
- **UI Components:** shadcn/ui

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
cd projects/loops/src

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Add your keys to `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
projects/loops/
├── docs/                  # Framework documentation and research
│   ├── loops-intro.md     # Loops framework paper
│   ├── loops-analysis.md  # Strategic analysis
│   └── tech-stack-research.md
├── content/               # Content marketing strategy
├── PRD.md                 # Product Requirements Document
└── src/                   # Next.js application
    └── app/
        ├── layout.tsx
        └── page.tsx
```

## Documentation

- [Loops Framework](docs/loops-intro.md) — The underlying delivery framework
- [Strategic Analysis](docs/loops-analysis.md) — Market analysis and product opportunities
- [Tech Stack Research](docs/tech-stack-research.md) — Architecture decisions
- [PRD](PRD.md) — Full product requirements document

## Status

**Stage: Pilot** — Early development. Working prototype at [discovery-loop.lovable.app](https://discovery-loop.lovable.app). Next.js application scaffolded, building toward MVP.

## License

Private — All rights reserved.
