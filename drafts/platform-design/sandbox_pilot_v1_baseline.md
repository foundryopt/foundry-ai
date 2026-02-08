---
status: frozen
owner: Kuan
last-reviewed: 2026-02-08
baseline-date: 2026-02-18
---

# SandBox Pilot — v1 Baseline (Frozen)

**This document is frozen. No optimization, no new logic. It records the 3-day pilot simulation as-run.**

Full simulation detail: `pilot-sandbox-day1-simulation.md`

---

## Pilot Parameters

| Parameter | Value |
|---|---|
| Project | SandBox |
| Duration simulated | 3 business days (Mon–Wed, 2026-02-16 to 2026-02-18) |
| Project phase | Mid-build, interior rough-in |
| Backfill | 47 RFIs, 11 COs, 6 decisions, 14 submittals, 2 warranty claims |
| CO approval threshold | $25,000 |
| Command surface | Slack |
| System of record | Google Drive |
| Email inboxes monitored | 4 (`sandbox@`, `info@`, `support@`, `shb-studio@adaptive.build`) |

---

## 3-Day Metrics

| Metric | Day 1 | Day 2 | Day 3 | Trend |
|---|---|---|---|---|
| SLA breaches (open) | 8 | 5 | 2 | Down |
| Items resolved | 0 | 5 | 8 | Up |
| Draft messages generated | 10 | 4 | 4 | Stable |
| Drafts approved / sent | 0 | 7 | 6 | Up |
| Invoices through gate | 0 | 1 | 2 | Up |
| Decisions made | 0 | 1 | 2 | Up |
| False approvals by AI | 0 | 0 | 0 | Zero |
| Unsanctioned sends by AI | 0 | 0 | 0 | Zero |

---

## Open Task Categories Exercised

| Category | Items Created | Items Resolved | Items Carried |
|---|---|---|---|
| RFI | 1 (RFI-048) | 2 (RFI-041, RFI-047 interim) | 3 (044, 047 formal, 048) |
| Change Order | 0 | 1 (PCO-009 executed) | 2 within SLA |
| Invoice (gate) | 3 | 3 approved | 0 |
| Decision | 0 | 2 (DEC-005, DEC-006 approved) | 1 (DEC-006 awaiting Principal) |
| Submittal | 0 | 1 (SUB-011) | 2 (SUB-013, 1 within SLA) |
| Lead Time | 0 | 0 | 1 critical (LT-005), 2 at-risk |
| Warranty | 1 (WC-003) | 1 (WC-003 repaired) | 1 (WC-001 backup) |
| Pay App | 0 | 1 (Pay App #5) | 0 |
| Pre-Task | 1 checklist | 1 completed | 0 |
| Expense Report | 1 (ER-0088) | 1 approved | 0 |

---

## Patterns Observed

1. **Design response is the bottleneck.** Taylor R. (SHB Studio) had 4 overdue items across RFIs and submittals. Second escalation required on RFI-044.
2. **Invoice gate caught real problems.** Invoice CM-2267 arrived with no job #, no cost code, claimed CO work. Gate blocked it. Vendor resubmitted with correct data next day.
3. **Critical-path items resolved within 48 hours** when surfaced by daily packets (RFI-047 blocking pour, WC-003 active leak).
4. **Decision velocity improved with visibility.** DEC-005 was 4 days overdue on Day 1. Decided by Day 2 after reminder. DEC-006 decided by Day 3.
5. **Threshold escalation worked.** DEC-006 ($28,500 > $25K) correctly flagged for Principal sign-off.
6. **Daily packet cadence is sufficient.** No real-time notifications needed. 8 AM delivery with `/daily` on-demand covered all scenarios.
7. **Draft quality was usable.** 13 of 18 drafts approved with no edits noted in simulation.

---

## Cost Exposure Movement

| Metric | Day 1 | Day 3 |
|---|---|---|
| Open PCOs | $127,000 | $108,600 |
| Contract sum | $4,215,000 | $4,233,400 |
| Net pending impact | -$13,500 | -$13,500 (DEC-006 pending) |

---

## Open Items at Freeze

| Item | Status | Next Action |
|---|---|---|
| RFI-044 | 3 days past SLA | Await Taylor R. (deadline Fri 2/20) |
| RFI-047 formal drawing | Due Thu 2/19 | Monitor |
| RFI-048 | Logged, routed | Standard 7-day SLA |
| SUB-013 | 3 days past review SLA | Await Taylor R. |
| DEC-006 | Approved by Owner's Rep | Awaiting Sam W. Principal sign-off |
| LT-005 | -8 days float | Awaiting expedite decision |
| WC-001 | Backup contractor Thu 2 PM | Access arranged |
| WC-003 | Repaired | Verification Mon 2/23 |
