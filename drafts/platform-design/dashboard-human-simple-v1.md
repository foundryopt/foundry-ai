---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
parallel-to: Phase 2 Probation (ends 2026-02-15)
---

# Human-Simple Open Task Dashboard — v1

**Read-Only — Informational — During Phase 2 Probation**

---

## Design Principle

One surface. One question answered: **"What needs attention today?"**

No buttons that change state. No approve, acknowledge, resolve, or dismiss. Every item links directly to the source system where the human acts. The dashboard is a visibility layer over existing Open Task data — it creates nothing, modifies nothing, enforces nothing.

After probation (Feb 15): if Phase 2 is confirmed, action buttons layer on top of this structure with zero rework. The read-only layout IS the production layout.

---

## Pages

| Page | Purpose | Default? |
|---|---|---|
| **What Needs Attention Today** | Primary view. All Open Tasks ranked by urgency. | Yes — landing page |
| **Invoice Gate** | Invoice pipeline only. Separate because invoices have their own lifecycle and gate checks. | No — secondary tab |

Two pages only. No settings, no profile, no configuration, no preferences.

---

## Page 1: What Needs Attention Today

### Banner

Persistent top bar, always visible:

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚠ READ-ONLY — Informational — During Phase 2 Probation        │
│  SandBox  ·  Last updated: [timestamp]  ·  Source: Open Tasks   │
└──────────────────────────────────────────────────────────────────┘
```

After probation: banner changes to `Phase 2 Active` (no other layout changes).

### Counts Bar

Four counts, always visible below the banner:

```
┌──────────┬──────────┬──────────┬──────────┐
│ Overdue  │ Due Today│   New    │ Total    │
│    3     │    2     │    4     │   18     │
│  (red)   │ (yellow) │  (blue)  │  (gray)  │
└──────────┴──────────┴──────────┴──────────┘
```

Tapping a count scrolls to that section. No filtering — all sections remain visible.

### Sections (in order, top to bottom)

#### Section 1: OVERDUE

Items past SLA. Sorted by days overdue, descending (worst first).

| Column | Source | Example |
|---|---|---|
| Category | Open Task classification | `RFI` |
| Item ID | Log Sheet `item_number` | `RFI-044` |
| Subject | Log Sheet `subject` or email subject | `Waterproofing detail at planter` |
| Owner | RACI — who must act next | `Taylor R.` |
| Days Overdue | Today minus SLA deadline | `5d overdue` |
| Links | Deep links (see Deep Link table) | `[Slack] [Sheet] [Email]` |

Red left-border on every row.

#### Section 2: DUE TODAY

Items with SLA deadline = today. Sorted by category.

Same columns as OVERDUE. Replace "Days Overdue" with:

| Column | Source | Example |
|---|---|---|
| Due | SLA deadline | `Due today` |

Yellow left-border on every row.

#### Section 3: NEW (Last 24h)

Items classified in the last 24 hours. Not yet overdue. Sorted by creation time, newest first.

Same columns as OVERDUE. Replace "Days Overdue" with:

| Column | Source | Example |
|---|---|---|
| SLA | Days until SLA deadline | `6d remaining` |

Blue left-border on every row.

#### Section 4: WATCHING (collapsed by default)

All other open items. Within SLA, no immediate action needed. User taps to expand.

Same columns. Replace "Days Overdue" with:

| Column | Source | Example |
|---|---|---|
| SLA | Days until SLA deadline | `12d remaining` |

Gray left-border. No badge.

### Empty States

| Section | Empty State Text |
|---|---|
| Overdue | `No overdue items.` |
| Due Today | `Nothing due today.` |
| New | `No new items in the last 24 hours.` |
| Watching | `No items in monitoring.` |

All four sections: `All clear. No open tasks.` (shown only when every section is empty.)

---

## Page 2: Invoice Gate

### Banner

Same persistent banner as Page 1.

### Purpose

Shows every invoice currently in the gate pipeline. Invoices have a distinct lifecycle (arrive → extract → check → review → approve/reject → forward) that does not fit cleanly into the urgency-ranked list on Page 1.

Invoices also appear on Page 1 as Open Tasks (category = Invoice). Page 2 adds the gate-specific fields.

### Layout

Single list. Sorted by arrival date, oldest first (longest-waiting at top).

| Column | Source | Example |
|---|---|---|
| Invoice # | AI extraction from PDF/email | `CM-2267` |
| Vendor | AI extraction | `Coastal Mechanical` |
| Amount | AI extraction | `$8,400.00` |
| Arrived | Email receive timestamp | `Feb 7, 8:22 AM` |
| Gate Status | Current pipeline position | `Flagged` |
| Flags | Which checks failed (if any) | `Missing job #` `No CO backing` |
| Links | Deep links | `[Slack] [Email] [Drive]` |

### Gate Status Values

| Status | Meaning | Row Style |
|---|---|---|
| Pending Review | Extracted, awaiting PM review | Yellow left-border |
| Flagged | One or more gate checks failed | Red left-border |
| Cleared | All checks passed, awaiting PM confirm | Green left-border |

### Flag Tags

Shown as tags/chips on the row. Multiple flags possible per invoice.

| Flag | Gate Check |
|---|---|
| `Missing job #` | Job number not found in email or PDF |
| `Missing cost code` | Cost code not found |
| `Over budget` | Invoice amount + existing costs exceed budget line |
| `No CO backing` | Work appears change-related but no executed CO found |
| `Possible duplicate` | Matching vendor + amount + date in last 90 days |

### Empty State

`No invoices in the gate pipeline.`

---

## Deep Links

Every Open Task row includes one-click links to the exact location in the source system. Links open in a new tab/window. No intermediate screens.

| Link Label | Target | URL Pattern | When Shown |
|---|---|---|---|
| **Slack** | The Slack thread where this item was discussed or the draft was posted | `https://{workspace}.slack.com/archives/{channel_id}/p{message_ts}` | Always (every item has a Slack thread) |
| **Sheet** | The exact row in the Drive log Sheet | `https://docs.google.com/spreadsheets/d/{sheet_id}/edit#gid=0&range=A{row}` | When the item exists in a log Sheet |
| **Email** | The source email that created this Open Task | `https://mail.google.com/mail/u/0/#inbox/{message_id}` | When the item originated from email |
| **Doc** | The source document in Drive (attachment, submittal, drawing) | `https://drive.google.com/file/d/{file_id}` | When a document is attached |
| **Fieldwire** | The Fieldwire task (for field-originated items) | `https://app.fieldwire.com/#!/projects/{project_id}/tasks/{task_id}` | When the item was created from Fieldwire |

### Link Display

Links shown as text labels, not icons. Mobile-tap-friendly.

```
RFI-044  ·  Waterproofing detail at planter  ·  Taylor R.  ·  5d overdue
[Slack]  [Sheet]  [Email]
```

Not all links appear on every row. Only show links to sources that exist for that item.

---

## Data Source

The dashboard reads from:

| Source | What It Provides | Write-Back? |
|---|---|---|
| Open Task daily report data | Items, categories, SLA status, owners | **No** |
| `#foundry-bot-log` | Audit trail, timestamps, classifications | **No** |
| Drive log Sheets (6) | Item details, row numbers for deep links | **No** |
| Slack message timestamps | Deep link targets | **No** |
| Email message IDs | Deep link targets | **No** |

The dashboard is a **read-only consumer** of existing data. It creates no data, modifies no data, and has no write path to any system.

---

## What Is NOT on This Dashboard

| Excluded | Why |
|---|---|
| Approve / Acknowledge / Resolve / Dismiss buttons | Read-only during probation. No state changes. |
| Role-based filtering | One view for everyone. Reduces thinking vs. 7 role dashboards. |
| Notification preferences | No configuration surface in v1. |
| Historical charts or trends | Weekly report covers trends. Dashboard = today only. |
| Draft message preview | Drafts live in Slack threads. Deep link goes there. |
| Bidding/outreach pipeline | Not in scope for v1 dashboard. Tracked in Slack. |
| Probation monitoring data | Probation checklist is a separate Kuan-only process. |
| Action buttons of any kind | No interaction that changes state. |

---

## Mobile Behavior

- **Primary target:** mobile (phone browser or PWA)
- **Layout:** single-column, stacked cards
- **Tap targets:** minimum 44px (Apple HIG)
- **Deep links:** open in native app if installed (Slack, Gmail, Drive), otherwise browser
- **Collapsed sections:** tap section header to expand/collapse
- **No horizontal scroll.** All content fits single column.
- **No login during probation.** Dashboard is internal-network-only, pre-authenticated.

---

## Labeling and Visual Hierarchy

### Color System

| Color | Meaning | Used For |
|---|---|---|
| Red | Past SLA / failed gate check | Overdue left-border, Flagged invoice border, count badge |
| Yellow | Due today / pending review | Due Today left-border, Pending Review invoice border, count badge |
| Blue | New / informational | New item left-border, count badge |
| Green | Passed / cleared | Cleared invoice border |
| Gray | Monitoring / no action needed | Watching section, Total count |

### Typography

- **Item ID:** bold, monospace (e.g., **`RFI-044`**)
- **Subject:** regular weight, truncated at 60 characters on mobile (full on desktop)
- **Owner:** regular weight
- **SLA/Days:** bold, colored per urgency
- **Links:** underlined, colored blue, standard link behavior

---

## Post-Probation Upgrade Path (No Rework Required)

If Phase 2 is confirmed on Feb 15, the following additions layer onto this exact layout:

| Addition | Where It Goes | Layout Change |
|---|---|---|
| "Approve & Log" button on log entries | Below the deep links row on applicable items | New row element — no layout shift |
| "Approve & Send" button on draft messages | Below the deep links row on applicable items | New row element — no layout shift |
| Role filter toggle | Top bar, next to counts | Dropdown — no layout shift |
| Item status indicator (Level 1 write confirmation) | Right side of item row | Badge — no layout shift |
| Notification indicator (Level 2 sent) | Right side of item row | Badge — no layout shift |

No page restructuring, no column changes, no section reordering. Buttons add; nothing moves.

---

## Spec Reference

| Document | Relationship |
|---|---|
| `dashboards-by-role.md` | Predecessor. 7 role-based dashboards with action buttons. Superseded by this spec for v1. Role dashboards may return as filtered views in v2+. |
| `production-shadow-playbook.md` | Phase 2 rules and probation monitoring. Dashboard does not interact with probation tracking. |
| `open-task-report-template.md` | Weekly report. Dashboard shows today; weekly report shows the week. No overlap. |
| `pilot-sandbox-config.md` | SandBox project config. Dashboard reads from the 6 log Sheets and Slack channels defined there. |
| `watcher-system.md` | Defines watchers, daily packets, invoice gate. Dashboard visualizes watcher output. |
