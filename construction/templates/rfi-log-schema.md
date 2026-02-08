---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# RFI Log Schema

## Overview

Defines the standard field structure for the project RFI log. Used by SHB Inc. (GC/CM) to track all RFIs from submission through close-out. Supports the controls and SLAs defined in `construction/sops/ops-rfi-intake.md`.

## Fields

| # | Field | Type | Required | Description |
|---|---|---|---|---|
| 1 | `rfi_number` | string | Yes | Sequential identifier (e.g. `RFI-001`) |
| 2 | `project` | string | Yes | Project name or code |
| 3 | `subject` | string | Yes | Brief description of the question |
| 4 | `submitted_by` | string | Yes | Name and company of originator |
| 5 | `date_submitted` | date | Yes | Date RFI was received by PM |
| 6 | `priority` | enum | Yes | `critical`, `high`, `standard`, `low` (per SLA table) |
| 7 | `status` | enum | Yes | `open`, `routed`, `responded`, `closed`, `proceeded-at-risk` |
| 8 | `drawing_spec_ref` | string | Yes | Affected drawing number(s) and/or spec section(s) |
| 9 | `location` | string | Yes | Location on site (grid, floor, area) |
| 10 | `routed_to` | string | Yes | Discipline and party responsible for response |
| 11 | `date_routed` | date | Yes | Date RFI was forwarded to responsible party |
| 12 | `response_due` | date | Yes | Calculated from priority SLA |
| 13 | `date_responded` | date | — | Date response received from responsible party |
| 14 | `responded_by` | string | — | Name and company of responder |
| 15 | `response_summary` | text | — | Brief summary of the response |
| 16 | `revision_issued` | string | — | Drawing/spec revision number if applicable |
| 17 | `date_distributed` | date | — | Date answered RFI was circulated |
| 18 | `date_closed` | date | — | Date RFI was marked resolved in log |
| 19 | `cost_impact` | boolean | — | Whether the response triggered a PCO |
| 20 | `linked_pco` | string | — | PCO number if cost impact exists |
| 21 | `schedule_impact_days` | integer | — | Estimated schedule impact in calendar days |
| 22 | `notes` | text | — | Escalation history, proceed-at-risk details, or other remarks |

## Status Lifecycle

```
open → routed → responded → closed
                    ↘
              proceeded-at-risk → closed
```

## Validation Rules

- `rfi_number` must be unique per project.
- `date_routed` must be within the routing window for the assigned `priority`.
- `response_due` is auto-calculated: `date_routed` + response window per SLA.
- `status` cannot move to `closed` without `date_responded` and `response_summary` (unless `proceeded-at-risk`).
- `proceeded-at-risk` requires a non-empty `notes` field documenting the justification.

## Usage Notes

- Copy this schema when setting up a new project RFI log.
- Field names use `snake_case` to support future automation and CSV/database interop.
- This schema aligns with the SLA table and controls in `construction/sops/ops-rfi-intake.md`.
