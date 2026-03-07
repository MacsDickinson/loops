# Development Guide

Standards and practices for contributing to Loops. Based on company-wide [engineering standards](/docs/engineering-standards.md).

---

## Behavior-Driven Development (BDD)

BDD is central to both the product (Discovery Loop generates BDD specs) and how we build it.

### Three Amigos

Before starting any feature, align across three perspectives:
- **Product/PM**: Business value and acceptance criteria
- **Engineering**: Technical considerations and edge cases
- **QA/Testing**: Boundary conditions and failure scenarios

### Gherkin Scenarios

Express requirements as Given-When-Then examples:

```gherkin
Feature: Discovery dialogue
  As a Product Manager
  I want to receive AI-guided clarifying questions
  So that my feature spec covers edge cases

Scenario: Security persona surfaces auth concerns
  Given a PM is describing an SSO login feature
  When the security persona is activated
  Then the AI asks about session timeout policy
  And the AI asks about MFA requirements
```

### Outside-In Development

1. Write failing acceptance test (user-facing behavior)
2. Write failing unit tests (internal design)
3. Implement to make tests pass
4. Refactor with confidence

---

## Domain-Driven Design (DDD)

### Ubiquitous Language

Use consistent domain terms in code, tests, docs, and conversation:
- `Specification`, `AcceptanceCriteria`, `DiscoverySession`, `Persona`, `DialogueTurn`
- Avoid generic names like `Data`, `Item`, `Process`, `Thing`

### Bounded Contexts

Each context has its own models, terminology, and schema:

| Context | Responsibility |
|---------|---------------|
| **Discovery** | AI dialogue, personas, spec generation |
| **User Management** | Auth, profiles, subscriptions |
| **Integrations** | GitHub, Linear, Jira export |
| **Analytics** | Usage patterns, engagement metrics |

### Layered Architecture

```
Presentation (API routes, UI)      Dependencies flow inward.
Application (Use cases)            Domain has no external dependencies.
Domain (Entities, value objects)
Infrastructure (DB, external APIs)
```

- No business logic in presentation or infrastructure layers
- Domain layer defines interfaces; infrastructure implements them
- Aggregates enforce invariants and are the unit of persistence

---

## Code Standards

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Example:
```
feat(discovery): add multi-persona dialogue switching

Allow users to toggle security and UX personas mid-conversation.
Persona state persists across dialogue turns.

Closes MAC-15
```

### Branch Strategy

Trunk-based development:
- `main` is always deployable
- Feature branches are short-lived (< 3 days)
- Merge to main frequently

### Testing

| Layer | Coverage Target | Test Type |
|-------|----------------|-----------|
| Domain logic | 90%+ | Unit tests |
| Application logic | 80%+ | Unit tests |
| Infrastructure | Critical paths | Integration tests |
| User journeys | Smoke tests | End-to-end |

Test naming:
```typescript
describe('DiscoverySession', () => {
  describe('addDialogueTurn', () => {
    it('should add turn when session is active', () => {});
    it('should throw when session is completed', () => {});
  });
});
```

### Code Review

Required for all production code, infra changes, and schema migrations. Reviews completed within 24 hours.

Checklist:
- Tests pass and cover new code
- Code uses ubiquitous language
- No business logic in presentation/infrastructure layers
- Edge cases handled

---

## Architecture Decision Records

Record significant technical decisions in `docs/adr/`:

```markdown
# ADR-001: Use Vercel AI SDK over LangChain

## Context
Need AI orchestration for multi-turn dialogue with Claude.

## Decision
Use Vercel AI SDK — native TypeScript, streaming support, Zod schemas.

## Consequences
+ Single language stack, simpler architecture
+ Built-in React hooks (useChat)
- Less mature than LangChain for complex agent patterns
```

---

## Deployment

| Environment | Trigger | URL |
|-------------|---------|-----|
| Development | Local | `localhost:3000` |
| Preview | Per PR | `*.vercel.app` |
| Production | Merge to `main` | TBD |

### Performance Targets

- First Contentful Paint: < 1.5s
- API response (p95): < 500ms
- AI first token: < 500ms (streaming)
- Database queries: < 100ms
