# Product Requirements Document: Discovery Loop Coach

**Version:** 2.0
**Date:** March 7, 2026
**Owner:** Product Manager
**Status:** Draft for Review

---

## Executive Summary

Discovery Loop Coach is an AI-powered specification assistant within the Loops platform. It transforms ambiguous product ideas into precise, testable requirements through structured dialogue. It addresses the critical gap in AI-assisted development: when AI coding tools build the wrong thing because requirements are unclear.

Discovery is the first stage of a feature's lifecycle. Users start with an **Idea**, flesh it out through AI-guided discovery dialogue, and the Idea **graduates** into a **Feature** within a **Product**. The coach sits within a natural hierarchy: Workspace > Product > Idea/Feature, supporting both exploratory (idea-first) and structured (product-centric) workflows.

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
6. **Ideas have no home** - Vague ideas live in people's heads or scattered across Slack/docs until someone writes a spec

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
3. **Tertiary:** Provide a structured home for ideas, from inception through to production features

### Success Metrics

#### Activation (First 24 hours)
- **Target:** 70% of signups complete first idea discovery within 24 hours
- **Measure:** Time from signup to first spec completion
- **Success:** Spec includes acceptance criteria and is >500 words

#### Engagement (First 7 days)
- **Target:** 50% day-2 return, 70% week-1 return
- **Measure:** Daily/weekly active users
- **Success:** Users create 3+ ideas in first week

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
- **Medium:** NPS >= 30
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
3. **AI Coding Tool Power Users** - Need better requirements to maximise AI tool value

### Market Size

**TAM (Total Addressable Market):**
- 50K+ product teams at tech companies globally
- Growing 30%+ annually as AI coding tools proliferate

**SAM (Serviceable Addressable Market):**
- ~15K teams using AI coding tools daily
- $5.4M ARR at 100% penetration ($29/PM x 15K teams)

**SOM (Serviceable Obtainable Market - Year 1):**
- 500 paying customers (3% of SAM)
- $174K ARR

---

## Product Overview

### What It Is

Loops is a product delivery platform organised around four feedback loops: Discovery, Build, Operationalise, Grow. Discovery Loop Coach is the first capability -- an AI assistant that guides PMs through structured discovery dialogue to create precise specifications with built-in acceptance tests.

### Product Hierarchy

The platform is organised around a natural hierarchy:

```
Workspace (team/org)
├── Product (app, service, platform)
│   ├── Ideas (being explored through discovery)
│   │   └── Specification (living document with changelog)
│   │       └── DiscoverySessions (AI dialogue instances)
│   └── Features (graduated ideas, Pilot stage and beyond)
│       └── Specification (complete, with requirements + tests)
└── Inbox (unassigned ideas -- no product yet)
```

### How It Works

1. **User has an idea** - Could be vague ("social login") or specific ("add MFA to existing auth")
2. **Idea is created** - Either in the Inbox (idea-first) or under a Product (product-centric)
3. **Discovery dialogue begins** - AI asks clarifying questions across multiple personas
4. **Specification emerges** - Requirements + BDD acceptance tests, with every change tracked
5. **Idea graduates to Feature** - Assigned to a Product, enters Pilot stage
6. **Feature progresses through lifecycle** - Pilot > Incubating > Graduating > Growth > Sunset

### Two Entry Paths

**Idea-First (Bottom-Up):** User has a vague idea, doesn't know where it fits. Starts discovery, and through dialogue it becomes clear whether this is a new feature, an amendment, or a new product entirely.

**Product-Centric (Top-Down):** User browses their products, sees features and lifecycle stages, and starts discovery on a new idea for a specific product.

### Feature Lifecycle

Ideas graduate into Features using the Loops lifecycle model:

| Stage | Description | Loop |
|-------|------------|------|
| **Idea** | A hypothesis worth exploring. No commitment beyond investigation. | Discovery |
| **Pilot** | Graduated from discovery. Spec complete, being prototyped. | Build |
| **Incubating** | Validated with real users but not production-grade. | Build |
| **Graduating** | Actively being operationalised. Moving toward production quality. | Operationalise |
| **Growth** | Production-ready, actively maintained and measured. | Grow |
| **Sunset** | Declining value. Planned for deprecation or replacement. | Grow |

An Idea can only graduate to Pilot (becoming a Feature) when it has a completed Specification with requirements and acceptance tests. This enforces discovery-before-build.

### Multiple Personas

The AI coach can activate different perspectives during discovery:
- **Product Coach** (default) - Probes for user value, edge cases, journeys
- **Security Expert** - Reviews for vulnerabilities, compliance requirements
- **UX Analyst** - Questions accessibility, user flows, error states
- **Domain Expert** - Validates business rules (configurable per team)

### Key Differentiators

**vs. Jira/Linear/Notion:**
- AI-guided discovery dialogue surfaces edge cases (they're static forms)
- Generates acceptance tests automatically (they don't)
- Idea-to-Feature lifecycle with graduation (they treat all items the same)
- Specification changelog with conversation provenance (they have basic history)

**vs. Productboard/Aha!:**
- Discovery dialogue, not just collection and voting
- Produces testable specs (BDD), not just prioritised lists
- Idea graduation is driven by specification completeness, not manual promotion

**vs. Just using ChatGPT:**
- Structured dialogue with domain personas (not freeform)
- Outputs BDD tests (not just prose)
- Tracks changes with conversation provenance
- Integrates with workflow (not copy-paste)

---

## Features and Requirements

### MVP (Weeks 1-8)

#### Core Features

**F0: Product & Idea Hierarchy**
- Workspace creation with team membership and roles
- Product CRUD with lifecycle stage management
- Idea creation via Inbox (idea-first) or under a Product (product-centric)
- Feature creation through Idea graduation
- Inbox view for unassigned ideas
- Product view with features grouped by lifecycle stage
- **Acceptance:** User can create a workspace, add products, create ideas in both entry paths, and graduate ideas to features

**F1: Conversational Spec Creation**
- User creates an Idea and enters a description
- AI asks 5-10 clarifying questions through structured dialogue
- Specification emerges iteratively with live preview
- All AI-generated changes logged to SpecificationChange with conversation provenance
- Manual edits logged on save
- **Acceptance:** User can create an idea, go through discovery dialogue, and produce a complete specification in <15 minutes. Every change is traceable to the conversation that produced it.

**F2: Multi-Persona Dialogue**
- Activate Product Coach (default), Security Expert, UX Analyst personas
- Each persona asks domain-specific questions
- User can toggle personas on/off mid-dialogue
- **Acceptance:** User can get security questions without restarting discovery

**F3: Acceptance Test Generation**
- Auto-generate BDD-style acceptance tests from requirements
- Tests map to specific requirements (traceability)
- Export as Gherkin format (Given/When/Then)
- **Acceptance:** Every requirement has at least one test

**F4: Spec Export/Versioning**
- Export spec as Markdown
- Download locally or copy to clipboard
- Format ready for repo commit
- Full specification changelog viewable (who changed what, when, and which conversation caused it)
- **Acceptance:** Exported spec is valid Markdown, includes requirements + tests. Changelog shows full history.

**F5: Idea Graduation**
- When spec is complete, prompt user to assign a product (if not already assigned)
- Create Feature at Pilot stage with link to source Idea
- Transfer Specification ownership from Idea to Feature
- Retain Idea as historical record
- **Acceptance:** User can graduate an idea, it appears as a Feature under the assigned Product at Pilot stage

**F6: Basic GitHub Integration**
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

**F7: Linear/Jira Integration**
- Export spec as Linear/Jira issue
- Bi-directional sync

**F8: Spec Templates**
- Save custom templates for common feature types
- Team-specific templates (e.g., "API endpoint" template)

**F9: Collaborative Specs**
- Multi-user editing
- Comment threads on specific requirements

**F10: Spec Library**
- Search past specs across products
- Reuse requirements from similar features

**F11: Custom Domain Personas**
- Configure domain-specific personas (e.g., "Fintech Compliance Expert")
- Load team-specific business rules

**F12: AI-Assisted Classification**
- During idea-first flow, AI suggests which product/feature the idea relates to
- Based on existing products, features, and their specifications

---

## User Stories and Use Cases

### Primary: PM Creating a New Feature from a Vague Idea

**As a** Product Manager at a Series B SaaS company
**I want to** explore a rough product idea through structured AI dialogue
**So that** it emerges as a clear, testable specification that can graduate into a feature

**Scenario (Idea-First Flow):**
1. I click "New Idea" from the Inbox
2. I describe the rough concept: "Add SSO login with Google and Microsoft"
3. Discovery Coach asks: "What happens if the SSO provider is down? Should there be a fallback?"
4. I answer: "Fallback to email/password login"
5. Security persona asks: "How do you handle session timeout? Should we enforce MFA?"
6. I answer and make decisions through dialogue
7. After 10 minutes, I have a complete spec with 15 acceptance tests
8. I'm prompted: "Which product does this belong to?" -- I select our main product
9. The idea graduates to a Feature at Pilot stage
10. I export the spec to a GitHub PR, link it in Linear
11. Engineering builds against the acceptance tests

**Current Alternative:** I write a Notion doc for 2 hours, engineers still ask clarifying questions, we iterate 3 times before it's right. Total time: 8 hours.

### Secondary: PM Adding a Feature to an Existing Product

**As a** Product Manager
**I want to** add a new feature idea directly to an existing product
**So that** it's organised from the start and I can see it alongside other features

**Scenario (Product-Centric Flow):**
1. I navigate to Products > "Loops Platform"
2. I see existing features grouped by lifecycle stage (Pilot, Incubating, Growth)
3. I click "Add Idea" and describe: "Team workspace settings with role management"
4. Discovery starts -- the idea is already associated with the product
5. After discovery, I complete the spec and graduate the idea
6. The new Feature appears under the product at Pilot stage

### Tertiary: PM Amending an Existing Feature

**As a** Product Manager
**I want to** run discovery on changes to an existing production feature
**So that** amendments are as well-specified as the original feature

**Scenario (Amendment Flow):**
1. I view a Feature "User Authentication" that's in Growth stage
2. I click "Start New Discovery" to explore adding MFA
3. A new Idea is created, linked to the existing Feature
4. Discovery focuses on the amendment, referencing existing auth spec
5. On graduation, a sub-Feature is created: "MFA Enhancement" under "User Authentication"

### Quaternary: Team Member Reviewing Spec History

**As an** Engineering Lead
**I want to** see how a specification evolved during discovery
**So that** I understand the rationale behind each requirement

**Scenario:**
1. I open a Feature's specification
2. I click "View History"
3. I see a changelog of every change -- each linked to the conversation that produced it
4. I click on a requirement and see: "Added during security persona dialogue, turn 7"
5. I can read the exact Q&A exchange that led to this requirement

---

## Data Model

### Entity Overview

| Entity | Purpose |
|--------|---------|
| **Workspace** | Top-level org container. Owns products, ideas, features, billing. |
| **Membership** | Links Users to Workspaces with roles. |
| **Product** | A significant deliverable (app, service, platform). Has lifecycle stage. |
| **Idea** | A pre-Feature concept being explored through discovery. Lives in Inbox or under a Product. |
| **Feature** | A graduated Idea. Unit of product capability at Pilot stage or beyond. |
| **Specification** | Living document output of discovery. Requirements + acceptance tests. |
| **SpecificationChange** | Changelog entry with provenance (which conversation caused the change). |
| **DiscoverySession** | An explicit dialogue instance for refining a specification. |
| **DialogueTurn** | A single exchange within a discovery session. |

### Key Relationships

```
Workspace 1:N Membership N:1 User
Workspace 1:N Product
Workspace 1:N Idea (unassigned -- Inbox)
Product 1:N Idea
Product 1:N Feature
Idea 1:1 Specification
Idea 0:1 Feature (graduates into)
Feature 1:N Specification (can go through discovery again)
Feature 0:1 Feature (self-ref: parent_feature_id for amendments)
Specification 1:N SpecificationChange
Specification 1:N DiscoverySession
DiscoverySession 1:N DialogueTurn
```

### Specification Changelog

Every change to a Specification is recorded in **SpecificationChange**:

- **AI-generated changes:** Logged automatically when the AI generates or modifies requirements/tests. References the `DiscoverySession` and `DialogueTurn` that produced the change.
- **Manual changes:** Logged when the user saves edits. No session/turn reference.
- **Provenance:** You can trace any requirement back to the exact conversation that created it.

### Graduation Flow

When an Idea's Specification is marked complete:
1. User is prompted to assign a Product (if not already assigned)
2. A Feature is created at Pilot stage, linked to the source Idea
3. The Specification is transferred to the Feature
4. The Idea is retained as a historical record

> For full entity definitions and database schema, see [Product Hierarchy Domain Model](../architecture/product-hierarchy.md).

---

## Technical Requirements

### Tech Stack

**Frontend:** Next.js 16 / React 19, Tailwind CSS v4, deployed on Vercel
**Backend:** Node.js / TypeScript, Supabase (PostgreSQL)
**AI Layer:** Vercel AI SDK + Claude API (Anthropic), Zod for structured output
**Auth:** Clerk
**Integrations:** GitHub API (OAuth + REST), Linear API (post-MVP)

### API Route Structure

```
app/api/
├── workspaces/          # Workspace CRUD, membership management
├── products/            # Product CRUD, lifecycle management
├── ideas/               # Idea CRUD, graduation
├── features/            # Feature CRUD, lifecycle transitions
├── discovery/           # Main dialogue endpoint (streaming)
├── specs/               # Specification CRUD, changelog, export, synthesis
├── integrations/        # GitHub, Linear OAuth and operations
└── webhooks/            # Clerk user events
```

### Navigation Structure

```
/dashboard              -- workspace overview, recent ideas, quick actions
/inbox                  -- unassigned ideas (idea-first flow landing)
/products               -- all products
/products/[id]          -- product detail: features + ideas in discovery
/ideas/[id]/discover    -- discovery session
/features/[id]          -- feature detail + specs + lifecycle
```

### Architecture Principles

1. **AI-native** - Conversational UX, not forms
2. **Integration-first** - Specs live where work happens (repo, not separate tool)
3. **Version-controlled** - Markdown output for git commit, changelog for every change
4. **Testable** - BDD format for direct use in testing frameworks
5. **Hierarchy-aware** - Ideas, features, and products have clear relationships and lifecycle

> For full technical implementation details, see [Technical Implementation Plan](../architecture/technical-implementation-plan.md).

---

## Go-to-Market Strategy

### Pricing

**Free Tier:**
- 1 workspace, 1 product
- 10 ideas/month
- Basic personas (Product Coach only)
- Export to Markdown
- Single user

**Pro ($29/PM/month):**
- Unlimited workspaces, products, ideas
- All personas (Product, Security, UX, Domain)
- GitHub/Linear/Jira integrations
- Full specification changelog
- Priority support

**Team ($199/month for 10 seats, $15/additional seat):**
- Everything in Pro
- Shared workspaces with role-based access
- Spec library across products
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

**Week 1-2: Product Hierarchy & Core Dialogue**
- Workspace, Product, Idea, Feature entities
- Idea-first and product-centric flows
- Conversational UI with Product Coach persona
- **Deliverable:** Working hierarchy + basic discovery dialogue

**Week 3-4: Spec Generation & Changelog**
- Specification synthesis from dialogue
- SpecificationChange tracking (AI and manual)
- Acceptance test generation (BDD format)
- Idea graduation flow
- **Deliverable:** Complete discovery-to-feature pipeline

**Week 5-6: Multi-Persona & Export**
- Security Expert, UX Analyst personas
- Markdown export functionality
- GitHub integration
- **Deliverable:** Full persona coverage + export working

**Week 7-8: Polish & Beta**
- UI polish, dashboard, Inbox view
- Performance optimisation
- Beta user onboarding
- **Deliverable:** Beta-ready product

### Post-MVP (Weeks 9-16)

**Week 9-10:** Beta with 20 users, collect feedback, iterate
**Week 11-12:** Linear/Jira integrations, payment processing, Product Hunt launch
**Week 13-16:** Content marketing, partnerships, feature iteration

---

## Risks and Mitigation

### Risk 1: Pain Point Not Severe Enough
**Likelihood:** Medium | **Impact:** High
**Mitigation:** Validate in customer interviews (weeks 1-2). If <5/10 report weekly rework, reassess ICP.
**Contingency:** Pivot to engineering-focused tool if PM pain is low.

### Risk 2: Existing Tools Already Solve This
**Likelihood:** Medium | **Impact:** Medium
**Mitigation:** Emphasise what others don't do: AI discovery dialogue, BDD test generation, idea-to-feature lifecycle with changelog provenance.
**Contingency:** Position as complementary tool rather than replacement.

### Risk 3: AI Quality Issues
**Likelihood:** Medium | **Impact:** High
**Mitigation:** Use Claude Sonnet/Opus for high-quality outputs. Extensive prompt engineering and testing.
**Contingency:** Add manual editing/refinement features. Position AI as assistant not automation.

### Risk 4: Adoption Friction
**Likelihood:** High | **Impact:** Medium
**Mitigation:** Integrate with existing tools (GitHub, Linear, Jira). Freemium tier with low commitment.
**Contingency:** Focus on solo devs / technical founders first.

### Risk 5: Competitive Response
**Likelihood:** Low (short-term), High (long-term) | **Impact:** High
**Mitigation:** Move fast. Build deeper AI features (multi-persona, custom domain experts, changelog provenance).
**Contingency:** Pivot to full Loops platform if single feature commoditised.

### Risk 6: Hierarchy Adds Complexity
**Likelihood:** Medium | **Impact:** Medium
**Mitigation:** Auto-create personal workspace on signup. Solo users see simplified UI (no workspace/team chrome). Idea-first flow doesn't require upfront product assignment.
**Contingency:** Allow flat mode for users who don't need hierarchy.

---

## Open Questions

**Product:**
1. Should Product lifecycle stage be manually set or auto-derived from its features' stages?
2. Should AI suggest product/feature classification during idea-first flow?
3. How should the personal workspace be named (user's name vs "Personal")?

**Engineering:**
1. How to handle spec changelog storage at scale? (partitioning, archival)
2. Should workspace billing replace user billing, or run in parallel?
3. Migration strategy from flat model to hierarchy for existing data?

**Go-to-Market:**
1. Do we have connections to Cursor/Replit for partnership discussions?
2. Should we hire a Content Specialist for thought leadership?
3. What's the budget for paid acquisition (if organic is slow)?

---

## Related Documents

- **Domain Model:** [Product Hierarchy](../architecture/product-hierarchy.md)
- **Architecture Decision:** [ADR-002: Product Hierarchy](../architecture/adr-002-product-hierarchy.md)
- **Competitive Analysis:** [Product Hierarchy Patterns](../research/product-hierarchy-patterns.md)
- **Technical Plan:** [Technical Implementation Plan](../architecture/technical-implementation-plan.md)
- **Loops Framework:** [Loops Introduction](../architecture/loops-intro.md)
- **Customer Interview Guide:** See PM documentation
- **Prototype:** [discovery-loop.lovable.app](https://discovery-loop.lovable.app)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-07 | PM | Initial PRD based on Loops framework analysis and customer discovery planning |
| 2.0 | 2026-03-07 | Technical Lead | Major update: introduced product hierarchy (Workspace > Product > Idea > Feature), Idea/Feature separation with graduation model, specification changelog with conversation provenance, extracted technical implementation plan to separate doc |
