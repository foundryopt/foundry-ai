---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Slack Command Flows — Design Specification

## Principles

- Slack is the **command + review interface**, not a system of record.
- Every command produces a **draft** that requires human review.
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

## Command Summary

| Command | Output | Reviewer | Destination After Review |
|---|---|---|---|
| `/rfi` | Draft RFI log entry | PM | Manual entry to RFI log |
| `/co` | Draft PCO/CO log entry | PM | Manual entry to CO log |
| `/decision` | Draft decision log entry | PM or Concierge | Manual entry to decision log |
| `/warranty` | Draft warranty claim entry | Property Mgmt | Manual entry to warranty claim log |
| `/fund` | Draft investor update | Fund Manager | Send via GHL |
| `/daily` | Role-based daily summary | Any | Informational — no log entry |

## Constraints

- All commands produce drafts, never final entries
- "Approve & Log" means the entry is ready to be manually logged — the bot does not write to systems of record
- Bot never sends external messages (email, SMS, GHL) — it only drafts within Slack
- Bot never pings clients, investors, or external parties
