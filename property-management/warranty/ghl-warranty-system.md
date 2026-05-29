---
status: draft
owner: Kuan
last-reviewed: 2026-05-29
---

# GHL Warranty System — Integration & Signoff Protocol

## Purpose

Define the integration between Go High Level (GHL) and Google Sheets for warranty claim intake, tracking, and resolution with proper human signoff gates at each stage.

## Overview

| Layer | Tool | Function |
|---|---|---|
| Tenant intake | GHL | Forms, portal, SMS/email communications |
| Tracking & SOR | Google Sheets | Warranty Claim Log, status tracking |
| Command surface | Slack | `/warranty` commands, signoff approvals |
| Governance | GitHub | SOPs, schemas, this document |

GHL handles the **tenant-facing interface**. Google Sheets is the **system of record**. Slack is the **approval surface**. AI drafts and monitors — humans approve and execute.

---

## Landing Page — www.shb.studio/warranty

### Purpose

Public-facing warranty portal for homeowners to file claims and check claim status.

### URL Structure

| URL | Function |
|---|---|
| `www.shb.studio/warranty` | Landing page with options |
| `www.shb.studio/warranty/new` | File a new claim (GHL form) |
| `www.shb.studio/warranty/status` | Check claim status (lookup by claim # or email) |

### Landing Page Content

```
SHB Studio — Warranty Service

We stand behind our work. Use this portal to report warranty issues 
or check the status of an existing claim.

[FILE A NEW CLAIM]          [CHECK CLAIM STATUS]

---

What's Covered:
• Defects in workmanship or materials
• Building system issues from installation
• Waterproofing failures within warranty period

Not Covered:
• Normal wear and tear
• Tenant-caused damage
• Cosmetic preferences

Questions? Contact support@shb.studio
```

### File New Claim Page (`/warranty/new`)

Embeds the GHL warranty claim form (see below). After submission:
- Homeowner sees confirmation with claim number
- Receives SMS/email confirmation via GHL
- Redirects to status page with their claim #

### Check Status Page (`/warranty/status`)

**Lookup options:**
1. Enter claim number (e.g., WC-042)
2. Enter email address to see all claims

**Status display:**
| Field | Shown |
|---|---|
| Claim # | Yes |
| Date filed | Yes |
| Status | Yes (friendly: "Under Review", "Repair Scheduled", "Completed") |
| Category | Yes |
| Next step | Yes (e.g., "Awaiting contractor response") |
| Before/after photos | Yes (if repair complete) |
| Signoff link | Yes (if awaiting homeowner signoff) |

**Privacy:** Requires email verification or claim # + unit match to view details.

### Implementation

| Component | Tool | Notes |
|---|---|---|
| Landing page | GHL Funnel or Webflow | Simple 2-button layout |
| New claim form | GHL Form (embedded) | See form fields below |
| Status lookup | GHL or custom integration | Query Google Sheet via API |
| Hosting | GHL subdomain or Webflow | Point `www.shb.studio/warranty` |

---

## GHL Setup — Warranty Portal

### Tenant-Facing Form (GHL)

Create a warranty claim form in GHL with the following fields:

| Field | Type | Required | Maps To |
|---|---|---|---|
| Name | text | Yes | `reported_by` |
| Unit / Location | text | Yes | `unit_location` |
| Phone | phone | Yes | Contact record |
| Email | email | Yes | Contact record |
| Issue Description | textarea | Yes | `defect_description` |
| Category | dropdown | Yes | `category` |
| Is this an emergency? | yes/no | Yes | `priority` (emergency/standard) |
| Photo upload | file | Encouraged | `photo_evidence` |

**Category options:** General, Roofing, Mechanical (HVAC), Plumbing, Electrical, Waterproofing, Appliance, Finish, Structural

### GHL Automation (Read-Only for AI)

GHL sends a notification to Slack `#warranty` when a form is submitted. AI reads this notification for classification — AI does **not** write to GHL.

```
GHL Form Submit
  → Webhook to Slack #warranty
  → Warranty Watcher reads notification
  → AI drafts claim entry
  → Human reviews and approves
```

---

## Google Sheets — Warranty Claim Log (Enhanced)

The warranty claim log schema (see `warranty-claim-log-schema.md`) is extended with signoff fields:

### Additional Signoff & Photo Fields

| # | Field | Type | Required | Description |
|---|---|---|---|---|
| 27 | `pm_signoff` | boolean | — | Property Management verified claim entry |
| 28 | `pm_signoff_date` | date | — | Date PM signed off on claim |
| 29 | `gc_signoff` | boolean | — | GC/CM confirmed contractor assignment |
| 30 | `gc_signoff_date` | date | — | Date GC signed off on assignment |
| 31 | `before_photos_url` | string | Yes (repair) | Link to before photos (Drive or GHL) |
| 32 | `after_photos_url` | string | Yes (repair) | Link to after photos (Drive or GHL) |
| 33 | `repair_signoff` | boolean | — | PM verified repair completion |
| 34 | `repair_signoff_date` | date | — | Date PM signed off on repair |
| 35 | `homeowner_signoff` | boolean | — | Homeowner confirmed satisfaction |
| 36 | `homeowner_signoff_date` | date | — | Date homeowner signed off |
| 37 | `homeowner_signoff_sent` | datetime | — | When signoff request was sent via GHL |
| 38 | `homeowner_signoff_method` | enum | — | `signed`, `auto-approved`, `reopened` |
| 39 | `homeowner_signoff_notes` | text | — | Notes (e.g., "Auto-approved: no response within 24 hours") |
| 40 | `close_signoff` | boolean | — | Owner's Rep approved closure |
| 41 | `close_signoff_date` | date | — | Date closure was approved |
| 42 | `ghl_contact_id` | string | — | GHL contact record ID for communication |
| 43 | `ghl_conversation_id` | string | — | GHL conversation thread ID |

### Sheet Location

`08-property-management/warranty-claims/[PROJECT-CODE]_warranty-claim-log`

---

## Signoff Protocol

Every warranty claim progresses through mandatory signoff gates. No claim advances without the required signature.

### Gate 1: Intake Signoff (PM)

**Trigger:** New claim received via GHL form or email (`support@shb.studio`)

**AI does:**
- Reads GHL notification
- Extracts claim details
- Checks warranty expiry against inventory
- Identifies likely responsible contractor
- Drafts claim entry in Slack

**Human does:**
- Reviews draft in Slack
- Confirms/edits classification
- Confirms warranty coverage
- Clicks "Approve & Log"
- Enters claim in Google Sheet
- Marks `pm_signoff = true` and sets `pm_signoff_date`

**Signoff record:**
```
PM Signoff: [Name]
Date: [YYYY-MM-DD]
Claim #: [WC-XXX]
Coverage: [Confirmed / Under Review]
```

### Gate 2: Assignment Signoff (GC/CM)

**Trigger:** Claim logged with `pm_signoff = true`

**AI does:**
- Drafts contractor notification
- Calculates response SLA deadline
- Posts assignment prompt to Slack

**Human does (GC/CM):**
- Confirms responsible contractor
- Issues warranty service request to contractor
- Updates Sheet: `responsible_contractor`, `date_assigned`, `response_due`
- Marks `gc_signoff = true` and sets `gc_signoff_date`

**Signoff record:**
```
GC Signoff: [Name]
Date: [YYYY-MM-DD]
Claim #: [WC-XXX]
Contractor: [Contractor Name]
Service Request Issued: [Yes/No]
```

### Gate 3: Photo Documentation (Before/After)

**Trigger:** Contractor scheduled for repair

**Before photos (required):**
- Contractor or PM takes photos of defect before repair
- Photos uploaded to GHL or Drive
- `before_photos_url` populated in claim log

**After photos (required):**
- Contractor or PM takes photos after repair complete
- Photos uploaded to GHL or Drive
- `after_photos_url` populated in claim log

**No repair is considered complete without before/after photo documentation.**

### Gate 4: Repair Signoff (PM)

**Trigger:** Contractor reports repair complete with after photos

**AI does:**
- Reminds PM to verify repair
- Calculates if repair is within SLA
- Flags if overdue

**Human does (PM):**
- Inspects repair in person or via photos
- Documents repair quality
- Updates Sheet: `date_repair_completed`, `repair_description`, `repair_verified`
- Marks `repair_signoff = true` and sets `repair_signoff_date`

**Signoff record:**
```
Repair Signoff: [Name]
Date: [YYYY-MM-DD]
Claim #: [WC-XXX]
Repair Verified: [Yes/No]
Quality: [Satisfactory / Deficient]
Before Photos: [link]
After Photos: [link]
```

### Gate 5: Homeowner Signoff (Via GHL)

**Trigger:** PM marks repair verified (`repair_signoff = true`)

**AI does:**
- Drafts homeowner signoff request
- PM approves, GHL sends to homeowner
- Tracks signoff status

**Homeowner receives (via GHL SMS/email):**
```
Hi [Name],

Your warranty repair for claim #[WC-XXX] has been completed.

Work performed: [repair_description]

Please confirm you are satisfied with the repair:
[LINK TO GHL SIGNOFF FORM]

If we do not hear from you within 24 hours, and you have not reported any issues, we will consider this repair complete.

— Property Management
```

**Homeowner signoff form (GHL):**
| Field | Type | Required |
|---|---|---|
| Are you satisfied with the repair? | Yes/No | Yes |
| If no, describe the issue | textarea | If No |
| Digital signature | signature | Yes |

**Outcomes:**

| Response | Action |
|---|---|
| Homeowner signs "Yes" | Mark `homeowner_signoff = true`, proceed to closure |
| Homeowner signs "No" with issue | Reopen claim, return to repair stage |
| No response within 24 hours (no complaint) | Mark `homeowner_signoff = true` (auto-closure), note "Auto-approved: no response" |
| Homeowner complains via any channel within 24 hours | Hold closure, address issue |

**Auto-closure rule:**
- If 24 hours pass after signoff request AND no complaint received via GHL, email, or Slack
- AI flags for PM review: "Homeowner did not respond — auto-closure eligible"
- PM confirms auto-closure
- `homeowner_signoff_notes` = "Auto-approved: no response within 24 hours"

### Gate 6: Closure Signoff (Owner's Rep)

**Trigger:** `homeowner_signoff = true` OR claim marked as `excluded`

**AI does:**
- Drafts closure summary
- Checks all prior signoffs are complete
- Flags if any escalations unresolved

**Human does (Owner's Rep):**
- Reviews claim history
- Confirms resolution is acceptable
- Updates Sheet: `status = closed`, `date_closed`
- Marks `close_signoff = true` and sets `close_signoff_date`

**Signoff record:**
```
Close Signoff: [Name]
Date: [YYYY-MM-DD]
Claim #: [WC-XXX]
Resolution: [Repaired / Excluded / Other]
```

---

## GHL Communication Flows

All tenant communications flow through GHL with human approval gates.

### Status Update to Tenant (Human-Gated)

When claim status changes:

1. AI drafts status update message
2. AI posts draft to Slack `#warranty`
3. PM reviews and approves
4. PM sends via GHL (or instructs AI to send if Level 4 authority is active)

**Draft template:**
```
Hi [Name],

Your warranty claim #[WC-XXX] has been updated:

Status: [New Status]
[Additional details]

If you have questions, reply to this message or call [contact].

— Property Management
```

### Scheduling Access Coordination

When repair visit is scheduled:

1. GC/CM confirms contractor schedule
2. AI drafts access coordination message
3. PM reviews and approves
4. PM sends via GHL

**Draft template:**
```
Hi [Name],

Repair for your warranty claim #[WC-XXX] has been scheduled:

Date: [Date]
Time: [Window]
Contractor: [Company]
Work: [Brief description]

Please confirm someone will be available to provide access.

— Property Management
```

---

## Warranty Watcher Integration

The Warranty Watcher (see `watcher-system.md`) monitors:

| Source | What | Action |
|---|---|---|
| GHL webhook | New form submissions | Draft intake entry |
| Email `support@shb.studio` | Defect reports | Draft intake entry |
| Google Sheet | Claim status changes | Draft status update |
| Google Sheet | Response SLA approaching | Flag to PM |
| Google Sheet | Repair SLA overdue | Escalation to GC |
| Warranty inventory | 60-day expiry alert | Pre-inspection reminder |

### Daily Review Packet — Warranty

```
WARRANTY WATCHER — Daily Review Packet — [DATE]

NEW CLAIMS (via GHL or email)
  • [claim type] [unit] — [subject] — [source]
  • ...

PENDING SIGNOFFS
  • [WC-XXX] — awaiting [PM/GC/Owner's Rep] signoff — [N] days
  • ...

SLA ALERTS
  • [WC-XXX] — contractor response due [date] — [on track / overdue]
  • ...

EXPIRING WARRANTIES (next 60 days)
  • [Project] — [Category] — expires [date] — inspection scheduled: [Y/N]
  • ...

RECOMMENDED ACTIONS
  • [action] — draft attached: [yes/no]
  • ...
```

---

## AI Boundaries (Warranty-Specific)

**AI may:**
- Read GHL form submissions and contact data
- Read email intake from `support@shb.studio`
- Draft claim entries, status updates, and access coordination messages
- Track signoff completion
- Calculate SLA deadlines and flag risks
- Draft tenant communications for approval

**AI may NOT:**
- Write to GHL (contacts, pipelines, conversations)
- Send messages to tenants without human approval
- Mark signoffs as complete
- Close claims without Owner's Rep approval
- Skip any signoff gate

---

## GHL Pipeline Configuration

### Warranty Pipeline Stages

Configure GHL pipeline to mirror claim status:

| Pipeline Stage | Maps to Status | Trigger |
|---|---|---|
| New Claim | `open` | Form submission |
| Under Review | `open` | PM reviewing |
| Assigned | `assigned` | GC signoff complete |
| In Repair | `in-repair` | Contractor scheduled |
| Repair Complete | `in-repair` | Awaiting PM verification |
| Closed | `closed` | Owner's Rep signoff |
| Excluded | `excluded` | Not covered |
| Disputed | `disputed` | Under escalation |

### Contact Tagging

Tag warranty contacts in GHL:
- `warranty-active` — has open claim
- `warranty-resolved` — all claims closed
- `warranty-vip` — priority tenant (optional)
- `warranty-[project-code]` — project identifier

---

## Reporting Dashboard (Read-Only)

Dashboard views powered by Google Sheets data:

### Summary Metrics

| Metric | Source |
|---|---|
| Open claims | Count where `status` in (open, assigned, in-repair, disputed) |
| Avg resolution time | Days between `date_reported` and `date_closed` |
| SLA compliance | % claims resolved within SLA |
| Claims by category | Group by `category` |
| Claims by contractor | Group by `responsible_contractor` |

### Signoff Completion

| Gate | % Complete | Avg Time to Signoff |
|---|---|---|
| PM Intake | — | — |
| GC Assignment | — | — |
| Repair Verification | — | — |
| Closure | — | — |

---

## Implementation Checklist

### Landing Page (www.shb.studio/warranty)
- [ ] Create landing page with "File Claim" and "Check Status" buttons
- [ ] Set up `/warranty/new` with embedded GHL form
- [ ] Set up `/warranty/status` with claim lookup
- [ ] Configure DNS/subdomain routing
- [ ] Add email verification for status lookup
- [ ] Style to match SHB Studio branding

### GHL Setup
- [ ] Create warranty claim form with required fields
- [ ] Configure webhook to Slack `#warranty`
- [ ] Create warranty pipeline stages
- [ ] Set up contact tagging rules
- [ ] Create SMS/email templates (for human-triggered sends)
- [ ] Create homeowner signoff form with signature field

### Google Sheets Setup
- [ ] Add signoff fields to warranty claim log schema
- [ ] Create signoff validation rules (date required when signoff = true)
- [ ] Add conditional formatting for signoff status
- [ ] Create dashboard summary tab

### Slack Setup
- [ ] Configure Warranty Watcher to post to `#warranty`
- [ ] Set up `/warranty` slash command for manual claim entry
- [ ] Configure GHL webhook notifications

### SOP Updates
- [ ] Update `ops-warranty-claim-intake-and-resolution.md` with GHL references
- [ ] Update `ops-warranty-administration.md` with signoff requirements
- [ ] Train PM team on signoff protocol

---

## RACI — Signoff Gates

| Activity | Property Mgmt | SHB Inc. (GC/CM) | SHB Group (Owner's Rep) | Homeowner | AI |
|---|---|---|---|---|---|
| Receive GHL form | I | — | — | **R** (submits) | Monitor |
| Intake signoff | **R** | I | I | — | Draft only |
| Assignment signoff | I | **R** | I | — | Draft only |
| Before/after photos | **R** | C | I | — | Remind only |
| Repair verification | **R** | C | I | — | Remind only |
| Homeowner signoff request | **R** | I | I | — | Draft only |
| Homeowner signoff | I | — | I | **R** | Track only |
| 24-hour auto-closure | **R** (confirms) | — | I | — | Flag only |
| Closure signoff | I | I | **R** | — | Draft only |
| Status updates to tenant | **R** | I | I | I | Draft only |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

---

## Review Schedule

- Reviewed every 6 months.
- Next review: 2026-11-29.
