---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Submittal Register Schema

## Overview

Defines the standard field structure for the project submittal register. Used by SHB Inc. (GC/CM) to track all submittals from initiation through approval. Supports the controls defined in `procurement/sops/ops-submittals-and-lead-time-control.md`.

## Fields

| # | Field | Type | Required | Description |
|---|---|---|---|---|
| 1 | `submittal_number` | string | Yes | Sequential identifier (e.g. `SUB-001`) |
| 2 | `project` | string | Yes | Project name or code |
| 3 | `spec_section` | string | Yes | Specification section reference |
| 4 | `description` | string | Yes | Brief description of the submittal item |
| 5 | `type` | enum | Yes | `shop-drawing`, `product-data`, `sample`, `mock-up`, `test-report`, `certificate`, `closeout` |
| 6 | `submitted_by` | string | Yes | Subcontractor or vendor name |
| 7 | `date_submitted` | date | Yes | Date submittal was received by PM |
| 8 | `priority` | enum | Yes | `critical` (on critical path), `standard`, `closeout` |
| 9 | `status` | enum | Yes | `pending`, `under-review`, `approved`, `approved-as-noted`, `revise-resubmit`, `rejected`, `closed` |
| 10 | `reviewer` | string | Yes | Party responsible for review (typically SHB Studio) |
| 11 | `date_routed` | date | Yes | Date submittal was forwarded to reviewer |
| 12 | `review_due` | date | Yes | Calculated from priority SLA |
| 13 | `date_reviewed` | date | — | Date review was completed |
| 14 | `review_action` | enum | — | `approved`, `approved-as-noted`, `revise-resubmit`, `rejected` |
| 15 | `review_comments` | text | — | Reviewer's comments or markup reference |
| 16 | `resubmit_number` | integer | — | Resubmission count (0 for initial) |
| 17 | `date_resubmitted` | date | — | Date of most recent resubmission |
| 18 | `date_approved_final` | date | — | Date of final approval (after any resubmissions) |
| 19 | `lead_time_days` | integer | — | Manufacturing/fabrication lead time after approval |
| 20 | `required_on_site` | date | — | Date material is needed on site |
| 21 | `linked_rfi` | string | — | RFI number if submittal triggered an RFI |
| 22 | `linked_co` | string | — | CO number if submittal is related to a change order |
| 23 | `notes` | text | — | Escalation history, coordination notes, or other remarks |

## Status Lifecycle

```
pending → under-review → approved → closed
                       → approved-as-noted → closed
                       → revise-resubmit → pending (resubmission)
                       → rejected → closed
```

## SLA Table

| Priority | Routing Window | Review Window | Resubmit Window | Escalation |
|---|---|---|---|---|
| Critical | 24 hours | 5 calendar days | 3 calendar days | PM escalates to Owner's Rep and design principal |
| Standard | 48 hours | 10 calendar days | 5 calendar days | PM sends written reminder; escalates after 14 days |
| Closeout | 48 hours | 14 calendar days | 7 calendar days | PM sends written reminder |

## Validation Rules

- `submittal_number` must be unique per project.
- `review_due` is auto-calculated: `date_routed` + review window per SLA.
- `status` cannot move to `closed` without `date_reviewed` and `review_action`.
- `revise-resubmit` increments `resubmit_number` and resets the review clock on resubmission.
- `date_approved_final` is set only when `review_action` is `approved` or `approved-as-noted` with no further resubmissions pending.

## Usage Notes

- Copy this schema when setting up a new project submittal register.
- Field names use `snake_case` to support future automation and CSV/database interop.
- Cross-reference `lead_time_days` and `required_on_site` with `procurement/templates/lead-time-tracker-schema.md` for procurement coordination.
