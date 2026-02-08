---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Warranty Claim Log Schema

## Overview

Defines the standard field structure for tracking warranty claims from intake through resolution. Owned by the property management team. Supports the controls and SLAs defined in `property-management/warranty/ops-warranty-claim-intake-and-resolution.md`.

## Fields

| # | Field | Type | Required | Description |
|---|---|---|---|---|
| 1 | `claim_number` | string | Yes | Sequential identifier (e.g. `WC-001`) |
| 2 | `project` | string | Yes | Project name or code |
| 3 | `unit_location` | string | Yes | Unit number, common area, or building system location |
| 4 | `reported_by` | string | Yes | Tenant, buyer, staff, or inspection source |
| 5 | `date_reported` | date | Yes | Date defect was reported to property management |
| 6 | `priority` | enum | Yes | `emergency`, `urgent`, `standard` |
| 7 | `status` | enum | Yes | `open`, `assigned`, `in-repair`, `resolved`, `disputed`, `closed` |
| 8 | `defect_description` | text | Yes | Description of the defect including location and symptoms |
| 9 | `category` | enum | Yes | `general`, `roofing`, `mechanical`, `plumbing`, `electrical`, `waterproofing`, `appliance`, `finish`, `structural` |
| 10 | `photo_evidence` | boolean | Yes | Whether photos were taken at intake |
| 11 | `warranty_item` | string | Yes | Reference to the warranty inventory item |
| 12 | `warranty_expiry` | date | Yes | Expiration date of the applicable warranty |
| 13 | `covered` | enum | Yes | `covered`, `excluded`, `under-review` |
| 14 | `responsible_contractor` | string | — | Subcontractor or manufacturer assigned |
| 15 | `date_assigned` | date | — | Date claim was sent to the contractor |
| 16 | `response_due` | date | — | Calculated from priority SLA |
| 17 | `date_contractor_responded` | date | — | Date contractor acknowledged the claim |
| 18 | `date_repair_scheduled` | date | — | Date repair visit is scheduled |
| 19 | `date_repair_completed` | date | — | Date repair was finished |
| 20 | `repair_description` | text | — | Description of the repair performed |
| 21 | `repair_verified` | boolean | — | Whether PM verified the repair quality |
| 22 | `date_closed` | date | — | Date claim was marked resolved |
| 23 | `escalation_history` | text | — | Dates and actions of any escalations |
| 24 | `linked_spec_section` | string | — | Original spec section for reference |
| 25 | `linked_submittal` | string | — | Submittal number for reference |
| 26 | `notes` | text | — | Dispute details, tenant communication, or other remarks |

## Status Lifecycle

```
open → assigned → in-repair → resolved → closed
                     ↘
                  disputed → assigned → in-repair → resolved → closed
```

## Validation Rules

- `claim_number` must be unique per project.
- `photo_evidence` should be true for all claims; required for emergency and urgent.
- `warranty_expiry` must be in the future at `date_reported` (otherwise the claim is post-warranty and must be handled outside this process).
- `covered` = `excluded` requires a non-empty `notes` field explaining the exclusion.
- `status` cannot move to `resolved` without `date_repair_completed` and `repair_verified` = true.
- `disputed` requires `escalation_history` to be non-empty.

## Usage Notes

- Copy this schema when setting up a new project warranty claim log.
- Field names use `snake_case` to support future automation and CSV/database interop.
- Cross-reference `category` values with warranty periods in `property-management/warranty/ops-warranty-administration.md`.
