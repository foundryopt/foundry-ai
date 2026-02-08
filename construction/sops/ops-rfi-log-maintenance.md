---
status: active
owner: Kuan
last-reviewed: 2026-02-08
---

# RFI Log Maintenance

## Purpose

Ensure the project RFI log remains accurate, current, and actionable through a weekly maintenance routine — preventing stale entries, missed SLAs, and unreported aging.

## Scope

All active construction projects across all entities. Owned by SHB Inc. (GC/CM) project manager. Reviewed weekly by SHB Group (Owner's Rep).

## Control: No Stale Entries Beyond One Review Cycle

**Every open RFI must be touched (updated or escalated) at least once per weekly review cycle.** An RFI with no activity for more than 7 calendar days triggers mandatory escalation.

## Procedure

1. **Generate aging report.** At the start of each weekly review, the PM generates an aging snapshot of all open RFIs sorted by days outstanding.
2. **Review each open RFI.** For every open entry:
   - Confirm `status` reflects the current state.
   - Verify `response_due` has not passed. If overdue, escalate per SLA aging rules.
   - Update `notes` with any interim communication or status change.
3. **Flag SLA breaches.** Mark any RFI that has exceeded its response window. Record the breach date and escalation action in `notes`.
4. **Escalate overdue items.** Apply the SLA aging rules below and notify the appropriate parties in writing.
5. **Reconcile closed RFIs.** Confirm every RFI closed in the past week has: `date_responded`, `response_summary`, `date_distributed`, and `date_closed` populated.
6. **Distribute weekly summary.** Send the aging report and escalation log to SHB Group (Owner's Rep) and SHB Studio (Design) leads.
7. **Archive the snapshot.** File the weekly aging report in the project record.

## SLA Aging Rules

| Days Overdue | Action | Notified Parties |
|---|---|---|
| 1–3 days past response window | PM sends written reminder to responsible party | Responsible party |
| 4–7 days past response window | PM escalates to Owner's Rep with written summary | SHB Group (Owner's Rep), responsible party |
| 8–14 days past response window | Owner's Rep escalates to Principal; responsible party's firm lead notified | SHB Group (Principal), firm lead |
| 15+ days past response window | Formal notice of non-response issued; schedule/cost impact documented | All parties, project record |

## RACI

| Activity | SHB Inc. (GC/CM) | SHB Studio (Design) | SHB Group (Owner's Rep) | SHB Group (Principal) | Builiq Inc. (Procurement) |
|---|---|---|---|---|---|
| Generate aging report | **R** | — | I | — | — |
| Review open RFIs | **R** | I | I | — | — |
| Flag SLA breaches | **R** | I | I | — | — |
| Escalate overdue items | **R** | I | **A** | I (8+ days) | — |
| Reconcile closed RFIs | **R** | — | **A** | — | — |
| Distribute weekly summary | **R** | I | I | — | — |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

## Review Schedule

- Reviewed every 6 months or at project close-out, whichever is sooner.
- Next review: 2026-08-08.

## Appendix: Google Sheets Quickstart (Optional)

If using Google Sheets as the RFI log:

1. Create a sheet from `construction/templates/rfi-log.csv` headers.
2. Add conditional formatting: red fill on rows where `response_due < TODAY()` and `status` is not `closed`.
3. Add a `days_overdue` calculated column: `=IF(AND(response_due<TODAY(), status<>"closed"), TODAY()-response_due, 0)`.
4. Create a filtered view named "Weekly Review" sorted by `days_overdue` descending, filtered to `status` not `closed`.
5. Duplicate the filtered view weekly and rename with the review date as the archived snapshot.
