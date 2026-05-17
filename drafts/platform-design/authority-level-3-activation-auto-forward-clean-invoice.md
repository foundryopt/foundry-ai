---
status: draft — NOT ACTIVE
owner: Kuan
last-reviewed: 2026-05-17
proposed-activation-order: 3 of 4 (medium risk; named in §7 but never activated; first level that writes to a non-Drive SOR)
---

# Level 3 Activation — Auto-Forward Clean Invoice

## Concept

Level 3 ("Auto-Forward Invoice") is named in `CLAUDE.md` §7 but has never been activated. Today, every invoice that arrives via email goes through the **Invoice gate** (§6): the watcher extracts the invoice, checks it against PO/budget/cost-code, drafts the entry, and a human clicks **Forward to Adaptive Build**.

This activation defines **"clean invoice"** narrowly enough that AI can auto-forward to Adaptive Build without per-invoice human review. Invoices that miss any cleanliness criterion stay in the manual Invoice gate as today.

This is the **first** authority level that lets AI write to a system of record other than Drive Sheets. That's a meaningful step. Every safety rail below reflects that.

> Per `CLAUDE.md` §4, "AI may NOT: Write to Smartsheet, Adaptive Build, QBO, or any SOR other than Drive Sheets via Auto-Log." This activation **changes that line** for the narrowly-defined "clean invoice" case. The §4 change is part of activation, not part of this spec.

---

## Cleanliness Criteria (ALL must be true)

An invoice is "Clean" only if **every** condition holds. Any failure → manual Invoice gate.

### A. Identification and Extraction

| # | Criterion | Threshold |
|---|---|---|
| 1 | Vendor identification | Sender email + invoice header both match a single vendor record in Drive |
| 2 | Vendor record status | Vendor record is `ACTIVE` and `AUTO-FORWARD-ELIGIBLE: yes` |
| 3 | Invoice number | Present, non-empty, not a duplicate of any prior invoice from this vendor |
| 4 | Invoice date | Present, parseable, within last 60 days |
| 5 | Due date | Present, parseable, ≥ 7 days from today |
| 6 | Total amount | Single total value extracted with classifier confidence ≥ 0.98 |
| 7 | Line items extracted | Number of lines extracted matches number of lines visible in source (anti-hallucination check) |

### B. PO and Budget Match

| # | Criterion | Threshold |
|---|---|---|
| 8 | PO number | Present, references a PO in Adaptive Build that is `ACTIVE` and `NOT-FULLY-INVOICED` |
| 9 | Vendor on PO | Matches the vendor identified in criterion 1 |
| 10 | Cost code | Matches a cost code on the referenced PO; not on the cost-code Exclusion List |
| 11 | Amount sanity | Invoice total ≤ remaining PO balance |
| 12 | Cumulative invoiced | Sum of all prior invoices on this PO + this invoice ≤ PO total + 0% tolerance (no over-runs auto-forwarded, period) |

### C. Anomaly Checks

| # | Criterion | Threshold |
|---|---|---|
| 13 | Amount vs vendor history | Within 2× the vendor's median invoice amount over the last 12 months (anti-double-billing) |
| 14 | Frequency vs vendor history | Not the 2nd+ invoice from this vendor in the last 7 days, unless vendor record explicitly allows weekly billing |
| 15 | Cross-agent flags | Zero (per `chief-of-staff-agent.md` cross-agent checks) |
| 16 | Project status | The PO's project is `ACTIVE` (not `CLOSED`, not `ON HOLD`) |

### D. Hard Exclusions (any → manual gate, regardless of A/B/C)

- Any change-order language in invoice body or subject (`change order`, `CO #`, `CCO`, `PCO`)
- Any retention or hold language (`retention`, `retainage`, `holdback`)
- Any lien or claim language (`lien`, `notice to owner`, `claim`)
- Any tax-only line items where the underlying work isn't on the PO
- Total ≥ Principal threshold (per SOP — read at runtime, not hard-coded)
- Vendor flagged `MANUAL-ONLY` on the vendor record
- First invoice from a vendor (no history yet — always manual for first 3 invoices)

All 16 criteria + exclusion list pass → Clean. Any failure → Manual.

---

## What Auto-Forward Means

For a Clean invoice:

1. Classifier identifies the inbound as `Financial` / type=`invoice`, routes to Financial Watcher.
2. Financial Watcher extracts all fields, runs all 16 criteria + exclusion list.
3. If Clean: Financial Watcher writes to Adaptive Build via the integration with:
   - Vendor, invoice #, date, due date
   - PO #, cost code, total, line items
   - Status: `PENDING APPROVAL` (Adaptive Build's internal state — **not** auto-approved within Adaptive Build)
   - Source artifact link (email message-ID)
   - Foundry classification metadata (criteria evaluation snapshot)
4. Financial Watcher writes the corresponding row to the Drive invoice log Sheet with status `AUTO-FORWARDED — AWAITING ADAPTIVE BUILD APPROVAL`.
5. `#foundry-bot-log` records the auto-forward with the full 16-criteria snapshot.
6. The COS Daily Packet shows the auto-forward in the new section described below.
7. Adaptive Build's own approval workflow takes over from there. Foundry does **not** approve invoices inside Adaptive Build.

**Key distinction:** auto-forward ≠ auto-pay. The invoice still requires whoever approves invoices in Adaptive Build to approve it. The expansion eliminates the *Foundry* gate, not the *Adaptive Build* gate. (And it must stay that way — see Hard Rule #3.)

---

## Clean Invoice Auto-Forward Digest — Format

Appended to the COS Daily Packet, between the Invoice section and the Routine Auto-Log Digest:

```
────────────────────────────────────────
CLEAN INVOICE AUTO-FORWARD DIGEST (no Foundry action needed; Adaptive Build approval still required)
────────────────────────────────────────
[N] invoices auto-forwarded to Adaptive Build under Level 3.
Total dollar value: $[total]
Largest single invoice: $[max] — [vendor] — [PO#]

Breakdown by vendor (top 5 by count):
  • [vendor]: [N] invoices, $[total]
  • ...

Spot-check (5 random samples):
  • [INV-ID] $[amount] — [vendor] — [PO#] — [Adaptive Build link] — [Recall to manual]
  • ...

Adaptive Build status check (as of digest time):
  • Pending approval in AB: [N]
  • Approved in AB since auto-forward: [N]
  • Rejected in AB since auto-forward: [N]
  • Stale > 5 business days: [N]  ← these auto-flag for re-review

→ View full audit: [link to "Clean Invoice Audit" Sheet in Drive]
```

---

## Reversal (Recall)

Every auto-forwarded invoice is **recallable** within 1 business day of forward time. Recall:

1. Marks the Drive log row as `RECALLED`
2. Posts a request to Adaptive Build to mark the invoice as `WITHDRAWN` (does **not** delete; preserves audit)
3. Reroutes the invoice to the manual Invoice gate
4. Posts the recall to `#foundry-bot-log` with reviewer ID and reason

After the 1-business-day window, recall is no longer one-click — recall after that point requires Principal approval (because Adaptive Build downstream actions may have started).

**Recall counter:** if reviewer recalls ≥ 2 invoices in a 5-business-day window, auto-forward halts and returns to manual until a spec review.

---

## Halt Conditions (Auto-Revocation)

| Trigger | Scope of halt | Re-enable |
|---|---|---|
| ≥ 2 recalls in a 5-business-day window | All Level 3 auto-forward | Spec review required |
| ≥ 1 auto-forward that violates any of criteria 8–12 (PO/budget) due to integration bug | All Level 3 auto-forward | Bug-fix + spec review |
| Adaptive Build rejection rate on auto-forwarded invoices ≥ 5% over 10 business days | All Level 3 auto-forward | Spec review |
| Any auto-forward of a hard-excluded invoice (change order, lien, etc.) | All Level 3 auto-forward, **permanent** until spec rewrite | Spec rewrite required, not just review |
| Vendor record drift (vendor marked `MANUAL-ONLY` but auto-forward happened anyway) | All Level 3 auto-forward | Spec review + classifier audit |
| Circuit Breaker triggered on Level 3 | All Level 3 | Per §7 Circuit Breaker re-activation process |

---

## Authority Mapping

| Action | Currently allowed under Level 3? | Allowed under Level 3 activation? |
|---|---|---|
| Write invoice extraction to Drive invoice log | Yes (Level 1) | Yes |
| Forward Clean invoice to Adaptive Build with `PENDING APPROVAL` status | **No** | **Yes** (this is the activation) |
| Forward an invoice failing any of the 16 criteria or hard exclusions | No | No |
| Approve an invoice within Adaptive Build | No | **No** — never. This is permanent. |
| Modify or delete an Adaptive Build invoice (other than `WITHDRAWN` via Recall) | No | No |
| Write to QBO, Smartsheet, or other SOR | No | No |
| Pay an invoice | No | **No** — never. Pay flows are out of scope for the entire platform. |

---

## Hard Rules

1. Auto-forward is **only** to Adaptive Build, with status `PENDING APPROVAL`. The Adaptive Build approval gate is preserved.
2. Auto-forward **never** results in payment. Payment authorization is out of scope of every Foundry authority level, present or proposed.
3. AI **never** approves an invoice inside Adaptive Build. This is a permanent rule; it cannot be expanded by any future spec.
4. The 16 cleanliness criteria are **all required**. Removing any criterion requires a spec update.
5. Hard exclusions are **add-only** in `pilot-sandbox-config.md`; removing one requires spec update.
6. Recall window is 1 business day. Post-window recall requires Principal approval.
7. Every auto-forward writes the full 16-criteria evaluation snapshot to the audit Sheet. Snapshot-missing forwards are rejected at the boundary.
8. First 3 invoices from any vendor are **always manual**. Vendor history is required before auto-forward eligibility.
9. Cumulative invoiced ≤ PO total + **0% tolerance**. There is no "small overage is OK" mode.
10. This activation can be revoked at any time via the Circuit Breaker.

---

## Pilot Activation

This activation is **NOT ACTIVE**. Activation requires:

1. Human reviewer approves this spec (Approval gate, §6).
2. Reviewer edits `CLAUDE.md` §7 to change the `Level 3: Auto-Forward Invoice` row from `NOT ACTIVE` to `ACTIVE | [date] | [date+7]`.
3. Reviewer edits `CLAUDE.md` §4 to remove "Adaptive Build" from the "AI may NOT write to" list and add a footnote pointing here.
4. Vendor records audited and `AUTO-FORWARD-ELIGIBLE` set per vendor (default `no`; reviewer flips to `yes` per vendor).
5. Cost-code Exclusion List finalized in `pilot-sandbox-config.md`.
6. Adaptive Build integration credentials confirmed scoped to **write-PENDING-APPROVAL only**, not approve, not pay. Scope audit posted to `#foundry-bot-log`.
7. First 10 business days run in **shadow mode**: Clean invoices are identified and a forward draft is composed, but the actual Adaptive Build write does **not** happen. Reviewer compares the draft to their manual forward action. Mismatch rate must be ≤ 2%.
8. After shadow mode, if mismatch rate ≤ 2% and no false-cleans (invoices marked Clean that should have been manual): enable real auto-forward.
9. Probation window: 7 business days from real auto-forward activation. Revocable immediately per Circuit Breaker.
10. KPIs (during probation):
    - Recall rate (target: < 1%)
    - Adaptive Build rejection rate on auto-forwarded invoices (target: < 2%)
    - False-cleans (target: 0; any > 0 → permanent halt + spec review)
    - Hard-exclusion bypasses (target: 0; any > 0 → permanent halt + spec rewrite)
    - Reviewer time savings (target: ≥ 30 minutes/day vs. pre-activation baseline)
    - Dollar volume processed (informational, not gating)

---

## What This Does NOT Do

- Does not authorize payment.
- Does not approve invoices inside Adaptive Build.
- Does not auto-forward invoices outside the Clean criteria.
- Does not modify POs.
- Does not modify the vendor record.
- Does not write to QBO, Smartsheet, or any other SOR.
- Does not change the Invoice gate for non-Clean invoices.

---

## Related Documents

- `CLAUDE.md` — §3 (active scope), §4 (the line that changes at activation), §6 (Invoice gate), §7 (Level 3 activation + Circuit Breaker)
- `chief-of-staff-agent.md` — emits the Clean Invoice Auto-Forward Digest
- `intake-classifier-spec.md` — produces confidence scores consumed by criteria 6, 7
- `integration-architecture.md` — Adaptive Build integration scope and credentials
- `watcher-system.md` — Financial Watcher; Invoice gate flow
- `pilot-sandbox-config.md` — vendor records, cost-code Exclusion List, threshold values
- `slack-command-flows.md` — `/foundry recall [inv-id]` and `/foundry resume level-3` commands
