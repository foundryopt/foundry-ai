---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Decision Log Schema

## Overview

Defines the standard field structure for the project decision log. Used to track all principal/owner approvals, threshold sign-offs, and key project decisions that affect scope, cost, schedule, or risk. Ensures an auditable record of who decided what and when.

## Fields

| # | Field | Type | Required | Description |
|---|---|---|---|---|
| 1 | `decision_number` | string | Yes | Sequential identifier (e.g. `DEC-001`) |
| 2 | `project` | string | Yes | Project name or code |
| 3 | `subject` | string | Yes | Brief description of the decision |
| 4 | `category` | enum | Yes | `scope`, `cost`, `schedule`, `design`, `procurement`, `risk`, `compliance`, `contract` |
| 5 | `requested_by` | string | Yes | Name and entity of the party requesting the decision |
| 6 | `date_requested` | date | Yes | Date the decision was requested |
| 7 | `priority` | enum | Yes | `urgent` (blocks active work), `standard` |
| 8 | `status` | enum | Yes | `pending`, `under-review`, `approved`, `rejected`, `deferred`, `closed` |
| 9 | `context` | text | Yes | Background, options considered, and recommendation |
| 10 | `cost_impact` | currency | — | Estimated cost impact of the decision |
| 11 | `schedule_impact_days` | integer | — | Estimated schedule impact in calendar days |
| 12 | `threshold_triggered` | boolean | — | Whether the decision triggers the project-defined CO approval threshold |
| 13 | `decision_maker` | string | Yes | Role and name of the authorized decision maker |
| 14 | `approval_level` | enum | Yes | `owner-rep` (SHB Group Owner's Rep), `principal` (SHB Group Principal) |
| 15 | `date_decided` | date | — | Date the decision was made |
| 16 | `decision_outcome` | text | — | What was decided and any conditions |
| 17 | `linked_co` | string | — | CO number if the decision resulted in a change order |
| 18 | `linked_rfi` | string | — | RFI number if the decision originated from an RFI |
| 19 | `date_communicated` | date | — | Date the decision was distributed to affected parties |
| 20 | `date_closed` | date | — | Date the decision was marked resolved |
| 21 | `notes` | text | — | Escalation history, conditions, caveats, or follow-up items |

## Status Lifecycle

```
pending → under-review → approved → closed
                       → rejected → closed
                       → deferred → pending (re-opened when ready)
```

## SLA Table

| Priority | Routing Window | Decision Window | Escalation |
|---|---|---|---|
| Urgent | 4 hours | 48 hours | PM escalates to Principal |
| Standard | 24 hours | 5 calendar days | PM sends written reminder; escalates after 7 days |

## Approval Authority

| Condition | Decision Maker |
|---|---|
| Decisions within standard project authority | SHB Group (Owner's Rep) |
| Decisions at or above the project-defined CO approval threshold | SHB Group (Principal) |
| Decisions affecting multiple projects or entities | SHB Group (Principal) |
| Safety-critical decisions | SHB Group (Owner's Rep) with immediate notification to Principal |

## Validation Rules

- `decision_number` must be unique per project.
- `status` cannot move to `closed` without `date_decided` and `decision_outcome`.
- `threshold_triggered` = true requires `approval_level` = `principal`.
- `deferred` requires a non-empty `notes` field explaining the reason and expected re-open date.

## Usage Notes

- Copy this schema when setting up a new project decision log.
- Field names use `snake_case` to support future automation and CSV/database interop.
- Cross-reference with `construction/templates/change-order-log-schema.md` for threshold-triggered decisions.
