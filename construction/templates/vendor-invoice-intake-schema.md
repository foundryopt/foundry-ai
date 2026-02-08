---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Vendor Invoice Intake Schema

## Overview

Defines the standard field structure for tracking vendor invoices from receipt through payment. Owned by Builiq Inc. (Procurement) with project-level approval by SHB Inc. (GC/CM) and payment authorization by SHB Group (Owner's Rep). Supports the controls defined in `construction/sops/ops-pay-app-and-invoice-approval.md`.

## Fields

| # | Field | Type | Required | Description |
|---|---|---|---|---|
| 1 | `invoice_number` | string | Yes | Vendor's invoice number |
| 2 | `internal_ref` | string | Yes | Internal sequential identifier (e.g. `INV-001`) |
| 3 | `project` | string | Yes | Project name or code |
| 4 | `vendor` | string | Yes | Vendor or supplier name |
| 5 | `date_received` | date | Yes | Date invoice was received by Builiq Inc. (Procurement) |
| 6 | `invoice_date` | date | Yes | Date on the vendor's invoice |
| 7 | `po_number` | string | Yes | Purchase order reference |
| 8 | `amount` | currency | Yes | Invoice amount |
| 9 | `status` | enum | Yes | `received`, `matched`, `disputed`, `approved`, `paid`, `credited` |
| 10 | `matched_to_po` | boolean | — | PO line items, quantities, and pricing confirmed |
| 11 | `matched_to_delivery` | boolean | — | Delivered quantities confirmed against QC/receiving records |
| 12 | `discrepancy` | text | — | Description of any mismatch (quantity, pricing, scope) |
| 13 | `date_approved` | date | — | Date PM or Owner's Rep approved payment |
| 14 | `approved_by` | string | — | Name and role of approver |
| 15 | `payment_due` | date | Yes | Calculated from vendor payment terms |
| 16 | `date_paid` | date | — | Date payment was processed |
| 17 | `payment_method` | string | — | Check, ACH, wire, etc. |
| 18 | `linked_co` | string | — | CO number if invoice relates to change-order scope |
| 19 | `linked_submittal` | string | — | Submittal number if invoice relates to a specific material delivery |
| 20 | `notes` | text | — | Dispute details, credit memo references, or other remarks |

## Status Lifecycle

```
received → matched → approved → paid
               ↘
            disputed → matched → approved → paid
                              → credited
```

## Validation Rules

- `internal_ref` must be unique per project.
- `status` cannot move to `matched` without `matched_to_po` = true.
- `status` cannot move to `approved` without `matched_to_po` = true and `matched_to_delivery` = true.
- `disputed` requires a non-empty `discrepancy` field.
- `status` cannot move to `paid` without `date_approved` and `approved_by`.
- Invoices referencing CO scope require `linked_co` to reference an executed CO.

## Approval Authority

| Condition | Approver |
|---|---|
| Invoice within standard PO authority | SHB Inc. (GC/CM) project manager |
| Invoice at or above the project-defined approval threshold | SHB Group (Owner's Rep) |
| Invoice tied to a CO above the CO approval threshold | SHB Group (Principal) |

## Usage Notes

- Copy this schema when setting up a new project vendor invoice tracker.
- Field names use `snake_case` to support future automation and CSV/database interop.
- Cross-reference with `construction/templates/pay-app-checklist.md` for contractor payments vs. direct vendor invoices.

## Appendix: Google Sheets Quickstart (Optional)

If using Google Sheets as the invoice tracker:

1. Create a sheet from the field names above as column headers.
2. Add conditional formatting: yellow for `received` or `matched` rows past `payment_due`; red for `disputed`.
3. Add a `days_to_payment` formula: `=IF(date_paid="", payment_due - TODAY(), "paid")`.
4. Create a filtered view named "Open Invoices" filtering `status` to everything except `paid` and `credited`.
