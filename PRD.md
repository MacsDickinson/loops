# Product Requirements Document: Discovery Loop Coach

**Version:** 1.0
**Date:** March 7, 2026
**Owner:** Product Manager
**Status:** Draft for Review

---

## Executive Summary

Discovery Loop Coach is an AI-powered specification assistant that transforms ambiguous product ideas into precise, testable requirements through structured dialogue. It addresses the critical gap in AI-assisted development: when AI coding tools build the wrong thing because requirements are unclear.

**Key Value Proposition:** Turn PM ideas into precise specs + acceptance tests in minutes, not hours. Reduce rework by 30%+, ship faster, and give AI coding tools the clarity they need to succeed.

**Business Model:** SaaS at $29/PM/month
**Timeline:** 8-12 weeks to MVP
**Current Status:** Working prototype at [discovery-loop.lovable.app](https://discovery-loop.lovable.app)

---

## Problem Statement

### The Core Problem

Product teams using AI coding tools (Cursor, GitHub Copilot, Replit) face a paradox: AI can build features in hours, but unclear requirements mean building the wrong thing fast. The faster you can build, the more expensive ambiguity becomes.

**Current Pain Points:**
1. **Requirements are vague** - PMs describe features in natural language, engineers interpret, AI executes that interpretation
2. **Edge cases get missed** - What happens when the email isn't registered? Should we rate-limit this endpoint?
3. **Acceptance criteria are missing** - No clear definition of "done"
4. **Rework is constant** - Teams iterate until it's right, wasting the speed advantage of AI coding tools
5. **Tools are disconnected** - Specs in Notion/Jira, tests somewhere else, code in GitHub. Nothing stays in sync.

### Why Now

- **AI coding adoption is accelerating** - Cursor, Copilot, Replit usage growing 10x YoY
- **Build time is compressing** - Tasks that took days now take hours (METR data)
- **Discovery is the new bottleneck** - When build is fast, unclear requirements become the constraint
- **No good solution exists** - Current tools (Jira, Notion, Linear) weren't designed for AI-native workflows

### Market Validation

**Hypothesis to Test:**
- 70%+ of teams using AI coding tools experience weekly rework due to unclear requirements
- PMs spend 5-10 hours/week on rework and clarification that could be prevented
- $29/month is acceptable if it saves 5+ hours/month

**Validation Plan:** 10 customer interviews in weeks 1-2 (see Customer Interview Guide)

---

## Goals and Success Metrics

### Product Goals

1. **Primary:** Reduce rework by 30%+ for teams using AI coding tools
2. **Secondary:** Make requirements clear enough that AI builds correctly first time
3. **Tertiary:** Shift requirements closer to code (repo, not separate tool)

### Success Metrics

#### Activation (First 24 hours)
- **Target:** 70% of signups complete first spec within 24 hours
- **Measure:** Time from signup to first spec export/save
- **Success:** Spec includes acceptance criteria and is >500 words

#### Engagement (First 7 days)
- **Target:** 50% day-2 return, 70% week-1 return
- **Measure:** Daily/weekly active users
- **Success:** Users create 3+ specs in first week

#### Value Delivered (First 30 days)
- **Target:** 30%+ reported reduction in rework (NPS survey)
- **Measure:** Post-use survey after 2 weeks
- **Success:** Engineers rate specs as "clear and actionable" (4+ out of 5)

#### Willingness to Pay (First 30 days)
- **Target:** 10% free-to-paid conversion
- **Measure:** Conversion rate at trial end
- **Success:** 80%+ retention after month 1

#### Product-Market Fit Signals
- **Strong:** 40%+ users say they'd be "very disappointed" if product went away (Sean Ellis test)
- **Medium:** NPS ≥ 30
- **Weak:** <10% free-to-paid conversion or <50% month-1 retention

---

## Target Users and Market

### Primary ICP (Ideal Customer Profile)

**Who:**
- **Role:** Product Manager or Product Owner
- **Company:** 50-500 employees, tech-enabled companies
- **AI Tool Usage:** Daily use of Cursor, GitHub Copilot, or Replit by engineering team
- **Pain Frequency:** Experiences rework due to unclear requirements weekly
- **Budget Authority:** Can approve $29/month tools without lengthy procurement

**Why This ICP:**
- Feels the pain acutely (fast builds make unclear requirements expensive)
- Has budget for lightweight SaaS tools
- Makes buying decisions quickly (weeks, not months)
- Will give product feedback (not too large, not too small)

### Secondary Segments

1. **Engineering Leads** - Whose teams use AI coding tools, want clearer specs from PMs
2. **Solo Developers / Technical Founders** - Doing both PM and dev, want structure for requirements
3. **AI Coding Tool Power Users** - Need better requirements to maximize AI tool value

### Market Size

**TAM (Total Addressable Market):**
- 50K+ product teams at tech companies globally
- Growing 30%+ annually as AI coding tools proliferate

**SAM (Serviceable Addressable Market):**
- ~15K teams using AI coding tools daily
- $5.4M ARR at 100% penetration ($29/PM × 15K teams)

**SOM (Serviceable Obtainable Market - Year 1):**
- 500 paying customers (3% of SAM)
- $174K ARR

---

## Product Overview

### What It Is

Discovery Loop Coach is a conversational AI assistant that guides PMs through structured discovery dialogue to create precise specifications with built-in acceptance tests.

### How It Works

1. **PM describes the feature** - Natural language, rough idea ("I want a login flow with social auth")
2. **AI asks clarifying questions** - Edge cases, security, user journeys, acceptance criteria
3. **Dialogue produces a spec** - Natural language requirements + structured acceptance tests (BDD format)
4. **Spec is version-controlled** - Lives in repo alongside code, integrated with GitHub/Linear/Jira
5. **Engineers build against the spec** - Acceptance tests define "done"

### Multiple Personas

The AI coach can activate different perspectives:
- **Product Coach** - Probes for user value, edge cases, journeys
- **Security Expert** - Reviews for vulnerabilities, compliance requirements
- **UX Analyst** - Questions accessibility, user flows, error states
- **Domain Expert** - Validates business rules (configurable per team)

### Key Differentiators

**vs. Jira/Linear/Notion:**
- Generates acceptance tests automatically (they don't)
- AI-guided dialogue surfaces edge cases (they're static forms)
- Version-controlled with code (they're separate tools)

**vs. Writing specs manually:**
- 10x faster (minutes, not hours)
- More complete (AI probes for missing cases)
- Tests generated automatically (not written separately)

**vs. Just using ChatGPT:**
- Structured dialogue (not freeform)
- Outputs BDD tests (not just prose)
- Integrates with workflow (not copy-paste)

---

## Features and Requirements

### MVP (Weeks 1-8)

#### Core Features

**F1: Conversational Spec Creation**
- PM enters feature description (text input)
- AI asks 5-10 clarifying questions (structured dialogue)
- Spec emerges iteratively (live preview)
- **Acceptance:** User can create a complete spec through dialogue in <15 minutes

**F2: Multi-Persona Dialogue**
- Activate Product Coach (default), Security Expert, UX Analyst personas
- Each persona asks domain-specific questions
- User can toggle personas on/off mid-dialogue
- **Acceptance:** User can get security questions without restarting spec

**F3: Acceptance Test Generation**
- Auto-generate BDD-style acceptance tests from requirements
- Tests map to specific requirements (traceability)
- Export as Gherkin format (Given/When/Then)
- **Acceptance:** Every requirement has at least one test

**F4: Spec Export/Versioning**
- Export spec as Markdown
- Download locally or copy to clipboard
- Format ready for repo commit
- **Acceptance:** Exported spec is valid Markdown, includes requirements + tests

**F5: Basic GitHub Integration**
- Create spec as PR description or issue
- OAuth authentication
- Select repo and branch
- **Acceptance:** User can export spec directly to GitHub PR

#### Non-Functional Requirements

**NFR1: Performance**
- Initial response <3 seconds
- Dialogue turn <2 seconds
- Spec generation <5 seconds

**NFR2: Quality**
- 95%+ uptime during business hours
- AI responses are relevant (no hallucinations of features not discussed)

**NFR3: Security**
- SOC 2 Type II compliant (required for enterprise)
- Encrypt data in transit and at rest
- No training on customer specs

### Post-MVP (Weeks 9-16)

**F6: Linear/Jira Integration**
- Export spec as Linear/Jira issue
- Bi-directional sync

**F7: Spec Templates**
- Save custom templates for common feature types
- Team-specific templates (e.g., "API endpoint" template)

**F8: Collaborative Specs**
- Multi-user editing
- Comment threads on specific requirements

**F9: Spec Library**
- Search past specs
- Reuse requirements from similar features

**F10: Custom Domain Personas**
- Configure domain-specific personas (e.g., "Fintech Compliance Expert")
- Load team-specific business rules

---

## User Stories and Use Cases

### Primary User Story: PM Creating Feature Spec

**As a** Product Manager at a Series B SaaS company
**I want to** create a clear, testable spec for a new feature
**So that** the engineering team (using Cursor) builds what I actually want, first time

**Scenario:**
1. I describe the feature: "Add SSO login with Google and Microsoft"
2. Discovery Coach asks: "What happens if the SSO provider is down? Should there be a fallback?"
3. I answer: "Fallback to email/password login"
4. Security persona asks: "How do you handle session timeout? Should we enforce MFA?"
5. I answer and make decisions through dialogue
6. After 10 minutes, I have a complete spec with 15 acceptance tests
7. I export it to a GitHub PR, link it in Linear
8. Engineering builds against the acceptance tests

**Current Alternative:** I write a Notion doc for 2 hours, engineers still ask clarifying questions, we iterate 3 times before it's right. Total time: 8 hours.

### Secondary User Story: Engineering Lead Requesting Clarity

**As an** Engineering Lead whose team uses Copilot
**I want** PMs to provide clearer acceptance criteria upfront
**So that** my team doesn't waste time building the wrong thing

**Scenario:**
1. PM shares spec created with Discovery Coach
2. I review the acceptance tests - they're clear and comprehensive
3. I assign to engineer with confidence
4. Engineer uses tests as build target
5. Feature ships first time, no rework

**Current Alternative:** PM provides vague Jira ticket, engineer guesses, we iterate 2-3 times. Team morale suffers.

---

## Technical Requirements

### Tech Stack (Recommended)

**Frontend:**
- Next.js / React
- Tailwind CSS
- Deployed on Vercel

**Backend:**
- Node.js / TypeScript
- Deployed on Railway or Render
- PostgreSQL for user data, specs

**AI Layer:**
- Claude API (Anthropic) for dialogue
- Prompt engineering for multi-persona dialogue
- Structured output for BDD test generation

**Integrations:**
- GitHub API (OAuth + REST)
- Linear API (OAuth + GraphQL)
- Jira API (OAuth + REST)

### Data Model

**User:**
- id, email, name
- githubAccessToken
- linearAccessToken
- subscriptionTier (free | pro | team)

**Spec:**
- id, userId, title, description
- requirementsJSON (structured)
- acceptanceTestsJSON (BDD format)
- status (draft | complete | archived)
- linkedGithubPR, linkedLinearIssue

**DialogueTurn:**
- id, specId, personaType, question, answer
- Order (for replay)

### Architecture Principles

1. **AI-native** - Conversational UX, not forms
2. **Integration-first** - Specs live where work happens (repo, not separate tool)
3. **Version-controlled** - Markdown output for git commit
4. **Testable** - BDD format for direct use in testing frameworks

---

## Go-to-Market Strategy

### Pricing

**Free Tier:**
- 10 specs/month
- Basic personas (Product Coach only)
- Export to Markdown
- Single user

**Pro ($29/PM/month):**
- Unlimited specs
- All personas (Product, Security, UX, Domain)
- GitHub/Linear/Jira integrations
- Priority support

**Team ($199/month for 10 seats, $15/additional seat):**
- Everything in Pro
- Shared spec library
- Custom domain personas
- Team analytics

### Distribution Channels

**Primary:**
1. **Content Marketing** - "Why your AI coding agent keeps building the wrong thing"
2. **Community** - Cursor Discord, GitHub Copilot forums, Indie Hackers
3. **Partnerships** - Co-sell with Cursor, Replit (they want better requirements too)

**Secondary:**
4. **LinkedIn** - Target PMs posting about AI tools
5. **Product Hunt** - Launch at MVP

### Marketing Message

**Headline:** "Turn Ideas Into Specs That AI Can Actually Build"

**Value Props:**
- Save 5-10 hours/week on rework and clarification
- AI builds it right the first time
- Specs + tests generated in minutes, not hours

**Proof Points:**
- 30%+ reduction in rework (beta customer quote)
- 10 minutes to complete spec (demo video)
- Works with Cursor, Copilot, Replit (integrations)

### Customer Acquisition Plan

**Phase 1: Problem Validation (Weeks 1-2)**
- 10 customer interviews
- Validate pain point and willingness to pay
- **Success:** 7/10 report weekly rework, 5/10 would pay $29/month

**Phase 2: Beta Launch (Weeks 8-10)**
- Invite 20 beta users (from interviews + community)
- Free access for feedback
- **Success:** 10 activated users, 3 paying after trial

**Phase 3: Public Launch (Week 12)**
- Product Hunt launch
- Content marketing push
- **Success:** 100 signups, 10 paying customers

**Phase 4: Growth (Weeks 13-16)**
- Expand distribution channels
- Add integrations (Linear, Jira)
- **Success:** 500 signups, 50 paying customers

---

## Timeline and Milestones

### MVP Development (Weeks 1-8)

**Week 1-2: Discovery & Design**
- Customer interviews (10 users)
- Wireframes and user flows
- Technical architecture design
- **Deliverable:** Problem validated, designs approved

**Week 3-4: Core Dialogue**
- Conversational UI
- Multi-persona dialogue
- Acceptance test generation
- **Deliverable:** Working dialogue, generates tests

**Week 5-6: Export & Integration**
- Markdown export
- GitHub integration
- User auth and data model
- **Deliverable:** End-to-end spec creation + export

**Week 7-8: Polish & Beta**
- UI polish
- Performance optimization
- Beta user onboarding
- **Deliverable:** Beta-ready product

### Post-MVP (Weeks 9-16)

**Week 9-10: Beta & Iteration**
- 20 beta users
- Collect feedback
- Bug fixes and UX improvements
- **Deliverable:** Product-market fit signals

**Week 11-12: Public Launch**
- Linear/Jira integrations
- Payment processing (Stripe)
- Product Hunt launch
- **Deliverable:** Publicly available, paying customers

**Week 13-16: Growth**
- Content marketing
- Partnership outreach
- Feature iteration based on usage
- **Deliverable:** 50 paying customers, clear roadmap

---

## Risks and Mitigation

### Risk 1: Pain Point Not Severe Enough

**Risk:** Teams don't actually experience enough rework to justify $29/month.

**Likelihood:** Medium
**Impact:** High (no PMF)

**Mitigation:**
- Validate in customer interviews (weeks 1-2)
- If <5/10 report weekly rework, reassess ICP
- Consider lower price point ($15/month) or different model

**Contingency:** Pivot to engineering-focused tool (requirements review assistant) if PM pain is low.

### Risk 2: Existing Tools Already Solve This

**Risk:** Teams say "we already use Notion/Jira for this" and don't see value.

**Likelihood:** Medium
**Impact:** Medium (differentiation issue)

**Mitigation:**
- Emphasize acceptance test generation (they don't do this)
- Emphasize speed (10 min vs 2 hours)
- Offer migration tools (import from Notion/Jira)

**Contingency:** Position as complementary tool (generates tests Notion can't) rather than replacement.

### Risk 3: AI Quality Issues

**Risk:** AI generates irrelevant questions or poor acceptance tests.

**Likelihood:** Medium
**Impact:** High (product quality)

**Mitigation:**
- Use Claude Opus/Sonnet for high-quality outputs
- Extensive prompt engineering and testing
- Human-in-loop for test review

**Contingency:** Add manual editing/refinement features, position AI as assistant not automation.

### Risk 4: Adoption Friction

**Risk:** Teams don't want to change their workflow, even if tool is better.

**Likelihood:** High
**Impact:** Medium (growth slower than expected)

**Mitigation:**
- Integrate with existing tools (GitHub, Linear, Jira)
- Offer spec templates matching their current format
- Freemium tier with low commitment

**Contingency:** Focus on solo devs / technical founders first (fewer stakeholders to convince).

### Risk 5: Competitive Response

**Risk:** Linear/Jira adds AI spec generation feature.

**Likelihood:** Low (short-term), High (long-term)
**Impact:** High (commoditization)

**Mitigation:**
- Move fast - establish user base before they react
- Build deeper AI features (multi-persona, custom domain experts)
- Focus on quality of AI dialogue, not just presence of AI

**Contingency:** Pivot to platform play (full Loops product) if single feature commoditized.

---

## Open Questions

**For Board/CEO:**
1. Do we have budget for Claude API usage? (estimate: $0.50-1.00 per spec)
2. Should we build in-house or hire a Technical Product Lead?
3. What's the success criteria for "go/no-go" after customer interviews?

**For Engineering:**
1. Is 8-12 week timeline realistic for MVP scope?
2. What's the tech stack preference? (Next.js recommended)
3. Do we need DevOps / infrastructure support?

**For Go-to-Market:**
1. Do we have connections to Cursor/Replit for partnership discussions?
2. Should we hire a Content Specialist for thought leadership?
3. What's the budget for paid acquisition (if organic is slow)?

---

## Appendices

### A. Customer Interview Guide

See: `/Users/macs/macs.dev/agents/pm/memory/Projects/customer-interview-guide.md`

### B. Target Customer Strategy

See: `/Users/macs/macs.dev/agents/pm/memory/Projects/target-customers.md`

### C. Product-Market Fit Plan

See: `/Users/macs/macs.dev/agents/pm/memory/Projects/discovery-loop-pmf.md`

### D. Related Documentation

- **Loops Framework:** `/Users/macs/macs.dev/projects/loops/docs/loops-intro.md`
- **CEO Analysis:** `/Users/macs/macs.dev/projects/loops/docs/loops-analysis.md`
- **Prototype:** [https://discovery-loop.lovable.app](https://discovery-loop.lovable.app)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-07 | PM | Initial PRD based on Loops framework analysis and customer discovery planning |

---

## Technical Discovery & Implementation Plan

**Prepared by:** Technical Product Lead
**Date:** March 7, 2026
**Status:** Technical Review Complete

### 1. Tech Stack Validation ✅

**Recommendation: Approved with High Confidence**

The all-TypeScript stack (Next.js + Vercel AI SDK) is the right choice for MVP:

- **Architecture simplicity**: Single language eliminates 50% of operational complexity
- **Cost efficiency**: $20-50/month vs $70-150/month with Python backend
- **Development velocity**: Frontend engineers can own full features end-to-end
- **AI capabilities**: Vercel AI SDK provides all required functionality for MVP scope
  - Multi-turn conversations ✅
  - Structured output (Zod schemas) ✅
  - Tool/function calling ✅
  - Streaming responses ✅
  - Multi-provider support ✅

**No Python backend needed for MVP.** Migration path exists if complex AI orchestration emerges later (multi-agent, RAG at scale, custom models).

### 2. Repository & Infrastructure Setup

**Critical Finding: Repository infrastructure must be set up BEFORE development starts.**

**Current State:**
- Project workspace defined at `/Users/macs/macs.dev`
- GitHub repo: `https://github.com/MacsDickinson/loops`
- Local directory exists but is NOT initialized as git repository
- No application scaffolding exists

**Required Setup (Week 0 - Pre-Development):**

#### 2.1 Repository Initialization
```bash
# Initialize repo and connect to GitHub
git init
git remote add origin https://github.com/MacsDickinson/loops.git
git branch -M main
```

#### 2.2 Next.js Application Scaffolding
```bash
npx create-next-app@latest discovery-loop \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

#### 2.3 Core Dependencies
```bash
# AI SDK
npm install ai @ai-sdk/anthropic zod

# Database (Supabase)
npm install @supabase/supabase-js

# Auth (Clerk)
npm install @clerk/nextjs

# UI Components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input textarea card

# Development tools
npm install -D @types/node typescript eslint prettier
```

#### 2.4 Infrastructure Services Setup
- **Vercel Account**: Create project, link to GitHub repo
- **Supabase**: Create project, get connection string
- **Clerk**: Create application, get API keys
- **Anthropic**: Create API key (Claude access)

#### 2.5 Environment Configuration
```bash
# .env.local (development)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# .env.production (Vercel)
# (same keys, production values)
```

**Estimated Setup Time: 1-2 days**

**Recommendation: Create dedicated task "MAC-11: Set up repository and development infrastructure" before starting feature development.**

### 3. Architecture Refinements

#### 3.1 Database Schema Updates

The current schema is solid but needs these additions:

```sql
-- Add prompt versioning for A/B testing
prompt_templates (
  id UUID PRIMARY KEY,
  persona_type TEXT NOT NULL, -- 'pm', 'security', 'ux', 'domain'
  version INTEGER NOT NULL,
  system_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add usage analytics
spec_analytics (
  id UUID PRIMARY KEY,
  spec_id UUID REFERENCES specifications(id),
  time_to_complete_sec INTEGER,
  dialogue_turns INTEGER,
  ai_tokens_used INTEGER,
  user_satisfaction_score INTEGER, -- 1-5
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add rate limiting
user_rate_limits (
  user_id UUID REFERENCES users(id),
  endpoint TEXT,
  request_count INTEGER,
  window_start TIMESTAMP,
  PRIMARY KEY (user_id, endpoint, window_start)
);
```

#### 3.2 API Route Structure

```
app/
├── api/
│   ├── discovery/
│   │   └── route.ts           # Main dialogue endpoint (streaming)
│   ├── specs/
│   │   ├── route.ts           # CRUD operations
│   │   └── [id]/
│   │       ├── route.ts       # Get/Update single spec
│   │       └── export/
│   │           └── route.ts   # Export to Markdown/GitHub
│   ├── integrations/
│   │   ├── github/
│   │   │   ├── auth/route.ts  # OAuth callback
│   │   │   └── pr/route.ts    # Create PR with spec
│   │   └── linear/
│   │       ├── auth/route.ts
│   │       └── issue/route.ts
│   └── webhooks/
│       └── clerk/route.ts     # User events
├── (auth)/                     # Auth-protected routes
│   ├── dashboard/
│   ├── specs/
│   └── settings/
└── (marketing)/                # Public routes
    ├── page.tsx               # Landing page
    ├── pricing/
    └── docs/
```

#### 3.3 Edge Runtime Strategy

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

### 4. Security Hardening

**Additional requirements beyond PRD:**

#### 4.1 Rate Limiting (Critical)
```typescript
// middleware.ts
import { ratelimit } from '@/lib/ratelimit';

export async function middleware(req: NextRequest) {
  const { success } = await ratelimit.limit(req.ip ?? 'anonymous');
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
}
```

**Limits:**
- Free tier: 10 specs/day, 50 dialogue turns/hour
- Pro tier: Unlimited specs, 200 turns/hour
- Burst protection: 5 requests/second max

#### 4.2 Input Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize all user inputs before AI processing
const sanitizedInput = DOMPurify.sanitize(userInput);
```

#### 4.3 API Key Security
- Never expose Anthropic API key to client
- Use Vercel Environment Variables (encrypted at rest)
- Rotate keys quarterly
- Implement key usage monitoring

#### 4.4 Content Security Policy
```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  connect-src 'self' *.supabase.co *.clerk.accounts.dev;
`;
```

### 5. Cost Analysis & Optimization

**Refined Cost Estimates:**

#### Early Stage (0-100 users, 500 specs/month)
| Service | Usage | Cost/Month |
|---------|-------|------------|
| Vercel (Hobby) | <100GB bandwidth | $0 |
| Supabase (Free) | <500MB DB, <2GB bandwidth | $0 |
| Clerk (Free) | <10K MAU | $0 |
| Anthropic API | ~25M tokens (Sonnet 4.6) | $75-150 |
| Sentry (Free) | <5K events | $0 |
| **Total** | | **$75-150** |

**Higher than initial estimate due to AI token usage. Mitigation strategies:**

1. **Prompt optimization**: Reduce average tokens per spec from 50K to 30K (-40%)
2. **Response caching**: Cache common persona questions (CDN/Redis)
3. **Model mixing**: Use Haiku for simple validations, Sonnet for complex dialogue
4. **Free tier caps**: Strict 10 specs/month limit (prevents abuse)

**Projected with optimizations: $40-80/month**

#### Growth Stage (100-1,000 users, 5,000 specs/month)
| Service | Cost/Month |
|---------|------------|
| Vercel (Pro, 2 seats) | $40 |
| Supabase (Pro) | $25 |
| Clerk (Pro, 1K MAU) | $25 |
| Anthropic API (250M tokens) | $750-1,500 |
| Sentry (Team) | $26 |
| Vercel KV (Redis) | $10 |
| **Total** | **$876-1,626** |

**Revenue at this stage: $29 × 100 paying users = $2,900/month**
**Gross margin: 44-70%** (healthy for SaaS)

### 6. Timeline Validation

**8-12 week MVP timeline is REALISTIC with conditions:**

**Prerequisites (Week 0 - Setup):**
- Repository initialized ✅
- Infrastructure provisioned (Vercel, Supabase, Clerk) ✅
- Team onboarded ✅
- **Duration: 3-5 days**

**Week 1-2: Core Dialogue Engine**
- Next.js app scaffolding ✅ (from setup)
- Clerk authentication integration
- Basic UI (chat interface with shadcn/ui)
- Vercel AI SDK + Claude integration
- Single persona dialogue (Product Coach)
- **Risk: Low** (well-documented, examples exist)

**Week 3-4: Spec Generation & Storage**
- Database schema implementation (Supabase)
- Structured output (Zod schemas for specs)
- Acceptance criteria generation (BDD format)
- Spec versioning and persistence
- **Risk: Low** (standard CRUD operations)

**Week 5-6: Multi-Persona & Export**
- Multi-persona dialogue (Security, UX, Domain)
- Markdown export functionality
- GitHub OAuth integration
- Create PR with spec
- **Risk: Medium** (GitHub App OAuth complexity)

**Week 7-8: Polish & Beta Launch**
- UI/UX refinement (shadcn/ui components)
- Performance optimization (Edge Functions)
- Error handling and edge cases
- Beta user onboarding flow
- Analytics instrumentation (PostHog or similar)
- **Risk: Medium** (polish takes longer than expected)

**Critical Path Dependencies:**
1. Anthropic API key approval (can take 1-2 days)
2. GitHub App approval (if building GitHub integration)
3. Designer availability (if custom UI beyond shadcn/ui)

**Contingency Buffer: +2 weeks** (for unknowns)
**Realistic Range: 8-10 weeks** (best case to expected)

### 7. Deployment Strategy

**Recommended Approach: Continuous Deployment with Preview Environments**

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main, staging]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test
      - run: npm run type-check
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

**Environments:**
- **Development**: Local (http://localhost:3000)
- **Preview**: Per-PR (https://discovery-loop-pr-123.vercel.app)
- **Staging**: `staging` branch (https://staging.discovery-loop.app)
- **Production**: `main` branch (https://discovery-loop.app)

**Database Migrations:**
- Use Supabase migrations (version-controlled SQL)
- Auto-apply on deploy (staging → prod promotion)

### 8. Monitoring & Observability

**Essential Metrics to Track from Day 1:**

#### Product Metrics (PostHog or Mixpanel)
- Sign-up to first spec (activation funnel)
- Specs created per user
- Dialogue turns per spec (complexity indicator)
- Time to complete spec (UX metric)
- Persona usage distribution
- Export method (Markdown, GitHub, Linear)

#### Technical Metrics (Vercel Analytics + Sentry)
- API latency (p50, p95, p99)
- AI token usage per spec
- Error rate by endpoint
- Database query performance
- Edge Function cold starts

#### Business Metrics (Stripe + Internal)
- Free to paid conversion rate
- Churn rate (monthly)
- MRR (Monthly Recurring Revenue)
- Cost per spec (COGS)

**Alerting Thresholds:**
- Error rate >1% (immediate Slack alert)
- API latency p95 >5s (warning)
- Daily AI cost >$50 (cost anomaly)
- Supabase DB >80% capacity (scale warning)

### 9. Risk Mitigation Updates

**Additional Risks Identified:**

#### Risk 6: AI Token Cost Explosion (Critical)

**Risk:** Single power user creates 1,000 specs/day, costs spike to $500/day

**Likelihood:** Medium (without rate limiting)
**Impact:** Critical (business viability)

**Mitigation:**
- Hard rate limits per tier (10/day free, unlimited pro with fair-use cap)
- Real-time cost monitoring per user
- Auto-pause accounts exceeding $10/day in AI costs
- Require payment method before spec creation

**Contingency:** Implement pay-per-spec model if flat pricing doesn't work

#### Risk 7: GitHub/Linear Integration Delays

**Risk:** OAuth flows and API integrations take longer than estimated

**Likelihood:** High (third-party API complexity)
**Impact:** Medium (can launch without integrations)

**Mitigation:**
- Prioritize Markdown export (works without integrations)
- Build GitHub integration first (higher value)
- Consider Zapier as interim solution for Linear/Jira
- Document manual workflows

**Contingency:** Launch MVP with Markdown export only, add integrations post-launch

### 10. Open Questions - Engineering Answers

**For Board/CEO:**

> 1. Do we have budget for Claude API usage? (estimate: $0.50-1.00 per spec)

**Answer:** Revised estimate is $0.50-1.50 per spec (depending on dialogue complexity). Budget $500/month for early stage, $2K/month for growth stage. Recommend monitoring daily and setting alerts at $50/day threshold.

> 2. Should we build in-house or hire a Technical Product Lead?

**Answer:** Technical Product Lead is now hired (this role). Recommend hiring 1-2 full-stack engineers (TypeScript proficiency required) for execution.

> 3. What's the success criteria for "go/no-go" after customer interviews?

**Answer:** From technical perspective, add these criteria:
- API key approvals obtained (Anthropic, Clerk, Supabase)
- $500/month AI budget approved
- 1-2 engineers committed to 8-10 week sprint

**For Engineering:**

> 1. Is 8-12 week timeline realistic for MVP scope?

**Answer:** YES, with conditions:
- Repository setup completed in Week 0 (prerequisite)
- Team of 2 full-stack engineers (not solo)
- No major scope additions during development
- Realistic range: 8-10 weeks with 2-week buffer

> 2. What's the tech stack preference? (Next.js recommended)

**Answer:** APPROVED - Next.js 15 + Vercel AI SDK + Supabase + Clerk
- All TypeScript (no Python)
- Single deployment (Vercel)
- Lowest operational complexity for MVP

> 3. Do we need DevOps / infrastructure support?

**Answer:** NO dedicated DevOps needed for MVP
- Vercel handles deployment/scaling automatically
- Supabase is fully managed
- GitHub Actions for CI/CD (minimal config)
- Consider DevOps hire at 1,000+ users or if moving to AWS/GCP

**For Go-to-Market:**

> 1. Do we have connections to Cursor/Replit for partnership discussions?

**Answer:** From technical side, ensure we can demonstrate:
- API for integration (future)
- Spec export formats they can consume
- Developer documentation for integration

---

### 11. Immediate Next Steps (Priority Order)

**Before Development Starts:**

1. **[CRITICAL] Create Task: Repository & Infrastructure Setup (MAC-11)**
   - Initialize git repository
   - Set up Next.js application scaffolding
   - Provision infrastructure accounts (Vercel, Supabase, Clerk, Anthropic)
   - Configure environment variables
   - **Owner:** Technical Product Lead
   - **Duration:** 1-2 days
   - **Blocker:** Cannot start development without this

2. **[HIGH] Hire Full-Stack Engineers**
   - 1-2 engineers with TypeScript + React + Next.js experience
   - Nice to have: AI/LLM integration experience
   - **Owner:** CEO/Board
   - **Duration:** 2-4 weeks recruitment

3. **[HIGH] Customer Interviews**
   - Execute discovery plan (10 interviews)
   - Validate pain point and $29/month willingness to pay
   - **Owner:** PM
   - **Duration:** Week 1-2 of timeline

4. **[MEDIUM] Finalize Go/No-Go Criteria**
   - Board approval on budget ($500/month early stage AI costs)
   - Customer interview results (7/10 validate pain, 5/10 willing to pay)
   - Engineering team committed
   - **Owner:** CEO
   - **Decision Point:** End of Week 2

5. **[MEDIUM] Set Up Monitoring & Analytics**
   - PostHog account (product analytics)
   - Sentry account (error tracking)
   - Stripe account (if launching with paid tier)
   - **Owner:** Technical Product Lead
   - **Duration:** 2-3 hours

---

### 12. Technical Discovery Summary

**PRD Assessment: APPROVED with minor refinements**

**Strengths:**
- Clear problem definition and ICP
- Realistic feature scope for MVP
- Strong go-to-market strategy
- Comprehensive risk analysis

**Refinements Made:**
- Tech stack validated (all-TypeScript approach is correct)
- Cost estimates updated (AI token usage higher than initial)
- Security requirements hardened (rate limiting, input sanitization)
- Repository setup identified as critical prerequisite task
- Timeline validated with conditions (8-10 weeks realistic with 2 engineers)
- Monitoring and observability requirements added

**Critical Finding:**
Repository and infrastructure setup MUST be completed before Week 1 of development timeline. Recommend creating dedicated task (MAC-11) for this work.

**Recommendation:**
- Proceed with customer interviews (Week 1-2)
- Complete repository setup in parallel (Week 0)
- Make go/no-go decision after interviews
- Start development Week 3 if approved

**Technical Risk Level: LOW-MEDIUM**
- Tech stack is proven and well-documented
- No novel technical challenges in MVP scope
- Main risks are timeline (hiring delays) and cost (AI token usage)
- Mitigation strategies in place for all identified risks

**Engineering Confidence: HIGH**
This MVP is achievable with the proposed stack and timeline.

---

**Next Steps:**

1. **Review & Approve** - CEO/Board review this PRD
2. **Customer Interviews** - Execute discovery plan (weeks 1-2)
3. **Repository Setup** - Create MAC-11 and complete infrastructure setup
4. **Go/No-Go Decision** - Based on interview results
5. **Hire Engineers** - 1-2 full-stack TypeScript engineers
6. **Start Development** - Week 3 kick-off
