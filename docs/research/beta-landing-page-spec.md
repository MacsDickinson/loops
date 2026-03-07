# Beta Landing Page Specification

**Version:** 1.0
**Last Updated:** 2026-03-07
**Owner:** PM
**Implementation:** Carrd, Notion, or Next.js page
**URL:** `beta.discovery-loop.com` or `/beta` route

---

## Page Overview

**Purpose:** Convert interested PMs to beta applicants

**Target Audience:**
- Product Managers at 50-500 person companies
- Using AI coding tools (Cursor, GitHub Copilot, etc.)
- Experiencing rework due to unclear specs

**Key Metrics:**
- Click-through rate from outreach → landing page
- Application submission rate
- Time on page

**Single CTA:** Apply for beta access (links to Typeform)

---

## Page Structure

### Hero Section

**Headline:**
> Stop rewriting AI-generated code. Start with better specs.

**Subheadline:**
> Discovery Loop Coach helps product managers create precise, testable specifications for AI coding tools—reducing rework by 30%.

**CTA Button:**
> **Apply for Beta Access** (Primary, prominent)

**Supporting Text:**
> Limited to 20 product managers. Free for 3 months. Beta launches Week 9 (2026-03-XX).

**Visual (optional):**
- Screenshot of chat interface with AI persona dialogue
- OR simple illustration of "unclear spec → rework" vs "clear spec → shipped"

---

### Problem Section

**Headline:**
> You know this pain:

**Pain Points (3 columns, icon + text):**

1. **Ambiguous Requirements**
   - Icon: ❓
   - You say "user-friendly dashboard"
   - AI builds something totally different
   - You spend hours clarifying and rewriting

2. **Missing Edge Cases**
   - Icon: 🐛
   - AI doesn't ask about error states
   - Production bugs after launch
   - Costly fixes and technical debt

3. **Spec-Code Mismatch**
   - Icon: 🔄
   - Specs get outdated quickly
   - Engineering builds to old specs
   - Endless rework cycles

---

### Solution Section

**Headline:**
> Discovery Loop Coach turns fuzzy ideas into precise, testable specs

**How It Works (3 steps, numbered):**

1. **Tell the AI what you want**
   - Describe your feature in plain English
   - No templates or rigid formats
   - Just conversation with our AI coach

2. **Get clarifying questions**
   - AI personas (Security, UX, Engineering) ask smart questions
   - Uncover edge cases you'd miss
   - Refine requirements in real-time

3. **Export precise specs**
   - BDD acceptance tests (Given-When-Then)
   - Clear requirements with edge cases covered
   - Copy-paste into GitHub, Linear, or AI coding tools

**CTA Button (repeated):**
> **Apply for Beta Access**

---

### Features Section (Optional)

**Headline:**
> What's included in beta:

**Feature List (checkmarks):**

✅ AI-guided discovery dialogue with 5+ personas (Product, Security, UX, Engineering, Data)
✅ Automatic BDD scenario generation
✅ Markdown export (copy-paste to GitHub, Linear, Notion)
✅ Spec version history and revision tracking
✅ Mobile-friendly interface
✅ Priority support via Slack

**Beta Pricing:**
- Free for 3 months (normally $29/month)
- Weekly feedback surveys (5 min)
- Help shape the product roadmap

---

### Social Proof (Optional, if available)

**Headline:**
> Trusted by product teams at:

**Logos/Names:**
- [Company 1]
- [Company 2]
- [Company 3]

**OR Early Testimonial Placeholder:**

> "Discovery Loop Coach helped me catch 3 edge cases I would've missed. Saved hours of rework."
> — *Beta Tester, Stealth Startup*

*(Note: Add real testimonials from first 5 beta users after Week 1)*

---

### Beta Timeline Section

**Headline:**
> Beta Timeline:

**Timeline (horizontal or vertical):**

📅 **Now → Week 8:** Applications open (rolling acceptance)
📅 **Week 9:** Beta launch (20 confirmed users)
📅 **Week 9-12:** 3-month beta period
📅 **Week 12:** Public launch

**Note:**
> Spots are limited to 20 product managers. Apply early for priority review.

---

### FAQ Section (Collapsible)

**Who should apply?**
> Product managers or founders at 50-500 person companies who use AI coding tools like Cursor, GitHub Copilot, or Lovable.

**What's the time commitment?**
> ~2 hours/week: Create 2-3 specs + weekly 5-min feedback survey.

**Is it really free?**
> Yes! Beta users get 3 months free (normally $29/month). After beta, you can choose to subscribe or cancel.

**What happens to my data?**
> Your specs and feedback are private. We don't share data with third parties. See our [Privacy Policy](#).

**Can I invite teammates?**
> Not during beta (limited to 20 users). After public launch, team plans will be available.

**What if I'm not accepted?**
> We'll add you to our waitlist and notify you when we launch publicly (Week 12).

**When does beta start?**
> Week 9 (target date: 2026-03-XX). Accepted users will receive login credentials 48 hours before launch.

**What tools integrate with Discovery Loop Coach?**
> Beta v1.0 exports Markdown (copy-paste to GitHub, Linear, Notion, Jira). Direct API integrations planned for v1.1.

---

### CTA Footer

**Headline:**
> Ready to reduce rework?

**CTA Button (large, centered):**
> **Apply for Beta Access**

**Subtext:**
> Takes 5 minutes. No payment info required.

**Additional Links:**
- Questions? Email: beta@discovery-loop.com
- Follow updates: [Twitter](#) | [LinkedIn](#)

---

## Design Guidelines

### Color Palette
- Primary: Brand color (TBD, suggest blue/purple for trust + innovation)
- Background: Light mode by default (white/off-white)
- Accents: Warm color for CTA (orange/green for "apply now")

### Typography
- Headline: Bold, large (48px+)
- Subheadline: Medium weight (20-24px)
- Body: 16-18px, readable line height (1.6)
- CTA Button: High contrast, clear text (18px+)

### Layout
- Single column, mobile-first
- Max content width: 800px (centered)
- Generous whitespace between sections
- Sticky CTA button on mobile (optional)

### Tone of Voice
- Direct and practical (not salesy or hype-driven)
- Empathetic to PM pain points
- Confident but humble ("We're building this with you")

---

## Implementation Options

### Option 1: Carrd (Fastest)
**Pros:**
- Free tier available
- No code required
- Custom domain supported
- Mobile-responsive by default

**Cons:**
- Limited customization
- No analytics without paid plan

**Setup:**
1. Create account at carrd.co
2. Use "Landing Page" template
3. Add 5 sections (Hero, Problem, Solution, FAQ, CTA)
4. Link CTA button to Typeform
5. Publish to custom domain

**Timeline:** 2-3 hours

---

### Option 2: Notion (Easiest)
**Pros:**
- Zero code
- Easy to update content
- Shareable link

**Cons:**
- Not as polished as Carrd
- No custom domain on free tier
- Slower page load

**Setup:**
1. Create Notion page
2. Add sections with headings, text, buttons
3. Link button to Typeform
4. Share publicly
5. Use short link (e.g., bit.ly/loops-beta)

**Timeline:** 1-2 hours

---

### Option 3: Next.js Page (Most Control)
**Pros:**
- Full customization
- Matches brand design system
- Fast page load (SSG)
- Analytics built-in

**Cons:**
- Requires development time
- Slower to iterate

**Setup:**
1. Create `/app/beta/page.tsx` route
2. Use shadcn/ui components
3. Implement sections with Tailwind
4. Link CTA to Typeform
5. Deploy to Vercel

**Timeline:** 4-6 hours

---

## Recommended Approach

**For MVP (Week 2):**
Use **Carrd** or **Notion** for speed

**For polish (Week 4+):**
Migrate to Next.js page if beta gains traction

---

## Content Checklist

Before publishing:

- [ ] Headline clearly states value prop
- [ ] Pain points resonate with ICP
- [ ] Solution is easy to understand (no jargon)
- [ ] CTA is prominent and repeated 2-3 times
- [ ] Beta timeline and expectations are clear
- [ ] FAQ addresses common objections
- [ ] Mobile layout is readable
- [ ] Typeform link is working
- [ ] Contact email is monitored

---

## Analytics & Tracking

**Key Metrics:**

- **Traffic sources:** LinkedIn, Twitter, community posts, blog
- **Conversion rate:** Visitors → Form submissions
- **Bounce rate:** <60% (if higher, revise copy)
- **Time on page:** 2-3 minutes (indicates engagement)

**Tools:**

- Google Analytics (free)
- Plausible (privacy-friendly, paid)
- Carrd built-in analytics (paid tier)

**UTM Parameters:**

Use for tracking outreach sources:
- `?utm_source=linkedin&utm_medium=dm&utm_campaign=beta-week2`
- `?utm_source=twitter&utm_medium=organic&utm_campaign=beta-launch`
- `?utm_source=reddit&utm_medium=community&utm_campaign=beta-pm-subreddit`

---

## Next Steps

**Week 2:**
- [ ] Choose implementation option (Carrd recommended)
- [ ] Draft content (use this spec as outline)
- [ ] Design landing page (or delegate to Design Lead)
- [ ] Set up custom domain: `beta.discovery-loop.com`
- [ ] Connect Typeform CTA button
- [ ] Test on mobile and desktop

**Week 3:**
- [ ] Launch landing page
- [ ] Share link in first outreach messages
- [ ] Track conversion rate
- [ ] Iterate on copy based on early feedback

---

**Related:**
- [MAC-67](/issues/MAC-67) - Beta launch product validation
- [Beta Application Form](/projects/loops/docs/research/beta-application-form.md)
- [Beta Recruitment Plan](/projects/loops/docs/research/beta-recruitment-plan.md)

**Version History:**
- v1.0 (2026-03-07): Initial landing page spec for beta recruitment
