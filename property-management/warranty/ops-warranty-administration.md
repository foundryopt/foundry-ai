---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Warranty Administration

## Purpose

Define warranty coverage periods, covered vs. excluded items, and the administrative process for tracking and enforcing warranty obligations — ensuring defects are claimed within warranty windows and contractors fulfill their obligations.

## Scope

All completed projects transitioned to property management. Applies to property management teams, SHB Inc. (GC/CM) for contractor coordination, and SHB Group (Owner's Rep) for dispute resolution.

## Warranty Periods

| Category | Standard Period | Start Date | Notes |
|---|---|---|---|
| **General construction** | 1 year | Date of substantial completion | Covers workmanship and materials |
| **Roofing** | 2 years (workmanship) + manufacturer warranty | Date of substantial completion | Manufacturer warranty may extend 10–30 years |
| **Mechanical (HVAC)** | 1 year (contractor) + manufacturer warranty | Date of substantial completion | Manufacturer warranty varies by equipment |
| **Plumbing** | 1 year (contractor) + manufacturer warranty | Date of substantial completion | |
| **Electrical** | 1 year (contractor) + manufacturer warranty | Date of substantial completion | |
| **Waterproofing / envelope** | 2–5 years (per contract) | Date of substantial completion | Verify contract-specific terms |
| **Appliances** | Manufacturer warranty only | Date of installation or delivery | Typically 1–2 years |
| **Finish items** (paint, flooring, cabinetry) | 1 year | Date of substantial completion | |
| **Structural** | Per contract and applicable code | Date of substantial completion | May be 6–10 years depending on jurisdiction |

**Note:** Actual warranty periods are defined in each project's construction contract and subcontractor agreements. The table above is a guideline; always verify contract-specific terms.

## Covered vs. Excluded Items

### Covered

- Defects in workmanship (e.g., cracked tile, misaligned doors, leaking fixtures).
- Defects in materials (e.g., premature finish failure, manufacturer defects).
- Building system malfunctions traceable to installation (e.g., HVAC not performing to spec).
- Waterproofing failures within the warranty period.

### Excluded

- Normal wear and tear.
- Damage caused by tenant misuse, negligence, or unauthorized modifications.
- Damage from natural disasters, acts of God, or force majeure events.
- Cosmetic preferences or design change requests.
- Items where the manufacturer warranty has been voided by improper maintenance.
- Damage resulting from failure to follow O&M manual procedures.

## Procedure

1. **Load warranty inventory.** At PM onboarding, load all warranty items into the warranty tracker with: item, contractor/manufacturer, start date, end date, and contact information.
2. **Set expiration alerts.** Configure alerts at 60 days and 30 days before each warranty expiration.
3. **Conduct warranty inspections.**
   - **11-month inspection** (for 1-year warranties): Property management and SHB Inc. (GC/CM) conduct a joint inspection of all areas covered by the general warranty. Document defects with photos.
   - **Pre-expiration inspection** (for longer warranties): Conduct at least 60 days before expiration.
4. **Submit warranty claims.** For any defect identified, initiate a claim per `property-management/warranty/ops-warranty-claim-intake-and-resolution.md`.
5. **Track open claims.** Monitor all open claims in the warranty claim log (`property-management/warranty/warranty-claim-log-schema.md`).
6. **Close expired warranties.** When a warranty period ends, mark it as expired in the tracker. File the warranty closeout checklist (`property-management/warranty/warranty-closeout-checklist.md`).

## RACI

| Activity | Property Mgmt | SHB Inc. (GC/CM) | SHB Group (Owner's Rep) | Builiq Inc. (Procurement) |
|---|---|---|---|---|
| Load warranty inventory | **R** | C | I | C |
| Set expiration alerts | **R** | — | I | — |
| Conduct 11-month inspection | **R** | **R** | I | — |
| Conduct pre-expiration inspection | **R** | C | I | — |
| Submit warranty claims | **R** | I | I | — |
| Coordinate contractor response | I | **R** | **A** | C |
| Escalate unresolved claims | **R** | I | **A** | — |
| Close expired warranties | **R** | I | **A** | — |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

## Review Schedule

- Reviewed every 6 months.
- Next review: 2026-08-08.
