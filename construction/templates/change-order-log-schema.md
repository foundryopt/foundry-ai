---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Change Order Log Schema

## Overview

Defines the standard field structure for the project change order log. Used by SHB Inc. (GC/CM) to track all potential change orders (PCOs) and executed change orders (COs) from identification through close-out. Supports the controls and SLAs defined in `construction/sops/ops-change-order-workflow.md`.

## Fields

| # | Field | Type | Required | Description |
|---|---|---|---|---|
| 1 | `co_number` | string | Yes | Sequential identifier (e.g. `PCO-001`, converts to `CO-001` on execution) |
| 2 | `project` | string | Yes | Project name or code |
| 3 | `description` | string | Yes | Brief description of the change |
| 4 | `reason` | enum | Yes | `owner-request`, `design-change`, `field-condition`, `rfi-response`, `code-regulatory`, `value-engineering` |
| 5 | `originated_by` | string | Yes | Name and company of originator |
| 6 | `date_submitted` | date | Yes | Date PCO was submitted |
| 7 | `status` | enum | Yes | `pco-open`, `pricing`, `priced`, `approved`, `rejected`, `executed`, `directed-pending`, `closed` |
| 8 | `priority` | enum | Yes | `standard`, `expedited` (per SLA table) |
| 9 | `drawing_spec_ref` | string | Yes | Affected drawing number(s) and/or spec section(s) |
| 10 | `linked_rfi` | string | — | RFI number if change originated from an RFI response |
| 11 | `preliminary_cost` | currency | Yes | Initial cost estimate at PCO submission |
| 12 | `final_cost` | currency | — | Final negotiated cost at CO execution |
| 13 | `schedule_impact_days` | integer | Yes | Estimated schedule impact in calendar days |
| 14 | `sub_pricing_due` | date | — | Deadline for subcontractor pricing per SLA |
| 15 | `sub_pricing_received` | date | — | Date all sub pricing was received |
| 16 | `design_confirmed` | date | — | Date design team confirmed scope alignment |
| 17 | `procurement_confirmed` | date | — | Date procurement confirmed lead-time impact |
| 18 | `date_approved` | date | — | Date owner's rep approved the CO |
| 19 | `approved_by` | string | — | Name and role of approver |
| 20 | `date_executed` | date | — | Date all signatures obtained |
| 21 | `date_distributed` | date | — | Date executed CO was circulated |
| 22 | `date_closed` | date | — | Date CO was marked resolved in log |
| 23 | `contract_sum_before` | currency | — | Contract sum before this CO |
| 24 | `contract_sum_after` | currency | — | Contract sum after this CO |
| 25 | `field_directive` | boolean | — | Whether work was directed before formal approval |
| 26 | `notes` | text | — | Escalation history, field directive justification, rejection reason, or other remarks |

## Status Lifecycle

```
pco-open → pricing → priced → approved → executed → closed
                                  ↘
                               rejected → closed
              ↘
         directed-pending → approved → executed → closed
```

## Validation Rules

- `co_number` must be unique per project.
- `co_number` prefix changes from `PCO-` to `CO-` when `status` moves to `executed`.
- `status` cannot move to `approved` without `final_cost`, `design_confirmed`, and `procurement_confirmed`.
- `status` cannot move to `executed` without `date_approved` and `approved_by`.
- `status` cannot move to `closed` without `date_executed` and `date_distributed`.
- `directed-pending` requires `field_directive` = true and a non-empty `notes` field.
- `rejected` requires a non-empty `notes` field documenting the reason.

## Threshold Rules

- COs at or above a defined dollar threshold require SHB Group (Principal) sign-off in addition to owner's rep approval.
- Threshold value is set per project in the project-specific configuration (not defined in this schema).

## Usage Notes

- Copy this schema when setting up a new project change order log.
- Field names use `snake_case` to support future automation and CSV/database interop.
- This schema aligns with the decision gates, SLAs, and controls in `construction/sops/ops-change-order-workflow.md`.
