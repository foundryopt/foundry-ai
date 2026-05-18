---
status: draft
owner: Kuan
last-reviewed: 2026-05-17
---

# Slack Command Flows — Design Specification

## Principles

- Slack is the **command + review interface**, not a system of record.
- Drafting commands produce a **draft** that requires human review.
- Control & audit commands (Part B) execute platform-state changes (revoke, pause, recall, retract). Each writes to `#foundry-bot-log` with full context.
- Commands are designed for speed: minimal input, maximum pre-fill.
- All outputs link back to the relevant SOP and log schema.

---

## `/rfi` — Draft RFI Entry

**Who uses it:** PM, Superintendent

**Flow:**

```
User types: /rfi

Bot responds:
┌──────────────────────────────────┐
│ 📋 New RFI Draft                 │
│                                  │
│ Project: [dropdown - active]     │
│ Subject: [text input]            │
│ Priority: [critical/high/        │
│            standard/low]         │
│ Drawing/Spec Ref: [text input]   │
│ Location: [text input]           │
│                                  │
│ [Submit Draft]  [Cancel]         │
└──────────────────────────────────┘

On submit:
- AI assigns next sequential RFI number
- AI suggests routing based on spec section
- AI calculates response_due from priority SLA
- Bot posts draft to channel:

  "DRAFT RFI-047 | High | Tile layout vs RCP conflict at lobby
   Routed to: SHB Studio (Design)
   Response due: 2026-02-15
   [Approve & Log]  [Edit]  [Discard]"

On "Approve & Log":
- Human confirms
- Entry is ready for manual logging in RFI log (CSV/Sheets)
- Bot posts confirmation with log entry data to copy
```

---

## `/co` — Draft PCO / CO Summary

**Who uses it:** PM

**Flow:**

```
User types: /co

Bot responds:
┌──────────────────────────────────┐
│ 📋 New Change Order Draft        │
│                                  │
│ Project: [dropdown - active]     │
│ Description: [text input]        │
│ Reason: [dropdown - owner-req/   │
│   design-change/field-condition/ │
│   rfi-response/code-reg/VE]     │
│ Linked RFI: [optional - RFI #]  │
│ Preliminary Cost: [currency]     │
│ Schedule Impact: [days]          │
│ Priority: [standard/expedited]   │
│                                  │
│ [Submit Draft]  [Cancel]         │
└──────────────────────────────────┘

On submit:
- AI assigns next sequential PCO number
- AI flags if cost exceeds project-defined threshold
- Bot posts draft summary to channel:

  "DRAFT PCO-012 | Expedited | Stairwell structural redesign
   Reason: RFI response (RFI-041)
   Est. cost: $45,000 | Schedule: +5 days
   ⚠️ Above threshold — requires Principal sign-off
   [Approve & Log]  [Edit]  [Discard]"
```

---

## `/decision` — Draft Decision Log Entry

**Who uses it:** PM, Concierge

**Flow:**

```
User types: /decision

Bot responds:
┌──────────────────────────────────┐
│ 📋 New Decision Request          │
│                                  │
│ Project: [dropdown - active]     │
│ Subject: [text input]            │
│ Category: [dropdown - scope/     │
│   cost/schedule/design/          │
│   procurement/risk/compliance/   │
│   contract]                      │
│ Priority: [urgent/standard]      │
│ Context: [text area]             │
│ Cost Impact: [optional currency] │
│ Schedule Impact: [optional days] │
│                                  │
│ [Submit Draft]  [Cancel]         │
└──────────────────────────────────┘

On submit:
- AI assigns next sequential decision number
- AI determines approval level (Owner's Rep vs Principal) based on threshold and category
- AI calculates decision window deadline
- Bot posts draft:

  "DRAFT DEC-008 | Standard | Elevator cab finish substitution
   Category: Cost | Impact: -$18,000
   Decision maker: SHB Group (Owner's Rep)
   Decision due: 2026-02-13
   [Approve & Log]  [Edit]  [Discard]"
```

---

## `/warranty` — Draft Warranty Claim

**Who uses it:** Property Management

**Flow:**

```
User types: /warranty

Bot responds:
┌──────────────────────────────────┐
│ 📋 New Warranty Claim            │
│                                  │
│ Project: [dropdown - completed]  │
│ Unit/Location: [text input]      │
│ Defect Description: [text area]  │
│ Category: [dropdown - general/   │
│   roofing/mechanical/plumbing/   │
│   electrical/waterproofing/      │
│   appliance/finish/structural]   │
│ Priority: [emergency/urgent/     │
│            standard]             │
│ Photos taken? [yes/no]           │
│                                  │
│ [Submit Draft]  [Cancel]         │
└──────────────────────────────────┘

On submit:
- AI assigns next sequential claim number
- AI checks warranty expiry from inventory (flags if expired)
- AI identifies responsible contractor from warranty inventory
- AI calculates response_due from priority SLA
- Bot posts draft:

  "DRAFT WC-003 | Urgent | Leaking fixture, Unit 204
   Category: Plumbing | Warranty expires: 2026-09-15
   Contractor: ABC Plumbing
   Response due: 2026-02-10
   [Approve & Log]  [Edit]  [Discard]"
```

---

## `/fund` — Draft Investor Update

**Who uses it:** Fund Manager

**Flow:**

```
User types: /fund

Bot responds:
┌──────────────────────────────────┐
│ 📋 Investor Update Draft         │
│                                  │
│ Fund: [dropdown]                 │
│ Period: [month/quarter]          │
│ Include: [checkboxes]            │
│   ☑ Project status summary      │
│   ☑ CO exposure & budget        │
│   ☑ Stabilization metrics       │
│   ☑ Upcoming milestones         │
│   ☑ Capital activity            │
│                                  │
│ [Generate Draft]  [Cancel]       │
└──────────────────────────────────┘

On submit:
- AI generates a narrative update pulling from:
  CO log (exposure), decision log (key decisions),
  lease-up tracker (stabilization), schedule data
- Bot posts the full draft text for review
- Fund manager edits, then sends via GHL manually

  "DRAFT Investor Update — Foundry Fund I — Q1 2026
   [Full text preview...]
   [Approve]  [Edit]  [Discard]"
```

---

## `/daily` — AI-Generated Daily Summary

**Who uses it:** Any role

**Flow:**

```
User types: /daily

Bot responds with role-appropriate summary:

  "Daily Summary — PM Dashboard — 2026-02-08

   🔴 OVERDUE (3)
   • RFI-041 — 3 days past due (high priority)
   • PCO-009 — sub pricing 3 days late
   • WC-001 — contractor response 1 day late

   🟡 DUE TODAY (2)
   • RFI-047 routing deadline (8hr window)
   • Pre-task checklist for concrete pour (tomorrow)

   🟢 ON TRACK (12)
   • [collapsed list]

   📊 Weekly Totals
   • RFIs: 2 opened, 3 closed
   • COs: 1 PCO created, 0 executed
   • Exposure: $127,000 open

   [View Full Dashboard]  [Flag Item]  [Done]"
```

---

# Part B — Control & Audit Commands

The commands in Part A produce drafts for review. The commands below operate on **platform state**: they revoke authorities, halt watchers, reverse auto-actions, and audit what the platform has done. They are the operational surface for the Circuit Breaker (`CLAUDE.md` §7) and the halt/reversal mechanisms in each authority spec.

Every Part B command writes to `#foundry-bot-log` with actor ID, command, arguments, and timestamp. No Part B command produces a draft for further approval — they execute. Authorization is by role + Slack channel, not by per-command Approve clicks (that would defeat the kill-switch purpose).

---

## `/foundry revoke` — Revoke an Active Authority Level

**Who uses it:** Principal (SHB Group), Owner's Rep (SHB Group), GC/CM lead (SHB Inc., Levels 1–2 only)

**Where:** `#foundry-bot-log` only. Anywhere else → command returns `ERROR: /foundry revoke must be issued in #foundry-bot-log`.

**Flow:**

```
User types: /foundry revoke level-3 reason="adaptive build integration drift detected"

Bot validates:
  • Caller role ∈ allowed-revokers for that level?
  • Channel is #foundry-bot-log?
  • Reason is non-empty (≥ 10 chars)?

If valid → bot posts to #foundry-bot-log (no draft, no Approve):

  ⛔ AUTHORITY REVOKED
  Level: 3 (Auto-Forward Clean Invoice)
  Revoked by: @kuan (SHB Group, Principal)
  Reason: "adaptive build integration drift detected"
  Effective: 2026-05-17 14:23:01 UTC (next polling cycle)
  Audit row: COS-LOG-2026-05-17-0042

Bot updates CLAUDE.md §7 row state to REVOKED (governance commit).
Bot stops the corresponding Open Task agent action at the next polling cycle.

If invalid:
  ❌ Cannot revoke Level 3 — you (@user) are not in the allowed-revokers
     for this level. See CLAUDE.md §7 Circuit Breaker.
```

**Hard rules:**
- The §7 table edit is automatic on successful revoke (a governance commit is pushed by the bot's service account to the `revoke/level-N-YYYY-MM-DD` branch and a PR opened for the auto-merge of governance state). The PR auto-merges after a 60-second cooling window to allow the revoker to cancel by reply.
- Restoration is **not** automatic. Re-activating a revoked level requires a new spec-defined activation flow (see each authority spec's Pilot Activation section).
- Multiple revokes in succession are allowed (defense in depth) — a revoke of an already-revoked level is a no-op that still logs.

---

## `/foundry pause` — Pause a Watcher's Output Without Revoking Authority

**Who uses it:** Any team member, for their own function's watcher.

**Where:** `#foundry-bot-log` or the relevant project channel (`#proj-[name]`, `#procurement`, `#warranty`, `#decisions`).

**Flow:**

```
User types: /foundry pause construction reason="overnight rework; resume tomorrow"

Bot validates:
  • Caller is registered as an internal user for that function?
  • Reason is non-empty (≥ 10 chars)?

If valid:

  ⏸️  WATCHER PAUSED
  Watcher: Construction
  Paused by: @kuan
  Reason: "overnight rework; resume tomorrow"
  Effective: now. Packet generation continues; posting halted.
  Resume with: /foundry resume construction

  Audit row: COS-LOG-2026-05-17-0043
```

**Hard rules:**
- Pause does NOT revoke any authority level. The watcher continues to generate its packet and continues to participate in the COS Daily Packet — only Slack posting is halted.
- Pause is reviewable: pause expires automatically at 23:59 local of the same day unless explicitly extended via `/foundry pause [watcher] extend-until=YYYY-MM-DD`.
- A pause without explicit extension is preferable to a long-running pause; long pauses suggest the issue should be a revoke, not a pause.

---

## `/foundry resume` — Resume a Paused Watcher or Halted Sub-Mode

**Who uses it:** Same caller who paused it, OR any Principal/Owner's Rep.

**Where:** Same channel as the pause was issued, or `#foundry-bot-log`.

**Flow:**

```
User types: /foundry resume construction

Bot validates:
  • Caller is original pauser OR Principal OR Owner's Rep?

If valid:

  ▶️  WATCHER RESUMED
  Watcher: Construction
  Resumed by: @kuan
  Posting resumes at the next packet cadence (next 8:00 AM local).
  Audit row: COS-LOG-2026-05-17-0044

Variants for halted sub-modes (after a Halt trigger fires):

  /foundry resume routine [type]            — Level 1 sub-mode, item-type scope
  /foundry resume ack-reply [template]      — Level 2 sub-mode, template scope
  /foundry resume level-3                   — Level 3 after halt (spec review required for some halt conditions)
  /foundry resume level-5                   — Level 5 after halt (spec review required for most halt conditions)
```

**Hard rules:**
- `resume` for Level 1 routine / Level 2 ack-reply with reversal-counter halts only requires the caller — no spec review.
- `resume` for Level 3 / Level 5 after a Halt condition that says "Spec review required" returns `ERROR: spec review required — see [authority-level-N-...]`. The command will not bypass the spec review gate.
- `resume` for a hard-exclusion bypass on Level 3 or Level 5 returns `ERROR: spec rewrite required` — no command can re-enable until the spec itself changes.

---

## `/foundry recall` — Recall an Auto-Forwarded Invoice (Level 3)

**Who uses it:** Anyone reviewing the Clean Invoice Auto-Forward Digest. Permission: any internal staff for invoices ≤ Principal threshold; Principal required above.

**Where:** Any internal channel, or the COS Daily Packet thread.

**Flow:**

```
User types: /foundry recall INV-2026-05-0123

Bot validates:
  • INV-id exists and was auto-forwarded under Level 3?
  • Within 1-business-day recall window? (else → Principal-required path)
  • Caller is authorized for this invoice's dollar size?

If valid (within window):

  ↩️  INVOICE RECALLED
  Invoice: INV-2026-05-0123
  Vendor: Acme Drywall LLC
  Amount: $4,200
  Recalled by: @kuan
  Adaptive Build action: marked WITHDRAWN
  Drive log: marked RECALLED (audit preserved)
  Reroute: returned to manual Invoice gate
  Audit row: COS-LOG-2026-05-17-0045

  Recall counter: 1 / 5-business-day-window
  (≥ 2 recalls in window → Level 3 auto-halts)

If outside 1-day window:

  ⚠️  Recall requires Principal approval (1-business-day window
      has elapsed). Adaptive Build may have started downstream
      processing.
  → Forward request to: @principal-on-call
```

**Hard rules:**
- One-click recall is **only** for invoices auto-forwarded under Level 3. Manually-forwarded invoices are recalled via Adaptive Build's own withdrawal flow (out of Foundry scope).
- Recall does **not** modify or delete the original invoice record — it adds a `RECALLED` status. Audit trail is permanent.
- The recall counter is global per project, not per vendor. Two recalls in a window halt Level 3 for the whole project, not just for that vendor.

---

## `/foundry retract` — Send Retraction Email (Level 5)

**Who uses it:** Anyone reviewing the Level 5 audit summary. Permission: any internal staff within the 1-hour window; Principal required after.

**Where:** Any internal channel, or the COS Daily Packet thread.

**Flow:**

```
User types: /foundry retract INTAKE-2026-05-17-0089

Bot validates:
  • Intake-id refers to a Level 5 auto-reply that was actually sent?
  • Within 1-hour retraction window? (else → Principal-required path)
  • Caller is authorized?

If valid (within window):

  ↩️  RETRACTION SENT
  Intake: INTAKE-2026-05-17-0089
  Vendor: jane@acmedrywall.com
  Original auto-reply sent: 14:01:33 UTC (52 min ago)
  Retraction template: standard correction
  Retraction sent: 14:53:47 UTC
  Audit row: COS-LOG-2026-05-17-0046

  Retraction counter: 1 / 5-business-day-window
  (≥ 1 retraction in window → Level 5 auto-halts)
  Level 5 status: HALTED — spec review required

If outside 1-hour window:

  ⚠️  Retraction requires Principal approval (1-hour window
      has elapsed). The vendor may have taken action on the
      auto-acknowledgment.
  → Forward request to: @principal-on-call
```

**Hard rules:**
- Retraction sends a separate, fixed-template "this earlier message was sent in error" email. It does **not** delete or recall the original — that's not possible with email.
- A single retraction halts Level 5 (per the authority spec). The command and the halt fire together.
- Retraction for an intake-id that is not a Level 5 auto-reply is rejected. (e.g., trying to retract a human-sent email returns `ERROR: not a Level 5 auto-reply`.)

---

## `/foundry undo` — Reverse an Ack-Reply (Level 2 Sub-Mode)

**Who uses it:** Anyone in the channel where the ack-reply was posted.

**Where:** The thread containing the ack-reply (preferred), or `#foundry-bot-log`.

**Flow:**

```
User types: /foundry undo [thread-ts]

  (or: react to the ack-reply with :undo:)

Bot validates:
  • thread-ts refers to a Level 2 ack-reply posted by Foundry?
  • Caller is an internal user in the channel?

If valid:

  ❌  ACK-REPLY UNDONE
  Channel: #proj-westview
  Thread: [link]
  Original ack-reply (now deleted): "Received. Routing to..."
  Undone by: @kuan
  Replacement: watcher Draft posted for per-item Approve
  Template undone: intake-receipt
  Audit row: COS-LOG-2026-05-17-0047

  Template counter: intake-receipt — 1 reversal today
  (≥ 2 reversals today → template auto-halts)
```

**Hard rules:**
- Undo deletes the bot's ack-reply from Slack. The deletion is logged with the full text of what was deleted.
- The deletion is **always** followed by a watcher Draft posted to the same thread, so the original requester gets a response (just one that's been human-reviewed).
- `:undo:` reaction is the no-typing equivalent of the slash command.

---

## `/foundry reverse` — Reverse an Auto-Logged Row (Level 1 Sub-Mode)

**Who uses it:** Anyone reviewing the Routine Auto-Log Digest.

**Where:** The COS Daily Packet thread, or `#foundry-bot-log`.

**Flow:**

```
User types: /foundry reverse LOG-2026-05-17-0033

  (or: click [Reverse] next to the spot-check sample in the Digest)

Bot validates:
  • LOG-id refers to an auto-logged row from today's Routine digest?
  • Caller is an internal user?

If valid:

  ❌  AUTO-LOG REVERSED
  Log: LOG-2026-05-17-0033
  Sheet: project-westview / Deliveries
  Type: delivery-confirmation
  Original auto-log: "ABC Drywall — 14 sheets — Bay 3 — 9:42 AM"
  Status now: REVERSED (row preserved for audit; not deleted)
  Reversed by: @kuan
  Audit row: COS-LOG-2026-05-17-0048

  Type counter: delivery-confirmation — 1 reversal today
  (≥ 2 reversals today → type auto-halts)
```

**Hard rules:**
- Reverse never deletes the Drive row. It flips the row's status to `REVERSED` and notes the reverser, reason (optional), and timestamp.
- Reverse triggers the type counter; the type's halt threshold is in `authority-level-1-expansion-routine-auto-log.md`.
- Reverse is a one-click action — no `Are you sure?` dialog.

---

## `/foundry status` — Show Current Platform State

**Who uses it:** Any internal user.

**Where:** Any internal channel, or DM with the bot.

**Flow:**

```
User types: /foundry status

Bot responds:

  📊 Foundry Platform Status — 2026-05-17 14:55 UTC

  Phase: 2 (SandBox)
  Active project(s): westview

  Authority Levels:
   • Level 1 (Auto-Log)              ACTIVE   since 2026-02-08
       └─ Routine Auto-Log sub-mode  NOT ACTIVE
   • Level 2 (Auto-Notify)           ACTIVE   since 2026-02-08
       └─ Internal Ack-Reply sub-mode NOT ACTIVE
   • Level 3 (Auto-Forward Invoice)  NOT ACTIVE
   • Level 4 (GHL Draft-to-Send)     NOT ACTIVE
   • Level 5 (Auto-Reply Vendor)     NOT ACTIVE

  Watchers (today):
   • Construction  ▶️ posting  | 12 items in queue | 3 URGENT
   • Procurement   ▶️ posting  |  4 items in queue | 0 URGENT
   • Financial     ▶️ posting  |  7 items in queue | 1 URGENT
   • Warranty      ⏸️ paused   | reason: "overnight rework" (expires 23:59)
   • Executive     ▶️ posting  |  2 items in queue | 0 URGENT

  COS Daily Packet: posted 09:00 UTC — 28 items reviewed today (18 pending)

  Recent Circuit Breaker activity (last 7d):
   • 2026-05-15: /foundry pause warranty by @kuan
   • 2026-05-15: /foundry resume warranty by @kuan
   (no revokes in last 7d)
```

**Hard rules:**
- Read-only. No state change.
- Available to any internal user. Guests get `ERROR: /foundry status is internal-only`.

---

## `/foundry queue` — Show Pending Items Requiring Review

**Who uses it:** Reviewers — any user with an Approval gate role in any function.

**Where:** Any internal channel, or DM with the bot.

**Flow:**

```
User types: /foundry queue [filter?]

  Filters:
    /foundry queue                 — all pending items, all functions
    /foundry queue urgent          — only URGENT
    /foundry queue construction    — items for one watcher
    /foundry queue mine            — items routed to caller

Bot responds with a compact view (mirrors COS Daily Packet Section 5):

  📋 Pending Review — 18 items (3 URGENT)

  URGENT:
   • RFI-047  Tile vs RCP conflict at lobby — Construction — SLA 4h
   • INV-0124 Acme Drywall $12,400 — Financial — Invoice gate
   • WC-003   Leaking fixture Unit 204 — Warranty — SLA 8h

  Standard:
   • [collapsed list of 15] — [Expand]

  → [ Approve all standard ]  [ Drill into URGENT ]  [ Open COS Daily ]
```

**Hard rules:**
- Read-only.
- The `Approve all standard` button is **not** a one-click batch-approve — it opens a multi-row form where each row still requires a per-item check unless the row qualifies under Level 1 Routine Auto-Log (active) — which would have already been auto-logged, so it wouldn't be in the queue.

---

## `/foundry log` — Query the Bot Audit Trail

**Who uses it:** Any internal user. Principal/Owner's Rep get full query; other roles see only their own function.

**Where:** Any internal channel.

**Flow:**

```
User types: /foundry log [filter?]

  Filters:
    /foundry log today                      — everything today
    /foundry log level-3 last-7d            — Level 3 actions only
    /foundry log revoke last-30d            — revokes
    /foundry log recall last-30d            — recalls
    /foundry log vendor=acmedrywall last-7d — vendor-scoped

Bot responds with a paginated table of audit rows linked to the
COS Log Sheet in Drive. Each row links to its source artifact
(email message-id, Slack thread-ts, or invoice in Adaptive Build).
```

**Hard rules:**
- Read-only.
- Audit data is the source of truth for what the bot did; the bot **cannot** issue a `/foundry log` query that hides or filters out its own actions. Self-redaction is impossible.

---

# Command Summary (Combined)

## Part A — Drafting Commands

| Command | Output | Reviewer | Destination After Review |
|---|---|---|---|
| `/rfi` | Draft RFI log entry | PM | Manual entry to RFI log |
| `/co` | Draft PCO/CO log entry | PM | Manual entry to CO log |
| `/decision` | Draft decision log entry | PM or Concierge | Manual entry to decision log |
| `/warranty` | Draft warranty claim entry | Property Mgmt | Manual entry to warranty claim log |
| `/fund` | Draft investor update | Fund Manager | Send via GHL |
| `/daily` | Role-based daily summary | Any | Informational — no log entry |

## Part B — Control & Audit Commands

| Command | Effect | Authorized callers | Scope |
|---|---|---|---|
| `/foundry revoke level-N` | Revokes an active authority level | Principal, Owner's Rep, GC/CM lead (Levels 1–2 only) | `#foundry-bot-log` only |
| `/foundry pause [watcher]` | Halts watcher's Slack posting | Internal user of that function | Any internal channel for that function |
| `/foundry resume [watcher\|sub-mode\|level-N]` | Resumes paused watcher or halted sub-mode | Original pauser, Principal, Owner's Rep | Same channel as pause |
| `/foundry recall INV-id` | Recalls Level 3 auto-forwarded invoice | Internal staff (within 1-day window); Principal (after) | Any internal channel |
| `/foundry retract INTAKE-id` | Sends Level 5 retraction email | Internal staff (within 1-hour window); Principal (after) | Any internal channel |
| `/foundry undo [thread-ts]` | Deletes Level 2 ack-reply, replaces with watcher Draft | Internal user in the channel | The ack-reply's thread |
| `/foundry reverse LOG-id` | Marks Level 1 auto-logged row REVERSED | Internal user | Any internal channel |
| `/foundry status` | Show platform state (phase, levels, watchers, COS) | Any internal user | Any internal channel or DM |
| `/foundry queue [filter]` | Show pending review items | Reviewers | Any internal channel or DM |
| `/foundry log [filter]` | Query audit trail | Any internal user (role-filtered) | Any internal channel |

---

## Constraints (current, as of 2026-05-17)

### Drafting commands (Part A)
- All produce drafts that require human review.
- `Approve & Log` actions now write to Drive Sheets via Level 1 Auto-Log (active since 2026-02-08).
- Drafting commands never send external messages (email, SMS, GHL) — they only draft within Slack.
- Drafting commands never ping clients, investors, or external parties.

### Control & audit commands (Part B)
- Part B commands execute platform-state changes. They do not produce drafts. Authorization is by role + channel.
- Every Part B execution writes to `#foundry-bot-log` and the COS Log Sheet with actor, command, arguments, timestamp.
- Part B commands never bypass the spec-defined halt conditions or activation gates. `/foundry resume level-5` after a hard-exclusion halt returns `ERROR: spec rewrite required` — no command overrides the spec.
- `/foundry retract` is the **only** Part B command that sends external email, and only via the fixed retraction template. There is no `/foundry send-email` command and there will not be one until and unless a future authority level defines it.

### What no command can do
- Approve an invoice inside Adaptive Build.
- Authorize payment.
- Send SMS or make calls.
- Reply to email outside the Level 5 templated auto-reply scope.
- Modify or hide audit-trail rows.
- Restore a revoked authority level (revocation paths re-activate only via spec, not command).

---

## Related Documents

- `CLAUDE.md` — §4 (boundaries), §6 (gates), §7 (Circuit Breaker, authority levels)
- `chief-of-staff-agent.md` — emits review items consumed by `/foundry queue` and `/foundry status`
- `intake-classifier-spec.md` — populates the routing queue surfaced by Part B audit commands
- `authority-level-1-expansion-routine-auto-log.md` — defines `/foundry reverse` and `/foundry resume routine` semantics
- `authority-level-2-expansion-internal-ack-reply.md` — defines `/foundry undo` and `/foundry resume ack-reply` semantics
- `authority-level-3-activation-auto-forward-clean-invoice.md` — defines `/foundry recall` and `/foundry resume level-3` semantics
- `authority-level-5-new-auto-reply-templated-vendor.md` — defines `/foundry retract` and `/foundry resume level-5` semantics
- `slack-workspace-setup.md` — channel architecture, `#foundry-bot-log` placement, member roles
