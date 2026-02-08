---
status: active
owner: Kuan
last-reviewed: 2026-02-08
---

# Change Order Log Maintenance

## Purpose

Ensure the project change order log remains accurate, current, and reconciled through a weekly maintenance routine — preventing untracked cost exposure, stale PCOs, and unsigned COs.

## Scope

All active construction projects across all entities. Owned by SHB Inc. (GC/CM) project manager. Reviewed weekly by SHB Group (Owner's Rep).

## Control: No Unreviewed Cost Exposure Beyond One Review Cycle

**Every open PCO and unapproved CO must be touched (updated or escalated) at least once per weekly review cycle.** A PCO with no activity for more than 7 calendar days triggers mandatory escalation. The cumulative cost exposure of all open PCOs must be reported weekly.

## Procedure

1. **Generate aging and exposure report.** At the start of each weekly review, the PM generates:
   - An aging snapshot of all open PCOs/COs sorted by days outstanding.
   - A cumulative cost exposure summary (sum of `preliminary_cost` for all non-closed items).
2. **Review each open item.** For every open PCO or unapproved CO:
   - Confirm `status` reflects the current state.
   - Verify pricing, design confirmation, and procurement confirmation deadlines per SLA.
   - Update `notes` with any interim communication or status change.
3. **Flag SLA breaches.** Mark any item that has exceeded its SLA window. Record the breach date and escalation action in `notes`.
4. **Escalate overdue items.** Apply the SLA aging rules below and notify the appropriate parties in writing.
5. **Reconcile executed COs.** Confirm every CO executed in the past week has: `final_cost`, `date_approved`, `approved_by`, `date_executed`, `date_distributed`, `contract_sum_before`, and `contract_sum_after` populated.
6. **Verify contract sum.** Confirm that the running contract sum (`contract_sum_after` on the most recent executed CO) matches the project accounting record.
7. **Distribute weekly summary.** Send the aging report, exposure summary, and contract sum reconciliation to SHB Group (Owner's Rep).
8. **Archive the snapshot.** File the weekly report in the project record.

## SLA Aging Rules

| Days Overdue | Action | Notified Parties |
|---|---|---|
| 1–3 days past SLA window | PM sends written reminder to responsible party | Responsible party |
| 4–7 days past SLA window | PM escalates to Owner's Rep with written summary | SHB Group (Owner's Rep), responsible party |
| 8–14 days past SLA window | Owner's Rep escalates to Principal; cost exposure flagged | SHB Group (Principal) |
| 15+ days past SLA window | Formal notice issued; schedule/cost impact documented | All parties, project record |

## RACI

| Activity | SHB Inc. (GC/CM) | SHB Studio (Design) | SHB Group (Owner's Rep) | SHB Group (Principal) | Builiq Inc. (Procurement) |
|---|---|---|---|---|---|
| Generate aging/exposure report | **R** | — | I | — | — |
| Review open PCOs/COs | **R** | I | I | — | I |
| Flag SLA breaches | **R** | I | I | — | I |
| Escalate overdue items | **R** | I | **A** | I (8+ days) | — |
| Reconcile executed COs | **R** | — | **A** | — | — |
| Verify contract sum | **R** | — | **A** | I | — |
| Distribute weekly summary | **R** | I | I | — | I |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

## Review Schedule

- Reviewed every 6 months or at project close-out, whichever is sooner.
- Next review: 2026-08-08.

## Appendix: Google Sheets Quickstart (Optional)

If using Google Sheets as the change order log:

1. Create a sheet from `construction/templates/change-order-log.csv` headers.
2. Add conditional formatting: yellow fill on `pco-open` or `pricing` rows older than 7 days; red fill on rows past their SLA window.
3. Add a `days_in_status` calculated column: `=TODAY()-MAX(date_submitted, sub_pricing_received, design_confirmed)` (adjust per current status).
4. Add a summary row at the top: `=SUMIF(status, "<>closed", preliminary_cost)` for total open cost exposure.
5. Create a filtered view named "Weekly Review" sorted by `days_in_status` descending, filtered to `status` not `closed`.
