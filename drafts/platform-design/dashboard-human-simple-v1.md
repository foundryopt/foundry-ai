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

Four views, accessible as tabs on a single surface. No separate pages, no navigation menu, no sidebar.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Interactive View — Read-Only Authority (Phase 2 Probation)                  │
│  [user name] · [role] · Last updated: [timestamp]                            │
├──────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│ Attention Today  │ What's Repeating│ Procurement &   │ Cost · Time · Quality │
│ (active tab)     │                 │ Delivery        │                       │
└──────────────────┴─────────────────┴─────────────────┴───────────────────────┘
```

Views 1–3 are Open Task action views (unchanged). View 4 provides visual context from Smartsheet.

---

## Context Strip (All Views)

A thin summary ribbon appears below the banner on every view. Three numbers — one per dimension — provide at-a-glance project health without leaving the action view. Tapping any cell navigates to the full Cost · Time · Quality tab.

```
┌───────────────────────┬───────────────────────┬───────────────────────┐
│ Budget: 78% spent     │ Schedule: On track    │ Quality: 92% current  │
│ +$108K potential      │ +4d potential          │ 3 items pending       │
│ (from 5 open tasks)   │ (from 3 open tasks)   │ (from 3 open tasks)   │
└───────────────────────┴───────────────────────┴───────────────────────┘
```

| Cell | Top Line | Bottom Line | Source |
|---|---|---|---|
| **Budget** | Actuals as % of budget | Potential cost exposure from unresolved Open Tasks | Smartsheet budget + CO log |
| **Schedule** | Current vs baseline status | Potential delay days from unresolved Open Tasks | Smartsheet schedule + Open Task impacts |
| **Quality** | % of specs/drawings at current revision | Count of pending submittals/RFIs affecting documents | Smartsheet doc register + submittal register |

**"Potential" values come only from unresolved Open Tasks.** They are labeled "potential" and never appear approved or committed. The strip shows the Open Task count that generates each potential value.

**Read-only.** No interaction except navigation to the full tab.

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

## View 4: Cost · Time · Quality

**Available to:** All roles (no default — accessed via tab)

**Scope:** Per-project. If user has multiple projects, a project selector appears at the top. Principal/Owner's Rep see an aggregated view with per-project drill-down.

**Purpose:** Provide visual context for Open Task decisions. Open Tasks tell you WHAT needs attention. Cost · Time · Quality tells you WHY it matters. All data sourced from Smartsheet as the data modeling layer.

**Read-only. No edits, no approvals, no write-back.**

---

### Section 1: Cost (Planned / Actual / Potential)

#### Macro View (default)

Stacked bar chart showing three values per cost category:

```
Budget vs Actuals vs Potential

Site Work        ████████████░░░░░░▓▓▓
Structural       ████████████████░░░
Mechanical       ██████████░░░░░░░░▓▓▓▓▓
Electrical       ████████████████░
Plumbing         ██████████████░░░▓
Finishes         ████████░░░░░░░░░░▓▓
General Cond.    ████████████████████

█ = Actual   ░ = Remaining Budget   ▓ = Potential (from Open Tasks)
```

| Bar Segment | Definition | Source | Color |
|---|---|---|---|
| **Actual** | Costs committed and invoiced | Smartsheet budget actuals + Adaptive Build | Solid blue |
| **Remaining Budget** | Budget minus actuals | Smartsheet budget | Light gray |
| **Potential** | Unresolved Open Task cost exposure | CO log (`preliminary_cost` where status != `closed`) + Decision log (`cost_impact` where status = `pending`) + Invoice gate (flagged amounts) | Amber, hatched pattern |

**Potential values:**
- Come **only** from unresolved Open Tasks
- Labeled `Potential (X open tasks)` on hover/tap
- Never appear as approved or committed
- Shown with hatched/striped pattern to visually distinguish from actuals

**Summary row above chart:**

| Metric | Value | Source |
|---|---|---|
| Original Budget | `$4,215,000` | Smartsheet budget baseline |
| Current Contract Sum | `$4,233,400` | Smartsheet budget + executed COs |
| Spent to Date | `$3,287,000` (78%) | Smartsheet actuals |
| Open Commitments | `$412,000` | Smartsheet committed costs |
| Potential Exposure | `$108,600` (from 5 open tasks) | Unresolved CO + Decision Open Tasks |

#### Micro View (on click)

Tapping a bar drills down to a per-cost-code table:

| Column | Source | Example |
|---|---|---|
| Cost Code | Smartsheet budget | `03 30 00 — Cast-in-Place Concrete` |
| Budget | Smartsheet budget | `$285,000` |
| Actual | Smartsheet actuals | `$241,200` |
| Committed | Smartsheet committed | `$32,000` |
| Remaining | Budget - Actual - Committed | `$11,800` |
| Potential | Unresolved Open Task cost impact mapped to this code | `$18,400 (PCO-011)` |
| Status | Calculated | `Over` (red) / `At Risk` (yellow) / `On Track` (green) |
| Links | Deep links to Smartsheet budget row | `[Smartsheet]` |

**Potential column links to the Open Task(s)** that generate the exposure. Tapping the potential value navigates to View 1, filtered to that Open Task.

---

### Section 2: Time (Planned / Actual / Potential)

#### Macro View (default)

Horizontal milestone bars showing planned vs actual progress for major phases:

```
Phase Milestones — Planned vs Actual

Foundations      ████████████████ ✓ Complete
Structural       ████████████████ ✓ Complete
Rough-In         █████████████░░░░ (82%, 3d behind)
Drywall          ░░░░░░░░░░░░░░░░ (not started, on track)
Finishes         ░░░░░░░░░░░░░░░░ (not started)
Punch / Close    ░░░░░░░░░░░░░░░░ (not started)

█ = Actual progress   ░ = Remaining
```

| Bar Segment | Definition | Source | Color |
|---|---|---|---|
| **Actual** | Work completed | Smartsheet schedule (% complete) | Solid green (complete) or blue (in progress) |
| **Remaining** | Work not yet done | Smartsheet schedule | Light gray |
| **Potential Delay** | Days of delay from unresolved Open Tasks | Open Tasks with `schedule_impact` field | Red marker at the projected end |

**Potential delay indicator:**

If unresolved Open Tasks have schedule impact, a red marker appears at the projected completion showing the potential slip:

```
Rough-In   █████████████░░░░│▓ (+4d potential from 3 open tasks)
```

**Summary row above chart:**

| Metric | Value | Source |
|---|---|---|
| Baseline Completion | `Jun 15, 2026` | Smartsheet baseline schedule |
| Projected Completion | `Jun 18, 2026` (+3d) | Smartsheet current schedule |
| Potential Additional Delay | `+4d` (from 3 open tasks) | Unresolved RFI/CO/Lead Time Open Tasks with schedule impact |
| Critical Path Float | `2d` | Smartsheet CPM |
| Activities In Progress | `12` | Smartsheet schedule |
| Activities Behind Schedule | `3` | Smartsheet schedule |

#### Micro View (on click)

Tapping a phase bar drills down to a Gantt-style activity list for that phase:

| Column | Source | Example |
|---|---|---|
| Activity | Smartsheet schedule | `Interior framing — Level 2` |
| Planned Start | Smartsheet baseline | `Feb 10` |
| Planned Finish | Smartsheet baseline | `Feb 28` |
| Actual Start | Smartsheet actual | `Feb 12` |
| Projected Finish | Smartsheet current | `Mar 3 (+3d)` |
| % Complete | Smartsheet | `45%` |
| Float | Smartsheet CPM | `-2d` (red) / `0d` (yellow) / `5d` (green) |
| Potential Impact | Unresolved Open Tasks affecting this activity | `RFI-044 (+2d)` |
| Links | Deep link to Smartsheet row | `[Smartsheet]` |

**Potential Impact column links to the Open Task(s).** Tapping navigates to View 1, filtered to that Open Task.

**Gantt bar display:** Simple horizontal bars only. No dependency arrows, no resource leveling, no editing. This is a read-only visualization of Smartsheet schedule data.

---

### Section 3: Quality (Planned / Actual / Potential)

#### Macro View (default)

Stacked bar or pie showing document currency across three states:

```
Document Status by Type

Drawings     ████████████████████░░░░▓▓
             72 issued  |  18 pending  |  6 superseded

Specifications ██████████████████████░░▓
               48 in-use | 8 pending   | 2 under revision

Submittals   ████████████████░░░░▓▓▓▓▓▓
             34 approved | 8 under review | 14 pending

QC Records   ████████████████████░░
             28 complete | 6 pending
```

| Segment | Definition | Source | Color |
|---|---|---|---|
| **Current / Issued / Approved** | Documents at latest revision and approved for use | Smartsheet drawing register + submittal register | Solid green |
| **Pending / Under Review** | Documents awaiting action | Smartsheet registers + submittal register | Yellow |
| **Potential** | Documents affected by unresolved Open Tasks (RFIs that may change drawings, submittals in revise-resubmit, specs under revision) | Open Tasks linked to document IDs | Amber, hatched pattern |

**Potential values:**
- Come **only** from unresolved Open Tasks
- Example: RFI-044 references Drawing A-201 → Drawing A-201 shows a `Potential revision` indicator
- Labeled `Potential (X open tasks)` on hover/tap
- Never appear as approved or final

**Summary row above chart:**

| Metric | Value | Source |
|---|---|---|
| Total Documents Tracked | `186` | Smartsheet registers |
| Current / In-Use | `172` (92%) | Smartsheet |
| Pending Action | `14` | Smartsheet |
| Affected by Open Tasks | `8` (from 6 open tasks) | Open Task → document cross-reference |
| Submittals Approved | `34 of 56` (61%) | Submittal register |
| Submittals Overdue | `3` | Submittal register vs SLA |

#### Micro View (on click)

Tapping a bar segment drills down to a document list:

**Drawings Drill-Down:**

| Column | Source | Example |
|---|---|---|
| Drawing # | Smartsheet drawing register | `A-201` |
| Title | Smartsheet | `Floor Plan — Level 2` |
| Current Revision | Smartsheet | `Rev C` |
| Status | Smartsheet | `Issued` (green) / `Superseded` (gray) / `Pending Revision` (yellow) |
| Affected By | Unresolved Open Tasks referencing this drawing | `RFI-044` (amber badge) |
| Issued Date | Smartsheet | `Jan 15, 2026` |
| Links | Deep link to Smartsheet row | `[Smartsheet]` |

**Submittals Drill-Down:**

| Column | Source | Example |
|---|---|---|
| Submittal # | Submittal register | `SUB-013` |
| Description | Submittal register | `Cabinet shop drawings` |
| Spec Section | Submittal register | `06 41 16` |
| Status | Submittal register | `Approved` / `Under Review` / `Revise-Resubmit` / `Pending` |
| Review Due | Submittal register | `Feb 5` |
| Days in Status | Calculated | `8d` |
| Affected By | Unresolved Open Tasks | `RFI-048` |
| Links | Deep links | `[Smartsheet] [Drive]` |

**Specs Drill-Down:**

| Column | Source | Example |
|---|---|---|
| Spec Section | Smartsheet spec register | `06 41 16 — Architectural Casework` |
| Status | Smartsheet | `In Use` / `Under Revision` / `Pending Addendum` |
| Current Version | Smartsheet | `Addendum 3` |
| Affected By | Unresolved Open Tasks | `RFI-044, SUB-013` |
| Links | Deep link to Smartsheet row | `[Smartsheet]` |

---

### Open Task → Cost / Time / Quality Mapping

Every Open Task in Views 1–3 may link to Cost, Time, or Quality context in View 4. The mapping is:

| Open Task Category | Cost Mapping | Time Mapping | Quality Mapping |
|---|---|---|---|
| RFI | Cost impact field → cost code | Schedule impact → activity | Drawing/spec reference → document |
| Change Order | Preliminary cost → cost code | Schedule impact → activity | Spec sections affected |
| Decision | Cost impact → cost code | Schedule impact → activity | — |
| Invoice | Amount → cost code | — | — |
| Submittal | — | Lead time → delivery → activity | Spec section → document |
| Lead Time | — | Float → activity dependency | — |
| Warranty | Repair cost → cost code | — | Defect → document reference |
| Pay App | Amount → cost code | — | — |

This mapping enables the **"Potential" calculations** across all three dimensions. An Open Task's potential impact appears in the dimension(s) it affects.

### Chart Rules

| Rule | Requirement |
|---|---|
| Chart type | Simple only: bar, stacked bar, horizontal bar, pie, progress bar |
| Default view | Macro (chart) — always show summary first |
| Drill-down | Micro (table) — on click only |
| Interactivity | Click to drill, hover for tooltips. No drag, no zoom, no pan. |
| "Potential" label | Always labeled. Never appears as approved or committed. Hatched/striped pattern. |
| Open Task link | Every potential value links back to the generating Open Task(s) in Views 1–3 |
| Edits | None. No data entry, no adjustments, no overrides. |
| Write-back | None. All updates happen in Smartsheet. |
| Refresh | Same as dashboard — data refreshed each morning cycle + on-demand |

### Empty States

| Section | Text |
|---|---|
| Cost | `No budget data available. Budget must be set up in Smartsheet.` |
| Time | `No schedule data available. Schedule must be set up in Smartsheet.` |
| Quality | `No document register data available. Registers must be set up in Smartsheet.` |
| All three empty | `Project context data is not yet configured in Smartsheet.` |

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

| Source | What It Provides | Used By | Write-Back? |
|---|---|---|---|
| Open Task index | Items, categories, SLA status, owners, project assignment | Views 1–3, Context Strip | **No** |
| Drive log Sheets (6) | Item detail fields, row references for deep links | Views 1–3 detail panels | **No** |
| Smartsheet — Budget | Cost codes, budgets, actuals, committed costs, forecasts | View 4 Cost, Context Strip | **No** |
| Smartsheet — Schedule | Activities, milestones, baseline/actual dates, float, % complete | View 4 Time, Context Strip | **No** |
| Smartsheet — Drawing Register | Drawing numbers, revisions, issue dates, status | View 4 Quality | **No** |
| Smartsheet — Spec Register | Spec sections, versions, addenda, status | View 4 Quality | **No** |
| Smartsheet — Row IDs | Deep link targets for all Smartsheet data | Deep links, View 4 drill-down | **No** |
| Slack API | Thread timestamps for deep links | Deep links | **No** |
| Email metadata | Message IDs for deep links | Deep links | **No** |
| Fieldwire API | Task IDs for deep links | Deep links | **No** |
| Adaptive Build | Record IDs for deep links, invoice/expense data | Deep links, View 4 Cost actuals | **No** |
| CompanyCam API | Photo IDs for deep links | Deep links | **No** |
| `#foundry-bot-log` | Audit trail, event timestamps, classifications | Audit | **No** |

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
| Time-series trend charts (month-over-month, quarter-over-quarter) | Cost · Time · Quality shows current state, not historical trends. Weekly report covers trends. | May revisit v2+ |
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
- **Tabs:** fixed at top, always visible (4 tabs). On mobile, 4th tab may scroll horizontally if screen width < 375px.
- **Charts:** rendered as SVG or Canvas. Tap-to-drill on mobile (no hover). Chart labels sized for mobile readability.
- **Context Strip:** always visible below banner, compact (3 lines tall). Tappable to navigate to View 4.
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
