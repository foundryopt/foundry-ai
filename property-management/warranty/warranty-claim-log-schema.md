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
| 27 | `pm_signoff` | boolean | — | Property Management verified claim entry |
| 28 | `pm_signoff_date` | date | — | Date PM signed off on claim |
| 29 | `gc_signoff` | boolean | — | GC/CM confirmed contractor assignment |
| 30 | `gc_signoff_date` | date | — | Date GC signed off on assignment |
| 31 | `before_photos_url` | string | Yes (repair) | Link to before photos (Drive or GHL) |
| 32 | `after_photos_url` | string | Yes (repair) | Link to after photos (Drive or GHL) |
| 33 | `repair_signoff` | boolean | — | PM verified repair completion |
| 34 | `repair_signoff_date` | date | — | Date PM signed off on repair |
| 35 | `homeowner_signoff` | boolean | — | Homeowner confirmed satisfaction |
| 36 | `homeowner_signoff_date` | date | — | Date homeowner signed off |
| 37 | `homeowner_signoff_sent` | datetime | — | When signoff request was sent via GHL |
| 38 | `homeowner_signoff_method` | enum | — | `signed`, `auto-approved`, `reopened` |
| 39 | `homeowner_signoff_notes` | text | — | Notes (e.g., "Auto-approved: no response within 24 hours") |
| 40 | `close_signoff` | boolean | — | Owner's Rep approved closure |
| 41 | `close_signoff_date` | date | — | Date closure was approved |
| 42 | `ghl_contact_id` | string | — | GHL contact record ID |
| 43 | `ghl_conversation_id` | string | — | GHL conversation thread ID |

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
- `pm_signoff_date` required when `pm_signoff` = true.
- `gc_signoff_date` required when `gc_signoff` = true.
- `before_photos_url` required before `repair_signoff` can be set.
- `after_photos_url` required before `repair_signoff` can be set.
- `repair_signoff_date` required when `repair_signoff` = true.
- `homeowner_signoff_date` required when `homeowner_signoff` = true.
- `homeowner_signoff_method` must be one of: `signed`, `auto-approved`, `reopened`.
- `status` cannot move to `closed` without `homeowner_signoff` = true.
- `close_signoff_date` required when `close_signoff` = true.
- `status` cannot move to `closed` without `close_signoff` = true.

## Usage Notes

- Copy this schema when setting up a new project warranty claim log.
- Field names use `snake_case` to support future automation and CSV/database interop.
- Cross-reference `category` values with warranty periods in `property-management/warranty/ops-warranty-administration.md`.
