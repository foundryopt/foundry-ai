---
status: active
owner: Kuan
last-reviewed: 2026-02-08
---

# Pay Application and Invoice Approval

## Purpose

Ensure every contractor pay application and vendor invoice is validated against executed change orders, verified for percent-complete accuracy, and supported by lien waivers before payment is authorized — preventing overpayment, unauthorized scope billing, and lien exposure.

## Scope

All active construction projects across all entities. Applies to project managers, accounting, subcontractors, vendors, and owner's representatives.

## Control: No Payment Without Executed CO Backing and Lien Waiver

**No payment may be released for work that includes change order scope unless the corresponding CO is fully executed.** Additionally, no payment may be released without the required lien waiver from the payee.

- Invoices referencing unapproved or unexecuted COs are returned with a written explanation.
- Partial lien waivers are required for progress payments; final lien waivers are required for final payment.
- Conditional lien waivers are acceptable for progress payments; unconditional lien waivers are required for final payment.

## Procedure

### Pay Application Review

1. **Receive pay application.** Subcontractor or GC submits a monthly pay application with: schedule of values, percent-complete by line item, stored material value, and retainage calculation.
2. **Validate against contract and COs.** PM confirms:
   - Every line item ties to the original contract or an executed CO.
   - No line item references a PCO or unapproved CO.
   - The contract sum matches the current executed contract value (original + all executed COs).
3. **Verify percent-complete.** PM and superintendent perform a field walk to verify claimed percent-complete against actual progress. Document discrepancies.
4. **Verify stored materials.** Confirm stored materials are on site, properly protected, and match invoiced quantities. Cross-reference with receiving QC records.
5. **Check retainage.** Confirm retainage is calculated correctly per contract terms.
6. **Complete the pay-app checklist.** Use `construction/templates/pay-app-checklist.md` to document all verification steps.
7. **Collect lien waiver.** Obtain the appropriate lien waiver from the payee before forwarding for approval.
8. **Decision gate: Approve, adjust, or reject.**
   - **Approve** — PM signs and forwards to SHB Group (Owner's Rep) for authorization.
   - **Adjust** — PM returns to the applicant with specific line-item corrections.
   - **Reject** — PM returns with written explanation of non-compliant items.
9. **Owner's Rep authorization.** SHB Group (Owner's Rep) reviews and authorizes payment.
10. **Process payment.** Accounting processes payment within the contract payment terms.

### Vendor Invoice Intake

11. **Receive vendor invoice.** Builiq Inc. (Procurement) receives the invoice and logs it per `construction/templates/vendor-invoice-intake-schema.md`.
12. **Match to PO and delivery.** Confirm the invoice matches the PO, quantities delivered, and QC acceptance records.
13. **Route for approval.** Forward to the PM for project-level approval, then to SHB Group (Owner's Rep) if above the project-defined approval threshold.
14. **Process payment.** Accounting processes payment within vendor payment terms.

## Decision Gates

| Gate | Condition to Pass | Authority |
|---|---|---|
| Pay-app line items validated | Every line item ties to contract or executed CO | SHB Inc. (GC/CM) |
| Percent-complete verified | Field walk confirms claimed progress | SHB Inc. (GC/CM) |
| Lien waiver received | Appropriate waiver type on file | SHB Inc. (GC/CM) |
| Pay-app approved | Checklist complete and signed | SHB Inc. (GC/CM) |
| Payment authorized | Owner's Rep reviews and signs | SHB Group (Owner's Rep) |
| Payment above threshold | Principal reviews and signs | SHB Group (Principal) |

## SLA Table

| Activity | Standard | Escalation |
|---|---|---|
| PM review of pay application | 5 business days from receipt | PM notifies applicant of delay |
| Field percent-complete verification | Within the PM review window | Superintendent escalates scheduling conflict to PM |
| Owner's Rep authorization | 3 business days from PM approval | PM escalates to Principal |
| Payment processing | Per contract terms (typically net 30) | Accounting notifies PM of delay |
| Vendor invoice matching | 3 business days from receipt | Builiq Inc. (Procurement) escalates discrepancy to PM |

## RACI

| Activity | SHB Inc. (GC/CM) | SHB Studio (Design) | SHB Group (Owner's Rep) | SHB Group (Principal) | Builiq Inc. (Procurement) |
|---|---|---|---|---|---|
| Receive pay application | **R** | — | I | — | — |
| Validate against contract/COs | **R** | — | I | — | — |
| Verify percent-complete (field walk) | **R** | — | C | — | — |
| Verify stored materials | **R** | — | — | — | C |
| Complete pay-app checklist | **R** | — | I | — | — |
| Collect lien waiver | **R** | — | I | — | — |
| Approve pay application | **R** | — | **A** | **A** (above threshold) | — |
| Process payment | I | — | **A** | — | — |
| Receive vendor invoice | I | — | — | — | **R** |
| Match invoice to PO/delivery | I | — | — | — | **R** |
| Route vendor invoice for approval | **R** | — | **A** (above threshold) | — | **R** |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

## Review Schedule

- Reviewed every 6 months or at project close-out, whichever is sooner.
- Next review: 2026-08-08.
