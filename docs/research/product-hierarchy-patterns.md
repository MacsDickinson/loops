# Product Hierarchy Patterns: Competitive Analysis

**Date:** March 2026
**Purpose:** Research how existing tools model the Product > Feature > Idea hierarchy to inform the Loops domain model.

---

## 1. Linear

**Hierarchy:** Workspace > Teams > Projects > Issues (with Initiatives above Projects)

| Level | Purpose |
|-------|---------|
| Workspace | Top-level org container. Unique URL. Users can belong to multiple. |
| Teams | Groups of people. Own issues. Have team-specific settings, cycles, workflows. Support sub-teams (Business/Enterprise). |
| Projects | Group related issues. Can span multiple teams. Have status and timeline. |
| Initiatives | Group projects at workspace level. High-level strategic goals. |
| Issues | Core work unit. Belong to one team. Support sub-issues across teams. |

**Strengths:**
- Flat-with-views approach reduces cognitive load vs deep hierarchies
- Sub-teams mirror org structure without adding issue hierarchy levels
- Projects span teams naturally (cross-functional work)
- Views are filter-based and dynamic, not rigid folder structures

**Weaknesses:**
- No explicit "idea" concept separate from issues
- Ideas are just issues with a particular status/label
- No graduation model (idea -> feature -> production)

**Relevance to Loops:**
- Workspace model is well-proven for team ownership
- Views-based navigation is more flexible than rigid tree structures
- Two levels of containment (team + project) is sufficient for most teams
- The lack of idea/feature separation is a gap we can fill

---

## 2. Jira

**Hierarchy:** Project > Initiative > Epic > Story/Task > Sub-task

| Level | Purpose |
|-------|---------|
| Project | Top-level container. Represents a team, product, or workstream. |
| Initiative | Strategic theme grouping epics (Advanced Roadmaps). |
| Epic | Large body of work spanning multiple sprints. |
| Story | User-facing requirement, single sprint scope. |
| Task | Technical or non-user-facing work item. |
| Sub-task | Breakdown of a story or task. |

**Strengths:**
- Deep hierarchy supports enterprise scale
- Custom issue types allow flexible modeling
- Workflows per issue type enable lifecycle management
- Strong filtering and JQL for cross-cutting views

**Weaknesses:**
- Hierarchy depth creates cognitive overhead and ceremony
- No clear idea-to-feature journey -- ideas are just issues at the top of a workflow
- Configuration complexity is notorious
- Mixing "type of work" (epic vs story) with "size of work" causes confusion

**Relevance to Loops:**
- Avoid the depth trap -- 2-3 levels max
- Workflow states (Jira's strongest pattern) map well to lifecycle stages
- Custom issue types show the value of distinguishing Ideas from Features at the type level

---

## 3. Productboard

**Hierarchy:** Workspace > Product > Components/Features > Sub-features

| Level | Purpose |
|-------|---------|
| Workspace | Org-level container. |
| Product | A product or product area. |
| Components | Grouping mechanism within a product. |
| Features | The core planning unit. Hierarchical -- features can have sub-features. |
| Insights | User feedback linked to features. Aggregated up the hierarchy. |

**Strengths:**
- Explicit separation of **insights** (raw feedback/ideas) from **features** (planned work)
- Features hierarchy with parent-child relationships
- Insights automatically aggregate up the hierarchy -- low-level feedback rolls up to high-level features
- AI auto-links feedback to features
- Portal for external idea collection with voting

**Weaknesses:**
- Insights and features are in separate boards -- the journey from insight to feature requires manual promotion
- Hierarchy can get deep and hard to navigate
- Feature status is basic (not a rich lifecycle model)

**Relevance to Loops:**
- **Key pattern: Insights (ideas) are separate from Features.** This directly validates our Idea/Feature separation.
- The promotion model (insight -> feature) is exactly what we're calling "graduation"
- Feedback aggregation up the hierarchy is powerful for understanding demand
- Portal concept could inform how external stakeholders submit ideas

---

## 4. Aha!

**Hierarchy:** Workspace Line > Workspace > Initiatives > Epics > Features > Requirements

| Level | Purpose |
|-------|---------|
| Workspace Line | Org/division/product line grouping. Nestable. |
| Workspace | Represents a product. Contains roadmaps, features, ideas. |
| Initiatives | Strategic themes grouping features. |
| Epics | Groups of related features. |
| Features | The core planning unit. |
| Requirements | Detailed specs within a feature. |
| Ideas Portal | Separate collection point for ideas from stakeholders. |

**Strengths:**
- **Explicit idea-to-feature promotion.** Ideas live in a portal, are reviewed, and promoted to features/epics/initiatives. Promoted records retain a link to the original idea and keep subscribers updated.
- Rich hierarchy for enterprise scale
- Ideas portal supports both internal and external collection
- Visual roadmaps connect strategy to features

**Weaknesses:**
- Very heavyweight -- designed for enterprise PM teams
- Deep hierarchy adds complexity
- Ideas and features live in different areas of the product

**Relevance to Loops:**
- **Strongest validation of the Idea -> Feature graduation model.** Aha! has this exact pattern and it's a core differentiator.
- The "promote and link back" pattern is what we're designing for graduation
- Internal vs external idea portals could be a future consideration
- Avoid the heavyweight trap -- keep it simple for smaller teams

---

## 5. Canny

**Hierarchy:** Groups > Ideas > Insights

| Level | Purpose |
|-------|---------|
| Groups | High-level initiative grouping. |
| Ideas | Feature requests or proposals. Core unit. |
| Insights | Individual pieces of feedback linked to ideas. |
| Categories | Public-facing top-level organization. |
| Tags | Internal-only flexible labeling. |

**Strengths:**
- Recently introduced Ideas Hierarchy with Groups, Ideas, and Insights
- AI auto-grouping assigns new ideas to the right groups based on descriptions
- Simple, focused on the idea-to-decision journey
- Voting and feedback collection built in

**Weaknesses:**
- No concept of "feature" as a distinct entity -- ideas are the unit of work
- No lifecycle model beyond basic status
- No product hierarchy above ideas

**Relevance to Loops:**
- AI auto-grouping is an interesting future feature for Loops (AI suggests which product/feature an idea relates to)
- Groups > Ideas > Insights hierarchy validates multi-level organization of pre-feature concepts
- Simplicity is a strength -- avoid over-engineering the hierarchy

---

## 6. Notion

**Hierarchy:** Workspace > Databases > Pages (user-defined structure)

**Strengths:**
- Completely flexible -- users define their own hierarchy with relations
- No enforced structure means it adapts to any team's mental model
- Powerful for documentation alongside tracking

**Weaknesses:**
- No enforced structure means inconsistency across teams
- No built-in idea-to-feature lifecycle
- Product management features are bolted on, not native

**Relevance to Loops:**
- Shows the value of flexibility, but also the cost of no structure
- Loops should provide opinionated defaults with room to customize

---

## Patterns and Recommendations for Loops

### Pattern 1: Ideas and Features are Separate Entities

Productboard, Aha!, and Canny all separate raw ideas/feedback from planned features. This is the strongest pattern across the competitive landscape:

- **Ideas** are lightweight, exploratory, and may never become features
- **Features** are committed work items with specifications and lifecycle tracking
- A **promotion/graduation step** connects them, maintaining traceability

This directly validates the Loops design: Idea (pre-discovery) -> Feature (post-discovery, at Pilot stage).

### Pattern 2: Two Levels of Containment is Sufficient

Linear and Jira both show that beyond 2-3 levels of hierarchy, cognitive overhead increases without proportional value:

- **Product** (or Project/Workspace) as the grouping level
- **Feature** (or Issue) as the work unit
- Optional sub-features for decomposition

Loops should stick with: **Workspace > Product > Feature** (with Ideas as a pre-Feature entity).

### Pattern 3: Lifecycle/Workflow States Beat Folder Structures

Linear's workflow states and Jira's issue workflows are more useful than rigid tree navigation:

- Features move through states rather than being filed in folders
- Views/filters provide flexible navigation across the hierarchy
- The lifecycle model (Idea -> Pilot -> ... -> Sunset) is inherently a workflow

### Pattern 4: Workspace Ownership is Table Stakes

Every tool in this analysis uses workspace/organization-level ownership:

- Data belongs to a workspace, not an individual
- Users access data through membership with roles
- Personal workspaces handle the solo-user case

### Pattern 5: AI-Assisted Classification is Emerging

Productboard and Canny both use AI to auto-link or auto-group ideas:

- AI suggests which feature/product an idea relates to
- Reduces manual triage overhead
- Could be a differentiator for Loops' idea-first flow

---

## Sources

- [Linear Conceptual Model](https://linear.app/docs/conceptual-model)
- [Linear Teams](https://linear.app/docs/teams)
- [Linear Projects](https://linear.app/docs/projects)
- [Linear Sub-teams](https://linear.app/docs/sub-teams)
- [Jira Issue Hierarchy](https://titanapps.io/blog/jira-issue-hierarchy)
- [Atlassian Epics, Stories, Initiatives](https://www.atlassian.com/agile/project-management/epics-stories-themes)
- [Productboard Feature Hierarchy](https://support.productboard.com/hc/en-us/articles/360058212333-Add-features-to-your-hierarchy)
- [Productboard Insights](https://support.productboard.com/hc/en-us/articles/360056354314-Create-your-first-insight)
- [Aha! Product Management](https://www.aha.io/team/product-management)
- [Canny Feature Request Management](https://canny.io/use-cases/feature-request-management)
