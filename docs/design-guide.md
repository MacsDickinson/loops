# Loops Design Guide

**Version:** 1.0
**Date:** March 7, 2026
**Author:** Design Lead
**Status:** Active

---

## 1. Design Philosophy

### Core Principles

Loops exists to improve how people build software. Every design decision should reflect this mission: **clarity over cleverness, guidance over gatekeeping, and precision without rigidity.**

**1. Conversation is the interface.**
The Discovery Loop Coach is a dialogue, not a form. The primary interaction pattern is structured conversation between a PM and an AI coach. Design should feel like a skilled collaborator sitting beside you, not a tool you operate.

**2. Progressive disclosure of complexity.**
A PM should be able to start a discovery session in under 30 seconds. Advanced features (persona switching, export options, spec formatting) should emerge naturally as the conversation deepens, not compete for attention at the start.

**3. The spec is the artefact.**
The conversation produces a living specification. The spec preview should always be visible and updating in real time as dialogue progresses. Users should feel the specification growing alongside their understanding.

**4. Trust through transparency.**
When AI generates acceptance tests or surfaces edge cases, users need to understand why. Show the connection between dialogue and output. Never hide how the spec was constructed.

**5. Reduce to essentials.**
Every screen element should earn its place. If removing something doesn't hurt comprehension or usability, remove it. The product differentiates on the quality of the AI dialogue, not visual decoration.

### Design Values (Mapped to Product)

| Value | Meaning in Loops | Anti-pattern |
|-------|-------------------|--------------|
| **Clarity** | Specs are precise, UI is unambiguous | Vague labels, hidden states, ambiguous icons |
| **Flow** | Dialogue feels natural, uninterrupted | Modal interruptions, context switching, loading walls |
| **Confidence** | Users trust the output is correct and complete | AI outputs without traceability, unexplained changes |
| **Craft** | Attention to detail signals quality | Generic layouts, misaligned elements, inconsistent spacing |

---

## 2. Brand Identity

### Brand Positioning

Loops is a professional tool for product and engineering teams. The brand should communicate:
- **Competence** -- this tool understands software delivery
- **Calm authority** -- not flashy or startup-trendy; trustworthy
- **Modern craft** -- clean, considered, intentional

The visual language should feel closer to Linear, Vercel, or Raycast than to Notion, Miro, or Jira. Opinionated minimalism. Tools for professionals.

### Product Name Hierarchy

- **Loops** -- the platform / framework brand
- **Discovery Loop Coach** -- the first product (can be shortened to "Discovery Coach" in UI)
- Future products: Build Loop, Operationalise Loop, Grow Loop

In the UI, use "Loops" as the top-level brand in navigation. The specific loop product appears in context (e.g., "Discovery" as a section name).

### Logo Usage

The logo should work at small sizes (favicon, mobile header) and large sizes (landing page). Guidelines:
- Minimum clear space: 1x the logo height on all sides
- Minimum size: 24px height for digital use
- Never stretch, rotate, or recolor outside approved palette
- Use the wordmark for primary contexts, icon-only for compact spaces

*Note: Logo design is pending. Current placeholder is the text "Discovery Loop Coach" in Geist Sans semibold.*

---

## 3. Typography

### Typeface System

**Primary: Geist Sans** (already configured as `--font-geist-sans`)
- Used for: all UI text, headings, body copy, buttons, labels
- Chosen because: clean geometric sans-serif with excellent readability at all sizes, designed for interfaces, used by the Vercel ecosystem

**Monospace: Geist Mono** (already configured as `--font-geist-mono`)
- Used for: code blocks, Gherkin scenarios, technical identifiers, acceptance test output
- Critical for: BDD test display, spec export preview, inline code references

### Type Scale

Use a constrained type scale. Avoid arbitrary font sizes.

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 48px (3rem) | 700 | 1.1 | Landing page hero only |
| `h1` | 30px (1.875rem) | 700 | 1.2 | Page titles |
| `h2` | 24px (1.5rem) | 600 | 1.3 | Section headings |
| `h3` | 20px (1.25rem) | 600 | 1.4 | Card titles, subsections |
| `h4` | 16px (1rem) | 600 | 1.5 | Labels, group headers |
| `body` | 14px (0.875rem) | 400 | 1.5 | Default body text, UI labels |
| `body-lg` | 16px (1rem) | 400 | 1.6 | Landing page body, dialogue messages |
| `small` | 13px (0.8125rem) | 400 | 1.5 | Secondary text, timestamps, metadata |
| `caption` | 12px (0.75rem) | 500 | 1.4 | Badges, chips, counters |
| `code` | 13px (0.8125rem) | 400 | 1.6 | Code, Gherkin syntax (Geist Mono) |

### Typography Rules

- **Never use more than 3 font weights** on a single screen (400, 500, 600 or 700).
- **Maximum line length**: 65-75 characters for body text. Wider lines reduce readability.
- **Heading hierarchy**: Skip no more than one level (h1 > h3 is fine for visual rhythm; h1 > h5 is not).
- **All-caps**: Use sparingly. Acceptable for labels and status badges. Never for body text or headings.

---

## 4. Colour System

### Current Palette

The existing oklch-based token system in `globals.css` is well-structured. It uses a monochrome (zero-chroma) base with blue-toned chart colours. Build on this foundation.

### Semantic Colour Tokens

Maintain the existing CSS custom property architecture. All colours reference design tokens, never raw values.

#### Neutrals (existing, well-defined)
The zinc-based neutral scale is appropriate for a professional tool. Keep it.

#### Brand Accent (recommendation: introduce one)

The current palette is entirely achromatic. For a product centred on feedback loops and iterative refinement, consider a single accent colour for:
- Primary CTAs ("Start Session", "Export Spec")
- Active states (selected persona, current dialogue turn)
- Progress indicators
- Brand identity moments

**Recommended accent**: A calm, confident blue-violet or indigo in the oklch space.

```css
/* Proposed brand accent -- adjust based on brand exploration */
--accent-brand: oklch(0.55 0.18 265);          /* Primary accent */
--accent-brand-hover: oklch(0.50 0.20 265);    /* Hover state */
--accent-brand-subtle: oklch(0.55 0.18 265 / 10%); /* Background tint */
```

**Why blue-violet:**
- Differentiates from the sea of blue SaaS products
- Connotes intelligence, precision, and creativity (attributes of the Discovery Loop)
- Works well against both light and dark backgrounds in oklch
- Sits in the same hue range as the existing chart tokens (251-265)

**Rules:**
- The accent should appear in no more than 2-3 places per screen
- Never use it for destructive actions (those use `--destructive`)
- The monochrome palette carries 90% of the interface; accent is punctuation

#### Persona Colours

Each AI persona needs a visual identifier. Use subtle colour coding:

| Persona | Colour | Token | Usage |
|---------|--------|-------|-------|
| Product Coach | Brand accent (indigo) | `--persona-product` | Default, primary persona |
| Security Expert | Amber/warm | `--persona-security` | `oklch(0.75 0.15 75)` |
| UX Analyst | Teal/cyan | `--persona-ux` | `oklch(0.70 0.15 195)` |
| Domain Expert | Green | `--persona-domain` | `oklch(0.70 0.15 150)` |

Apply persona colours to:
- Avatar ring / icon background
- Subtle left-border on their dialogue messages
- Persona toggle button active state

Do NOT use persona colours for:
- Large background fills
- Text colour (use standard foreground)
- Anything that carries semantic meaning beyond persona identity

#### Status Colours

| Status | Token | Usage |
|--------|-------|-------|
| Success | `oklch(0.65 0.18 145)` | Spec complete, test passing, export success |
| Warning | `oklch(0.75 0.15 75)` | Incomplete sections, edge cases surfaced |
| Error | `--destructive` (existing) | Failed export, session error |
| Info | Brand accent | New persona suggestion, tips |

### Contrast Requirements

- Text on background: minimum 4.5:1 (WCAG AA)
- Large text (18px+ or 14px bold): minimum 3:1
- UI components (borders, icons that convey meaning): minimum 3:1
- The oklch colour space makes contrast calculation straightforward -- lightness (L) is the primary lever

### Dark Mode

The existing dark mode tokens are well-structured. Guidelines:
- Dark mode is not just inverted colours. Reduce contrast slightly in dark mode (pure white text on pure black is harsh).
- Accent colours may need lightness adjustment in dark mode (+0.05 to +0.10 L value).
- Elevated surfaces should be slightly lighter than the background (`--card` is already doing this correctly).
- Borders should use transparency (`oklch(1 0 0 / 10%)`) rather than opaque greys in dark mode (already done).

---

## 5. Layout and Spacing

### Spacing Scale

Use a consistent 4px base unit. All spacing should be multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight inline gaps, icon-to-label |
| `space-2` | 8px | Default inline spacing, small gaps |
| `space-3` | 12px | Compact padding (badges, chips) |
| `space-4` | 16px | Standard padding (cards, inputs) |
| `space-6` | 24px | Section gaps within a page area |
| `space-8` | 32px | Major section separation |
| `space-12` | 48px | Page section breaks |
| `space-16` | 64px | Hero spacing, page-level breathing room |

### Page Layout

**Maximum content width:** 1280px (`max-w-7xl`) -- already used, maintain this.

**Page structure:**
```
┌──────────────────────────────────────────────┐
│  Header (fixed, 64px height)                  │
├──────────────────────────────────────────────┤
│  Content area (scrollable)                    │
│                                               │
│  ┌─────────────┬───────────────────────────┐ │
│  │ Sidebar     │ Main content              │ │
│  │ (280px,     │ (flex-1)                  │ │
│  │ collapsible)│                           │ │
│  │             │                           │ │
│  └─────────────┴───────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**For the Discovery Loop Coach (dialogue view):**
```
┌──────────────────────────────────────────────┐
│  Header (product name, user, session info)    │
├──────────────────────────────────────────────┤
│  ┌──────────────────┬───────────────────────┐│
│  │ Dialogue Panel   │ Spec Preview Panel    ││
│  │ (50-60%)         │ (40-50%)              ││
│  │                  │                       ││
│  │ [conversation    │ [live spec document   ││
│  │  messages here]  │  updating in real     ││
│  │                  │  time as dialogue     ││
│  │                  │  progresses]          ││
│  │                  │                       ││
│  ├──────────────────┤                       ││
│  │ Input area       │                       ││
│  │ [persona toggles]│                       ││
│  └──────────────────┴───────────────────────┘│
└──────────────────────────────────────────────┘
```

This split-panel layout is the signature view. The dialogue and spec preview should be visible simultaneously, reinforcing the principle that "the conversation IS the specification."

### Responsive Breakpoints

| Breakpoint | Width | Behaviour |
|------------|-------|-----------|
| Mobile | <640px | Single column, spec preview becomes a tab/drawer |
| Tablet | 640-1024px | Dialogue full-width, spec in slide-over panel |
| Desktop | 1024px+ | Side-by-side dialogue and spec preview |
| Wide | 1280px+ | Comfortable split with breathing room |

**Mobile is secondary.** The PRD notes 90%+ of spec work happens on desktop. Mobile should work but doesn't need to be optimised beyond usable.

### Border Radius

Use the existing `--radius` token system. Current base: `0.625rem` (10px).

| Element | Radius |
|---------|--------|
| Buttons, inputs | `--radius-lg` (10px) |
| Cards, panels | `--radius-xl` (14px) |
| Modals, dialogs | `--radius-xl` (14px) |
| Badges, chips | `--radius-sm` (6px) |
| Avatars | Full (`rounded-full`) |
| Page sections | `--radius-2xl` (18px) or none |

---

## 6. Component Guidelines

### Buttons

Already well-defined via shadcn/ui `buttonVariants`. Guidance on when to use each:

| Variant | When to use | Example |
|---------|-------------|---------|
| `default` (primary) | Primary action per screen. ONE per section. | "Start Session", "Export Spec" |
| `outline` | Secondary actions alongside a primary | "View Sessions", "Cancel" |
| `secondary` | Tertiary actions, less emphasis | "Copy to Clipboard" |
| `ghost` | Toolbar actions, navigation items | Persona toggles, settings |
| `destructive` | Irreversible actions (use sparingly) | "Delete Session" |
| `link` | Inline text links | "Learn more", "View docs" |

**Button copy guidelines:**
- Use verbs: "Start Session" not "New Session"
- Be specific: "Export as Markdown" not "Export"
- Keep short: 2-3 words maximum for primary CTAs

### Cards

Use the existing `Card` component for:
- Dashboard session summaries
- Spec overview tiles
- Feature highlights on marketing pages

**Do not use cards for:**
- Single items in a list (use list rows)
- Wrapping dialogue messages (they have their own pattern)

### Inputs and Forms

- Always show labels above inputs (never floating/placeholder-only labels)
- Use the `Textarea` component for multi-line input (dialogue input area)
- Error messages appear below the input, left-aligned, in `--destructive` colour
- Required fields: indicate with `*` next to label (not colour alone)

### Dialogue Messages

This is the most important UI component in the product. Each message needs:

```
┌──────────────────────────────────────────┐
│ [Avatar] Persona Name          Timestamp │
│                                          │
│ Message content here. Can contain        │
│ markdown, inline code, and structured    │
│ questions.                               │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Suggested requirement or test        │ │
│ │ (highlighted card within message)    │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Visual distinction between participants:**
- **User messages**: Right-aligned or subtle background (`--muted`), no avatar needed
- **AI Coach messages**: Left-aligned, persona avatar with colour ring, white/card background
- **System messages**: Centre-aligned, smaller text, `--muted-foreground` colour

**Streaming indicator**: When the AI is generating, show a subtle pulsing cursor or skeleton. Never a spinning loader -- it should feel like the coach is typing, not computing.

### Spec Preview Panel

The right-side spec preview should look like a document, not a code editor:

- Use clear section headings (h2/h3) for spec structure
- Requirements should be numbered
- Acceptance criteria displayed in Gherkin syntax using `Geist Mono`
- Highlight newly added content with a brief fade-in animation
- Include a "completeness" indicator showing which sections are filled

**Spec document structure:**
```
Title
Description
─────────────────────
User Stories
  [numbered list]
Business Rules
  [numbered list]
Edge Cases
  [numbered list]
Security Considerations
  [if security persona activated]
Acceptance Tests
  [Gherkin scenarios in monospace]
─────────────────────
Metadata (personas used, turns, time)
```

---

## 7. Key Interface Patterns

### 7.1 Session Start Flow

The zero-to-value path should be frictionless:

1. User clicks "Start Session" (or "New Discovery Session")
2. Clean input area appears with prompt: "Describe the feature you want to explore..."
3. Large textarea, no distractions, just the prompt and a submit button
4. After first message, the split-panel view appears with the dialogue on the left and an initially empty spec preview on the right
5. Persona toggles appear subtly below the input area after the first AI response

**Do not front-load options.** No persona selection before the conversation starts. No template selection. Start with the Product Coach by default.

### 7.2 Persona Switching

Personas are toggled, not selected from a menu. They participate in the ongoing dialogue.

**Pattern: Toggle bar below the dialogue input**
```
[Product Coach (on)] [Security] [UX] [Domain]
```

- Active persona shows filled state with persona colour
- Inactive shows ghost/outline state
- Toggling a persona adds a brief system message: "Security Expert has joined the conversation"
- Multiple personas can be active simultaneously
- The current "speaker" is indicated by the avatar on the latest message

### 7.3 Acceptance Test Display

Tests are the core deliverable. They must feel first-class, not secondary:

- Display in Gherkin syntax with syntax highlighting (Given = neutral, When = action-coloured, Then = assertion-coloured)
- Each test is linked to its originating requirement (click to scroll to the relevant dialogue turn)
- Tests can be expanded/collapsed
- Show a count: "12 acceptance tests generated" in the spec header
- Export includes raw Gherkin that can be dropped directly into a test file

### 7.4 Export Flow

Export should be quick and contextual:

1. User clicks "Export" in the spec preview header
2. Dropdown shows options:
   - Copy as Markdown (instant, clipboard)
   - Download as .md file
   - Push to GitHub (if connected) -- opens repo/branch selector
   - Create Linear issue (if connected)
   - Create Jira issue (if connected)
3. Confirmation toast: "Spec exported to GitHub PR #42" with link

**Do not use a modal for export.** A dropdown or slide-over is faster.

### 7.5 Dashboard

The dashboard is the home screen after login. It should answer one question: **"What should I work on?"**

```
┌──────────────────────────────────────────────┐
│  Welcome back, [Name].                        │
│                                               │
│  [+ New Discovery Session] (primary CTA)      │
│                                               │
│  Recent Sessions                              │
│  ┌────────────────────────────────────┐       │
│  │ SSO Login Feature    Draft  3h ago │       │
│  │ 8 turns, 12 tests    ──────────── │       │
│  ├────────────────────────────────────┤       │
│  │ Payment Flow v2    Complete  1d ago│       │
│  │ 15 turns, 23 tests   ──────────── │       │
│  └────────────────────────────────────┘       │
│                                               │
│  Quick Stats                                  │
│  Specs created: 12  |  Tests generated: 187   │
│  Avg. completion: 11 min                      │
└──────────────────────────────────────────────┘
```

---

## 8. Accessibility Standards

### WCAG Compliance Target: AA

This is non-negotiable. The product must meet WCAG 2.2 Level AA.

### Specific Requirements

**Keyboard Navigation:**
- All interactive elements must be reachable via Tab
- Focus order follows visual layout (left-to-right, top-to-bottom)
- Visible focus indicators on all interactive elements (use `focus-visible:ring` -- already in component styles)
- Escape closes modals/dropdowns
- Enter submits forms, Ctrl+Enter submits dialogue input (common chat pattern)

**Screen Readers:**
- All images have descriptive `alt` text
- Form inputs have associated `<label>` elements
- Live regions (`aria-live`) for:
  - New AI dialogue messages ("polite")
  - Spec preview updates ("polite")
  - Error messages ("assertive")
  - Streaming text indicator ("polite", debounced)
- Persona toggle buttons use `aria-pressed`
- Dialogue messages use `role="log"` on the container

**Colour:**
- Never convey meaning through colour alone. Always pair with text, icon, or pattern.
- Persona colours are supplementary to persona name labels.
- Status indicators use icon + colour + text label.

**Motion:**
- Respect `prefers-reduced-motion`. All animations should have a reduced-motion alternative.
- No autoplay animations. No flashing content.
- Streaming text cursor is exempt (essential UI feedback) but should be simple, not elaborate.

**Touch Targets:**
- Minimum 44x44px for all interactive elements on touch devices
- Persona toggle buttons must meet this minimum

**Text:**
- Support browser zoom up to 200% without layout breaking
- No text smaller than 12px rendered on screen
- Never disable text selection

---

## 9. Motion and Animation

### Principles

Animation in Loops should feel **purposeful and quiet**. This is a professional tool, not a consumer app.

**Use animation for:**
- State transitions (panel open/close, tab switch)
- Content appearing (new dialogue messages fading in)
- Feedback (button press, successful export)
- Streaming text indicator

**Never use animation for:**
- Decoration or delight (no confetti, no bounces)
- Drawing attention to marketing content
- Loading states that block interaction

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro-interactions (hover, focus) | 100-150ms | `ease-out` |
| State transitions (toggle, collapse) | 200-250ms | `ease-in-out` |
| Content appearance (message, panel) | 250-350ms | `ease-out` |
| Page transitions | 300-400ms | `ease-in-out` |

### Specific Animations

**New dialogue message**: Fade in + subtle translate-up (8px). Duration: 300ms.

**Spec preview update**: New content highlights with a brief warm background flash (200ms), then settles to normal.

**Persona toggle**: Scale 0.95 on press, snap back on release. Duration: 150ms.

**Export success toast**: Slide in from top-right, auto-dismiss after 4 seconds. Slide out.

---

## 10. Responsive Design

### Mobile (< 640px)

- Single-column layout
- Dialogue view: full-width conversation with a bottom sheet or tab for spec preview
- Header collapses to icon + hamburger menu
- Input area fixed to bottom of viewport (like a chat app)
- Persona toggles become a horizontal scrollable row

### Tablet (640-1024px)

- Dialogue takes full width
- Spec preview available as a slide-over panel from right edge
- Toggle button to show/hide spec preview

### Desktop (1024px+)

- Side-by-side split panel (primary view)
- Resizable divider between dialogue and spec preview
- Keyboard shortcuts for common actions (Cmd+Enter to send, Cmd+E to export)

---

## 11. Writing Guidelines (UX Copy)

### Voice

Loops speaks like a **knowledgeable colleague**: direct, helpful, and confident without being condescending.

### Principles

- **Be specific.** "Spec exported to GitHub" not "Operation successful."
- **Use the product's language.** "Discovery session" not "chat session." "Acceptance test" not "test case." Match the ubiquitous language from DDD.
- **Write for scanning.** Bold the key word. Use bullets for options. Keep paragraphs to 1-2 sentences.
- **Guide, don't lecture.** "Try activating the Security persona to review authentication concerns" not "You should consider security implications."

### Specific Copy Patterns

**Empty states**: Always include a CTA. "No sessions yet. Start your first discovery session to turn an idea into a precise specification."

**Error messages**: Say what happened, then what to do. "Couldn't connect to GitHub. Check your authorisation in Settings."

**Confirmation**: Be specific about what happened. "12 acceptance tests exported as Gherkin to `specs/login-feature.md`."

**AI dialogue prompts**: The initial placeholder should be inviting but concrete. "Describe the feature you want to explore. For example: 'A login flow with social auth and MFA support.'"

**Loading states**: Use contextual language. "Analysing your feature for edge cases..." not "Loading..." or "Please wait."

### Terminology (Ubiquitous Language)

| Use | Don't Use |
|-----|-----------|
| Discovery Session | Chat, Conversation |
| Specification (Spec) | Document, Requirements Doc |
| Acceptance Test | Test Case, Check |
| Dialogue Turn | Message, Chat Message |
| Persona | Agent, Bot, AI Character |
| Feature Description | Prompt, Input |
| Spec Preview | Output, Result |

---

## 12. Design System Component Library

### Current Components (shadcn/ui, base-nova style)

| Component | Status | Notes |
|-----------|--------|-------|
| Button | Installed | All variants defined, good shape |
| Card | Installed | Suitable for dashboard and content areas |
| Input | Installed | Standard text input |
| Textarea | Installed | For dialogue input area |

### Components to Add (in order of need)

**MVP Priority:**
1. **Avatar** -- for persona identity in dialogue
2. **Badge** -- for spec status, persona labels, test counts
3. **Dropdown Menu** -- for export options, settings
4. **Scroll Area** -- for dialogue panel with custom scrollbar
5. **Separator** -- for spec sections
6. **Skeleton** -- for streaming/loading states
7. **Toast** -- for export confirmation, error feedback
8. **Tooltip** -- for persona descriptions, icon explanations
9. **Tabs** -- for spec sections, mobile navigation
10. **Resizable** -- for split-panel layout

**Post-MVP:**
11. Dialog / Sheet -- for settings, GitHub connection
12. Command -- for keyboard shortcut palette
13. Select -- for repo/branch selection in export
14. Toggle -- for persona switching
15. Progress -- for spec completeness indicator

### Custom Components (not in shadcn/ui)

| Component | Description |
|-----------|-------------|
| `DialogueMessage` | Message bubble with avatar, persona identity, timestamp, and nested content |
| `SpecPreview` | Live-updating spec document panel with section anchoring |
| `PersonaBar` | Horizontal toggle bar for activating/deactivating personas |
| `GherkinBlock` | Syntax-highlighted BDD scenario display with copy button |
| `SessionCard` | Dashboard card showing session summary, status, stats |
| `CompletenessIndicator` | Visual progress showing which spec sections are populated |

---

## 13. Design Review Checklist

Use this checklist for every feature or screen before engineering handoff:

- [ ] **Visual hierarchy**: Is it clear what the primary action is?
- [ ] **Consistency**: Does it use existing components and patterns?
- [ ] **Responsiveness**: Does it work at mobile, tablet, and desktop widths?
- [ ] **Dark mode**: Have both themes been considered?
- [ ] **Accessibility**: Keyboard navigable? Contrast passing? Screen reader labels?
- [ ] **Empty states**: What does this screen look like with no data?
- [ ] **Error states**: What happens when something fails?
- [ ] **Loading states**: What shows while data is being fetched or AI is generating?
- [ ] **Copy**: Does the text follow our UX writing guidelines?
- [ ] **Motion**: Are animations purposeful and respecting reduced-motion preference?
- [ ] **Ubiquitous language**: Are we using the correct domain terms?

---

## 14. Current UI Review and Recommendations

### What's Working Well

1. **Geist typeface**: Excellent choice. Clean, modern, purpose-built for interfaces. Keep it.
2. **Monochrome palette**: The zinc-based neutral scale is professional and restrained. Good foundation.
3. **Dark mode tokens**: Well-structured oklch tokens with transparency-based borders in dark mode.
4. **shadcn/ui base-nova**: Accessible primitives from @base-ui/react with good default styling.
5. **Consistent spacing**: The existing pages use sensible padding and max-width constraints.

### Recommendations for Improvement

**1. Introduce brand accent colour.**
The current UI is entirely achromatic. The "Start Session" button, persona toggles, and spec completeness indicator all need visual differentiation. Add one accent colour (see Section 4).

**2. Refactor the landing page.**
The current hero is generic. Replace with copy that demonstrates the value proposition with a concrete example:
- Show a before/after: vague requirement on the left, precise spec with tests on the right
- The CTA "Get Started" should feel like the start of a discovery journey, not a sign-up wall

**3. Refactor the dashboard.**
The current dashboard has three cards with placeholder buttons ("Start Session", "View Sessions", "View Specs") and a profile section showing raw user data. Recommendations:
- Remove the profile section from the dashboard (move to a settings page)
- Make the session list the primary content
- The "New Discovery Session" button should be the most prominent element
- Show actual session data when it exists, useful empty states when it doesn't

**4. Extract repeated layout patterns.**
The header is duplicated between `page.tsx` and `dashboard/page.tsx`. Extract to a shared layout component.

**5. Use design tokens consistently.**
The existing pages mix direct Tailwind colour utilities (`bg-zinc-50`, `text-zinc-700`) with the design token system (`bg-background`, `text-foreground`). Standardise on tokens for consistency and theme switching.

**6. Add the split-panel dialogue view.**
This is the core product interface and doesn't exist yet. Prioritise building the conversation + spec preview side-by-side layout (see Section 5).

---

## 15. Implementation Notes for Engineers

### Tailwind CSS v4

- Use `@import` syntax (already configured correctly)
- Prefer design token classes (`bg-primary`, `text-muted-foreground`) over raw colour values (`bg-zinc-800`)
- The oklch colour space is natively supported -- no plugins needed

### Adding shadcn/ui Components

```bash
cd src/
npx shadcn@latest add [component-name]
```

Components are installed to `src/components/ui/` and are fully editable. Customise them to match this design guide.

### Dark Mode

Dark mode is toggled via the `.dark` class on `<html>`. Use the `@custom-variant dark` directive (already configured). Test every component in both modes.

### Responsive Utilities

Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`. The dialogue split-panel should use `lg:` as the breakpoint for side-by-side layout.

---

*This is a living document. Update it as the design system evolves. Every change should be committed alongside the code it affects.*
