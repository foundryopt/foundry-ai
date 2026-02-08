---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Lead-Time Tracker Schema

## Overview

Defines the standard field structure for the project lead-time tracker. Owned by Builiq Inc. (Procurement) to monitor manufacturing, fabrication, and delivery timelines for all approved submittals. Supports the lead-time escalation rules defined in `procurement/sops/ops-submittals-and-lead-time-control.md`.

## Fields

| # | Field | Type | Required | Description |
|---|---|---|---|---|
| 1 | `item_number` | string | Yes | Sequential identifier (e.g. `LT-001`) |
| 2 | `project` | string | Yes | Project name or code |
| 3 | `linked_submittal` | string | Yes | Submittal register number (e.g. `SUB-001`) |
| 4 | `spec_section` | string | Yes | Specification section reference |
| 5 | `description` | string | Yes | Brief description of material or equipment |
| 6 | `vendor` | string | Yes | Manufacturer or supplier name |
| 7 | `status` | enum | Yes | `awaiting-approval`, `approved-ordering`, `in-production`, `shipped`, `delivered`, `delayed`, `cancelled` |
| 8 | `date_approved` | date | — | Date submittal was approved (triggers lead-time clock) |
| 9 | `date_ordered` | date | — | Date PO was issued to vendor |
| 10 | `lead_time_weeks` | integer | Yes | Vendor-quoted lead time in weeks from order |
| 11 | `projected_ship_date` | date | — | Calculated: `date_ordered` + `lead_time_weeks` |
| 12 | `actual_ship_date` | date | — | Date vendor confirms shipment |
| 13 | `projected_delivery_date` | date | — | Estimated delivery to site |
| 14 | `actual_delivery_date` | date | — | Actual arrival on site |
| 15 | `required_on_site` | date | Yes | Date material is needed per construction schedule |
| 16 | `float_days` | integer | — | Calculated: `required_on_site` - `projected_delivery_date` (negative = late) |
| 17 | `risk_flag` | enum | — | `on-track`, `at-risk` (< 14 days float), `critical` (< 0 days float) |
| 18 | `escalation_date` | date | — | Date risk was escalated per lead-time escalation rules |
| 19 | `linked_co` | string | — | CO number if a substitution or change was triggered |
| 20 | `notes` | text | — | Vendor updates, delay reasons, alternative sourcing notes |

## Status Lifecycle

```
awaiting-approval → approved-ordering → in-production → shipped → delivered
                                                          ↘
                                                        delayed → shipped → delivered
                  ↘
               cancelled
```

## Risk Flag Rules

| Condition | Flag | Action |
|---|---|---|
| `float_days` >= 14 | `on-track` | No action; monitor weekly |
| `float_days` >= 0 and < 14 | `at-risk` | Builiq Inc. (Procurement) flags to PM |
| `float_days` < 0 | `critical` | PM escalates to Owner's Rep; evaluate alternatives |

## Validation Rules

- `item_number` must be unique per project.
- `linked_submittal` must reference an existing entry in the submittal register.
- `required_on_site` must be populated before `status` moves past `awaiting-approval`.
- `float_days` is auto-calculated; negative values trigger `critical` risk flag.
- `status` cannot move to `delivered` without `actual_delivery_date`.

## Usage Notes

- Copy this schema when setting up a new project lead-time tracker.
- Field names use `snake_case` to support future automation and CSV/database interop.
- Update weekly in coordination with the submittal register and construction schedule.

## Appendix: Google Sheets Quickstart (Optional)

If using Google Sheets as the lead-time tracker:

1. Create a sheet from the field names above as column headers.
2. Add a `float_days` formula: `=IF(AND(required_on_site<>"", projected_delivery_date<>""), required_on_site - projected_delivery_date, "")`.
3. Add conditional formatting: green for `float_days` >= 14, yellow for 0–13, red for negative.
4. Add a `risk_flag` formula: `=IF(float_days<0, "critical", IF(float_days<14, "at-risk", "on-track"))`.
5. Create a filtered view named "At Risk" filtering `risk_flag` to `at-risk` or `critical`.
