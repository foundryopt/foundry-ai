---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Role-Based Dashboards — Design Specification

## Principles

- Mobile-first
- Read-only by default
- Action buttons trigger drafts, not final actions
- Inbox-style, not spreadsheet-style
- No complex navigation trees
- Pulls from: logs (RFI, CO, decision, warranty), Google Drive (documents), Slack events

---

## 1. Project Manager (GC/CM — SHB Inc.)

The PM sees everything that needs action across their project(s).

### Sections

**Action Required (top of screen)**

| Item | Source | Badge Logic |
|---|---|---|
| Open RFIs by priority | RFI log | Red badge if any item past `response_due` |
| Open PCOs / COs | CO log | Yellow badge if any item past SLA window |
| Pre-task readiness items due this week | Construction schedule + checklist | Red badge if checklist incomplete < 3 days before task |
| Pay apps awaiting verification | Pay-app intake | Badge shows count |
| Lead-time risk flags | Lead-time tracker | Red = critical (negative float), Yellow = at-risk (< 14 days) |

**Weekly Summary**

| Metric | Source |
|---|---|
| RFIs opened / closed this week | RFI log |
| COs opened / executed this week | CO log |
| Total open cost exposure (PCOs) | CO log `preliminary_cost` sum |
| Contract sum (current) | CO log `contract_sum_after` latest |
| SLA breaches this week | All logs |

**Daily Action List**

Auto-generated list of today's tasks ranked by urgency:
1. Items overdue (past SLA)
2. Items due today
3. Items due this week
4. FYI / monitoring items

### Actions Available

| Button | What It Does |
|---|---|
| "Draft Escalation" | AI drafts an escalation message per SLA aging rules. PM reviews and sends. |
| "Draft RFI Response Review" | AI pre-fills a response review based on the architect's reply. PM edits and distributes. |
| "Flag for Weekly Report" | Tags the item for inclusion in the weekly summary to Owner's Rep. |

---

## 2. Site Superintendent

The super sees today and tomorrow. No backlog noise.

### Sections

**Today / Tomorrow**

| Item | Source |
|---|---|
| Tasks scheduled today and tomorrow | Construction schedule |
| Pre-task readiness blockers (incomplete checklists) | Readiness checklist |
| Material deliveries expected today | Lead-time tracker |
| Inspections due | Permit / inspection schedule |

**Critical Items**

| Item | Source | Badge Logic |
|---|---|---|
| Open critical RFIs affecting active work areas | RFI log, `priority` = `critical` | Red badge |
| Material QC pending (delivered but not inspected) | Receiving log | Yellow badge |
| Safety items (hazard analyses due, PPE gaps) | Safety checklist | Red badge |

**Recent Deliveries**

| Field | Source |
|---|---|
| Delivery date, PO number, QC status | Receiving log |
| Photo link | CompanyCam |

### Actions Available

| Button | What It Does |
|---|---|
| "Start QC Checklist" | Opens the receiving QC checklist pre-filled with today's delivery PO data. Super completes and signs. |
| "Start Pre-Task Checklist" | Opens a pre-task readiness checklist for the selected task. |
| "Flag Blocker" | Creates a blocking item notification routed to PM. |

---

## 3. Procurement (Builiq Inc.)

Procurement sees supply chain health and pending actions.

### Sections

**Action Required**

| Item | Source | Badge Logic |
|---|---|---|
| Submittals awaiting design approval | Submittal register, `status` = `under-review` | Yellow if past `review_due` |
| Lead-time items at risk or critical | Lead-time tracker, `risk_flag` = `at-risk` or `critical` | Red = critical, Yellow = at-risk |
| Material deliveries pending this week | Lead-time tracker, `projected_delivery_date` | Count badge |
| Damage claims open | Material log | Red if claim > 48 hours without vendor notification |

**Lead-Time Health**

| Metric | Source |
|---|---|
| Total items tracked | Lead-time tracker count |
| On-track / At-risk / Critical | Lead-time tracker by `risk_flag` |
| Average float (days) | Lead-time tracker `float_days` average |

**Submittal Pipeline**

| Status | Count | Avg Days in Status |
|---|---|---|
| Pending | — | — |
| Under review | — | — |
| Revise-resubmit | — | — |
| Approved | — | — |

### Actions Available

| Button | What It Does |
|---|---|
| "Draft Vendor Reminder" | AI drafts a lead-time follow-up email to the vendor. Procurement reviews and sends. |
| "Draft Damage Claim Notice" | AI pre-fills the 48-hour damage claim notice with PO, delivery, and photo data. |
| "Escalate Lead Time" | AI drafts escalation per lead-time escalation rules. Routes to PM. |

---

## 4. Design (SHB Studio)

Design sees what's waiting for their response.

### Sections

**Action Required**

| Item | Source | Badge Logic |
|---|---|---|
| RFIs awaiting response | RFI log, `routed_to` = SHB Studio | Red if past `response_due` |
| Submittals awaiting review | Submittal register, `reviewer` = SHB Studio | Red if past `review_due` |
| Design decisions pending | Decision log, `decision_maker` = SHB Studio | Yellow if > 3 days old |

**Feedback Inbox**

| Item | Source |
|---|---|
| Feedback routed from showroom / leasing | Feedback log, category = design-related |
| High-signal items (3+ mentions) | Feedback log, flagged |

**SLA Summary**

| Metric | Value |
|---|---|
| RFIs: average response time (days) | Calculated from RFI log |
| Submittals: average review time (days) | Calculated from submittal register |
| Items currently overdue | Count |

### Actions Available

| Button | What It Does |
|---|---|
| "Draft RFI Response" | AI pre-fills a response template with the RFI context, drawing refs, and spec section. Designer edits and submits. |
| "Draft Submittal Review" | AI pre-fills the review action fields. Designer marks approved / approved-as-noted / revise-resubmit / rejected. |

---

## 5. Development / Executive (SHB Group)

Executive sees decisions, risk, and money.

### Sections

**Decisions Pending Approval**

| Item | Source | Badge Logic |
|---|---|---|
| Decisions awaiting Owner's Rep sign-off | Decision log, `status` = `pending` or `under-review` | Red if past decision window |
| COs awaiting approval (standard) | CO log, `status` = `priced` | Yellow |
| COs awaiting approval (above threshold) | CO log, `status` = `priced`, `threshold_triggered` | Red |

**Financial Exposure**

| Metric | Source |
|---|---|
| Total open PCO exposure | CO log, sum of `preliminary_cost` where `status` != `closed` |
| Executed COs this month | CO log, count + sum |
| Current contract sum | CO log, latest `contract_sum_after` |
| Pay apps pending authorization | Pay-app log |

**Schedule & Risk**

| Metric | Source |
|---|---|
| Critical lead-time items | Lead-time tracker, `risk_flag` = `critical` |
| SLA breaches this week (all logs) | Aggregated |
| Projects with open "proceed at risk" items | RFI log + CO log |

**Weekly Summary (auto-generated)**

Aggregated across all projects. AI drafts; Owner's Rep reviews before distribution.

### Actions Available

| Button | What It Does |
|---|---|
| "Approve Decision" | Marks decision as approved in the draft. Human confirms and signs. |
| "Request More Info" | Routes the decision back to the originator with Owner's Rep comments. |
| "View Weekly Summary" | AI-generated summary of all project activity. Review and distribute. |

---

## 6. Fund / Investor Relations (Foundry Fund)

Fund sees what affects capital and returns.

### Sections

**Reporting**

| Item | Source |
|---|---|
| Next investor report due date | Reporting calendar |
| Draft investor update (AI-generated) | Decision log + CO log + stabilization metrics |

**Capital Activity**

| Item | Source |
|---|---|
| Draw requests pending | Fund tracking |
| Distributions scheduled | Fund tracking |
| Budget variance flags | Smartsheet budget data |

**Decision Items Affecting Returns**

| Item | Source | Badge Logic |
|---|---|---|
| COs above threshold | CO log | Red |
| Stabilization delays | Lease-up metrics | Yellow if projected slip > 30 days |
| Scope changes with cost impact | Decision log, `cost_impact` > 0 | Yellow |

**Post-Close (Stabilized Projects)**

| Metric | Source |
|---|---|
| Occupancy rate | Lease-up tracker |
| Absorption rate | Lease-up tracker |
| Tenant retention | PM reporting |

### Actions Available

| Button | What It Does |
|---|---|
| "Draft Investor Update" | AI drafts an investor update from project data. Fund manager reviews, edits, and sends via GHL. |
| "View Draw Summary" | Shows current draw schedule and status. |

---

## 7. Property Management / Warranty

PM/Warranty sees building health and open claims.

### Sections

**Warranty Claims**

| Item | Source | Badge Logic |
|---|---|---|
| Open claims by priority | Warranty claim log | Red = emergency/urgent overdue, Yellow = standard overdue |
| Claims awaiting contractor response | Warranty claim log, `status` = `assigned` | Red if past `response_due` |
| Disputed claims | Warranty claim log, `status` = `disputed` | Yellow |

**Upcoming Expirations**

| Item | Source | Badge Logic |
|---|---|---|
| Warranties expiring within 60 days | Warranty inventory | Red if no pre-expiration inspection scheduled |
| Warranties expiring within 30 days | Warranty inventory | Red always |

**Contractor Responsibility**

| Contractor | Open Claims | Avg Response Time | SLA Breaches |
|---|---|---|---|
| [Sub name] | count | days | count |

**Lease-Up (if applicable)**

| Metric | Source |
|---|---|
| Occupancy rate vs target | Lease-up tracker |
| Absorption rate vs target | Lease-up tracker |
| Concession rate | Lease-up tracker |

### Actions Available

| Button | What It Does |
|---|---|
| "Draft Warranty Claim" | AI pre-fills claim log entry from the defect report. PM reviews and logs. |
| "Draft Contractor Notice" | AI drafts a warranty service request to the responsible sub. PM reviews and sends. |
| "Draft Escalation" | AI drafts escalation per warranty SLA rules. PM reviews and sends. |
| "Start Closeout Checklist" | Opens the warranty closeout checklist pre-filled with warranty category and dates. |
