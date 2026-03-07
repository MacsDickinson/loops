# Domain Model: Product Hierarchy

**Date:** March 2026
**Status:** Design (pending implementation)
**Related:** [ADR-002](./adr-002-product-hierarchy.md) | [Competitive Analysis](../research/product-hierarchy-patterns.md) | [Discovery Loop Coach PRD](../product/discovery-loop-coach-prd.md)

---

## Overview

This document defines the domain model for the Loops product hierarchy. The core insight: Discovery is not a standalone product -- it's the first stage in a feature's lifecycle. Users start with an **Idea**, flesh it out through discovery, and it **graduates** into a **Feature** within a **Product**.

**Key design principles:**
- Idea and Feature are separate entities (Ideas graduate to Features at Pilot stage)
- Specification has a continuous changelog with conversation provenance
- Team/workspace ownership from day one
- Both idea-first (bottom-up) and product-centric (top-down) entry paths

---

## Bounded Contexts

| Context | Responsibility | Changes |
|---------|---------------|---------|
| **Product Management** | Workspace, Product, Idea, Feature, lifecycle management | **New context** |
| **Discovery** | AI dialogue, personas, spec generation, changelog tracking | Extended with DiscoverySession, SpecificationChange |
| **User Management** | Auth, profiles, subscriptions, workspace membership | Extended with Membership |
| **Integrations** | GitHub, Linear, Jira export | Unchanged |
| **Analytics** | Usage patterns, engagement metrics | Extended to product/feature-level |

---

## Entity Definitions

### Workspace (Aggregate Root)

The top-level organisational container. All data is workspace-scoped.

```
Workspace {
  id: UUID (PK)
  name: string
  slug: string (unique, URL-safe)
  owner_user_id: UUID (FK -> users)
  subscription_tier: 'free' | 'pro' | 'team'
  settings: JSONB
  created_at: timestamp
  updated_at: timestamp
}
```

- Auto-created as "Personal" on signup (solo users never see "workspace" in the UI)
- All products, ideas, features, and specs belong to a workspace
- Billing/subscription lives at workspace level

### Membership

Links Users to Workspaces with role-based access.

```
Membership {
  id: UUID (PK)
  workspace_id: UUID (FK -> workspaces)
  user_id: UUID (FK -> users)
  role: 'owner' | 'admin' | 'member' | 'viewer'
  invited_by: UUID (FK -> users, nullable)
  joined_at: timestamp
}
```

- A user can belong to multiple workspaces
- Owner role is assigned to workspace creator
- RLS policies check workspace membership instead of individual user ID

### Product (Aggregate Root)

A significant deliverable -- an application, service, or platform.

```
Product {
  id: UUID (PK)
  workspace_id: UUID (FK -> workspaces)
  name: string
  description: text
  lifecycle_stage: 'idea' | 'pilot' | 'incubating' | 'graduating' | 'growth' | 'sunset'
  created_by: UUID (FK -> users)
  created_at: timestamp
  updated_at: timestamp
}
```

- Uses the full Loops lifecycle
- A Product in "idea" stage is just a concept -- may not have features yet
- Contains Features (graduated Ideas)
- Product lifecycle stage is set manually (not auto-derived from features)

### Idea

A pre-Feature concept being explored through discovery. The user-facing entity during early stages.

```
Idea {
  id: UUID (PK)
  workspace_id: UUID (FK -> workspaces)
  product_id: UUID (FK -> products, nullable)
  name: string
  description: text
  created_by: UUID (FK -> users)
  graduated_feature_id: UUID (FK -> features, nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

- `product_id` is **nullable**: supports idea-first flow where the product is unknown
- Unassigned ideas (null product_id) live in the workspace-level **Inbox**
- Ideas don't have a lifecycle stage -- they are inherently pre-Pilot
- Status is implicit: has active discovery session, has completed spec, or has graduated
- `graduated_feature_id` is set when the Idea graduates to a Feature
- The Idea is retained as a historical record after graduation (never deleted)

### Feature (Aggregate Root)

A graduated Idea. A unit of product capability at Pilot stage or beyond.

```
Feature {
  id: UUID (PK)
  workspace_id: UUID (FK -> workspaces)
  product_id: UUID (FK -> products, required)
  name: string
  description: text
  lifecycle_stage: 'pilot' | 'incubating' | 'graduating' | 'growth' | 'sunset'
  source_idea_id: UUID (FK -> ideas)
  parent_feature_id: UUID (FK -> features, nullable)
  created_by: UUID (FK -> users)
  created_at: timestamp
  updated_at: timestamp
}
```

- `lifecycle_stage` starts at `pilot` (Features are born at Pilot -- everything before is an Idea)
- `product_id` is **required** (must be assigned to a product by graduation)
- `source_idea_id` links back to the originating Idea for traceability
- `parent_feature_id` supports amendments/sub-features of existing features

### Specification

The living document output of discovery. Contains requirements and acceptance tests. Evolves over time with tracked changes.

```
Specification {
  id: UUID (PK)
  workspace_id: UUID (FK -> workspaces, denormalised)
  idea_id: UUID (FK -> ideas, nullable)
  feature_id: UUID (FK -> features, nullable)
  created_by: UUID (FK -> users)
  title: string
  description: text
  requirements_json: JSONB
  acceptance_tests_json: JSONB
  status: 'draft' | 'complete' | 'archived'
  linked_github_pr: text (nullable)
  linked_linear_issue: text (nullable)
  created_at: timestamp
  updated_at: timestamp
  completed_at: timestamp (nullable)
}
```

- Owned by either an Idea (`idea_id` set) or a Feature (`feature_id` set) -- one must be set
- Check constraint: `(idea_id IS NOT NULL) OR (feature_id IS NOT NULL)`
- Single spec that evolves over time -- not multiple version records
- All changes tracked via SpecificationChange
- `workspace_id` denormalised for query efficiency and RLS

### SpecificationChange

Continuous changelog for the specification. Every change is recorded with provenance.

```
SpecificationChange {
  id: UUID (PK)
  specification_id: UUID (FK -> specifications)
  change_type: 'ai_generated' | 'manual'
  field_changed: string
  previous_value: JSONB (nullable)
  new_value: JSONB
  session_id: UUID (FK -> discovery_sessions, nullable)
  dialogue_turn_id: UUID (FK -> dialogue_turns, nullable)
  changed_by: UUID (FK -> users)
  description: text
  created_at: timestamp
}
```

- **AI changes:** Logged automatically when AI generates or modifies requirements/tests. References the `session_id` and `dialogue_turn_id` that produced the change.
- **Manual changes:** Logged when user saves edits. `session_id` and `dialogue_turn_id` are null.
- Acts like a git log -- you can trace any requirement back to the conversation that created it.
- `field_changed` uses dot notation: `requirements[0].text`, `acceptance_tests[2].then`, etc.

### DiscoverySession

An explicit instance of the discovery dialogue process.

```
DiscoverySession {
  id: UUID (PK)
  specification_id: UUID (FK -> specifications)
  started_by: UUID (FK -> users)
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  personas_used: text[]
  started_at: timestamp
  completed_at: timestamp (nullable)
}
```

- Makes sessions explicit (currently implicit in the codebase)
- Supports pause/resume
- Multiple sessions per spec (e.g., initial discovery + follow-up to address gaps)

### DialogueTurn

A single exchange within a discovery session. Re-parented from Specification to DiscoverySession.

```
DialogueTurn {
  id: UUID (PK)
  session_id: UUID (FK -> discovery_sessions)
  persona_type: 'product_coach' | 'security_expert' | 'ux_analyst' | 'domain_expert'
  question: text
  answer: text
  turn_order: integer
  tokens_used: integer (nullable)
  latency_ms: integer (nullable)
  created_at: timestamp
}
```

---

## Entity Relationships

```
Workspace (1) -----> (*) Membership (*) <----- (1) User
    |
    |--- (1) -----> (*) Product
    |                     |
    |                     |--- (1) -----> (*) Feature
    |                     |                     |
    |                     |--- (1) -----> (*) Idea ---graduates--> Feature
    |                                           |
    |--- (1) -----> (*) Idea (unassigned, Inbox)
                          |
                          |--- (1) -----> (1) Specification
                                               |
                                               |--- (1) -----> (*) SpecificationChange
                                               |
                                               |--- (1) -----> (*) DiscoverySession
                                                                    |
                                                                    |--- (1) -----> (*) DialogueTurn
```

**Key relationships:**
- `Workspace 1:N Product`
- `Workspace 1:N Idea` (unassigned ideas in Inbox)
- `Product 1:N Idea` (ideas assigned to a product)
- `Product 1:N Feature` (graduated ideas)
- `Idea 0:1 Feature` (graduates into)
- `Idea 1:1 Specification` (during discovery)
- `Feature 1:N Specification` (can go through discovery again)
- `Feature 0:1 Feature` (self-ref: parent_feature_id for amendments)
- `Specification 1:N SpecificationChange` (changelog)
- `Specification 1:N DiscoverySession`
- `DiscoverySession 1:N DialogueTurn`

---

## Lifecycle State Machine

### Ideas

Ideas don't have an explicit lifecycle stage. Their status is derived:

| Derived Status | Condition |
|---------------|-----------|
| **New** | Has no Specification yet |
| **In Discovery** | Has a Specification with an active DiscoverySession |
| **Discovered** | Has a completed Specification, not yet graduated |
| **Graduated** | `graduated_feature_id` is set |

### Features

Features use lifecycle stages starting from Pilot:

```
Pilot --> Incubating --> Graduating --> Growth --> Sunset
```

| Transition | Trigger | Who Decides |
|-----------|---------|-------------|
| Idea -> Pilot (graduation) | Spec complete, product assigned | PM |
| Pilot -> Incubating | Prototype validated with real users | PM + Eng Lead |
| Incubating -> Graduating | Decision to invest in production quality | PM + Stakeholders |
| Graduating -> Growth | Production-tier tests pass, operationalised | Eng Lead |
| Growth -> Sunset | Declining value, replacement planned | PM + Stakeholders |

### Products

Products use the full Loops lifecycle:

```
Idea --> Pilot --> Incubating --> Graduating --> Growth --> Sunset
```

Product lifecycle stage is manually set and represents overall maturity.

---

## Graduation: Idea to Feature

The graduation process when an Idea's Specification is marked complete:

1. **Spec completion:** User clicks "Complete Specification" after discovery dialogue
2. **Product assignment:** If the Idea has no `product_id`, the user is prompted: "Which product does this belong to?" They can select an existing product or create a new one.
3. **Feature creation:** A Feature is created with:
   - `lifecycle_stage: 'pilot'`
   - `source_idea_id` set to the Idea's ID
   - `product_id` from the Idea or the user's selection
   - `name` and `description` from the Idea
4. **Spec transfer:** The Specification's `feature_id` is set to the new Feature. `idea_id` remains set (dual link during transition).
5. **Idea update:** `graduated_feature_id` set to the new Feature's ID
6. **Visibility:** The Feature appears in the Product's feature list at Pilot stage. The Idea is retained in history.

### Amendment Flow

When a user wants to modify an existing Feature:

1. User views Feature, clicks "Start New Discovery"
2. A new Idea is created, linked to the Feature context
3. Discovery session explores the change
4. On graduation: the new Specification is added to the existing Feature (or a sub-Feature is created with `parent_feature_id`)

---

## User Flows

### Idea-First Flow (Bottom-Up)

```
Dashboard/Inbox --> "New Idea" --> Enter description --> Idea created (Inbox)
    --> Spec created (draft) --> Discovery session starts
    --> AI dialogue (changes logged to SpecificationChange)
    --> "Complete Specification"
    --> Graduation prompt: assign to product
    --> Feature created at Pilot stage
```

### Product-Centric Flow (Top-Down)

```
Products --> Select product --> "Add Idea" --> Idea created (under product)
    --> Spec created (draft) --> Discovery session starts
    --> AI dialogue (changes logged to SpecificationChange)
    --> "Complete Specification"
    --> Feature created at Pilot (product already assigned)
```

### Navigation Structure

```
/dashboard                              -- workspace overview, recent ideas, quick actions
/inbox                                  -- unassigned ideas (idea-first flow landing)
/products                               -- all products
/products/[id]                          -- product detail: features + ideas in discovery
/products/[id]/ideas/[id]               -- idea detail + discovery
/products/[id]/features/[id]            -- feature detail + specs + lifecycle
/ideas/[id]/discover                    -- discovery session (works for inbox ideas too)
/features/[id]                          -- feature detail (direct link)
```

---

## Ubiquitous Language

| Term | Definition |
|------|-----------|
| **Workspace** | Organisational container. Owns products, ideas, features, billing. |
| **Product** | A significant deliverable (app, service, platform). Contains features. Has lifecycle stage. |
| **Idea** | A pre-Feature concept being explored through discovery. Lives in Inbox or under a Product. |
| **Feature** | A graduated Idea. A unit of product capability at Pilot stage or beyond. |
| **Specification** | The living document output of discovery. Has requirements + acceptance tests. Tracks changes. |
| **SpecificationChange** | A single logged change to a specification, with provenance (which conversation caused it). |
| **DiscoverySession** | An explicit dialogue instance for refining a specification. |
| **DialogueTurn** | A single exchange (user message + AI response) within a discovery session. |
| **Inbox** | Collection of unassigned ideas (no product yet). Result of idea-first flow. |
| **Graduation** | The act of promoting an Idea to a Feature when discovery is complete. |
| **Lifecycle Stage** | One of: Idea, Pilot, Incubating, Graduating, Growth, Sunset. Applies to Products and Features. |

---

## Open Questions

1. **Product lifecycle derivation:** Should a Product's lifecycle stage be manually set or auto-derived from its features' stages?
   - **Current decision:** Manual. Simpler, avoids complex rollup logic.

2. **AI-assisted classification:** Should AI suggest which product/feature an idea relates to during idea-first flow?
   - **Future consideration.** Compelling but adds complexity. Defer to post-MVP.

3. **Personal workspace naming:** Use "Personal" or the user's name?
   - **Recommendation:** User's name (matches Linear's pattern).

4. **Workspace billing:** Current model bills by user subscription tier. Moving to workspace-level billing is a significant change.
   - **Recommendation:** Phase for post-MVP. Keep user-level billing initially, migrate when team features are fully built.

5. **Spec changelog storage:** At scale, SpecificationChange rows could grow large.
   - **Recommendation:** Partition by specification_id. Archive old changes after 90 days. Consider summarisation for display.
