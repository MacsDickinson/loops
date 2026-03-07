Loops**A lens for software delivery in the age of AI**  
_Macs Dickinson · February 2026 · Internal Discussion Draft_

---

> **The argument in 30 seconds**  
> Every improvement to software delivery in the last 25 years has been about making a feedback loop faster. AI doesn't change this principle — it accelerates it. When build becomes dramatically faster, the bottleneck moves to discovery (understanding what to build), operationalisation (making it production-grade), and growth (learning from what's live). Loops is a lens that reorganises delivery around four feedback loops — Discovery, Build, Operationalise, Grow — designed for teams working with AI but applicable to any team that thinks in feedback loops. It complements Agile, DevOps, Lean and XP rather than replacing them.

---

## Why now

Software delivery has always been about feedback loops. Agile shortened the loop between plan and release. DevOps shortened the loop between build and deploy. Lean shortened the loop between idea and validation. XP argued that if feedback is good, more feedback is better. These principles are sound and more relevant than ever. Loops builds on them, it doesn't replace them.  
What's changed is the landscape. AI-assisted development — from copilots to fully agentic coding — is compressing the build phase dramatically. Models are improving at an accelerating rate; tasks that required days of human effort a year ago are now completable by AI agents in hours. This isn't a plateau — the trajectory is steep and shows no sign of slowing.

![METR Time Horizons](./metr-time-horizons-feb-26.png)

> _source: [https://metr.org/time-horizons/](https://metr.org/time-horizons/)_

When build becomes significantly faster, three things happen:

1. **The cost of being wrong drops.** If build is cheap, exploring an idea that doesn't work out is no longer a significant loss. This changes the calculus on upfront analysis.
2. **The cost of being unclear stays the same.** AI agents are fast but literal. Ambiguous requirements don't produce wrong code slowly; they produce wrong code quickly. Clarity of intent becomes more important, not less.
3. **New bottlenecks emerge.** When build is no longer the constraint, time and attention create the most value in discovery, testing, operationalisation and learning.

The tools to address these bottlenecks now exist. AI doesn't just write code faster. It can engage in structured dialogue to refine requirements, generate test specifications, identify gaps in acceptance criteria, surface production concerns, and review for compliance. The same technology that compressed build can tighten loops across the entire delivery process.

---

## The Loops model

Traditional delivery processes — whether waterfall, Scrum, or SAFe — tend to be structured as a linear sequence: Idea → Plan → Analyse → Build → Test → Deploy → Measure. Loops simplifies this into four interconnected feedback loops:

> PLACEHOLDER: Image show cycles between loops to be added here

Each loop feeds back into the others. Discovery informs Build. Build reveals gaps in Discovery. Operationalise surfaces concerns that feed back into both. Grow generates evidence that drives the next round of Discovery. The process is circular by design.

Not all work needs all four loops — some changes move through Build and Operationalise as a single pass. The model is flexible; what matters is the feedback, not the formality.

---

## The Discovery Loop

|                  |                                                          |
| ---------------- | -------------------------------------------------------- |
| **Purpose**      | Turn a rough idea into a precise, testable specification |
| **Key question** | _Do we understand what we're building and why?_          |

Discovery is where product intent becomes clear. A Product Manager describes what they want in natural language. Through structured dialogue — with AI and with domain experts — the idea is refined into a specification with clear acceptance criteria. The conversation is the analysis.

This is the most underserved part of the current process and where AI can add the most value outside of code generation. When an AI product coach asks "what happens if the email address isn't registered?" or a security persona asks "should we rate-limit this endpoint?", those questions force analytical rigour that previously required workshops, PRDs, and cross-functional meetings.

### How it works in practice

The PM starts a structured conversation with an AI coach, describing the feature in plain language. The AI asks clarifying questions, probing for edge cases, security concerns, user journeys and acceptance criteria. As the conversation progresses, a specification emerges: a natural language description of the requirements enriched with structured sections for user journeys, business rules, security requirements and production concerns. Alongside this, acceptance tests are generated automatically — each one tied back to a requirement.

> _prototype available at [https://discovery-loop.lovable.app/](https://discovery-loop.lovable.app/)_

The PM never needs to learn Gherkin syntax, but the engineering team gets precise, testable acceptance criteria. BDD becomes the contract language for human-AI collaboration. The spec and the tests emerge together, stay in sync, and are version-controlled alongside the code.

Multiple AI personas can participate in the dialogue. A security expert reviews for vulnerabilities and compliance. A UX persona probes for accessibility and edge cases. A domain expert validates business rules. The PM orchestrates, making decisions and providing context that the AI cannot.

### What's different from today

Most teams separate requirements gathering from specification from test design. These happen at different times, in different tools, by different people. Discovery collapses them into a single, fast loop. The output isn't a document that gets handed over and interpreted — it's a living specification: natural language requirements backed by structured acceptance tests that become the contract between the person designing the system and the person (or agent) building it.

> **Open question for the team:** Which teams or features would be the best candidates for a Discovery Loop trial? We want a willing PM-engineering pair working on something with enough complexity to be a real test, but not so critical that experimentation feels risky.

---

## The Build Loop

|                  |                                            |
| ---------------- | ------------------------------------------ |
| **Purpose**      | Turn a specification into working software |
| **Key question** | _Does this work as expected?_              |

An engineer — or increasingly, a PM working directly with an AI coding agent — takes the specification from Discovery and builds against it. The acceptance tests serve as the build target. The loop is tight: build, run the tests, see what's passing, iterate until green.

This is where agentic AI has the most immediate impact today. The specification provides the clarity that AI agents need to work effectively. The acceptance tests provide the feedback mechanism. The engineer's role evolves: more time on system design, architectural judgement, and quality assurance; less time on implementation mechanics. This isn't a diminished role — it's a more senior one, focused on the decisions that matter most.

### Engineering practices that thrive here

Three established practices map particularly well to AI-assisted build. BDD provides the acceptance tests from Discovery as unambiguous build targets. XP's emphasis on simplicity, continuous feedback and small iterations translates directly to working with AI agents. Domain-Driven Design becomes more important when AI writes the code: thinking at a systems level — bounded contexts, ubiquitous language, clean domain boundaries — ensures the output is architecturally sound.

### Coordination

The Build Loop is where coordination between teams and agents matters most. The current ceremony layer — sprint planning, standup, backlog grooming — exists largely to manage the complexity of human-driven build. As PMs and engineers get closer through Discovery and AI agents handle more implementation, much of this ceremony becomes overhead. The hypothesis is that simpler coordination tooling, integrated with where the work actually happens (the repo, not a separate project management tool), can replace much of it.

This doesn't mean coordination disappears. Dependencies still need managing. But they should be minimised through organisational design — clear bounded contexts, self-service platforms, autonomous teams. Loops doesn't solve the organisational design problem, but it does reduce the need for process to compensate for poor organisational design.

> **Open question for the team:** How does the Discovery Loop interact with our current agile ceremonies? Does it replace refinement? Complement it? What should we stop doing if we start doing this?

---

## The Operationalise Loop

|                  |                                                   |
| ---------------- | ------------------------------------------------- |
| **Purpose**      | Graduate validated software to production quality |
| **Key question** | _Can this scale, be maintained, and be trusted?_  |

Not everything that passes its acceptance tests is production-ready. A prototype built to answer "does this solve the user's problem?" has a different quality bar from a system built to handle real traffic, meet SLAs, and satisfy compliance requirements.

The decision to operationalise happens before this loop begins — it's a gate at the end of Build. Once the decision is made to take something forward, the specification from Discovery is enriched with production concerns: performance, observability, security hardening, error handling, accessibility, compliance. A second tier of acceptance tests — production-tier tests — captures these requirements. The AI agent builds them out, graduating the prototype systematically.  
Not all changes need this separation. For routine work, Build and Operationalise may be a single pass. The model is flexible. What matters is having an explicit quality bar for production-readiness rather than leaving it implicit.

### Continuous compliance

In regulated environments, compliance is often treated as an annual audit — a painful retrospective exercise of documenting what was missed. This parallels how deployment used to work before DevOps: big releases, long regression cycles, manual confidence checks. DevOps solved this by automating the confidence check and deploying smaller, less risky changes more often.

The same approach can apply to compliance. Focused AI agents — reviewing for GDPR, PSD2, ISO 27001, SOC 2 — can participate in the Operationalise Loop (and the discovery loop), checking changes continuously rather than annually. The spec-driven approach makes process and decision-making auditable by design. Every requirement has a trace from Discovery through Build to production. This doesn't replace the audit, but it turns it from an archaeological exercise into a report.

> **Open question for the team:** What's the right set of production-tier criteria for our context? Security, compliance, performance, observability — what does "production-ready" mean for us specifically?

---

## The Grow Loop

|                  |                                                            |
| ---------------- | ---------------------------------------------------------- |
| **Purpose**      | Measure, learn, and feed evidence back into the next cycle |
| **Key question** | _What should we improve, change, or try next?_             |

Software in production generates data: usage patterns, error rates, performance metrics, user feedback, support tickets. The Grow Loop turns that data into actionable insight that feeds back into Discovery. AI can help — summarising usage data, identifying patterns, correlating feedback with features, surfacing opportunities.

This closes the circle. Discovery → Build → Operationalise → Grow → Discovery. Each pass produces a more refined, more validated, more production-ready product.

---

## Product lifecycle

As the cost of building drops, the risk shifts from "can we build it?" to "should we keep investing in it?" A cheap prototype can create stakeholder expectations that are expensive to manage. Loops addresses this by articulating a product lifecycle that sets expectations at each stage:

|                |                                                                                       |
| -------------- | ------------------------------------------------------------------------------------- |
| Stage          | Description                                                                           |
| **Idea**       | A hypothesis worth exploring. No commitment beyond investigation.                     |
| **Pilot**      | A working proof of concept. Built to learn, not to ship. May be discarded.            |
| **Incubating** | Validated with real users but not production-grade. Known limitations.                |
| **Graduating** | Actively being operationalised. Moving toward production quality.                     |
| **Growth**     | Production-ready, actively maintained and measured. Investment justified by evidence. |
| **Sunset**     | Declining value. Planned for deprecation or replacement.                              |

This lifecycle should be visible to stakeholders. When a PM demos a prototype, everyone should understand it's a prototype. When something graduates to Growth, the investment decision is backed by evidence from Grow. This doesn't need to be another loop — it's the context in which the loops operate.

---

## What this is and isn't

**This is** a lens for organising software delivery around feedback loops, designed for teams working with AI. It complements Agile, Lean, DevOps and XP rather than replacing them. It's applicable to conventional teams (the loops are just longer) as well as AI-augmented teams. It starts with the Discovery Loop because that's where the most underserved opportunity is.  
**This isn't** a replacement for Agile values or principles. It isn't only applicable to AI-native teams. It isn't a finished framework — it's a working hypothesis that needs to be tested with real teams. And while it may be supported by tooling, it's a way of thinking first.

---

## Where we start

The proposal is to test the Loops approach, beginning with the Discovery Loop:

### Immediate

1. Trial the Discovery Loop on one or two real features with a willing PM-engineering pair.
2. Use AI-assisted dialogue to refine requirements into specifications with acceptance tests.
3. Store specifications in the repo alongside code. Test whether this reduces the need for separate Jira/Confluence documentation.
4. Measure: is the output clearer? Are fewer things missed? Does build go faster when the spec is better?

### Next

1. Refine the approach based on what we learn.
2. Extend to the Build Loop — integrate the specifications with our AI coding workflows.
3. Define the Operationalise Loop criteria, including continuous compliance checks.

_This is a proposal for discussion, not a finished plan. The best way to test whether Loops works is to try it on something real and see what we learn._
