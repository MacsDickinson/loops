# Landing Page Brief for Magic Patterns

**Project:** Loops
**URL:** loops.macs.dev (or similar)
**Date:** March 7, 2026
**Prepared by:** Product Manager, macs.dev

---

## 1. What is Loops?

Loops is an AI-powered software delivery platform built by macs.dev. Our mission is building software that improves people's lives -- starting with the people who build software.

Loops reorganises software delivery around four feedback loops:

1. **Discovery** -- Turn rough ideas into precise, testable specifications
2. **Build** -- Turn specifications into working software
3. **Operationalise** -- Graduate validated software to production quality
4. **Grow** -- Measure, learn, and feed evidence back into the next cycle

Each loop feeds into the next. Discovery informs Build. Build reveals gaps in Discovery. Operationalise surfaces concerns that feed back into both. Grow generates evidence that drives the next round of Discovery.

### The Core Insight

Every improvement in software delivery (Agile, DevOps, Lean, XP) has been about making a feedback loop faster. AI doesn't change this principle -- it accelerates it. When build becomes dramatically faster, the bottleneck moves to discovery (understanding what to build), operationalisation (making it production-grade), and growth (learning from what's live).

---

## 2. Products

### Discovery Loop Coach (First Product -- Active Development)

An AI-powered conversational assistant that turns ambiguous product ideas into precise, testable specifications with BDD acceptance tests.

**How it works:**
1. PM describes a feature in natural language ("I want a login flow with social auth")
2. AI coach asks clarifying questions -- edge cases, security, user journeys
3. Multiple AI personas contribute: Product Coach, Security Expert, UX Analyst, Domain Expert
4. A living specification emerges with structured requirements + acceptance tests in Gherkin format
5. Spec exports to GitHub, Linear, or Jira -- version-controlled alongside code

**Key value proposition:** Turn PM ideas into precise specs + acceptance tests in minutes, not hours. Reduce rework by 30%+, ship faster, and give AI coding tools the clarity they need to succeed.

**Pricing:**
- Free: 10 specs/month, basic personas, Markdown export
- Pro ($29/PM/month): Unlimited specs, all personas, integrations
- Team ($199/month for 10 seats): Shared library, custom personas, analytics

### Future Products (Mentioned but not detailed)
- **Build Loop** -- AI-assisted development against spec-driven acceptance tests
- **Operationalise Loop** -- Continuous compliance, production hardening
- **Grow Loop** -- Evidence-driven product iteration

---

## 3. Brand Identity & Design Direction

### Brand Personality: Mudita

Mudita is Sanskrit for empathetic, vicarious, or altruistic joy -- finding happiness in others' success. This is the emotional core of the Loops brand.

- **Helpful and happy** -- not sterile or intimidating. Approachable without being unserious.
- **Empathetic joy** -- we find satisfaction in helping others build better software.
- **Modern craft** -- clean, considered, intentional. Quality you can feel.
- **Warm authority** -- like a supportive mentor, not a cold instrument.

### Visual Tone

Think: Linear meets Notion warmth. Professional tool with genuine care for its users. The visual language should be warm, muted, and confident -- professional but never clinical.

### Typography

- **Primary:** Geist Sans -- clean geometric sans-serif designed for interfaces
- **Monospace:** Geist Mono -- for code/Gherkin examples

### Colour Palette

The palette uses muted, pastel tones that feel warm, inviting, and human. Each loop has its own colour:

| Loop | Colour Name | Hex (approx) | Feeling |
|------|-------------|--------------|---------|
| **Discovery** | Soft Lavender | #C4B0E0 | Exploration, curiosity, imagination |
| **Build** | Muted Coral | #E0B0A8 | Energy, making, craftsmanship |
| **Operationalise** | Sage Green | #A8D4B8 | Stability, trust, maturity |
| **Grow** | Warm Amber | #D8CCA0 | Learning, insight, warmth |

**Usage rules:**
- Loop colours appear at low saturation -- as backgrounds, borders, subtle accents
- The monochrome palette carries 80% of the interface; loop colours are punctuation
- Discovery's soft lavender is the current brand accent (first product)
- Neutrals: zinc-based scale (professional, clean)

### Dark Mode

Should support both light and dark modes. In dark mode, loop colours shift to lower lightness and chroma to remain readable without glaring.

---

## 4. Landing Page Goals

1. **Introduce Loops** as a platform/framework brand
2. **Explain the four loops** and why they matter in the age of AI
3. **Highlight the Discovery Loop Coach** as the first product available now
4. **Drive signups** for the Discovery Loop Coach
5. **Establish credibility** -- this is a serious tool for professional teams

---

## 5. Suggested Page Structure

### Section 1: Hero

**Headline:** "Software delivery, redesigned for the age of AI"

**Subhead:** "Loops is an AI-powered platform that tightens the feedback loops that matter most: Discovery, Build, Operationalise, and Grow."

**CTA:** "Start with Discovery" (primary) | "Learn more" (secondary)

**Visual:** Abstract representation of four interconnected loops/rings, each in its loop colour (lavender, coral, sage, amber). Consider a subtle animation of them cycling.

### Section 2: The Problem

**Headline:** "AI builds fast. But are you building the right thing?"

**Body:** AI coding tools have made build dramatically faster. But unclear requirements don't produce wrong code slowly -- they produce wrong code quickly. The faster you can build, the more expensive ambiguity becomes.

The bottleneck has shifted. From build to discovery. From deployment to operationalisation. From shipping to learning.

**Visual:** Simple before/after or bottleneck-shift diagram.

### Section 3: The Four Loops

Show each loop as a card or section with its colour, icon, and brief description:

1. **Discovery** (Lavender) -- "Turn rough ideas into precise, testable specifications through AI-guided dialogue."
2. **Build** (Coral) -- "Build against spec-driven acceptance tests. AI handles implementation; you handle architecture."
3. **Operationalise** (Sage) -- "Graduate validated software to production quality with continuous compliance."
4. **Grow** (Amber) -- "Measure what matters, learn from production, and feed evidence into the next cycle."

**Note:** Discovery should be highlighted as "Available now." Others as "Coming soon."

### Section 4: Discovery Loop Coach (Product Feature Section)

**Headline:** "Meet the Discovery Loop Coach"

**Subhead:** "Your AI spec assistant that turns ideas into precise specifications with built-in acceptance tests."

Show the core workflow:

1. **Describe your feature** -- "Add SSO login with Google and Microsoft"
2. **AI probes for clarity** -- "What happens if the SSO provider is down? Should there be a fallback?"
3. **Multiple perspectives** -- Security, UX, and domain experts join the conversation
4. **Spec + tests emerge** -- Structured requirements with Gherkin acceptance tests
5. **Export anywhere** -- GitHub PR, Linear issue, Markdown file

**Visual:** Mockup or illustration of the three-panel interface: dialogue on the left, spec preview in the middle, BDD tests on the right.

### Section 5: Who It's For

**Headline:** "Built for teams shipping with AI"

Three personas:

- **Product Managers** -- "Create specs your engineers actually use. No more 2-hour PRDs that still leave questions unanswered."
- **Engineering Leads** -- "Get acceptance criteria upfront. Your team builds the right thing first time."
- **Technical Founders** -- "Wear both hats. Structure your requirements before handing off to AI coding tools."

### Section 6: How It's Different

| | Jira / Linear / Notion | ChatGPT / Claude | **Discovery Loop Coach** |
|---|---|---|---|
| AI-guided requirements | No | Unstructured | Structured dialogue with personas |
| Acceptance tests | No | Manual | Auto-generated BDD/Gherkin |
| Version controlled | No | No | Markdown in your repo |
| Multi-perspective review | No | Manual prompting | Security, UX, Domain personas |

### Section 7: Pricing

Three tiers as described in Section 2 above (Free / Pro $29 / Team $199).

### Section 8: The Loops Philosophy

**Headline:** "Built on what works"

Brief section explaining: Loops builds on Agile, DevOps, Lean, and XP -- it doesn't replace them. Every improvement in software delivery has been about tightening feedback loops. AI is the next evolution of this principle.

Link to the full framework introduction for those who want to go deeper.

### Section 9: Footer CTA

**Headline:** "Start your first discovery session"

**CTA:** "Get Started Free" (primary)

**Sub-note:** "No credit card required. 10 free specs/month."

### Footer

- macs.dev brand attribution ("Built by macs.dev")
- Links: Docs, Pricing, GitHub, Blog
- Copyright

---

## 6. Key Messaging Reference

**Tagline options:**
- "Software delivery, redesigned for the age of AI"
- "Turn ideas into specs that AI can actually build"
- "The feedback loops that matter most"

**Value props:**
- Save 5-10 hours/week on rework and clarification
- AI builds it right the first time
- Specs + tests generated in minutes, not hours
- Works with Cursor, Copilot, Replit, and any AI coding tool

**Tone:** Warm, direct, confident. Not salesy or hyperbolic. Professional but human. The site should feel like a tool you trust, not a tool trying to convince you.

---

## 7. Technical Notes

- **Framework:** Next.js (React) with Tailwind CSS
- **Font:** Geist Sans / Geist Mono (available via `next/font`)
- **Colour space:** oklch (modern CSS, good browser support)
- **Component library:** shadcn/ui (base-nova style)
- **Responsive:** Must work well at mobile (<640px), tablet (640-1024px), desktop (1024px+)
- **Dark mode:** Required (toggle via `.dark` class on html)

---

## 8. Reference Links

- **Existing prototype:** https://discovery-loop.lovable.app
- **GitHub:** https://github.com/MacsDickinson/loops
- **Design guide:** See `docs/design-guide.md` in the repository
- **Framework intro:** See `docs/loops-intro.md` in the repository

---

## 9. What We Need from Magic Patterns

A complete, responsive landing page design that:

1. Introduces the Loops brand and platform vision
2. Highlights the Discovery Loop Coach as the flagship product
3. Uses our muted pastel loop colour palette throughout
4. Feels warm, professional, and trustworthy (mudita principle)
5. Works in both light and dark mode
6. Is responsive across mobile, tablet, and desktop
7. Can be implemented in Next.js + Tailwind CSS + shadcn/ui

We're looking for the full page layout with all sections, not just individual components. The page should tell a story: problem > solution > product > pricing > CTA.
