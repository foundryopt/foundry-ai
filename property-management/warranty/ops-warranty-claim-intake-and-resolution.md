---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Warranty Claim Intake and Resolution

## Purpose

Standardize how warranty defects are reported, logged, assigned to the responsible contractor, and resolved — ensuring claims are filed within warranty windows, response SLAs are enforced, and defects are corrected.

## Scope

All active warranty claims across all completed projects. Applies to property management teams, tenants/buyers, SHB Inc. (GC/CM), and responsible subcontractors.

## Control: No Warranty Expiration Without Final Inspection

**No warranty period may expire without a pre-expiration inspection and claim submission for all identified defects.** See `property-management/warranty/ops-warranty-administration.md` for inspection timing.

## Procedure

### Intake

1. **Receive defect report.** Property management receives a defect report from a tenant, buyer, building staff, or inspection. Record the report immediately.
2. **Log the claim.** Create an entry in the warranty claim log (`property-management/warranty/warranty-claim-log-schema.md`) with all required fields.
3. **Classify the claim.**
   - **Emergency** — Active water intrusion, no heat/AC, fire/life safety issue. Requires immediate response.
   - **Urgent** — Defect affecting habitability or building operations. Requires response within 24 hours.
   - **Standard** — Cosmetic or non-critical defect. Requires response within the standard SLA.
4. **Verify warranty coverage.** Confirm the item is within the warranty period and the defect is a covered item (not tenant-caused damage or normal wear). If excluded, notify the reporter with an explanation.

### Assignment and Resolution

5. **Assign to responsible contractor.** SHB Inc. (GC/CM) identifies the responsible subcontractor or manufacturer and issues a warranty service request.
6. **Track contractor response.** Monitor against the response SLA table below. If the contractor does not respond within the SLA, escalate.
7. **Coordinate access.** Property management coordinates site or unit access for the contractor's repair visit.
8. **Verify repair.** Property management inspects the completed repair. If satisfactory, mark the claim as resolved. If not, return to step 5 with specific deficiencies noted.
9. **Close the claim.** Update the claim log with resolution date, description of repair, and any follow-up required.

### Escalation

10. **Contractor non-response.** If the contractor fails to respond within the SLA, SHB Inc. (GC/CM) escalates to the subcontractor's principal. If still unresolved, SHB Group (Owner's Rep) evaluates back-charge or alternative contractor options.
11. **Disputed claims.** If the contractor disputes that the defect is a warranty item, SHB Group (Owner's Rep) reviews and makes a determination. Cross-reference the original submittal, spec section, and installation records.

## Response SLA Table

| Priority | Initial Response | On-Site Assessment | Repair Completed | Escalation |
|---|---|---|---|---|
| Emergency | 4 hours | Same day | 24 hours (temporary); 5 days (permanent) | PM escalates to GC immediately; GC arranges emergency contractor if sub unresponsive |
| Urgent | 24 hours | 48 hours | 7 calendar days | GC escalates to sub principal at 48 hours |
| Standard | 3 business days | 5 business days | 14 calendar days | GC sends written reminder at 5 days; escalates to Owner's Rep at 14 days |

## Contractor Responsibility

- The responsible contractor bears the full cost of warranty repairs for covered defects.
- If the contractor is unresponsive or has ceased operations, SHB Inc. (GC/CM) coordinates an alternative contractor. Costs are charged against the original contractor's retainage (if held) or pursued as a claim.
- Warranty repairs must match the original specification and approved submittal. No substitutions without SHB Studio (Design) approval.

## RACI

| Activity | Property Mgmt | SHB Inc. (GC/CM) | SHB Studio (Design) | SHB Group (Owner's Rep) | Builiq Inc. (Procurement) |
|---|---|---|---|---|---|
| Receive defect report | **R** | I | — | — | — |
| Log the claim | **R** | I | — | I | — |
| Classify the claim | **R** | C | — | — | — |
| Verify warranty coverage | **R** | **R** | — | — | C |
| Assign to contractor | I | **R** | — | I | — |
| Track contractor response | I | **R** | — | I | — |
| Coordinate access | **R** | I | — | — | — |
| Verify repair | **R** | C | C (if spec question) | — | — |
| Escalate non-response | **R** | **R** | — | **A** | — |
| Resolve disputed claims | I | C | C | **R** | — |
| Close the claim | **R** | I | — | **A** | — |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

## Review Schedule

- Reviewed every 6 months.
- Next review: 2026-08-08.
