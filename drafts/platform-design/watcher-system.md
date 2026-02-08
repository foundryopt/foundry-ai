---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Watcher System — Design Specification

## Concept

AI is **not a PM**. AI acts as **function-level watchers** — specialized monitors that observe a single domain, check against SOPs and SLAs, draft responses, surface decisions, and wait for human approval.

Each watcher:

- Monitors intake from email, Slack, and Drive
- Checks against SOPs, SLAs, and budgets
- Drafts responses and review prompts
- Surfaces decisions to the right human
- Recommends next steps
- **Waits for human approval before any action**

Humans remain accountable for every decision and every action.

---

## Watchers (Pilot)

| Watcher | Domain | Primary Sources | Outputs To |
|---|---|---|---|
| **Construction** | RFIs, COs, pre-task readiness | RFI log, CO log, email (project inbox), Slack | PM Dashboard, `#proj-[name]`, `#construction-ops` |
| **Procurement** | Submittals, lead times, material QC | Submittal register, lead-time tracker, email (`info@shb.studio`), Slack | Procurement Dashboard, `#procurement` |
| **Financial** | Invoices, pay apps, budget exposure | Email (`info@shb.studio`, `shb-studio@adaptive.build`), CO log, budget data | PM Dashboard (invoice queue), `#proj-[name]` |
| **Warranty** | Claims, warranty expiry, contractor response | Warranty claim log, email (`support@shb.studio`), Slack | `#warranty`, `#proj-[name]` |
| **Executive** | Decisions, cost exposure, SLA breaches | Decision log, CO log, all watcher summaries | Executive Dashboard, `#decisions` |

Each watcher operates independently. Watchers do not chain — they surface items and wait.

---

## Email as First-Class Intake

### Why

Email is the **most trusted source of truth** in current operations. Invoices, RFIs, submittals, warranty reports, and vendor correspondence arrive via email before they appear anywhere else. The watcher system must treat email as a primary input.

### Email Inboxes (Pilot)

| Inbox | Function | Watcher | Typical Content |
|---|---|---|---|
| `project-name@shb.studio` | Project-specific communication | Construction | RFIs, field issues, sub coordination, owner requests |
| `info@shb.studio` | General intake | Financial / Procurement | Invoices, vendor inquiries, misc correspondence |
| `support@shb.studio` | Warranty and maintenance | Warranty | Defect reports, tenant complaints, contractor follow-up |
| `shb-studio@adaptive.build` | Expenses and pay apps | Financial | Pay apps, expense reports, Adaptive Build routing |

### AI Responsibilities (Email)

For each incoming email, the relevant watcher must:

1. **Read metadata** — sender, subject line, date, attachment names
2. **Classify intent** — invoice, RFI, decision request, warranty claim, submittal, vendor inquiry, general correspondence
3. **Detect missing information** — no job number, no cost code, no PO reference, no approval attached
4. **Draft a human review prompt** — not an auto-forward

Example review prompt:

```
NEW EMAIL — Financial Watcher
From: vendor@example.com
Subject: Invoice #4521 — Electrical rough-in
Attachments: invoice-4521.pdf

Classification: INVOICE
Extracted: Vendor: ABC Electric | Amount: $12,400 | Job #: not found | Cost code: not found

Missing: Job number, cost code
Budget check: Cannot verify without job number

Action required:
  [ ] Confirm job number: ___
  [ ] Confirm cost code: ___
  [ ] Approve send to Adaptive Build
  [ ] Reject / request more info
```

### Rules

- No automatic routing without human approval
- No automatic forwarding
- AI reads metadata and attachments for classification only
- AI does not reply to external senders
- All email actions are logged to `#foundry-bot-log`

---

## Invoice Intake Gate

### Current Problem

Invoices go directly to Adaptive Build with **no PM validation**. This means:

- Invoices may be coded to the wrong job
- Cost codes may be missing or wrong
- No budget check before entry
- No CO backing verified for change-related work

### New Rule (Pilot)

Every invoice must pass through an **AI Intake Gate** before reaching Adaptive Build.

### Gate Flow

```
Invoice arrives (email to info@shb.studio or shb-studio@adaptive.build)
  → Financial Watcher detects invoice
  → AI extracts:
      • Vendor name
      • Invoice number
      • Amount
      • Job number (if present)
      • Cost code (if present)
      • PO reference (if present)
  → AI checks:
      • Budget availability (if job # and cost code found)
      • Executed CO status (if cost relates to change work)
      • Duplicate detection (same vendor + amount + date)
  → AI produces PM review prompt:
      "Invoice from [vendor] for $[amount]"
      "Job #: [found/not found]"
      "Cost code: [found/not found]"
      "Budget status: [available/over/cannot verify]"
      "CO backing: [verified/not found/not applicable]"
      "Approve send to Adaptive Build? [Yes / Edit / Reject]"
  → PM reviews and confirms
  → Only after human approval: invoice is forwarded to Adaptive Build
```

### Invoice Gate Controls

| Check | Pass Condition | Fail Action |
|---|---|---|
| Job number present | Extracted or confirmed by PM | PM must enter manually |
| Cost code present | Extracted or confirmed by PM | PM must enter manually |
| Budget available | Cost code total + invoice < budget line | Flag: "Over budget — requires approval" |
| CO backing (if applicable) | Executed CO exists for the work | Flag: "No executed CO — payment blocked per SOP" |
| Duplicate check | No matching vendor + amount + date in last 90 days | Flag: "Possible duplicate — review" |

---

## Daily Review Packet (Mandatory)

Each watcher generates a **Daily Review Packet** every business day. This is the primary output of the watcher system.

### Format

```
[WATCHER NAME] — Daily Review Packet — [DATE]

NEW ITEMS (since last report)
  • [item type] [number] — [subject] — [source]
  • ...

BLOCKED (awaiting human input)
  • [item type] [number] — [what's needed] — [days waiting]
  • ...

RISKS (vs SOP / budget / SLA)
  • [item] — [risk description] — [SOP reference]
  • ...

RECOMMENDED ACTIONS
  • [action description] — [draft attached: yes/no]
  • ...

DRAFT MESSAGES (not sent — requires approval)
  • [recipient] — [subject] — [type: escalation/reminder/notice]
  • ...
```

### Delivery

- **Primary:** Slack channel (project channel for Construction/Procurement/Warranty; `#decisions` for Executive)
- **Optional:** DM to the responsible human (if configured)
- **Optional:** Email archive (for record)

### Rules

- One packet per watcher per business day
- Delivered by 8:00 AM local time
- No real-time spam — watchers batch observations, not stream them
- If nothing new: packet says "No new items. [N] items in monitoring."
- Draft messages are attached but **never sent** — human must approve and send

---

## Watcher Constraints (Hard Rules)

1. Watchers **observe and draft**. They do not act.
2. Watchers **wait for human approval** before any routing, forwarding, or posting.
3. Watchers **do not send email, SMS, or external messages** under any circumstances.
4. Watchers **do not write to systems of record** (Drive Sheets, Smartsheet, Adaptive Build, QBO).
5. Watchers **do not create, close, or modify items** in any tool.
6. Watchers **log every action** to `#foundry-bot-log` (audit trail).
7. Watchers **cite the SOP** when flagging a risk or recommending an action.
8. Watchers **do not chain** — one watcher's output does not automatically trigger another watcher's action.

---

## Watcher vs. Previous "AI Triage Layer"

The watcher model refines the AI triage layer (see `ai-triage-layer.md`) with three key changes:

| Previous (AI Triage Layer) | Current (Watcher System) |
|---|---|
| Single monolithic triage function | Function-level watchers with distinct domains |
| Slack and Drive as primary inputs | Email added as first-class intake source |
| No invoice validation | Invoice intake gate before Adaptive Build |
| Summaries generated on command (`/daily`) | Daily review packets generated automatically by each watcher |
| Reactive (responds to commands) | Proactive (monitors and surfaces without being asked) |

The constraints are identical: draft only, human gates, no execution authority.
