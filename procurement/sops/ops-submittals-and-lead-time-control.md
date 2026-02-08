---
status: active
owner: Kuan
last-reviewed: 2026-02-08
---

# Submittals and Lead-Time Control

## Purpose

Ensure every material and equipment submittal is tracked from initiation through approval, and that lead times are monitored against the construction schedule — preventing installation of unapproved materials and schedule disruption from late deliveries.

## Scope

All active construction projects across all entities. Applies to procurement coordinators, project managers, subcontractors, and design consultants.

## Control: No Install Without Approved Submittal

**No material or equipment may be installed on site until its submittal has been approved or approved-as-noted by the design team.**

- Delivery to site does not constitute approval for installation.
- If field conditions require installation before formal approval, the project manager must document a field directive in writing, obtain SHB Group (Owner's Rep) sign-off, and flag the submittal as "installed at risk" in the register.
- Any cost to remove or replace unapproved material is tracked against the responsible party.

## Procedure

1. **Identify submittal requirements.** At project start, Builiq Inc. (Procurement) and SHB Inc. (GC/CM) compile the submittal register from the specification sections. Assign each item a priority (critical, standard, closeout).
2. **Initiate submittal.** Subcontractor or vendor prepares and submits the package to SHB Inc. (GC/CM) project manager.
3. **Log and route.** PM logs the submittal in the register (per `construction/templates/submittal-register-schema.md`) and routes to SHB Studio (Design) for review.
4. **Design review.** SHB Studio reviews within the SLA window and returns with action: approved, approved-as-noted, revise-resubmit, or rejected.
5. **Handle resubmissions.** If revise-resubmit, PM returns to the sub with comments. The SLA clock resets on resubmission.
6. **Confirm lead time.** Upon approval, Builiq Inc. (Procurement) confirms manufacturing/fabrication lead time with the vendor and records it in the lead-time tracker (per `procurement/templates/lead-time-tracker-schema.md`).
7. **Monitor lead time.** Builiq Inc. (Procurement) monitors delivery dates weekly against the construction schedule. Flag any item where the projected delivery date risks the `required_on_site` date.
8. **Escalate lead-time risks.** Apply the lead-time escalation rules below.
9. **Confirm delivery.** Upon material arrival, follow the receiving and QC process (per `procurement/sops/ops-material-receiving-qc-and-damage-claims.md`).
10. **Close submittal.** PM marks the submittal as closed in the register once the material is approved, delivered, and accepted.

## Submittal Register Ownership

| Responsibility | Entity |
|---|---|
| Compile and maintain the register | SHB Inc. (GC/CM) |
| Route submittals and track SLAs | SHB Inc. (GC/CM) |
| Perform design review | SHB Studio (Design) |
| Confirm lead times and monitor delivery | Builiq Inc. (Procurement) |
| Approve "installed at risk" exceptions | SHB Group (Owner's Rep) |

## SLA Table

| Priority | Routing Window | Design Review Window | Resubmit Window | Lead-Time Confirmation |
|---|---|---|---|---|
| Critical | 24 hours | 5 calendar days | 3 calendar days | Within 48 hours of approval |
| Standard | 48 hours | 10 calendar days | 5 calendar days | Within 5 calendar days of approval |
| Closeout | 48 hours | 14 calendar days | 7 calendar days | N/A |

## Lead-Time Escalation Rules

| Condition | Action | Notified Parties |
|---|---|---|
| Projected delivery within 2 weeks of `required_on_site` | Builiq Inc. (Procurement) flags to PM | SHB Inc. (GC/CM) |
| Projected delivery after `required_on_site` | PM escalates to Owner's Rep; evaluate alternatives | SHB Group (Owner's Rep), SHB Studio (Design) |
| Vendor confirms delay > 2 weeks past `required_on_site` | Owner's Rep escalates to Principal; assess schedule and cost impact | SHB Group (Principal), all parties |
| Vendor unable to meet any revised date | PM initiates substitution process; new submittal required | All parties |

## RACI

| Activity | SHB Inc. (GC/CM) | SHB Studio (Design) | SHB Group (Owner's Rep) | SHB Group (Principal) | Builiq Inc. (Procurement) |
|---|---|---|---|---|---|
| Compile submittal register | **R** | C | I | — | **R** |
| Log and route submittals | **R** | I | I | — | — |
| Perform design review | I | **R** | — | — | — |
| Handle resubmissions | **R** | **A** | — | — | — |
| Confirm lead time | I | — | I | — | **R** |
| Monitor lead time weekly | I | — | I | — | **R** |
| Escalate lead-time risks | **R** | I | **A** | I (2+ weeks late) | **R** |
| Approve "installed at risk" | I | C | **R** | **A** | — |
| Close submittal | **R** | I | — | — | I |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

## Review Schedule

- Reviewed every 6 months or at project close-out, whichever is sooner.
- Next review: 2026-08-08.
