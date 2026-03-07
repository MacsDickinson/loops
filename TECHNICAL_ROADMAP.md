# Technical Roadmap & Assignment Plan

**Date:** 2026-03-07
**Created by:** CTO
**Status:** BLOCKED - Awaiting task assignment permissions (see MAC-48)

## Executive Summary

The technical team is idle with 15 unassigned tasks in the backlog (9 high priority, 5 medium, 1 current). CTO lacks `tasks:assign` permission to delegate work, blocking all technical execution.

## Current Team State

| Agent | Status | Current Assignment | Capacity |
|-------|--------|-------------------|----------|
| Technical Product Lead | Idle | None | 100% available |
| Design Lead | Idle | None | 100% available |
| QA Engineer | Idle | None | 100% available |
| Founding Engineer | Idle | None | Pending sunset decision |
| CTO | Active | MAC-48 (escalation) | Blocked on permissions |

## Critical Path Tasks (Must Start Immediately)

### Phase 1: Foundation (Week 1-2)
Priority: Complete these in parallel to unblock all downstream work.

1. **MAC-26: Database Schema** → Technical Product Lead
   - 2-3 days estimated
   - Blocks: MAC-29, MAC-27, MAC-25
   - Critical infrastructure for all features

2. **MAC-27: Zod Schemas** → Technical Product Lead
   - 1-2 days estimated
   - Can run parallel to MAC-26
   - Enables type-safe development

3. **MAC-25: Product Coach Dialogue** → Technical Product Lead
   - 3-4 days estimated
   - Starts after MAC-26/MAC-27 complete
   - Core MVP feature
   - Blocks: MAC-28, MAC-29, MAC-30

### Phase 2: Core Features (Week 2-3)

4. **MAC-28: BDD Test Generation** → Technical Product Lead
   - 2-3 days estimated
   - Depends on: MAC-25
   - Core value proposition

5. **MAC-29: Spec Versioning** → Technical Product Lead
   - 2-3 days estimated
   - Depends on: MAC-25, MAC-26
   - Data persistence layer

6. **MAC-31: Markdown Export** → Technical Product Lead
   - 1-2 days estimated
   - Depends on: MAC-28, MAC-29
   - Export functionality

### Phase 3: Enhanced Features (Week 3-4)

7. **MAC-30: Multi-Persona System** → Technical Product Lead
   - 3-4 days estimated
   - Depends on: MAC-25
   - Differentiator feature

8. **MAC-32: GitHub OAuth** → Technical Product Lead
   - 2-3 days estimated
   - Blocks: MAC-33
   - Integration feature

9. **MAC-33: GitHub PR Creation** → Technical Product Lead
   - 2-3 days estimated
   - Depends on: MAC-32, MAC-31
   - Export to PR feature

### Phase 4: Polish & Production (Week 4-5)

10. **MAC-47: Landing Page** → Technical Product Lead + Design Lead
    - Frontend implementation by TPL
    - Design review by Design Lead
    - Go-to-market asset

11. **MAC-34: UI/UX Refinement** → Design Lead
    - 3-4 days estimated
    - Polish pass on all interfaces
    - Accessibility compliance

12. **MAC-36: Error Handling** → Technical Product Lead
    - 2-3 days estimated
    - Production readiness
    - Should run parallel with feature work

13. **MAC-35: Performance Optimization** → Technical Product Lead
    - 2-3 days estimated
    - Edge Functions, caching
    - NFR compliance

### Phase 5: Launch Prep (Week 5-6)

14. **MAC-37: Beta Onboarding** → Technical Product Lead
    - 2-3 days estimated
    - Depends on: MAC-25, MAC-28
    - User activation flow

15. **MAC-38: Analytics** → Technical Product Lead
    - 1-2 days estimated
    - PostHog instrumentation
    - Can run parallel with other work

## Recommended Initial Assignments

**Immediate (This Week):**
- Technical Product Lead → MAC-26, MAC-27 (parallel work)
- Design Lead → MAC-47 (design review), prepare for MAC-34
- QA Engineer → Standby for test strategy (post-MAC-28)

**Next Week:**
- Technical Product Lead → MAC-25 (after MAC-26/27 complete)
- Design Lead → MAC-34 planning
- QA Engineer → Test automation framework setup

## Dependency Graph

```
MAC-26 (DB Schema) ──┬──> MAC-25 (Product Coach) ──┬──> MAC-28 (BDD)
                     │                              ├──> MAC-29 (Versioning)
MAC-27 (Zod) ────────┘                              └──> MAC-30 (Multi-Persona)

MAC-28 ──┬──> MAC-31 (Markdown Export) ──> MAC-33 (PR Creation)
         │
MAC-29 ──┘

MAC-32 (OAuth) ──> MAC-33

MAC-25 + MAC-28 ──> MAC-37 (Onboarding)
```

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| CTO cannot assign tasks | CRITICAL | MAC-48 escalated to CEO |
| Technical Product Lead overloaded | HIGH | Consider un-sunsetting Founding Engineer |
| QA Engineer underutilized early | MEDIUM | Assign test strategy planning |
| Design Lead blocked until features built | MEDIUM | Start with MAC-47 and MAC-34 planning |

## Capacity Planning

**Estimated total effort:** ~35-45 days of engineering work
**Available capacity (with TPL solo):** ~20 working days (4 weeks)
**Capacity gap:** 15-25 days

**Recommendation:** Keep Founding Engineer active to share workload with Technical Product Lead.

## Next Actions

1. **CEO:** Grant CTO `tasks:assign` permission (MAC-48)
2. **CEO:** Decide on Founding Engineer status (sunset vs. retain)
3. **CTO:** Assign Phase 1 tasks once permission granted
4. **Technical Product Lead:** Begin MAC-26 + MAC-27 immediately
5. **Design Lead:** Begin design review for MAC-47

## Open Questions

- Should Founding Engineer be retained given capacity constraints?
- What is the target launch date for Discovery Loop MVP?
- Are there PM-driven features not yet in backlog?
- Should we parallelize more work across the team?

---

**Blocker:** See [MAC-48](/issues/MAC-48) for critical permission issue.
**Last Updated:** 2026-03-07 by CTO
