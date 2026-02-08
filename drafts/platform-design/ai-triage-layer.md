---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# AI Triage Layer — Design Specification

## Role

AI acts as a **triage and drafting layer**, not a decision-maker. Every AI output is a draft that requires human review before publication or execution.

## Core Capabilities

### 1. SLA Monitoring & Aging

AI continuously monitors all logs and surfaces items approaching or past their SLA windows.

| Log | What AI Monitors | Alert Trigger |
|---|---|---|
| RFI log | `response_due` vs today | 1 day before due, on due date, and each day overdue |
| CO log | SLA windows per priority (standard/expedited) | Same pattern |
| Decision log | Decision window (48h urgent, 5d standard) | Same pattern |
| Warranty claim log | `response_due` per priority | Same pattern |
| Lead-time tracker | `float_days` | At-risk (< 14 days), critical (< 0 days) |
| Submittal register | `review_due` | 2 days before due, on due date, and each day overdue |

**Output format:** Daily aging summary per role, delivered to the role's dashboard and optionally to Slack.

### 2. Missing Document Detection

AI scans for incomplete records based on schema validation rules.

| Check | Source | Flag |
|---|---|---|
| RFI closed without `response_summary` | RFI log | "Incomplete closure — missing response summary" |
| CO executed without `final_cost` | CO log | "Incomplete execution — missing final cost" |
| Pay app without lien waiver on file | Pay-app checklist | "Missing lien waiver — payment blocked" |
| Warranty claim without `photo_evidence` | Warranty claim log | "Missing photo evidence" |
| Pre-task checklist incomplete < 3 days before task | Readiness checklist | "Readiness blocker — checklist incomplete" |
| Submittal approved without lead-time confirmation | Submittal register + lead-time tracker | "Missing lead-time entry" |

### 3. Draft Generation

AI drafts the following document types. All drafts are presented to the human for review and editing before any action.

| Draft Type | Trigger | Pre-filled From | Reviewer |
|---|---|---|---|
| **RFI escalation message** | RFI past SLA | RFI log entry, aging rules, RACI | PM |
| **RFI response review** | Architect response received | RFI log entry, response text, drawing refs | PM |
| **CO summary** | PCO created or CO priced | CO log entry, linked RFIs, sub pricing | PM |
| **Escalation notice** | Any SLA breach | Relevant log entry, aging rules, RACI | PM or Concierge |
| **Decision brief** | Decision requested | Decision log entry, context, options, cost/schedule impact | Concierge |
| **Pay-app review notes** | Pay app received | Pay-app checklist, CO log, contract sum | PM |
| **Warranty claim entry** | Defect reported | Warranty claim log schema, warranty inventory | Property Mgmt |
| **Warranty service request** | Claim assigned to contractor | Claim log entry, contractor contact, SLA | Property Mgmt |
| **Investor update** | Reporting cadence trigger | CO exposure, schedule status, stabilization metrics | Fund Manager |
| **Daily summary** | End of day | All logs, by role | Each role |
| **Weekly summary** | End of week | All logs, aggregated | PM → Owner's Rep |

### 4. Request Classification

When a request arrives (via Slack, email, or manual entry), AI classifies it:

| Input Signal | Classification | Routed To |
|---|---|---|
| Question about drawings, specs, or design intent | **RFI** | PM to log and route per RFI SOP |
| Scope, cost, or schedule deviation | **Change Order (PCO)** | PM to log per CO SOP |
| Defect report from tenant or field | **Warranty Claim** | Property Mgmt to log per warranty SOP |
| Approval needed from Owner's Rep or Principal | **Decision** | Concierge to log per decision tracking SOP |
| Field task or coordination item | **Task** | Superintendent or PM per pre-task readiness SOP |
| Material or vendor issue | **Procurement** | Builiq Inc. per submittal/lead-time SOP |

AI presents the classification with confidence level. Human confirms or reclassifies before routing.

### 5. Log Entry Pre-fill

When a new log entry is needed, AI pre-fills the entry from available context:

| Log | Pre-filled Fields | Human Completes |
|---|---|---|
| RFI log | `rfi_number` (next sequential), `date_submitted`, `project`, `priority` (suggested) | `subject`, `drawing_spec_ref`, `location`, `routed_to` |
| CO log | `co_number` (next sequential), `date_submitted`, `project`, `linked_rfi` (if applicable) | `description`, `reason`, `preliminary_cost`, `schedule_impact_days` |
| Decision log | `decision_number` (next sequential), `date_requested`, `project`, `category` (suggested) | `subject`, `context`, `decision_maker` |
| Warranty claim log | `claim_number` (next sequential), `date_reported`, `project` | `unit_location`, `defect_description`, `category`, `priority` |

## Constraints (Enforced)

- AI never writes directly to a system of record
- AI never sends a message without human confirmation
- AI never approves, closes, or authorizes
- AI never accesses QuickBooks, Connecteam, or financial systems
- AI never triggers CRM automations or marketing sends
- All drafts are labeled "DRAFT — awaiting review" until human confirms
