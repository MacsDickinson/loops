# ADR-002: Product Hierarchy with Idea/Feature Separation

**Date:** March 2026
**Status:** Accepted
**Deciders:** Product Owner, Technical Lead

---

## Context

The Discovery Loop Coach was initially built as a standalone product where PMs create specifications in isolation. The data model is flat: User -> Specification -> DialogueTurn. There is no concept of Product, Feature, or Idea.

This creates several problems:

1. **No organisational structure.** Specs exist in isolation with no way to group them by product or feature area.
2. **No lifecycle tracking.** A spec is either draft, complete, or archived -- there's no model for the journey from idea to production feature.
3. **No team ownership.** Specs belong to individual users, blocking collaboration.
4. **Discovery is disconnected from the product.** It should be the first stage of a feature's lifecycle, not a standalone activity.

The Loops framework already defines a product lifecycle (Idea -> Pilot -> Incubating -> Graduating -> Growth -> Sunset) and four feedback loops (Discovery, Build, Operationalise, Grow). The domain model should reflect this.

## Decision

Introduce a product hierarchy: **Workspace > Product > Feature**, with **Idea** as a separate pre-Feature entity that graduates into a Feature through discovery.

### Key Design Decisions

**1. Idea and Feature are separate entities**

An Idea is lightweight and exploratory. It may never become a Feature. A Feature is a committed unit of product capability at Pilot stage or beyond. An Idea graduates into a Feature when its Specification is complete and a Product is assigned.

*Alternatives considered:*
- Single entity with UI label change (simpler data model, but muddies the domain semantics -- an Idea and a Feature have different invariants)
- Always call it "Idea" regardless of stage (confusing for production features)

**2. Specification has continuous changelog (SpecificationChange)**

Every AI-generated change is logged with a reference to the DiscoverySession and DialogueTurn that produced it. Manual changes are logged on save. This provides full provenance: you can trace any requirement back to the conversation that created it.

*Alternatives considered:*
- Snapshot versioning (simpler but loses granularity -- can't see which conversation produced which requirement)
- No versioning (loses history entirely)

**3. Team/workspace ownership from day one**

All data belongs to a Workspace, not an individual User. Users access data through Membership with roles. A personal workspace is auto-created on signup.

*Alternatives considered:*
- User-scoped data with team features added later (simpler initially but requires painful migration)

**4. Both entry paths: idea-first and product-centric**

Users can start from a vague idea (bottom-up, lands in Inbox) or browse products and add features (top-down). The `product_id` on Idea is nullable to support the idea-first flow.

*Alternatives considered:*
- Product-centric only (forces classification before understanding -- premature)
- Idea-first only (doesn't support structured product management)

**5. DiscoverySession as explicit entity**

Sessions are currently implicit (a set of dialogue turns for a spec). Making them explicit enables pause/resume, session analytics, and multiple sessions per spec.

## Consequences

### Positive
- Domain model reflects real-world product management workflow
- Ideas can be explored without committing to a product structure
- Full traceability from conversation to requirement to feature
- Team collaboration enabled from day one
- Lifecycle stages align with the Loops framework

### Negative
- Migration required from flat model to hierarchy
- RLS policies must move from user-scoped to workspace-scoped
- More entities to manage (Workspace, Membership, Product, Idea, Feature, SpecificationChange, DiscoverySession)
- Graduation step adds a decision point in the user flow

### Risks
- Over-engineering for current user base (mitigated: personal workspace abstracts complexity for solo users)
- Spec changelog could grow large at scale (mitigated: partition by spec, archive after 90 days)

## Related Documents

- [Product Hierarchy Domain Model](./product-hierarchy.md)
- [Competitive Analysis](../research/product-hierarchy-patterns.md)
- [Discovery Loop Coach PRD](../product/discovery-loop-coach-prd.md)
- [Loops Framework](./loops-intro.md)
