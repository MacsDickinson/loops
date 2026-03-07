# Beta Application Form Specification

**Version:** 1.0
**Last Updated:** 2026-03-07
**Owner:** PM
**Implementation:** Typeform (recommended) or Google Forms
**Target:** Screen 50-100 applicants to 20 qualified beta users

---

## Form Overview

**Purpose:** Qualify beta applicants based on ICP fit, pain point alignment, and commitment level

**Flow:** Multi-step form (5 sections, ~3-5 minutes to complete)

**Auto-scoring:** Each answer assigns points; top-scoring applicants get priority review

**Outcome:**
- **High score (15+ points):** Auto-accept
- **Medium score (10-14 points):** Manual review by PM
- **Low score (<10 points):** Waitlist with explanation

---

## Section 1: Role & Context (Screener)

**Purpose:** Verify ICP match and usage of AI coding tools

### Q1: What's your primary role?
**Type:** Single choice
**Required:** Yes

**Options:**
- Product Manager (3 points)
- Engineering Manager / Tech Lead (2 points)
- Founder / Solo Developer (2 points)
- Software Engineer (1 point)
- Designer (1 point)
- Other: _________ (0 points)

**Auto-reject:** "Other" unless manual review

---

### Q2: What's your company size?
**Type:** Single choice
**Required:** Yes

**Options:**
- 50-500 employees (3 points) ← **Primary ICP**
- 10-50 employees (2 points)
- 1-10 employees (2 points)
- 500+ employees (1 point)
- Just me (solo) (1 point)

---

### Q3: Which AI coding tools do you currently use?
**Type:** Multiple choice
**Required:** Yes
**Minimum selections:** 1

**Options:**
- Cursor (2 points)
- GitHub Copilot (2 points)
- Lovable (formerly GPT Engineer) (2 points)
- v0.dev (2 points)
- Replit AI (2 points)
- Claude Code / Aider / Windsurf (1 point)
- ChatGPT/Claude for coding (1 point)
- None (0 points) → **Auto-reject**

**Logic:** Sum points (max 4 points from this question)

---

## Section 2: Pain Point Validation

**Purpose:** Confirm they experience the problem we're solving

### Q4: How often do you experience rework because AI-generated code doesn't match your intent?
**Type:** Single choice
**Required:** Yes

**Options:**
- Multiple times per week (4 points)
- About once a week (3 points)
- A few times a month (2 points)
- Rarely (1 point)
- Never (0 points) → **Auto-reject**

---

### Q5: What's your biggest frustration when working with AI coding tools?
**Type:** Single choice
**Required:** Yes

**Options:**
- AI generates code that doesn't match my vision (3 points)
- Specs get outdated quickly, causing misalignment (3 points)
- Friction between what I want and what gets built (3 points)
- AI produces low-quality or buggy code (1 point)
- Difficulty explaining edge cases to AI (2 points)
- Other: _________ (1 point, manual review)

---

### Q6: How do you currently create specs for your development team or AI tools?
**Type:** Single choice
**Required:** No

**Options:**
- Written docs (Google Docs, Notion, etc.)
- Verbal communication / calls
- GitHub issues / Linear tickets
- Figma mockups + comments
- I don't create formal specs
- Other: _________

**Note:** This is diagnostic, not scored. Helps understand current workflow.

---

## Section 3: Commitment & Expectations

**Purpose:** Filter for engaged, committed beta testers

### Q7: Can you commit to 2 hours per week for beta testing (creating specs, providing feedback)?
**Type:** Single choice
**Required:** Yes

**Options:**
- Yes, I can commit (4 points)
- Maybe, depends on the week (1 point) → **Likely reject**
- No, I don't have the time (0 points) → **Auto-reject**

---

### Q8: Are you willing to provide weekly feedback during the beta (via 5-min survey)?
**Type:** Single choice
**Required:** Yes

**Options:**
- Yes, weekly feedback is fine (3 points)
- Bi-weekly would be better (2 points)
- Feedback only if I encounter bugs (0 points) → **Auto-reject**

---

### Q9: If Discovery Loop Coach delivers value, would you pay $29/month after the free beta period?
**Type:** Single choice
**Required:** Yes

**Options:**
- Yes, definitely (4 points)
- Probably, if it saves me time (3 points)
- Maybe, depends on features (1 point)
- No, I wouldn't pay (0 points) → **Likely reject**

**Note:** This gauges willingness to pay, a key PMF signal

---

## Section 4: Use Case & Goals

**Purpose:** Understand what they want to achieve (not scored, qualitative)

### Q10: What would you use Discovery Loop Coach for? (Check all that apply)
**Type:** Multiple choice
**Required:** No

**Options:**
- Creating specs for features before coding
- Clarifying requirements with AI-guided questions
- Generating BDD test scenarios
- Documenting edge cases and acceptance criteria
- Improving communication with engineering teams
- Reducing rework from unclear specs
- Other: _________

---

### Q11: Describe a recent project where unclear specs led to rework or delays.
**Type:** Long text (3-5 sentences)
**Required:** Yes

**Purpose:**
- Understand real-world pain points
- Identify power users with strong use cases
- Manual review: Does this align with our value prop?

**Placeholder:**
> "Example: We built a user dashboard, but the AI tool didn't understand our mobile-first requirement. We had to rewrite 30% of the components after launch."

---

## Section 5: Contact & Logistics

**Purpose:** Collect contact info and preferences

### Q12: What's your full name?
**Type:** Short text
**Required:** Yes

---

### Q13: What's your email address?
**Type:** Email
**Required:** Yes
**Validation:** Must be valid email format

---

### Q14: LinkedIn profile (optional, but helpful for verification)
**Type:** URL
**Required:** No

**Purpose:** Verify role, company, and credibility

---

### Q15: Preferred communication channel for beta updates?
**Type:** Single choice
**Required:** Yes

**Options:**
- Email
- Slack
- Discord
- Other: _________

---

### Q16: Anything else you'd like us to know?
**Type:** Long text
**Required:** No

**Purpose:** Capture edge cases, unique needs, or enthusiasm signals

**Placeholder:**
> "Optional: Share any specific needs, constraints, or ideas you have for Discovery Loop Coach."

---

## Scoring & Decision Logic

### Scoring Breakdown

| Section | Max Points |
|---------|-----------|
| Role & Context (Q1-Q3) | 10 points |
| Pain Point (Q4-Q5) | 7 points |
| Commitment (Q7-Q9) | 11 points |
| **Total Possible** | **28 points** |

### Decision Thresholds

**Auto-Accept (18+ points):**
- Strong ICP fit
- High pain point alignment
- Committed and willing to pay
- Send acceptance email within 24 hours

**Manual Review (12-17 points):**
- PM reviews Q11 (use case description)
- Check LinkedIn profile for credibility
- Look for unique insights or strong enthusiasm
- Accept top 10-15 from this tier

**Waitlist (8-11 points):**
- Decent fit but not enough capacity
- Send polite rejection with waitlist invite
- May be accepted if we expand beta to 30 users

**Auto-Reject (<8 points):**
- Not using AI tools
- No time commitment
- Rarely experiences rework
- Send rejection email with option to follow launch

---

## Auto-Reject Criteria (Immediate Disqualification)

1. **Not using AI coding tools** (Q3: None)
2. **Never experiences rework** (Q4: Never)
3. **No time commitment** (Q7: No)
4. **No feedback willingness** (Q8: Only if bugs)

**Rejection Email Template:**

```
Subject: Discovery Loop Coach Beta – Waitlist

Hi [Name],

Thanks for your interest in Discovery Loop Coach beta!

We received a strong pool of applicants and are prioritizing users who:
- Actively use AI coding tools like Cursor or GitHub Copilot
- Experience frequent rework from unclear specs
- Can commit to weekly feedback during beta

Unfortunately, we don't have capacity to include everyone in this round.

**Want to stay updated?**
Join our waitlist: [link]
Follow launch announcements: [Twitter/LinkedIn]

We'll notify you when we open to the public in [Month].

Best,
[PM Name]
Discovery Loop Coach Team
```

---

## Acceptance Email Template

**Subject:** Welcome to Discovery Loop Coach Beta! 🎉

**Body:**

```
Hi [Name],

Congrats! You're one of 20 beta users for Discovery Loop Coach.

**What You Get:**
- Free access through [Beta End Date] (3 months)
- Priority support via [Slack/Discord]
- Shape the product with your feedback

**What We Need From You:**
- Create 2-3 specs over the next 3 weeks
- Weekly 5-minute feedback survey
- Optional: 30-min interview at end of beta

**Next Steps:**
1. Check your email for login credentials (arriving within 48 hours)
2. Watch the 2-min onboarding video: [Loom link]
3. Join our beta Slack channel: [Invite link]

**Beta Launch:** Week 9 ([Specific Date])

We'll send a kickoff email with detailed instructions before launch.

Questions? Reply to this email.

Looking forward to building with you!

[PM Name]
Discovery Loop Coach Team
```

---

## Implementation Notes

### Typeform (Recommended)

**Pros:**
- Logic jumps (skip auto-reject questions)
- Scoring built-in
- Beautiful UX, high completion rate
- Email notifications for high-score applicants

**Cons:**
- Paid plan needed for logic ($29/month)

**Setup:**
1. Create form with 16 questions (5 sections)
2. Add logic jumps for auto-reject paths
3. Set up hidden field for score calculation
4. Connect to Zapier for email automation
5. Embed on landing page or share direct link

### Google Forms (Free Alternative)

**Pros:**
- Free, unlimited responses
- Syncs to Google Sheets for manual scoring

**Cons:**
- No conditional logic
- Manual scoring required
- Less polished UX

**Setup:**
1. Create form with 16 questions
2. Export responses to Sheets
3. Add scoring formula in Sheets
4. Manually send acceptance/rejection emails

---

## Testing Checklist

Before launching:

- [ ] Test form on mobile and desktop
- [ ] Verify auto-reject logic works correctly
- [ ] Check email automation (acceptance/rejection)
- [ ] Preview form completion time (should be <5 min)
- [ ] Test score calculation with sample responses
- [ ] Ensure LinkedIn field validates URL format
- [ ] Preview all email templates (acceptance, waitlist, rejection)

---

## Privacy & Data Handling

**GDPR Compliance:**
- Include privacy notice at form start: "We'll use your info only for beta selection and updates"
- Provide opt-out: "Unsubscribe anytime from emails"
- Store data securely (Typeform or Google Sheets with access control)

**Data Retention:**
- Keep applicant data for 6 months
- Delete rejected applicants' data after launch (unless they opt in to waitlist)

---

## Success Metrics

**Target:**
- 50-100 applications over 6 weeks
- 20 accepted beta users
- 70%+ match ICP (score 15+ points)
- 50%+ willing to provide weekly feedback

**Tracking:**
- Application source (LinkedIn, blog post, community post)
- Conversion rate: Applications → Acceptances
- Average score by source (which channels yield best applicants?)

---

## Next Steps

**Week 2:**
- [ ] Build form in Typeform (or Google Forms)
- [ ] Write acceptance/rejection email templates
- [ ] Test form with 3-5 internal users
- [ ] Set up applicant tracking spreadsheet

**Week 3:**
- [ ] Launch form on landing page
- [ ] Share form link in outreach messages
- [ ] Monitor first 10 applications
- [ ] Adjust scoring thresholds if needed

---

**Related:**
- [MAC-67](/issues/MAC-67) - Beta launch product validation
- [Beta Recruitment Plan](/projects/loops/docs/research/beta-recruitment-plan.md)
- [MAC-50](/issues/MAC-50) - Beta launch roadmap

**Version History:**
- v1.0 (2026-03-07): Initial application form spec for 20-user beta
