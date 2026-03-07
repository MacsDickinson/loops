# Technical Discovery & Implementation Plan

**Prepared by:** Technical Product Lead
**Date:** March 7, 2026
**Status:** Technical Review Complete

> This document was extracted from the [Discovery Loop Coach PRD](../product/discovery-loop-coach-prd.md) to separate product requirements from technical implementation details.

---

## 1. Tech Stack Validation

**Recommendation: Approved with High Confidence**

The all-TypeScript stack (Next.js + Vercel AI SDK) is the right choice for MVP:

- **Architecture simplicity**: Single language eliminates 50% of operational complexity
- **Cost efficiency**: $20-50/month vs $70-150/month with Python backend
- **Development velocity**: Frontend engineers can own full features end-to-end
- **AI capabilities**: Vercel AI SDK provides all required functionality for MVP scope
  - Multi-turn conversations
  - Structured output (Zod schemas)
  - Tool/function calling
  - Streaming responses
  - Multi-provider support

**No Python backend needed for MVP.** Migration path exists if complex AI orchestration emerges later (multi-agent, RAG at scale, custom models).

## 2. Repository & Infrastructure Setup

**Critical Finding: Repository infrastructure must be set up BEFORE development starts.**

**Current State:**
- GitHub repo: `https://github.com/MacsDickinson/loops`
- Next.js 16 application scaffolded and deployed
- Infrastructure provisioned (Vercel, Supabase, Clerk, Anthropic)

### Core Dependencies

```bash
# AI SDK
npm install ai @ai-sdk/anthropic zod

# Database (Supabase)
npm install @supabase/supabase-js

# Auth (Clerk)
npm install @clerk/nextjs

# UI Components
npx shadcn@latest add button input textarea card

# Development tools
npm install -D @types/node typescript eslint prettier
```

### Environment Configuration

```bash
# .env.local (development)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

## 3. Architecture Refinements

### 3.1 Database Schema

See [Product Hierarchy Domain Model](./product-hierarchy.md) for the updated schema including Workspace, Product, Idea, Feature, Specification, SpecificationChange, DiscoverySession, and DialogueTurn entities.

Legacy tables from the initial schema:
- `prompt_templates` -- AI persona system prompts with versioning
- `spec_analytics` -- Usage metrics per specification
- `user_rate_limits` -- Rate limiting tracking

### 3.2 API Route Structure

```
app/
├── api/
│   ├── workspaces/
│   │   ├── route.ts               # List/create workspaces
│   │   └── [id]/
│   │       ├── route.ts           # Get/update workspace
│   │       └── members/route.ts   # Manage membership
│   ├── products/
│   │   ├── route.ts               # List/create products
│   │   └── [id]/route.ts          # Get/update product
│   ├── ideas/
│   │   ├── route.ts               # List/create ideas (inbox)
│   │   ├── [id]/route.ts          # Get/update idea
│   │   └── [id]/graduate/route.ts # Graduate idea to feature
│   ├── features/
│   │   ├── route.ts               # List features
│   │   └── [id]/route.ts          # Get/update feature
│   ├── discovery/
│   │   └── route.ts               # Main dialogue endpoint (streaming)
│   ├── specs/
│   │   ├── route.ts               # CRUD operations
│   │   ├── [id]/
│   │   │   ├── route.ts           # Get/update single spec
│   │   │   ├── changes/route.ts   # Spec changelog
│   │   │   └── export/route.ts    # Export to Markdown/GitHub
│   │   └── synthesize/route.ts    # Generate spec from dialogue
│   ├── integrations/
│   │   ├── github/
│   │   │   ├── auth/route.ts      # OAuth callback
│   │   │   └── pr/route.ts        # Create PR with spec
│   │   └── linear/
│   │       ├── auth/route.ts
│   │       └── issue/route.ts
│   └── webhooks/
│       └── clerk/route.ts         # User events
├── (auth)/                         # Auth-protected routes
│   ├── dashboard/
│   ├── inbox/
│   ├── products/
│   ├── features/
│   └── settings/
└── (marketing)/                    # Public routes
    ├── page.tsx                    # Landing page
    ├── pricing/
    └── docs/
```

### 3.3 Edge Runtime Strategy

Deploy AI dialogue to Edge Functions for global performance:

```typescript
// app/api/discovery/route.ts
export const runtime = 'edge';
export const maxDuration = 60; // 60 seconds for long dialogues
```

**Expected Performance:**
- Global latency: <100ms (Edge Network)
- AI first token: <500ms (Claude streaming)
- Total dialogue turn: <2s (within NFR requirements)

## 4. Security Hardening

### 4.1 Rate Limiting (Critical)

**Limits:**
- Free tier: 10 ideas/day, 50 dialogue turns/hour
- Pro tier: Unlimited ideas, 200 turns/hour
- Burst protection: 5 requests/second max

### 4.2 Input Sanitisation

All user inputs sanitised before AI processing. XSS pattern detection and control character filtering already implemented in discovery route.

### 4.3 API Key Security

- Never expose Anthropic API key to client
- Use Vercel Environment Variables (encrypted at rest)
- Rotate keys quarterly
- Implement key usage monitoring

### 4.4 Content Security Policy

```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  connect-src 'self' *.supabase.co *.clerk.accounts.dev;
`;
```

## 5. Cost Analysis & Optimisation

### Early Stage (0-100 users, 500 specs/month)

| Service | Usage | Cost/Month |
|---------|-------|------------|
| Vercel (Hobby) | <100GB bandwidth | $0 |
| Supabase (Free) | <500MB DB, <2GB bandwidth | $0 |
| Clerk (Free) | <10K MAU | $0 |
| Anthropic API | ~25M tokens (Sonnet 4.6) | $75-150 |
| Sentry (Free) | <5K events | $0 |
| **Total** | | **$75-150** |

**Optimisation strategies:**
1. Prompt optimisation: Reduce average tokens per spec from 50K to 30K (-40%)
2. Response caching: Cache common persona questions (CDN/Redis)
3. Model mixing: Use Haiku for simple validations, Sonnet for complex dialogue
4. Free tier caps: Strict 10 specs/month limit

**Projected with optimisations: $40-80/month**

### Growth Stage (100-1,000 users, 5,000 specs/month)

| Service | Cost/Month |
|---------|------------|
| Vercel (Pro, 2 seats) | $40 |
| Supabase (Pro) | $25 |
| Clerk (Pro, 1K MAU) | $25 |
| Anthropic API (250M tokens) | $750-1,500 |
| Sentry (Team) | $26 |
| Vercel KV (Redis) | $10 |
| **Total** | **$876-1,626** |

**Revenue at this stage: $29 x 100 paying users = $2,900/month**
**Gross margin: 44-70%** (healthy for SaaS)

## 6. Timeline Validation

**8-12 week MVP timeline is REALISTIC with conditions:**

**Prerequisites (Week 0 - Setup):**
- Repository initialised (done)
- Infrastructure provisioned (done)
- Team onboarded

**Week 1-2: Core Dialogue Engine**
- Clerk authentication integration
- Basic UI (chat interface with shadcn/ui)
- Vercel AI SDK + Claude integration
- Single persona dialogue (Product Coach)

**Week 3-4: Product Hierarchy & Spec Generation**
- Database schema for Workspace, Product, Idea, Feature, Specification
- Idea-first and product-centric flows
- Structured output (Zod schemas for specs)
- Acceptance criteria generation (BDD format)
- Specification changelog tracking

**Week 5-6: Multi-Persona & Export**
- Multi-persona dialogue (Security, UX, Domain)
- Markdown export functionality
- Idea graduation flow
- GitHub OAuth integration

**Week 7-8: Polish & Beta Launch**
- UI/UX refinement
- Performance optimisation
- Error handling and edge cases
- Beta user onboarding flow
- Analytics instrumentation

**Contingency Buffer: +2 weeks**
**Realistic Range: 8-10 weeks**

## 7. Deployment Strategy

**Continuous Deployment with Preview Environments**

**Environments:**
- **Development**: Local (http://localhost:3000)
- **Preview**: Per-PR (https://loops-pr-123.vercel.app)
- **Staging**: `staging` branch
- **Production**: `main` branch

**Database Migrations:**
- Use Supabase migrations (version-controlled SQL)
- Auto-apply on deploy (staging -> prod promotion)

## 8. Monitoring & Observability

### Product Metrics (PostHog)
- Sign-up to first idea (activation funnel)
- Ideas created per user
- Graduation rate (ideas -> features)
- Dialogue turns per spec (complexity indicator)
- Time to complete spec (UX metric)
- Persona usage distribution

### Technical Metrics (Vercel Analytics + Sentry)
- API latency (p50, p95, p99)
- AI token usage per spec
- Error rate by endpoint
- Database query performance

### Business Metrics (Stripe + Internal)
- Free to paid conversion rate
- Churn rate (monthly)
- MRR (Monthly Recurring Revenue)
- Cost per spec (COGS)

**Alerting Thresholds:**
- Error rate >1% (immediate Slack alert)
- API latency p95 >5s (warning)
- Daily AI cost >$50 (cost anomaly)
- Supabase DB >80% capacity (scale warning)

## 9. Additional Risks

### Risk 6: AI Token Cost Explosion (Critical)

**Mitigation:**
- Hard rate limits per tier
- Real-time cost monitoring per user
- Auto-pause accounts exceeding $10/day in AI costs
- Require payment method before spec creation

### Risk 7: GitHub/Linear Integration Delays

**Mitigation:**
- Prioritise Markdown export (works without integrations)
- Build GitHub integration first (higher value)
- Consider Zapier as interim solution for Linear/Jira

## 10. Open Questions - Engineering Answers

**Budget:** Revised estimate is $0.50-1.50 per spec. Budget $500/month early stage, $2K/month growth stage.

**Timeline:** YES, 8-12 weeks realistic with 2 full-stack engineers and no major scope additions.

**Tech Stack:** APPROVED - Next.js 16 + Vercel AI SDK + Supabase + Clerk. All TypeScript, single deployment on Vercel.

**DevOps:** NO dedicated DevOps needed for MVP. Vercel and Supabase are fully managed.
