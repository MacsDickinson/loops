# Loops Platform Reframing

**Status:** Working draft — needs further development
**Date:** March 2026
**Context:** Strategic rethink of the Loops framework, informed by the emerging AI-assisted development ecosystem

---

## Why Reframe

The original Loops framework defined four sequential loops: Discovery → Build → Operationalise → Grow. This framing has two problems:

1. **The Discovery Loop tries to be one thing for two very different contexts.** Exploring a greenfield product idea (challenging premises, validating market fit) is a fundamentally different process from specifying a feature on an existing product (where you have users, metrics, technical constraints, and a codebase). The current "Discovery Session" concept doesn't flex between these.

2. **Build, Operationalise, and Grow are increasingly well-served by other tools.** The AI-assisted development ecosystem is maturing rapidly. Tools like gstack, superpowers, spec-kit, and get-shit-done handle specification → planning → execution → review extremely well. Loops shouldn't compete with them — it should complement them.

3. **Measurement comes too late.** Treating metrics as something that happens in the "Grow" phase means teams define success after they've already built. The metric tree — what we expect to move and why — should be part of the spec, not a post-launch afterthought.

---

## The Reframed Loops: Clarify → Instrument → Learn

Instead of four sequential phases, three loops that genuinely cycle:

### Clarify

Turn ambiguity into testable hypotheses. The process adapts to context:

**For new products / greenfield ideas:**
- Challenge premises and assumptions (inspired by gstack's office-hours pattern)
- Explore alternatives and validate the core proposition
- Surface risks across personas (security, UX, technical feasibility)
- Output: a spec with explicit hypotheses about what this product will achieve

**For features on existing products:**
- Pull in existing metrics, user behaviour data, and technical context
- Frame the feature as a response to observed data or user feedback
- Understand constraints from the existing system
- Output: a spec that connects the feature to specific metrics it aims to influence

In both cases, the output isn't just a spec — it's a **spec with a hypothesis and a metric tree**. This is the key difference from the original Discovery Loop.

The BDD acceptance tests remain central. They define what we expect *functionally*. The metric tree defines what we expect in terms of *performance*. Together they form a complete definition of success.

### Instrument

Define what success looks like in hard numbers, before build begins.

This is DoubleLoop-style linkage between:
- **Input metrics** — things the team can directly influence (e.g. onboarding completion rate, feature adoption %)
- **North star metric** — the primary measure of value delivery
- **Business KPIs** — revenue, retention, growth outcomes

The hypothesis from Clarify becomes measurable: "We believe this feature will move metric X by Y%, because of mechanism Z."

The build itself happens outside Loops, in whatever tool the team uses. Loops produces specs and metric definitions that those tools can consume.

### Learn

Close the loop. Observe what actually happened against predictions.

- Did the metric move as hypothesised?
- Were the BDD acceptance criteria met in production (not just in tests)?
- What surprised us? What did users actually do?
- Feed learnings directly back into the next Clarify cycle

---

## Loops as an Integration Layer

A key strategic question: rather than being a standalone platform that does everything, could Loops sit as an integration layer across the product lifecycle?

```
┌─────────────────────────────────────────────────────┐
│                      LOOPS                          │
│                                                     │
│   Clarify          Instrument           Learn       │
│   ┌─────┐          ┌─────────┐         ┌──────┐    │
│   │Specs│──────────▶│ Metric  │────────▶│Actual│    │
│   │+ BDD│          │ Trees   │         │vs    │    │
│   │+Hypo│          │+ Targets│         │Pred. │    │
│   └──┬──┘          └────┬────┘         └──┬───┘    │
│      │                  │                 │         │
└──────┼──────────────────┼─────────────────┼─────────┘
       │                  │                 │
       ▼                  │                 ▲
┌──────────────┐          │          ┌──────────────┐
│  Build Tools │          │          │  Analytics   │
│              │          │          │  Platforms   │
│ • GitHub     │          │          │              │
│ • gstack     │          └─────────▶│ • Mixpanel   │
│ • superpowers│                     │ • PostHog    │
│ • spec-kit   │                     │ • Amplitude  │
│ • GSD        │                     │              │
│              │ BDD tests run in CI │              │
│              │─────────────────────│              │
└──────────────┘                     └──────────────┘
```

In this model:

- **Loops → GitHub**: Specs and BDD feature files are pushed to the repo. The build pipeline runs BDD tests as acceptance gates. Loops doesn't need to know how the code gets written — it just needs to know whether its acceptance criteria pass.
- **Loops → Analytics platforms**: Metric tree definitions flow to PostHog/Mixpanel/Amplitude. Loops defines *what* to measure; the analytics platform provides the *data*. Loops pulls actuals back to compare against predictions.
- **GitHub → Loops**: Build status, BDD test results, and deployment events flow back. Loops knows when something shipped and whether it met its functional criteria.
- **Analytics → Loops**: Metric data flows back for the Learn phase. Loops compares actual performance against the hypotheses defined in Clarify/Instrument.

This positioning means Loops doesn't compete with any of these tools — it's the connective tissue that ties intent (what we wanted to achieve) to outcome (what actually happened).

---

## What This Means for the Existing Work

### What carries forward

- **The AI-guided dialogue approach** — the conversational spec creation with personas is still the core UX for the Clarify phase. It just needs to flex based on context.
- **BDD as the contract language** — acceptance tests remain central, now explicitly paired with metric hypotheses.
- **The product hierarchy** (Workspace > Product > Idea > Feature) — still valid. Ideas and Features just get different Clarify flows.
- **The "mudita" design philosophy** — unchanged.
- **The domain model** — mostly carries forward, with extensions for metric trees and hypotheses.

### What changes

- **The four-loop framing** → three loops (Clarify, Instrument, Learn)
- **"Discovery Session" terminology** → needs rethinking. The session concept is still useful (pause/resume a conversation), but the framing should reflect context-awareness.
- **Build/Operationalise/Grow** → replaced by integrations with external tools. Loops doesn't own the build or operations phases.
- **The landing page narrative** → needs updating to reflect the new positioning as a complement to build tools, not a replacement.
- **Analytics events schema** → extends significantly. Currently tracks platform usage; needs to also model the metric trees that users define for their own products.

---

## Open Questions

These need further thinking before this reframing is complete:

### User journeys
- Who exactly is the primary user? The PM defining the spec? The engineering lead tracking delivery? The product analyst measuring outcomes? All three?
- What does the day-to-day workflow look like? When do they open Loops vs their other tools?
- How does the Clarify flow differ in practice for "new product idea" vs "feature on existing product"? What context does it pull in for the latter?

### Integration depth
- How tightly coupled does the GitHub integration need to be? Is it enough to push feature files, or does Loops need to understand the repo structure?
- For analytics platforms, is the MVP a manual "enter your metric values" flow, or does it need live API integration from day one?
- How do BDD test results flow back? Webhooks from CI? GitHub Actions status checks?

### Metric trees
- How much does the AI help with metric tree construction? Can it suggest plausible input metrics based on the feature type?
- What's the right level of rigour for early-stage products (where you might not have baseline data) vs mature products (where you have historical trends)?
- How do metric trees compose across features within a product?

### Market positioning
- "The connective tissue between intent and outcome" — is this compelling enough as a positioning statement?
- Does the DoubleLoop gap genuinely exist now that Mixpanel has acquired them, or will Mixpanel ship similar functionality natively?
- How do we explain the value prop to someone who hasn't used gstack/superpowers/spec-kit? Do they need to understand the ecosystem to get the pitch?

### The name
- "Loops" still works well for the Clarify → Instrument → Learn cycle. The feedback loop metaphor is arguably stronger with three phases than four.
- But the individual loop names (Discovery, Build, Operationalise, Grow) are baked into the brand identity, colour palette, and landing page. Renaming needs to cascade through the design system.

---

## Competitive Landscape

### Tools that handle Build (not our problem to solve)

| Tool | What it does | How Loops complements it |
|------|-------------|------------------------|
| **gstack** | AI office-hours for validating new product ideas, generates implementation plans | Loops extends gstack's output with metric trees and ongoing measurement |
| **superpowers** | 7-phase AI development workflow (brainstorm → plan → build → review) | Loops provides the "why build this" and "did it work" bookends |
| **spec-kit** | Turns GitHub issues into detailed specs with acceptance criteria | Loops could be the source of those issues, enriched with hypotheses |
| **get-shit-done** | Structured task execution with AI agents | Loops feeds it prioritised, measured work items |

### The metrics gap (our opportunity)

| Tool | Status | Gap |
|------|--------|-----|
| **DoubleLoop** | Acquired by Mixpanel (2025). Product being absorbed. | No standalone offering connecting objectives → metrics → features |
| **Vistaly** | Active. KPI tree visualisation. | More GTM/strategy focused, not integrated into product development workflow |
| **Mixpanel/Amplitude/PostHog** | Active. Analytics platforms. | Measure what happened, but don't link metrics to feature hypotheses or specs |
| **Productboard/Airfocus** | Active. Roadmap/prioritisation. | Feature voting and prioritisation, but no metric tree or hypothesis tracking |

The gap: nobody currently connects **"what we decided to build and why"** to **"what actually happened when we shipped it"** in a single workflow. That's the Loops opportunity.

---

## Next Steps

- [ ] Map out user journeys for the primary personas
- [ ] Define the Clarify flow differences for new products vs features in detail
- [ ] Design the metric tree data model and how it connects to the existing domain model
- [ ] Research analytics platform APIs (PostHog, Mixpanel, Amplitude) for integration feasibility
- [ ] Revisit the landing page narrative and brand identity with the new framing
- [ ] Update the PRD to reflect the reframed scope
