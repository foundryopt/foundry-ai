---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
parallel-to: Phase 2 Probation (ends 2026-02-15)
---

# Human-Simple Open Task Dashboard — v1

**Interactive View — Read-Only Authority (Phase 2 Probation)**

---

## Design Principle

One inbox. Three questions, based on role:

- **PM / Superintendent:** "What needs attention today?"
- **Principal / Owner's Rep:** "What keeps repeating?"
- **Procurement / Ops:** "What's blocking purchasing and delivery?"

The dashboard is interactive for navigation — filter, sort, search, drill down. But no interaction changes state. No approve, acknowledge, resolve, dismiss, edit, or override. Every item deep-links to the exact location in the source EPC system where the human acts.

**Hard rule:** If a precise deep link cannot be generated for an Open Task, that item is not surfaced on the dashboard. Every visible item is one click from action.

After probation (Feb 15): if Phase 2 is confirmed, action buttons layer on top of this structure with zero rework. The read-only layout IS the production layout.

---

## Authentication & Roles

### Login

Login required. SSO (Google Workspace) preferred. No anonymous access. No shared accounts.

### Role Assignments

| Role | Entity | Default View | Scope |
|---|---|---|---|
| PM | SHB Inc. | What Needs Attention Today | Assigned projects only |
| Superintendent | SHB Inc. | What Needs Attention Today | Assigned projects only |
| Principal | SHB Group | What's Repeating | All projects |
| Owner's Rep | SHB Group | What's Repeating | All projects |
| Procurement | Builiq Inc. | Procurement & Delivery | All projects (domain-filtered) |
| Ops | SHB Inc. / Builiq Inc. | Procurement & Delivery | All projects (domain-filtered) |

Role is set at account creation. All roles can navigate to all views via tabs. Default view is where they land after login.

---

## Views

Three views, accessible as tabs on a single surface. No separate pages, no navigation menu, no sidebar.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Interactive View — Read-Only Authority (Phase 2 Probation)        │
│  [user name] · [role] · Last updated: [timestamp]                  │
├────────────────────┬───────────────────┬────────────────────────────┤
│  Attention Today   │  What's Repeating │  Procurement & Delivery   │
│  (active tab)      │                   │                           │
└────────────────────┴───────────────────┴────────────────────────────┘
```

---

## View 1: What Needs Attention Today

**Default for:** PM, Superintendent

**Scope:** Open Tasks for the logged-in user's assigned projects only. PM sees their projects. Super sees their projects. No cross-project noise.

### Toolbar

```
┌────────────────────────────────────────────────────────────────┐
│ [Search: item ID, subject, owner, vendor...]                   │
│ Filter: [Category ▾] [Owner ▾] [SLA Status ▾] [Date Range ▾] │
│ Sort: [Urgency ▾]  (default: Overdue → Due Today → New)       │
└────────────────────────────────────────────────────────────────┘
```

All filters are additive (AND logic). Active filters shown as dismissible chips. "Clear all" resets to default.

### Counts Bar

```
┌──────────┬──────────┬──────────┬──────────┐
│ Overdue  │ Due Today│   New    │ Total    │
│    3     │    2     │    4     │   18     │
│  (red)   │ (yellow) │  (blue)  │  (gray)  │
└──────────┴──────────┴──────────┴──────────┘
```

Counts reflect current filters. Tapping a count filters to that urgency level.

### Item List

Single list, grouped by urgency. Each item is a card.

#### Card Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ■ RFI  ·  RFI-044  ·  5d overdue                      red  │
│   Waterproofing detail at planter                           │
│   Owner: Taylor R.  ·  Project: SandBox                     │
│   [Slack]  [Smartsheet]  [Email]                            │
└─────────────────────────────────────────────────────────────┘
```

| Field | Source | Display |
|---|---|---|
| Category | Open Task classification | Tag/chip: `RFI` `CO` `Invoice` `Decision` `Submittal` `Lead Time` `Warranty` `Pay App` `Pre-Task` `Expense` |
| Item ID | Log system item number | Bold monospace: **`RFI-044`** |
| Subject | Log system subject or email subject | Regular weight, single line, truncated at 60 chars mobile / full desktop |
| Owner | RACI — who must act next | Regular weight |
| Project | Project name | Regular weight (only shown if user has multiple projects) |
| Urgency | SLA calculation | `5d overdue` (red) / `Due today` (yellow) / `3d remaining` (blue) / `12d remaining` (gray) |
| Deep Links | Source system URLs | Text labels, one per source (see Deep Links section) |

Left-border color: red (overdue), yellow (due today), blue (new), gray (watching).

#### Urgency Groups

| Group | Criteria | Sort Within Group | Collapsed? |
|---|---|---|---|
| OVERDUE | Past SLA deadline | Days overdue descending (worst first) | No |
| DUE TODAY | SLA deadline = today | Category | No |
| NEW (24h) | Created in last 24 hours, not overdue | Creation time descending (newest first) | No |
| WATCHING | Open, within SLA, not new | SLA deadline ascending (soonest first) | Yes (tap to expand) |

### Drill-Down (Detail Panel)

Tapping a card opens a detail panel (slide-over on mobile, side panel on desktop). The list remains visible behind it.

#### Detail Panel Contents

| Section | Fields | Source |
|---|---|---|
| **Header** | Item ID, category, subject, urgency badge | Open Task data |
| **Assignment** | Owner, project, entity, created by | RACI + log data |
| **Timeline** | Created → Classified → Routed → SLA set → Updates → Current status | Open Task event log |
| **SLA** | Deadline, days remaining/overdue, SOP reference | SLA rules + calculation |
| **Details** | All fields from the source log (varies by category — see Field Tables below) | Log Sheet row |
| **Related Items** | Other Open Tasks referencing the same PO, CO, RFI, or vendor | Cross-reference by ID |
| **Deep Links** | All available links, full labels | Source system URLs |

#### Field Tables by Category

**RFI Detail:**

| Field | Source |
|---|---|
| RFI number, subject, priority | `SANDBOX_rfi-log` |
| Initiated by, routed to, response due | `SANDBOX_rfi-log` |
| Drawing/spec reference | `SANDBOX_rfi-log` |
| Response summary (if received) | `SANDBOX_rfi-log` |
| Cost impact, schedule impact | `SANDBOX_rfi-log` |

**Change Order Detail:**

| Field | Source |
|---|---|
| PCO/CO number, description, status | `SANDBOX_co-log` |
| Vendor, trade | `SANDBOX_co-log` |
| Preliminary cost, approved amount | `SANDBOX_co-log` |
| Threshold triggered (yes/no) | `SANDBOX_co-log` vs CO approval threshold |
| Contract sum before/after | `SANDBOX_co-log` |

**Decision Detail:**

| Field | Source |
|---|---|
| Decision ID, description, category | `SANDBOX_decision-log` |
| Decision maker, approval authority | `SANDBOX_decision-log` |
| Cost impact, schedule impact | `SANDBOX_decision-log` |
| Options presented | `SANDBOX_decision-log` |
| Decision window, deadline | `SANDBOX_decision-log` |

**Submittal Detail:**

| Field | Source |
|---|---|
| Submittal number, description, spec section | `SANDBOX_submittal-register` |
| Submitted by, reviewer | `SANDBOX_submittal-register` |
| Review due, review status | `SANDBOX_submittal-register` |
| Resubmit count | `SANDBOX_submittal-register` |

**Lead Time Detail:**

| Field | Source |
|---|---|
| Item, PO number, vendor | `SANDBOX_lead-time-tracker` |
| Order date, projected delivery | `SANDBOX_lead-time-tracker` |
| Float days, risk flag | `SANDBOX_lead-time-tracker` |
| Schedule task dependent on delivery | `SANDBOX_lead-time-tracker` |

**Invoice Detail:**

| Field | Source |
|---|---|
| Invoice number, vendor, amount | AI extraction + `05-financial/` |
| Job number, cost code | AI extraction or PM-confirmed |
| Gate status, flags | Invoice gate |
| Budget status | Smartsheet budget data |

**Warranty Claim Detail:**

| Field | Source |
|---|---|
| Claim ID, defect description, priority | `SANDBOX_warranty-claim-log` |
| Unit/location, category | `SANDBOX_warranty-claim-log` |
| Contractor assigned, response due | `SANDBOX_warranty-claim-log` |
| Repair status, verification date | `SANDBOX_warranty-claim-log` |

**Pay App / Expense Report / Pre-Task:** Follows same pattern — all fields from their respective log Sheets.

### Empty States

| State | Text |
|---|---|
| No overdue | `No overdue items.` |
| No due today | `Nothing due today.` |
| No new items | `No new items in the last 24 hours.` |
| No watching items | `No items in monitoring.` |
| Fully empty | `All clear. No open tasks for your projects.` |
| No search results | `No items match "[query]". Try a different search.` |
| No filter results | `No items match the current filters.` [Clear all] |

---

## View 2: What's Repeating

**Default for:** Principal, Owner's Rep

**Scope:** All projects. Cross-project patterns and systemic issues.

**Purpose:** The Principal and Owner's Rep don't work item-by-item. They need to see what keeps happening — the patterns that indicate systemic problems, bottlenecks, or risks that span projects or persist over time.

### Toolbar

```
┌────────────────────────────────────────────────────────────────┐
│ Time window: [Last 7 days ▾]  [Last 14 days]  [Last 30 days] │
│ Filter: [Project ▾] [Category ▾]                              │
└────────────────────────────────────────────────────────────────┘
```

Default: Last 14 days, all projects, all categories.

### Section 1: Repeat SLA Breaches

Items or categories that breach SLA more than once in the time window.

| Column | Description | Example |
|---|---|---|
| Category | Open Task type | `RFI` |
| Breach Count | Number of distinct breaches in window | `6` |
| Top Owner | Owner with the most breaches in this category | `Taylor R. (4 of 6)` |
| Avg Days Overdue | Average days past SLA at resolution (or current) | `4.2d` |
| Projects | Which projects are affected | `SandBox` |
| Trend | Improving or worsening vs previous window | `Worsening (+2)` |

Sorted by breach count descending. Tapping a row drills down to the specific Open Tasks.

### Section 2: Owner Load

Who has the most open items, and who is consistently overdue.

| Column | Description | Example |
|---|---|---|
| Owner | Person responsible | `Taylor R.` |
| Open Items | Total open across all categories | `7` |
| Overdue Items | Currently past SLA | `4` |
| Overdue Rate | Overdue / Open | `57%` |
| Categories | Which categories their items span | `RFI (3), Submittal (2), Decision (2)` |
| Projects | Which projects | `SandBox` |

Sorted by overdue count descending. Tapping a row drills down to that owner's Open Tasks.

### Section 3: Invoice Gate Patterns

Recurring flags from the invoice gate.

| Column | Description | Example |
|---|---|---|
| Flag Type | Which gate check keeps failing | `Missing job #` |
| Occurrences | Count in time window | `4` |
| Vendors | Which vendors triggered this flag | `Coastal Mechanical (2), ABC Electric (1), Delta Plumbing (1)` |
| Total Exposure | Sum of flagged invoice amounts | `$34,200` |

Sorted by occurrences descending. Tapping drills down to the specific invoices.

### Section 4: Cost Exposure Summary

Aggregate financial risk across all projects.

| Metric | Value | Source |
|---|---|---|
| Open PCO exposure (total) | `$108,600` | CO logs, sum of open preliminary costs |
| PCOs executed in window | `$18,400` | CO logs |
| Pending decisions with cost impact | `$13,500` | Decision logs |
| Invoice flags (total exposure) | `$34,200` | Invoice gate |

No drill-down — these are aggregate numbers. Deep links go to the relevant log Sheets.

### Section 5: Cross-Project Comparison

Available when multiple projects are active. Not relevant during single-project pilot.

| Column | Description |
|---|---|
| Project | Project name |
| Open Tasks | Total count |
| Overdue | Count past SLA |
| Breach Rate | Overdue / Total |
| Top Category | Category with most open items |
| Top Issue | Most urgent single item |

Sorted by overdue count descending. Tapping drills down to that project's items (switches to View 1, filtered to project).

### Empty State

`No repeating patterns detected in the selected time window.`

---

## View 3: Procurement & Delivery

**Default for:** Procurement, Ops

**Scope:** All projects. Filtered to domain-relevant categories: Lead Time, Submittal, Invoice (vendor-side), Change Order (vendor-side), Pre-Task Readiness (material-dependent).

### Toolbar

```
┌────────────────────────────────────────────────────────────────┐
│ [Search: PO, vendor, submittal #, item...]                     │
│ Filter: [Project ▾] [Category ▾] [Vendor ▾] [Risk Level ▾]   │
│ Sort: [Risk ▾]  (default: Critical → At-Risk → On-Track)      │
└────────────────────────────────────────────────────────────────┘
```

### Section 1: Lead-Time Risks

Open lead-time items, sorted by risk.

| Column | Source | Example |
|---|---|---|
| Item | Lead-time tracker description | `Structural steel — Level 3` |
| PO # | Lead-time tracker | `PO-1247` |
| Vendor | Lead-time tracker | `Metro Steel` |
| Projected Delivery | Lead-time tracker | `Mar 12` |
| Float | Lead-time tracker (days) | `-8d` |
| Risk | Lead-time tracker flag | `Critical` (red) / `At-Risk` (yellow) / `On-Track` (green) |
| Dependent Task | Schedule task blocked by this delivery | `Level 3 framing` |
| Links | Deep links | `[Smartsheet] [Slack] [Email]` |

Red border = critical (negative float). Yellow = at-risk (< 14 days float). Green = on-track.

### Section 2: Submittal Pipeline

Open submittals by status.

| Column | Source | Example |
|---|---|---|
| Submittal # | Submittal register | `SUB-013` |
| Description | Submittal register | `Cabinet shop drawings` |
| Spec Section | Submittal register | `06 41 16` |
| Status | Submittal register | `Under Review` |
| Reviewer | Submittal register | `Taylor R.` |
| Days in Status | Today minus status change date | `8d` |
| Review Due | Submittal register | `Feb 5 (3d overdue)` |
| Links | Deep links | `[Smartsheet] [Slack] [Drive]` |

Status chips: `Pending Submission` (gray), `Under Review` (yellow), `Revise-Resubmit` (red), `Approved` (green).

### Section 3: Vendor Invoice Status

Invoices in the gate pipeline, filtered to show vendor/PO context relevant to procurement.

Same layout as the Invoice Gate detail in View 1, with the addition of:

| Column | Source | Example |
|---|---|---|
| PO Reference | AI extraction or manual | `PO-1247` |
| Related Lead-Time Item | Cross-reference by PO/vendor | `LT-005` |

### Section 4: Delivery Schedule (Next 14 Days)

Timeline of expected deliveries.

| Column | Source | Example |
|---|---|---|
| Date | Lead-time tracker projected delivery | `Feb 12` |
| Item | Lead-time tracker | `Structural steel — Level 3` |
| Vendor | Lead-time tracker | `Metro Steel` |
| PO # | Lead-time tracker | `PO-1247` |
| QC Required | Receiving checklist | `Yes` |
| Links | Deep links | `[Smartsheet] [Slack]` |

Sorted by date ascending (nearest delivery first).

### Empty States

| Section | Text |
|---|---|
| Lead-Time Risks | `No lead-time items at risk.` |
| Submittal Pipeline | `No open submittals.` |
| Vendor Invoices | `No invoices in the gate pipeline.` |
| Delivery Schedule | `No deliveries expected in the next 14 days.` |

---

## Deep Links

Every Open Task includes one-click links to the **exact** location in the source EPC system. Not the project page. Not the sheet. The exact row, task, message, or record.

**If a precise deep link cannot be generated, the Open Task is not surfaced on the dashboard.**

| Link Label | Target | URL Pattern | When Shown |
|---|---|---|---|
| **Smartsheet** | The exact row in Smartsheet | `https://app.smartsheet.com/sheets/{sheet_id}?rowId={row_id}` | When the item is tracked in Smartsheet (schedule, budget) |
| **Slack** | The exact Slack thread | `https://{workspace}.slack.com/archives/{channel_id}/p{message_ts}` | When the item has a Slack thread |
| **Sheet** | The exact row in a Drive log Sheet | `https://docs.google.com/spreadsheets/d/{sheet_id}/edit#gid=0&range=A{row}` | When the item exists in a Drive log Sheet |
| **Email** | The exact source email | `https://mail.google.com/mail/u/0/#inbox/{message_id}` | When the item originated from email |
| **Doc** | The exact document in Drive | `https://drive.google.com/file/d/{file_id}` | When a document is attached |
| **Fieldwire** | The exact Fieldwire task | `https://app.fieldwire.com/#!/projects/{project_id}/tasks/{task_id}` | When the item was created from Fieldwire |
| **Adaptive** | The exact record in Adaptive Build | `https://{instance}.adaptivebuild.com/.../{record_id}` | When the item maps to an Adaptive Build record |
| **CompanyCam** | The exact photo or album | `https://app.companycam.com/projects/{project_id}/photos/{photo_id}` | When photo documentation is attached |

### Link Display

Links shown as text labels in a row beneath the item card. Tap-friendly (minimum 44px target).

```
┌─────────────────────────────────────────────────────────────┐
│ ■ RFI  ·  RFI-044  ·  5d overdue                      red  │
│   Waterproofing detail at planter                           │
│   Owner: Taylor R.  ·  Project: SandBox                     │
│   [Smartsheet]  [Slack]  [Email]                            │
└─────────────────────────────────────────────────────────────┘
```

### Link Resolution

The system must resolve deep links at render time:

1. Query the source system for the current URL (row IDs can shift in Smartsheet).
2. If the URL resolves to a valid target → show the link.
3. If the URL cannot be resolved → **do not show the Open Task on the dashboard.**
4. Log unresolvable items to `#foundry-bot-log` with reason (row deleted, sheet moved, ID mismatch).

---

## Data Sources

The dashboard reads from:

| Source | What It Provides | Write-Back? |
|---|---|---|
| Open Task index | Items, categories, SLA status, owners, project assignment | **No** |
| Drive log Sheets (6) | Item detail fields, row references for deep links | **No** |
| Smartsheet | Schedule data, budget data, row IDs for deep links | **No** |
| Slack API | Thread timestamps for deep links | **No** |
| Email metadata | Message IDs for deep links | **No** |
| Fieldwire API | Task IDs for deep links | **No** |
| Adaptive Build | Record IDs for deep links | **No** |
| CompanyCam API | Photo IDs for deep links | **No** |
| `#foundry-bot-log` | Audit trail, event timestamps, classifications | **No** |

**Current phase (Phase 2):** The dashboard is a read-only consumer. It creates no data, modifies no data, and has no write path to any system.

**Phase 3 addition:** The dashboard writes interaction events (acknowledgments, risk acceptances, status confirmations) to an internal interaction log and to `#foundry-bot-log`. It does NOT write to any EPC system of record.

---

## What Is NOT on This Dashboard

| Excluded | Why | Phase |
|---|---|---|
| Approve / Resolve / Close | Source system is where work is completed | All current phases |
| Edit source data fields | Source system is the system of record | All current phases |
| Acknowledge (non-blocking items) | Acknowledgment is only meaningful for blocking items | Phase 3 scoping |
| Notification preferences | No configuration surface in v1 | May revisit v2+ |
| Historical charts or trend graphs | Weekly report covers trends; "What's Repeating" covers patterns | May revisit v2+ |
| Draft message preview | Drafts live in Slack threads — deep link goes there | Intentional |
| Bidding/outreach pipeline | Not in scope for v1 — tracked in Slack | May revisit v2+ |
| Probation monitoring data | Separate Kuan-only process | Intentional |
| User or role management | Admin function, not dashboard scope | Intentional |
| Workflow enforcement / gating | Dashboard is visibility and awareness, not control | Phase 4 (preview only) |

---

## Mobile Behavior

- **Primary target:** mobile (phone browser or PWA)
- **Layout:** single-column, stacked cards
- **Tap targets:** minimum 44px (Apple HIG)
- **Deep links:** open in native app if installed (Slack, Gmail, Drive, Smartsheet, Fieldwire), otherwise browser
- **Detail panel:** full-screen slide-over on mobile, side panel on desktop
- **Collapsed sections:** tap section header to expand/collapse
- **Search:** top of screen, always accessible
- **Tabs:** fixed at top, always visible (3 tabs)
- **No horizontal scroll.** All content fits single column.
- **Login:** SSO via Google Workspace. Persistent session (30-day token).

---

## Visual Hierarchy

### Color System

| Color | Meaning | Used For |
|---|---|---|
| Red | Past SLA / failed gate check / critical risk | Overdue border, Flagged invoice, Critical lead-time, count badge |
| Yellow | Due today / pending review / at-risk | Due Today border, Pending Review invoice, At-Risk lead-time, count badge |
| Blue | New / informational | New item border, count badge |
| Green | Passed / cleared / on-track / approved | Cleared invoice, On-Track lead-time, Approved submittal |
| Gray | Monitoring / no action needed | Watching section, Total count, Pending Submission submittal |

### Typography

- **Item ID:** bold, monospace (e.g., **`RFI-044`**)
- **Subject:** regular weight, truncated at 60 characters on mobile (full on desktop)
- **Owner:** regular weight
- **Urgency/SLA:** bold, colored per urgency
- **Category tag:** uppercase, colored background chip
- **Deep links:** underlined, blue, standard link behavior
- **Section headers:** bold, uppercase, with count badge

---

## Phase Upgrade Path (No Rework Required)

### Phase 2 Confirmation (Post-Probation)

If Phase 2 is confirmed on Feb 15, the following additions layer onto the existing layout:

| Addition | Where It Goes | Layout Change |
|---|---|---|
| "Approve & Log" button | Detail panel, below deep links | New element in panel — no card layout shift |
| "Approve & Send" button | Detail panel, below deep links | New element in panel — no card layout shift |
| Status badge (Level 1 write confirmed) | Right side of item card | Small badge — no layout shift |
| Notification badge (Level 2 sent) | Right side of item card | Small badge — no layout shift |
| Banner text change | Top bar | `Phase 2 Active` replaces probation label |

No view restructuring, no column changes, no section reordering, no role changes.

---

## Phase 3 — Limited Interaction (NOT ACTIVE)

**STATUS: NOT ACTIVE. Phase 3 activates only after Phase 2 is confirmed. Kuan must explicitly approve. 7-day probation follows activation.**

**Design Principle (Non-Negotiable):**

> Phase 3 interactions confirm awareness and ownership — they do not replace work.

### Global Phase 3 Rules

1. No auto-approval, auto-resolution, or blocking of work.
2. All state changes are **explicit, logged, and reversible**.
3. Interaction is **additive, not required** — deep links remain the primary path.
4. One interaction button per role. Button appears only when applicable.
5. Every button includes a tooltip: *"This does not resolve the item. Work must be completed in the source system."*

### Banner

```
┌──────────────────────────────────────────────────────────────────┐
│  Limited Interaction Enabled — Phase 3                           │
│  [user name] · [role] · Last updated: [timestamp]                │
└──────────────────────────────────────────────────────────────────┘
```

---

### Interaction 1: PM / Superintendent — Required Acknowledgment

**Button:** `Acknowledge — Working on This`

**Appears on:** Open Tasks in the OVERDUE or DUE TODAY sections where the item is flagged as blocking (blocks a schedule task, blocks another Open Task, or blocks a downstream workflow).

**Behavior:**

| Action | What Happens |
|---|---|
| User taps `Acknowledge — Working on This` | Records: user name, timestamp, item ID |
| Open Task status | **Does NOT change.** Item remains in its current urgency section. |
| Visual indicator | Small `Acknowledged` badge appears on the card (gray, not green) |
| Audit log | Entry written to `#foundry-bot-log`: `ACK | RFI-044 | Jordan M. | 2026-02-18 09:14` |

**Escalation on non-acknowledgment:**

| Condition | Action |
|---|---|
| Blocking item not acknowledged within **X days** (configurable, default: 2 business days) | Auto-escalate: Level 2 (Auto-Notify) posts notice to project channel and tags the owner's manager per RACI |
| Escalation notice | Informational only — does not change item status, does not block work |

**Not allowed:**

- Resolve or close the item
- Dismiss or hide the item
- Edit any fields
- Change the SLA deadline
- Change the blocking flag
- Acknowledge non-blocking items (button does not appear)

**Rollback:** Tap `Undo Acknowledgment` within 60 minutes. After 60 minutes, acknowledgment is permanent (but meaningless — it doesn't change status).

**Purpose:** Confirm human awareness. Reduce the "I didn't see it" failure mode. Acknowledgment is a signal, not a resolution.

---

### Interaction 2: Principal / Owner's Rep — Risk Acceptance / Defer Decision

**Button:** `Accept Risk / Defer`

**Appears on:** Open Tasks in the "What's Repeating" view where the item has a cost impact, schedule impact, or is a pending decision past its decision window.

**Behavior:**

| Action | What Happens |
|---|---|
| User taps `Accept Risk / Defer` | Modal opens with reason selection and optional comment |
| Reason selection (required) | Dropdown: `Awaiting more information` / `Acceptable risk at this stage` / `Deferred to next decision cycle` / `Covered by contingency` |
| Optional comment | Free text, max 280 characters |
| On submit | Records: user name, timestamp, item ID, reason, comment |
| Open Task status | **Does NOT change.** Item remains visible. |
| Visual indicator | `Risk Accepted` badge on the card (amber) with the selected reason as tooltip |
| Open Task visibility | Item moves from its current position to a **Risk Accepted** sub-section at the bottom of the view (visible, not hidden) |
| Audit log | Entry written to `#foundry-bot-log`: `RISK-ACCEPT | DEC-006 | Sam W. | Reason: Deferred to next cycle | 2026-02-18 14:30` |

**Not allowed:**

- Edit the Open Task data (subject, cost, owner, SLA)
- Close or resolve the item
- Override system categorization or risk flags
- Suppress future alerts for this item
- Accept risk on items without cost/schedule impact (button does not appear)

**Rollback:** Tap `Remove Risk Acceptance` at any time. Item returns to its original position. Removal is also logged.

**Purpose:** Make conscious risk ownership explicit. Replace silent delays with documented decisions. The system knows someone saw the risk and chose to defer — this is data, not dismissal.

---

### Interaction 3: Procurement / Ops — Status Confirmation

**Button:** `Confirmed — In Progress`

**Appears on:** Open Tasks in the "Procurement & Delivery" view for Lead Time and Submittal categories that are currently in OVERDUE or DUE TODAY status.

**Behavior:**

| Action | What Happens |
|---|---|
| User taps `Confirmed — In Progress` | Records: user name, timestamp, item ID |
| Open Task status | **Does NOT change.** SLA clock is not affected. |
| Visual indicator | `In Progress` badge on the card (blue) |
| Dashboard behavior | Item remains in its urgency section (OVERDUE stays overdue). Badge signals to other viewers that someone is actively working it. |
| Audit log | Entry written to `#foundry-bot-log`: `CONFIRM-IP | LT-005 | Alex P. | 2026-02-18 10:45` |

**Not allowed:**

- Mark complete or resolved
- Modify lead times, delivery dates, or float calculations
- Change the vendor or PO reference
- Bypass the source system (Smartsheet, submittal register)
- Confirm items that are not in OVERDUE or DUE TODAY (button does not appear)

**Rollback:** Tap `Remove Confirmation` at any time. Badge removed, logged.

**Purpose:** Reduce noise from items that are already being actively worked. Improve signal quality for the rest of the team without hiding risk. An item can be overdue AND in progress — both facts are visible simultaneously.

---

### Phase 3 Interaction Summary

| Role | Button | Appears When | Changes Status? | Changes Visibility? | Logged? | Reversible? |
|---|---|---|---|---|---|---|
| PM / Super | `Acknowledge — Working on This` | Blocking items in Overdue/Due Today | No | Badge only | Yes | Yes (60 min) |
| Principal / Owner's Rep | `Accept Risk / Defer` | Items with cost/schedule impact | No | Moves to Risk Accepted sub-section | Yes | Yes (any time) |
| Procurement / Ops | `Confirmed — In Progress` | Overdue/Due Today lead times & submittals | No | Badge only | Yes | Yes (any time) |

### Explicitly NOT Allowed for Any Role (Phase 3)

| Prohibited Action | Why |
|---|---|
| Resolve / Close an Open Task | Work must be completed in the source system |
| Edit source data (subject, cost, dates, owner) | Source system is the system of record |
| Modify thresholds, SLAs, or rules | Governance lives in the playbook, not the dashboard |
| Suppress or mute future alerts | Every item must remain visible until resolved at source |
| Override system categorization | Classification is an Open Task function, not a user function |
| Any action without an audit log entry | All interactions are logged to `#foundry-bot-log` |

### Phase 3 Card Layout (Updated)

```
┌─────────────────────────────────────────────────────────────┐
│ ■ RFI  ·  RFI-044  ·  5d overdue  ·  BLOCKING    red      │
│   Waterproofing detail at planter                           │
│   Owner: Taylor R.  ·  Project: SandBox                     │
│   [Smartsheet]  [Slack]  [Email]                            │
│                                                             │
│   [Acknowledge — Working on This]                           │
│   ⓘ This does not resolve the item. Work must be completed  │
│     in the source system.                                   │
└─────────────────────────────────────────────────────────────┘
```

After acknowledgment:

```
┌─────────────────────────────────────────────────────────────┐
│ ■ RFI  ·  RFI-044  ·  5d overdue  ·  BLOCKING    red      │
│   Waterproofing detail at planter          [Acknowledged]   │
│   Owner: Taylor R.  ·  Project: SandBox                     │
│   [Smartsheet]  [Slack]  [Email]                            │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3 Data Flow

```
User taps interaction button
  │
  ├─ Dashboard writes to: Open Task interaction log (internal)
  ├─ Dashboard writes to: #foundry-bot-log (audit)
  │
  ├─ Dashboard reads back: badge state, sub-section placement
  │
  └─ Dashboard does NOT write to:
       • Drive Sheets
       • Smartsheet
       • Slack (except bot-log)
       • Email
       • Fieldwire
       • Adaptive Build
       • Any source EPC system
```

The interaction log is dashboard-internal. It does not propagate to any system of record.

### Phase 3 Activation Rules

Phase 3 is not activated unless:

1. Phase 2 is confirmed (probation passed, no revocations)
2. Dashboard v1 is deployed and stable for 7+ days
3. Kuan explicitly approves Phase 3
4. Phase 3 is documented in CLAUDE.md with an activation date
5. A 7-day probation period follows activation

---

## Phase 4 — Status & Resolution (NOT ACTIVE — Preview Only)

**STATUS: NOT ACTIVE. Not designed. Exists only as a directional placeholder.**

Phase 4 would introduce:

| Capability | Description |
|---|---|
| Status change | Users could change Open Task status (e.g., In Progress → Pending → Resolved) |
| Resolution confirmation | Users could mark an Open Task as resolved from the dashboard |
| Workflow gating | Dashboard could block downstream steps until an Open Task is resolved |

**Phase 4 is explicitly excluded from Phase 3.** No status change, no resolution, no gating logic exists in the Phase 3 interaction layer.

Phase 4 design will begin only after Phase 3 is confirmed and Kuan approves planning.

---

## Spec Reference

| Document | Relationship |
|---|---|
| `dashboards-by-role.md` | Predecessor. 7 role dashboards with action buttons. Superseded for v1. Retained for v2+ feature reference. |
| `production-shadow-playbook.md` | Phase 2 rules and probation monitoring. Dashboard does not interact with probation tracking. |
| `open-task-report-template.md` | Weekly report. Dashboard shows live state; weekly report shows the week. Complementary. |
| `pilot-sandbox-config.md` | SandBox project config. Dashboard reads from the 6 log Sheets and Slack channels defined there. |
| `watcher-system.md` | Defines watchers, daily packets, invoice gate. Dashboard visualizes watcher output. |
| `integration-architecture.md` | Full application inventory and data flow. Dashboard deep links target the systems mapped there. |
