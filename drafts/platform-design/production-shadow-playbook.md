---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Production Shadow Playbook — SHB EPC Operations

## Purpose

Run Open Tasks alongside live SHB operations for 14 business days. Open Tasks observe, classify, draft, and report — but hold **zero authority**. Humans continue working exactly as they do today. Open Tasks shadow their work and prove (or disprove) value.

Baseline: `sandbox_pilot_v1_baseline.md`

---

## What Is an Open Task

An Open Task is any item the system is tracking that requires human action. Open Tasks are created from intake sources (email, Slack, Drive), checked against SOPs and SLAs, and surfaced in daily reports with recommended next steps and draft messages.

Open Tasks replace the concept of "watchers." There are no autonomous monitors. There is a list of open items, each with an owner, a deadline, and a status. The system maintains this list and reports on it. Humans act on it.

### Open Task Categories (from v1 baseline)

| Category | Source | SLA Reference |
|---|---|---|
| RFI | Email, Slack, Fieldwire | `ops-rfi-intake.md` |
| Change Order | Email, Slack | `ops-change-order-workflow.md` |
| Invoice | Email (`info@`, `shb-studio@adaptive.build`) | `ops-pay-app-and-invoice-approval.md` |
| Decision | Slack, email | `decision-log-schema.md` |
| Submittal | Email, Slack | `ops-submittals-and-lead-time-control.md` |
| Lead Time | Submittal register, vendor email | `ops-submittals-and-lead-time-control.md` |
| Warranty Claim | Email (`support@`) | `ops-warranty-claim-intake-and-resolution.md` |
| Pay App | Email (`shb-studio@adaptive.build`) | `ops-pay-app-and-invoice-approval.md` |
| Pre-Task Readiness | Schedule + Slack | `ops-pre-task-readiness-checklist.md` |
| Expense Report | Email (`shb-studio@adaptive.build`) | `ops-pay-app-and-invoice-approval.md` |

No new categories added beyond v1 baseline.

---

## Operating Rules

1. Open Tasks **observe, classify, draft, and report**. Authority limited to active levels below.
2. Open Tasks **draft only** unless an active authority level applies. Non-authority output is marked DRAFT.
3. Open Tasks **do not send** email, SMS, or GHL actions. **Exception:** Level 2 (Auto-Notify) allows internal Slack notifications (SLA breaches, new items, deliveries).
4. Open Tasks **do not write** to Smartsheet, Adaptive Build, or any SOR. **Exception:** Level 1 (Auto-Log) allows writing to Drive Sheets after human clicks "Approve & Log."
5. Open Tasks **do not block** any existing workflow. If the system is down, work continues unchanged.
6. All Open Task output is logged to `#foundry-bot-log` for audit.
7. Level 1 and Level 2 can be **revoked immediately** during probation (through 2026-02-15).

---

## Daily Runtime Behavior

### Morning Cycle (6:00–8:00 AM, automated)

```
1. SCAN — Read all intake sources since last scan:
   • Email inboxes (4): new messages, replies, attachments
   • Slack channels: commands, thread replies, posts
   • Drive Sheets: log updates, new files
   • Schedule: tasks due today and tomorrow

2. CLASSIFY — For each new item:
   • Assign Open Task category (RFI, invoice, decision, etc.)
   • Extract key fields (vendor, amount, job #, priority, etc.)
   • Detect missing information
   • Check SLA status for all existing Open Tasks

3. COMPILE — Generate daily report:
   • New Open Tasks (created from overnight intake)
   • Updated Open Tasks (status changes, responses received)
   • Overdue Open Tasks (past SLA, ranked by severity)
   • Blocked Open Tasks (awaiting human input)
   • Recommended actions (with draft messages attached)

4. DELIVER — Post daily report:
   • #daily-summaries channel at 8:00 AM
   • Cross-post critical items to project channel
```

### Intraday Behavior

- **No real-time notifications.** Open Tasks batch all observations for the next morning report.
- **Exception:** If a user runs `/daily` in Slack, the system generates an on-demand summary of current Open Task state.
- **No polling or pinging.** The system does not remind, nudge, or follow up between daily reports.

### End-of-Day (5:00 PM, optional)

If the PM runs `/daily`, the system generates an end-of-day summary showing:
- Actions taken today (based on Slack/Drive activity observed)
- Actions still pending
- Items to watch tomorrow

---

## Human Approval Flow

```
Open Task generates output (draft, classification, flag)
  │
  ├─ DRAFT MESSAGE ──→ Posted in Slack thread, marked DRAFT
  │                     Human reads → [Approve & Send] / [Edit] / [Discard]
  │                     If approved: Human copies and sends manually
  │                     Open Task logs the action
  │
  ├─ INVOICE GATE ───→ Extraction + checks posted in Slack
  │                     Human reviews → [Approve to Adaptive Build] / [Edit] / [Reject]
  │                     If approved: Human forwards manually
  │                     Open Task logs the action
  │
  ├─ LOG ENTRY ──────→ Pre-filled entry posted in Slack thread
  │                     Human reviews → [Approve & Log]
  │                     Open Task writes row to Drive Sheet (Level 1: Auto-Log ACTIVE)
  │                     Open Task confirms in thread: "Logged to SANDBOX_rfi-log, row 48"
  │                     Open Task logs the action
  │
  ├─ CLASSIFICATION ──→ Category + confidence posted in Slack thread
  │                      Human confirms or reclassifies
  │                      Open Task updates category
  │
  └─ FLAG / RISK ────→ Risk description + SOP reference posted
                        Human reads and decides whether to act
                        No approval needed — informational only
```

Every path ends with a human action or a human choosing to do nothing. Open Tasks never proceed without confirmation.

---

## Reporting Cadence

| Report | Frequency | Delivered To | Format |
|---|---|---|---|
| Daily Open Task Report | Every business day, 8:00 AM | `#daily-summaries` + project channel | Per daily runtime (section above) |
| Weekly Open Task Report | Friday 4:00 PM | `#daily-summaries` + `#construction-ops` | Per `open-task-report-template.md` |
| On-demand summary | When user runs `/daily` | Requesting channel | Same as daily report, current-state |

No monthly, quarterly, or ad-hoc reports during shadow period.

---

## 14-Day Shadow Schedule

### Week 1 — Observe and Compare

| Day | Focus | Kuan Reviews |
|---|---|---|
| Mon (Day 1) | First production daily report. Compare to v1 baseline Day 1. | Are categories correct? Anything missed? |
| Tue (Day 2) | Observe human response to reports. Note which drafts are opened vs ignored. | Are drafts useful or noise? |
| Wed (Day 3) | First invoice gate test (if invoices arrive). | Did gate catch real issues? False flags? |
| Thu (Day 4) | Mid-week check. Compare SLA breach count to what PM already knew. | Did Open Tasks surface anything new? |
| Fri (Day 5) | First weekly report generated. | Is the weekly format useful? Adjust template? |

### Week 2 — Validate and Measure

| Day | Focus | Kuan Reviews |
|---|---|---|
| Mon (Day 6) | Second week begins. Review Week 1 weekly report with PM. | PM feedback: helpful, neutral, or noise? |
| Tue (Day 7) | Focus on email classification accuracy. Spot-check 10 emails. | Classification accuracy vs 85% target? |
| Wed (Day 8) | Focus on invoice gate. Review all invoices from Week 1. | Did any bypass the gate? Were flags accurate? |
| Thu (Day 9) | Focus on SLA accuracy. Compare Open Task SLA tracking vs PM's own tracking. | Discrepancies? |
| Fri (Day 10) | Second weekly report. Compare Week 1 vs Week 2 metrics. | Trend improving or flat? |

### Days 11–14 — Decision Window

| Day | Focus |
|---|---|
| Mon (Day 11) | Collect written feedback from PM, Super, Procurement lead. |
| Tue (Day 12) | Compile: What Open Tasks caught that would have been missed? |
| Wed (Day 13) | Compile: What Open Tasks got wrong? |
| Thu (Day 14) | Decision meeting: Kuan + PM + Owner's Rep. Go / adjust / pause. |

---

## Shadow Success Criteria (from v1 baseline)

| Metric | Target | How Measured |
|---|---|---|
| Daily report accuracy | > 90% correct | Kuan spot-check vs actual project state |
| Email classification | > 85% first-pass correct | Spot-check 10 emails/week |
| Invoice gate coverage | 100% invoices surfaced | Compare gate log vs Adaptive Build receipts |
| SLA breach detection | 100% breaches flagged within 24h | Compare Open Task flags vs PM knowledge |
| False positives | < 10% of flagged items | Count flags PM dismisses as wrong |
| Zero false approvals | AI never approves anything | Audit `#foundry-bot-log` |
| Zero unsanctioned sends | AI never sends anything | Audit `#foundry-bot-log` |
| PM assessment | "Same or less effort" | Written feedback Day 11 |

---

## Phase 2 — Limited Authority Rules

**STATUS: Level 1 and Level 2 are ACTIVE as of 2026-02-08. Probation ends 2026-02-15. Level 3 and Level 4 remain NOT ACTIVE.**

### Authority Level 1: Auto-Log (ACTIVE — 2026-02-08 — Probation ends 2026-02-15)

Open Tasks write approved entries directly to Drive Sheets via API, eliminating the copy-paste step.

| Condition | Behavior |
|---|---|
| Human clicks "Approve & Log" in Slack | Open Task writes the row to the Drive Sheet |
| Human can edit before approving | Same as today — edit, then approve |
| Open Task confirms in thread | "Logged to SANDBOX_rfi-log, row 48" |
| Rollback | Human can delete the row from the Sheet manually |

**Human still approves. Open Task just executes the paste.**

### Authority Level 2: Auto-Notify (ACTIVE — 2026-02-08 — Probation ends 2026-02-15)

Open Tasks send pre-approved notification messages in Slack channels (not email, not SMS, not external).

| Condition | Behavior |
|---|---|
| SLA breach detected | Open Task posts breach notice to project channel |
| New item classified | Open Task tags the relevant owner in the channel |
| Delivery confirmed | Open Task tags Super for receiving QC |

**Limited to internal Slack notifications. No external messages. No email. No GHL.**

### Authority Level 3: Auto-Forward Invoice (NOT ACTIVE)

If enabled, Open Tasks could forward validated invoices to Adaptive Build after PM clicks "Approve."

| Condition | Behavior |
|---|---|
| All gate checks pass | Open Task presents one-click "Forward to Adaptive Build" |
| PM clicks approve | Open Task forwards via API |
| Any gate check fails | Blocked — human must resolve manually (same as today) |

**Human still approves. Open Task executes the forward.**

### Authority Level 4: GHL Draft-to-Send (NOT ACTIVE)

If enabled, Open Tasks could execute approved outreach via GHL after PM review.

| Condition | Behavior |
|---|---|
| Bidding outreach drafted | PM reviews candidate list + draft messages |
| PM clicks "Approve & Send" | Open Task sends via GHL API |
| Response tracking | Open Task monitors opens/replies, posts updates to Slack |

**Human approves every send. Open Task executes and tracks.**

### Activation Rules

No authority level is activated unless:

1. The 14-day shadow is complete
2. Success criteria are met
3. Kuan explicitly approves the specific authority level
4. The authority is documented in CLAUDE.md with an activation date
5. A 7-day probation period follows activation, during which the authority can be revoked immediately

**Level 1 (Auto-Log) and Level 2 (Auto-Notify) activated 2026-02-08 by Kuan. All 5 conditions met. Probation ends 2026-02-15. Level 3 and Level 4 remain NOT ACTIVE.**
