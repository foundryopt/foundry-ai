---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Decision Tracking and Escalation

## Purpose

Ensure every project decision requested through the Development Concierge is logged, tracked, and resolved within defined timelines — linking to the project decision log and applying consistent escalation and threshold rules across all functional teams.

## Scope

All active projects managed through the Development Concierge. Covers decisions routed to any functional team (Design, GC, Procurement, Fund Management, Sales/Showroom).

## Decision Log Linkage

All decisions are recorded in the project decision log per `construction/templates/decision-log-schema.md`. The Concierge is responsible for:

- Creating the decision log entry when a decision is requested.
- Populating: `decision_number`, `project`, `subject`, `category`, `requested_by`, `date_requested`, `priority`, `context`, and `decision_maker`.
- Updating status as the decision progresses through review.
- Closing the entry when the decision is communicated and acknowledged.

Cross-references to related systems:

| If the decision involves... | Also update... |
|---|---|
| Scope, cost, or schedule change | Change order log (`construction/templates/change-order-log-schema.md`) |
| Design or specification question | RFI log (`construction/templates/rfi-log-schema.md`) |
| Material or vendor selection | Submittal register (`construction/templates/submittal-register-schema.md`) |
| Payment or financial commitment | Vendor invoice tracker (`construction/templates/vendor-invoice-intake-schema.md`) |

## Procedure

1. **Receive decision request.** Concierge receives a request from the developer, a functional team, or identifies a decision need during status review.
2. **Log in decision log.** Create an entry with all required fields. Assign priority (urgent or standard).
3. **Route to decision maker.** Forward to the appropriate authority per the approval authority table below.
4. **Track against SLA.** Monitor the decision timeline per the SLA table.
5. **Escalate if overdue.** Apply escalation rules below.
6. **Record outcome.** Update the decision log with `decision_outcome`, `date_decided`, and any linked COs or RFIs.
7. **Communicate decision.** Distribute the decision to all affected parties. Record `date_communicated`.
8. **Close entry.** Mark the decision as closed once acknowledged by all parties.

## Escalation Timelines

| Priority | Decision Window | First Escalation | Second Escalation |
|---|---|---|---|
| Urgent (blocks active work) | 48 hours | Concierge → Owner's Rep at 48 hours | Owner's Rep → Principal at 72 hours |
| Standard | 5 calendar days | Concierge → Owner's Rep at 5 days | Owner's Rep → Principal at 8 days |

## Principal Threshold Rules

Decisions requiring SHB Group (Principal) sign-off regardless of urgency:

| Condition | Trigger |
|---|---|
| Cost impact at or above the project-defined CO approval threshold | Per `construction/sops/ops-change-order-workflow.md` |
| Decisions affecting multiple projects or entities | Concierge flags at intake |
| Changes to capital structure or fund terms | Concierge routes to Fund Management + Principal |
| Safety-critical decisions | Immediate notification to Principal; Owner's Rep decides with Principal informed |
| Developer contract modifications | Concierge routes to Owner's Rep + Principal |

## RACI

| Activity | Concierge | SHB Inc. (GC/CM) | SHB Studio (Design) | SHB Group (Owner's Rep) | SHB Group (Principal) | Builiq Inc. (Procurement) |
|---|---|---|---|---|---|---|
| Receive decision request | **R** | — | — | I | — | — |
| Log in decision log | **R** | — | — | I | — | — |
| Route to decision maker | **R** | I | I | I | I | I |
| Provide technical input | — | **R** | **R** | — | — | **R** |
| Make decision (standard) | — | — | — | **R** | I | — |
| Make decision (above threshold) | — | — | — | C | **R** | — |
| First escalation | **R** | I | I | **A** | — | — |
| Second escalation | I | I | I | **R** | **A** | — |
| Communicate decision | **R** | I | I | I | I | I |
| Close entry | **R** | — | — | **A** | — | — |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

## Review Schedule

- Reviewed every 6 months.
- Next review: 2026-08-08.
