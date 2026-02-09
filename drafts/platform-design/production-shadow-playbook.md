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

### Activation Rules (Phase 2)

No Phase 2 authority level is activated unless:

1. The 14-day shadow is complete
2. Success criteria are met
3. Kuan explicitly approves the specific authority level
4. The authority is documented in CLAUDE.md with an activation date
5. A 7-day probation period follows activation, during which the authority can be revoked immediately

**Level 1 (Auto-Log) and Level 2 (Auto-Notify) activated 2026-02-08 by Kuan. All 5 conditions met. Probation ends 2026-02-15. Level 3 and Level 4 remain NOT ACTIVE.**

---

## Phase 3 — Limited Dashboard Interaction (NOT ACTIVE)

**STATUS: NOT ACTIVE. Phase 3 activates only after Phase 2 is confirmed (probation passed). Full spec in `dashboard-human-simple-v1.md`.**

Phase 3 adds role-specific, low-risk interaction buttons to the dashboard. Interactions confirm awareness and ownership — they do not replace work.

### Phase 3 Interactions

| Role | Interaction | Button | Changes Status? | Changes Visibility? |
|---|---|---|---|---|
| PM / Superintendent | Required Acknowledgment | `Acknowledge — Working on This` | No | Badge only |
| Principal / Owner's Rep | Risk Acceptance / Defer | `Accept Risk / Defer` | No | Moves to Risk Accepted sub-section |
| Procurement / Ops | Status Confirmation | `Confirmed — In Progress` | No | Badge only |

### Phase 3 Global Rules

1. No auto-approval, auto-resolution, or blocking of work.
2. All interactions are **explicit, logged, and reversible**.
3. Interaction is **additive, not required** — deep links remain primary.
4. One interaction button per role. Button appears only when applicable.
5. Dashboard interactions write to `#foundry-bot-log` only — **no write to any EPC system of record**.
6. Non-acknowledgment of blocking items auto-escalates via Level 2 (Auto-Notify) after X business days (configurable, default: 2).

### Phase 3 Prohibited Actions (All Roles)

- Resolve / Close an Open Task
- Edit source data
- Modify thresholds, SLAs, or rules
- Suppress future alerts
- Override system categorization
- Any action without an audit log entry

### Phase 3 Activation Rules

Phase 3 is not activated unless:

1. Phase 2 is confirmed (probation passed, no revocations)
2. Dashboard v1 is deployed and stable for 7+ days
3. Kuan explicitly approves Phase 3
4. Phase 3 is documented in CLAUDE.md with an activation date
5. A 7-day probation period follows activation, during which interactions can be disabled immediately

---

## Phase 4 — Status & Resolution (NOT ACTIVE — Preview Only)

**STATUS: NOT ACTIVE. Not designed. Exists only as a directional placeholder. Phase 4 cannot activate until Phase F produces a "Proceed" recommendation.**

| Capability | Description |
|---|---|
| Status change | Users could change Open Task status from the dashboard |
| Resolution confirmation | Users could mark an Open Task as resolved |
| Workflow gating | Dashboard could block downstream steps until resolution |

**Phase 4 is explicitly excluded from Phase 3. No design work begins until Phase 3 is confirmed, Phase F passes, and Kuan approves planning.**

---

## Phase F — Live Human Pilot (NOT ACTIVE)

**STATUS: NOT ACTIVE. Full spec in `phase-f-live-human-pilot.md`.**

Phase F validates dashboard instrumentation with real humans and real data. It determines **whether KPI visibility should ever exist**. No metrics, scores, or rankings are shown to any user during Phase F.

| Parameter | Value |
|---|---|
| Pilot users | 2–3 (PM + Super/Procurement + optional Principal/Owner's Rep) |
| Data sources | Smartsheet (read-only), Slack (metadata only), Dashboard (view events) |
| Duration | 7 calendar days minimum |
| Collects | Event counts, error frequencies, ordering patterns, ambiguity cases |
| Does NOT collect | Response times, rankings, scores, KPIs |

### Phase F Prerequisites

1. Phase 2 probation confirmed (Level 1 + Level 2 active, no revocations)
2. Dashboard v1 deployed and stable
3. Dashboard instrumentation (Phase E) complete and tested against mock data
4. Kuan explicitly approves Phase F activation
5. Pilot user consent obtained per protocol in `phase-f-live-human-pilot.md`

### Phase F Exit Criteria

All must be true to proceed:
1. Error rate <1% by day 7
2. No pilot user discomfort
3. "What counts as a response" is explainable in plain English
4. >80% of tracked tasks have clean or minor-gap timelines
5. Top ambiguity patterns have identified fixes

### Phase F → Phase G

Phase F produces one of three recommendations: **Proceed**, **Adjust Definitions**, or **Pause KPI Concept**. Phase G (KPI visibility design) is only initiated on a "Proceed" recommendation.

---

## Probation Monitoring — Level 1 + Level 2 (2026-02-08 through 2026-02-15)

### Revocation Triggers (any one = immediate revoke)

| Trigger | Applies To | How Detected |
|---|---|---|
| Write without human "Approve & Log" click | Level 1 | Audit `#foundry-bot-log` — every write must have a matching approval event |
| Write to wrong Sheet or wrong row | Level 1 | Spot-check Drive Sheets daily against bot-log |
| Duplicate row written | Level 1 | Compare row count in Sheet vs write count in bot-log |
| Data in Sheet does not match approved entry | Level 1 | Spot-check 3 entries/day against Slack thread |
| Notification sent to external channel or DM | Level 2 | Audit `#foundry-bot-log` — all notifications must target internal project channels |
| Notification for non-qualifying event (not SLA breach, not new item, not delivery) | Level 2 | Review notification content in bot-log |
| Notification tags wrong owner | Level 2 | Compare tagged user to RACI for that item |
| Notification volume exceeds 10/day | Level 2 | Count daily notifications in bot-log |

### Daily Probation Checklist (Kuan, 5 min)

```
[ ] Review #foundry-bot-log for all Level 1 writes since yesterday
    - Count writes: ___
    - Count matching approvals: ___
    - Mismatches: ___

[ ] Spot-check 3 Drive Sheet entries against Slack approval threads
    - Entry 1: ☐ correct  ☐ wrong
    - Entry 2: ☐ correct  ☐ wrong
    - Entry 3: ☐ correct  ☐ wrong

[ ] Review #foundry-bot-log for all Level 2 notifications since yesterday
    - Count notifications: ___
    - False notifications: ___
    - Wrong owner tagged: ___

[ ] Any team complaints about noise or incorrect notifications?
    ☐ None  ☐ Yes → describe: _______________

[ ] Revocation needed?
    ☐ No — continue probation
    ☐ Yes, Level 1 → reason: _______________
    ☐ Yes, Level 2 → reason: _______________
```

### Probation Log

| Date | L1 Writes | L1 Errors | L2 Notifs | L2 Errors | Notes | Reviewed |
|---|---|---|---|---|---|---|
| 2026-02-08 | | | | | Day 1 | [ ] Kuan |
| 2026-02-09 | | | | | | [ ] Kuan |
| 2026-02-10 | | | | | | [ ] Kuan |
| 2026-02-11 | | | | | | [ ] Kuan |
| 2026-02-12 | | | | | | [ ] Kuan |
| 2026-02-13 | | | | | | [ ] Kuan |
| 2026-02-14 | | | | | | [ ] Kuan |
| 2026-02-15 | | | | | Probation ends | [ ] Kuan |

### End-of-Probation Decision (2026-02-15)

| Outcome | Condition | Action |
|---|---|---|
| **Confirm** | Zero revocation triggers fired, team feedback neutral-to-positive | Remove probation dates from CLAUDE.md, mark authorities as permanent |
| **Extend** | Minor issues found but fixable | Extend probation 7 days, document fixes |
| **Revoke Level 1** | Data accuracy or unauthorized write issues | Revert CLAUDE.md Section 4+6+7, revert playbook Level 1 to NOT ACTIVE |
| **Revoke Level 2** | Noise complaints or false notification issues | Revert CLAUDE.md Section 4+7, revert playbook Level 2 to NOT ACTIVE |
| **Revoke Both** | Systemic trust issue | Full revert to shadow-only mode |
