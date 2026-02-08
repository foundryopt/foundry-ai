---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Integration Architecture

## Purpose

Map how Slack (interface), Google Drive (system of record), AI (triage/drafting), and existing tools connect. This is the wiring diagram for the platform.

---

## System Layers

```
┌─────────────────────────────────────────────────────┐
│                    HUMAN LAYER                       │
│  PM  |  Super  |  Procurement  |  Design  |  Exec  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            INTAKE LAYER (Email + Slack)              │
│                                                     │
│  EMAIL INBOXES                                      │
│  project-name@shb.studio    (project comms)         │
│  info@shb.studio            (general / invoices)    │
│  support@shb.studio         (warranty)              │
│  shb-studio@adaptive.build  (expenses / pay apps)   │
│                                                     │
│  SLACK INTERFACE                                    │
│  Slash commands    Notifications    Summaries       │
│  /rfi /co /decision /submittal /warranty /fund      │
│  Draft → Review → Approve                           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│          WATCHER LAYER (Function-Level AI)           │
│                                                     │
│  Construction ── RFIs, COs, pre-task readiness      │
│  Procurement ─── submittals, lead times, QC         │
│  Financial ───── invoices, pay apps, budget          │
│  Warranty ────── claims, expiry, contractor          │
│  Executive ───── decisions, exposure, SLA breaches   │
│                                                     │
│  Each watcher: monitors → checks SOPs → drafts      │
│  → surfaces decisions → WAITS for human approval    │
│                                                     │
│  Daily Review Packet: mandatory output per watcher  │
│                                                     │
│  ⚠️  NEVER: approve, execute, send, or delete       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│          GOOGLE DRIVE (System of Record)             │
│                                                     │
│  Project folders (per drive-project-structure.md)   │
│  Log Sheets (RFI, CO, decision, submittal, etc.)    │
│  Documents (contracts, submittals, pay apps, etc.)  │
│                                                     │
│  AI reads. Humans write.                            │
│  (Future: AI writes to Sheets via API with gate)    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│          DOWNSTREAM TOOLS (AI Does Not Write)        │
│                                                     │
│  Adaptive Build ── invoices (after PM gate only)    │
│  Fieldwire ────── field tasks, drawings             │
│  OpenSpace ────── 360 walkthroughs                  │
│  CompanyCam ───── site photos                       │
│  Smartsheet ───── budgets, schedules (temp SOR)     │
│  QBO ──────────── accounting (no AI access)         │
│  Connecteam ───── workforce (no AI access)          │
│  GHL ──────────── CRM, marketing, investor comms    │
│  GitHub ─────────  SOPs, schemas, CLAUDE.md         │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow by Workflow

### RFI Lifecycle

```
Field identifies issue
  → Super or PM runs /rfi in Slack
  → AI pre-fills: number, date, suggested priority, suggested routing
  → PM reviews draft in Slack thread
  → PM clicks "Approve & Log"
  → PM copies formatted row to Drive RFI Log Sheet
  → PM routes to Design (tags in Slack or emails)
  → Design responds (uploads to Drive 02-design/rfi-responses/)
  → Design posts in Slack thread: "Response attached"
  → AI detects response, drafts review notes for PM
  → PM reviews, distributes resolution
  → PM updates Drive RFI Log Sheet: status → closed
  → AI confirms closure in Slack thread
```

### Change Order Lifecycle

```
Change identified (from RFI, field condition, or owner request)
  → PM runs /co in Slack
  → AI pre-fills: number, date, linked RFI, suggested reason
  → AI flags if preliminary cost exceeds threshold
  → PM reviews draft, clicks "Approve & Log"
  → PM copies to Drive CO Log Sheet
  → PM solicits sub pricing (via Slack thread or email)
  → Procurement confirms lead-time impact in thread
  → Design confirms scope in thread
  → PM updates Sheet: status → priced
  → PM routes to Owner's Rep for approval (tags in #decisions)
  → Owner's Rep approves (replies in thread or signs in Drive)
  → PM updates Sheet: status → approved → executed
  → PM distributes executed CO
  → AI updates daily summary
```

### Decision Request

```
Decision needed (from any source)
  → PM or Concierge runs /decision in Slack
  → AI pre-fills: number, date, suggested category, approval level
  → AI calculates decision deadline from priority SLA
  → Draft posted to #decisions + project channel
  → Owner's Rep (or Principal if threshold) reviews
  → Owner's Rep replies with decision
  → Concierge logs in Drive Decision Log Sheet
  → AI drafts communication to affected parties
  → Human distributes
```

### Submittal Lifecycle

```
Sub prepares submittal package
  → PM or Procurement runs /submittal in Slack
  → AI pre-fills: number, spec section, suggested reviewer
  → PM uploads package to Drive 02-design/submittals/
  → PM copies entry to Drive Submittal Register Sheet
  → Design reviews (downloads from Drive, marks up, re-uploads)
  → Design posts action in Slack: "Approved as noted"
  → PM updates Sheet
  → On approval: Procurement confirms lead time
  → Procurement updates Drive Lead-Time Tracker
  → AI monitors float and flags risk
```

### Warranty Claim

```
Tenant or PM reports defect
  → Property Mgmt runs /warranty in Slack
  → AI pre-fills: number, date, checks warranty expiry, identifies contractor
  → AI flags if warranty is expired (handle outside this process)
  → PM reviews draft, clicks "Approve & Log"
  → PM copies to Drive Warranty Claim Log Sheet
  → GC identifies responsible sub, issues service request
  → PM coordinates access
  → Contractor repairs
  → PM verifies, updates Sheet: status → resolved → closed
```

### Invoice Intake (via Email Gate)

```
Invoice arrives (email to info@shb.studio or shb-studio@adaptive.build)
  → Financial Watcher detects invoice email
  → AI extracts: vendor, amount, job #, cost code, PO reference
  → AI checks: budget availability, executed CO status, duplicate detection
  → AI posts PM review prompt in Slack:
      "Invoice from [vendor] for $[amount]"
      "Job #: [found / not found]"
      "Cost code: [found / not found]"
      "Budget: [available / over / cannot verify]"
      "CO backing: [verified / not found / n/a]"
  → PM reviews: confirms job #, cost code, approves
  → Only after human approval: invoice forwarded to Adaptive Build
  → Financial Watcher logs action to #foundry-bot-log
```

**No invoice reaches Adaptive Build without PM validation.**

### Investor Update

```
Reporting cadence triggers (monthly or quarterly)
  → Fund Manager runs /fund in Slack
  → AI generates draft update from: CO exposure, decisions, stabilization data
  → Draft posted in #fund
  → Fund Manager edits
  → Fund Manager copies to GHL and sends
  → Fund Manager replies "sent" in Slack thread
```

---

## AI Read Sources (Pilot)

During the pilot, AI reads from these sources to generate drafts and summaries:

| Source | How AI Accesses | What AI Reads |
|---|---|---|
| Email (inboxes) | Email API (read-only — metadata + attachments) | Sender, subject, date, attachment names, body text for classification. Inboxes: `project-name@shb.studio`, `info@shb.studio`, `support@shb.studio`, `shb-studio@adaptive.build` |
| Google Sheets (logs) | Google Sheets API (read-only) | RFI log, CO log, decision log, submittal register, lead-time tracker, warranty claim log |
| Google Drive (files) | Google Drive API (read-only) | File names and metadata for reference links. Does not read document contents unless explicitly configured. |
| Slack (messages) | Slack Events API | Commands, thread replies, channel messages (for context in classifications) |
| GitHub (SOPs) | Direct file read | SOP rules, SLA tables, RACI matrices, schema definitions |

AI does **not** read from: QuickBooks, Connecteam, Fieldwire, OpenSpace, CompanyCam, or GHL.

AI does **not** reply to, forward, or send email. Email is read-only intake.

---

## Human Gates (Where AI Stops)

Every workflow has explicit points where AI stops and a human must act:

| Gate | What AI Produces | What Human Does |
|---|---|---|
| **Draft gate** | Pre-filled log entry in Slack | Human reviews, edits, approves |
| **Log gate** | Formatted row for copy-paste | Human pastes into Drive Sheet |
| **Route gate** | Suggested routing per RACI | Human confirms and tags/sends |
| **Escalation gate** | Drafted escalation message | Human reviews and sends |
| **Approval gate** | Summary for decision maker | Human approves or rejects |
| **Invoice gate** | Extracted invoice data + budget/CO check | Human confirms job #, cost code, approves forwarding to Adaptive Build |
| **Send gate** | Drafted external message | Human copies to GHL/email and sends |
| **Close gate** | Suggested closure entry | Human verifies and updates Sheet |

---

## Future State (Post-Pilot, If Approved)

| Current (Pilot) | Future (If Validated) |
|---|---|
| Copy-paste from Slack to Sheets | AI writes to Sheets via API (with human approve button) |
| Manual notifications | Automated Slack notifications on Sheet changes |
| Separate tool logins | Single Slack-based entry point for all workflows |
| Manual CompanyCam/Fieldwire reference | API integration for auto-linking photos and tasks |
| Manual GHL sends | Draft-to-send pipeline with one-click approval |

**No future state is implemented until the pilot validates the workflow and Kuan explicitly approves.**
