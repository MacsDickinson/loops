# Beta Applicant Tracking Sheet

**Version:** 1.0
**Last Updated:** 2026-03-07
**Owner:** PM
**Tool:** Google Sheets (recommended) or Airtable
**Purpose:** Track beta applicants from outreach through acceptance

---

## Sheet Overview

**Single spreadsheet with 3 tabs:**

1. **Applicants** - Main tracking sheet (all applicants)
2. **Outreach Targets** - Pre-application contact list
3. **Dashboard** - Summary metrics and charts

---

## Tab 1: Applicants

**Purpose:** Track all beta applicants from form submission through decision

### Columns (20 total)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| **ID** | Auto | Unique ID | APP-001 |
| **Timestamp** | Date/Time | When they applied | 2026-03-10 14:32 |
| **Name** | Text | Full name | Jane Smith |
| **Email** | Email | Contact email | jane@example.com |
| **LinkedIn** | URL | Profile link (optional) | linkedin.com/in/janesmith |
| **Role** | Dropdown | PM, Eng Manager, Founder, etc. | Product Manager |
| **Company** | Text | Company name | Acme Corp |
| **Company Size** | Dropdown | 1-10, 10-50, 50-500, 500+ | 50-500 |
| **AI Tools** | Multi-select | Cursor, Copilot, Lovable, etc. | Cursor, Copilot |
| **Rework Frequency** | Dropdown | Multiple/week, Weekly, Monthly, Rarely | Multiple/week |
| **Biggest Frustration** | Text | Open-ended pain point | AI doesn't understand edge cases |
| **Time Commitment** | Dropdown | Yes, Maybe, No | Yes |
| **Feedback Willingness** | Dropdown | Weekly, Bi-weekly, Only bugs | Weekly |
| **Willingness to Pay** | Dropdown | Definitely, Probably, Maybe, No | Probably |
| **Score** | Formula | Auto-calculated from responses | 18 |
| **Source** | Dropdown | LinkedIn, Email, Reddit, Twitter, etc. | LinkedIn DM |
| **UTM Campaign** | Text | Auto-populated from form | beta-week3 |
| **Status** | Dropdown | New, Reviewing, Accepted, Waitlist, Rejected | Accepted |
| **Decision Date** | Date | When PM made decision | 2026-03-11 |
| **Notes** | Text | PM notes, follow-up needed | Strong use case, top priority |

---

### Formulas

**Score Calculation (Column O):**

```
=
  IF(F2="Product Manager", 3,
    IF(F2="Engineering Manager", 2,
      IF(F2="Founder", 2, 1))) +
  IF(H2="50-500", 3,
    IF(OR(H2="10-50", H2="1-10"), 2, 1)) +
  (IF(ISNUMBER(SEARCH("Cursor", I2)), 2, 0) +
   IF(ISNUMBER(SEARCH("Copilot", I2)), 2, 0)) +
  IF(J2="Multiple/week", 4,
    IF(J2="Weekly", 3,
      IF(J2="Monthly", 2, 1))) +
  IF(L2="Yes", 4, IF(L2="Maybe", 1, 0)) +
  IF(M2="Weekly", 3, IF(M2="Bi-weekly", 2, 0)) +
  IF(N2="Definitely", 4,
    IF(N2="Probably", 3, IF(N2="Maybe", 1, 0)))
```

**Auto-Status (Column R - based on score):**

```
=IF(O2>=18, "Auto-Accept",
   IF(O2>=12, "Manual Review",
     IF(O2>=8, "Waitlist", "Auto-Reject")))
```

---

### Conditional Formatting

**Score column (O):**
- Green: ≥18 (Auto-accept)
- Yellow: 12-17 (Manual review)
- Orange: 8-11 (Waitlist)
- Red: <8 (Auto-reject)

**Status column (R):**
- Dark Green: Accepted
- Yellow: Reviewing
- Light Blue: Waitlist
- Red: Rejected

---

### Filters & Views

**Saved Views:**

1. **New Applicants** - Status = "New", sorted by timestamp (newest first)
2. **Manual Review Queue** - Score 12-17, Status = "Reviewing"
3. **Accepted** - Status = "Accepted", sorted by decision date
4. **By Source** - Group by source column, show conversion rates

---

## Tab 2: Outreach Targets

**Purpose:** Track pre-application contacts (LinkedIn, email outreach)

### Columns (12 total)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| **ID** | Auto | Contact ID | OUT-001 |
| **Name** | Text | Full name | John Doe |
| **LinkedIn URL** | URL | Profile link | linkedin.com/in/johndoe |
| **Email** | Email | Contact email (if known) | john@company.com |
| **Company** | Text | Current company | Tech Startup Inc |
| **Role** | Text | Title from profile | Senior Product Manager |
| **AI Tool Mention** | Text | From profile/posts | Uses Cursor |
| **Outreach Method** | Dropdown | LinkedIn DM, Email, Community | LinkedIn DM |
| **Template Used** | Dropdown | Template A, B, C, etc. | Template A (Cold) |
| **Sent Date** | Date | When outreach was sent | 2026-03-12 |
| **Status** | Dropdown | Sent, Responded, Applied, No Response | Responded |
| **Notes** | Text | Follow-up needed, conversation context | Interested, needs to check calendar |

---

### Formulas

**Days Since Outreach:**

```
=IF(J2<>"", TODAY()-J2, "")
```

**Follow-Up Needed (conditional):**

```
=IF(AND(K2="Sent", TODAY()-J2>=5), "Follow up", "")
```

---

### Filters & Views

**Saved Views:**

1. **Follow-Up Needed** - Status = "Sent", Days since ≥5
2. **Responded (Not Applied)** - Status = "Responded", sorted by sent date
3. **By Source** - Group by outreach method

---

## Tab 3: Dashboard

**Purpose:** Summary metrics and charts for tracking campaign performance

### Key Metrics (Auto-calculated)

**Applications:**
- Total applications: `=COUNTA(Applicants!A:A) - 1`
- This week: `=COUNTIFS(Applicants!B:B, ">=TODAY()-7")`
- Avg score: `=AVERAGE(Applicants!O:O)`

**Decisions:**
- Accepted: `=COUNTIF(Applicants!R:R, "Accepted")`
- Waitlist: `=COUNTIF(Applicants!R:R, "Waitlist")`
- Rejected: `=COUNTIF(Applicants!R:R, "Rejected")`
- Pending review: `=COUNTIF(Applicants!R:R, "Reviewing")`

**Conversion Rates:**
- Application → Acceptance rate: `=Accepted / Total applications`
- Target ICP match rate: `=COUNTIF(Applicants!H:H, "50-500") / Total applications`

**Sources:**
- LinkedIn: `=COUNTIF(Applicants!P:P, "LinkedIn*")`
- Email: `=COUNTIF(Applicants!P:P, "Email*")`
- Communities: `=COUNTIF(Applicants!P:P, "*Reddit*") + COUNTIF(Applicants!P:P, "*Slack*")`
- Twitter: `=COUNTIF(Applicants!P:P, "Twitter*")`

**Outreach:**
- Total contacts: `=COUNTA('Outreach Targets'!A:A) - 1`
- Sent: `=COUNTIF('Outreach Targets'!K:K, "Sent")`
- Responded: `=COUNTIF('Outreach Targets'!K:K, "Responded")`
- Applied: `=COUNTIF('Outreach Targets'!K:K, "Applied")`
- Response rate: `=Responded / Sent`

---

### Charts

**Chart 1: Applications Over Time**
- Type: Line chart
- X-axis: Week (Week 2, Week 3, etc.)
- Y-axis: Cumulative applications
- Goal line: 100 applications by Week 8

**Chart 2: Applications by Source**
- Type: Pie chart
- Segments: LinkedIn, Email, Reddit, Twitter, Other
- Shows: Which channels drive most applications

**Chart 3: Score Distribution**
- Type: Histogram
- X-axis: Score ranges (0-7, 8-11, 12-17, 18+)
- Y-axis: Count of applicants
- Shows: Quality of applicant pool

**Chart 4: Acceptance Funnel**
- Type: Funnel chart (or stacked bar)
- Stages: Applied → Manual Review → Accepted
- Shows: Drop-off at each stage

---

## Automation (Optional)

**If using Zapier or Make:**

### Zap 1: Typeform → Google Sheets
- Trigger: New Typeform response
- Action: Add row to "Applicants" sheet
- Map: All form fields to columns
- Auto-populate: Timestamp, UTM source, initial status

### Zap 2: Auto-Accept Email
- Trigger: New row in "Applicants" with Score ≥18
- Action: Send email (Template: Acceptance)
- CC: PM for tracking

### Zap 3: Auto-Reject Email
- Trigger: New row in "Applicants" with Score <8
- Action: Send email (Template: Rejection + Waitlist)

### Zap 4: Manual Review Notification
- Trigger: New row with Score 12-17
- Action: Slack/Email notification to PM
- Message: "New applicant needs manual review: [Name]"

---

## Sample Data (First 3 Rows)

| ID | Timestamp | Name | Email | Role | Company Size | Score | Source | Status |
|----|-----------|------|-------|------|--------------|-------|--------|--------|
| APP-001 | 2026-03-10 14:32 | Jane Smith | jane@acme.com | Product Manager | 50-500 | 21 | LinkedIn DM | Accepted |
| APP-002 | 2026-03-10 16:45 | Bob Johnson | bob@startup.io | Founder | 1-10 | 15 | Email | Manual Review |
| APP-003 | 2026-03-11 09:12 | Alice Chen | alice@corp.com | Designer | 500+ | 6 | Reddit | Waitlist |

---

## Setup Instructions

### Google Sheets Setup (15 minutes)

1. **Create new spreadsheet:** "Discovery Loop Coach - Beta Applicants"
2. **Create 3 tabs:** Applicants, Outreach Targets, Dashboard
3. **Add column headers** (Tab 1 & 2)
4. **Add formulas** (Score, Auto-Status, Days Since Outreach)
5. **Set up conditional formatting** (Score, Status columns)
6. **Create saved views** (New Applicants, Manual Review Queue, etc.)
7. **Add dashboard metrics** (formulas for totals, conversion rates)
8. **Create charts** (Applications over time, by source, score distribution)
9. **Share with team** (PM: edit access, CEO: view access)

---

### Airtable Setup (Alternative, 20 minutes)

**Pros:**
- Better automation (no Zapier needed)
- Built-in forms (can replace Typeform)
- Kanban view for applicant status

**Cons:**
- Free tier limits (1,200 records)
- More complex setup

**Setup:**
1. Create base: "Beta Applicants"
2. Create tables: Applicants, Outreach Targets
3. Add fields (same as Sheet columns, but with field types)
4. Create views: Grid, Kanban (by Status), Calendar (by Sent Date)
5. Set up automations (auto-email on score thresholds)
6. Create dashboard with charts

---

## Usage Workflow

### Daily (5 min)
1. Check "New Applicants" view
2. Review score and auto-status
3. For "Manual Review" applicants:
   - Read Q11 (use case description)
   - Check LinkedIn profile
   - Update status to Accepted/Waitlist/Rejected
   - Add notes
4. Send acceptance/rejection emails

### Weekly (15 min)
1. Review Dashboard metrics
2. Check conversion rates by source
3. Identify low-performing channels (adjust strategy)
4. Check "Follow-Up Needed" in Outreach Targets
5. Send Template C (follow-up) to non-responsive contacts

### End of Week 8 (30 min)
1. Finalize 20 accepted users
2. Create waitlist from remaining qualified applicants
3. Send final batch of acceptance/waitlist emails
4. Export accepted users list for onboarding
5. Archive tracking sheet for reference

---

## Privacy & Data Retention

**Data Security:**
- Restrict sheet access to PM and CEO only
- Do not share publicly or with third parties
- Use HTTPS-only access

**GDPR Compliance:**
- Store only data necessary for beta selection
- Delete rejected applicants' data after 6 months
- Provide opt-out in rejection emails

**Retention:**
- Accepted users: Keep indefinitely (customer records)
- Waitlist: Keep until public launch + 3 months
- Rejected: Delete after 6 months (or on request)

---

## Success Criteria

**Week 8 Targets:**
- 50-100 total applications
- 20 accepted (70%+ match ICP)
- 50%+ applications from LinkedIn/Email (high-quality sources)
- 30%+ acceptance rate (efficient screening)

**Tracking Quality:**
- All applicants scored within 24 hours
- Follow-ups sent on time (5-day LinkedIn, 7-day email)
- Dashboard updated weekly
- No data loss or duplicate entries

---

## Next Steps

**Week 2:**
- [ ] Create Google Sheet using this template
- [ ] Set up formulas and conditional formatting
- [ ] Create saved views and dashboard
- [ ] Share with CEO (view-only access)
- [ ] Test with 3 sample applicants

**Week 3:**
- [ ] Connect Typeform to Sheets (Zapier or manual CSV export)
- [ ] Add first 10 outreach targets
- [ ] Track first applications
- [ ] Iterate on scoring formula if needed

---

**Related:**
- [MAC-67](/issues/MAC-67) - Beta launch product validation
- [Beta Application Form](/projects/loops/docs/research/beta-application-form.md)
- [Beta Recruitment Plan](/projects/loops/docs/research/beta-recruitment-plan.md)
- [Beta Outreach Templates](/projects/loops/docs/research/beta-outreach-templates.md)

**Version History:**
- v1.0 (2026-03-07): Initial tracking sheet specification
