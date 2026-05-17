---
status: draft — NOT ACTIVE
owner: Kuan
last-reviewed: 2026-05-17
proposed-activation-order: 1 of 4 (lowest risk; expands an already-active level)
---

# Level 1 Expansion — Routine Auto-Log (No Per-Item Approve)

## Concept

Level 1 (Auto-Log) is active today, but every row requires a human to click **Approve & Log** before it lands in the Drive Sheet. For routine high-confidence items (sub weekly status, delivery confirmations, minor RFI acknowledgments), the per-item click is the bottleneck — not the judgment.

This expansion creates a sub-mode of Level 1: items meeting all of the **Routine Criteria** below are logged automatically and surfaced in a **daily digest**, not the per-item review queue. Items that miss any criterion fall back to the existing per-item Approve flow.

The expansion does not change Level 1's scope (Drive Sheets only — no Smartsheet, Adaptive Build, QBO, GHL). It changes the **interaction surface** for items already inside Level 1's scope.

> Per `CLAUDE.md` §4, AI may write log entries under Level 1. This spec narrows the per-item-Approve requirement for items below a routine threshold while preserving full audit trail and one-click revocation per the Circuit Breaker (§7).

---

## Routine Criteria (ALL must be true)

An item is "Routine" only if **every** condition below holds. Any failure → per-item Approve queue.

| # | Criterion | Threshold |
|---|---|---|
| 1 | Classifier confidence | ≥ 0.95 |
| 2 | COS cross-agent flags | 0 — no disagreement, no duplicate-of, no out-of-scope |
| 3 | Dollar exposure on the item | ≤ $2,500 *or* not applicable (item has no dollar field) |
| 4 | Item type | One of: delivery-confirmation, sub-weekly-status, minor-RFI-acknowledgment, status-update, vendor-receipt-acknowledgment |
| 5 | Source agent | One of the five active function watchers (no out-of-scope) |
| 6 | Item type-specific safety check | Passes (see Type-Specific Rules below) |
| 7 | Source artifact attached | Email message-ID or Slack thread-ID present and resolvable |

The thresholds above are **configurable per project** in `pilot-sandbox-config.md`, but the *structure* of having all seven conditions is not configurable. Removing a condition requires a spec update.

---

## Type-Specific Rules

### delivery-confirmation
- Must include vendor name matching an existing vendor record in Drive
- Must include date and PO# (if PO exists for the vendor)
- Excluded if delivery is partial, damaged, or short — those go to per-item Approve regardless of dollar value

### sub-weekly-status
- Must come from a subcontractor on the active project sub list
- Must include the week-ending date
- Excluded if status text contains any of: "delay," "issue," "behind," "stop work," "RFI," "change order," "claim"

### minor-RFI-acknowledgment
- ONLY the receipt acknowledgment ("RFI received, routing to [owner], response due [date]")
- The actual RFI response is **never** auto-logged — that always requires per-item review

### status-update
- Internal status updates only (no external-facing status reports)
- Must match a recurring update channel (weekly project status, monthly portfolio status)

### vendor-receipt-acknowledgment
- Acknowledging receipt of a vendor document (spec, drawing, certificate)
- Excluded if the document is an invoice, change order, or claim — those have their own gates

---

## What Auto-Log Means in Practice

Under this expansion, a Routine item:

1. Is classified by the Intake Classifier (`intake-classifier-spec.md`).
2. Is consumed by the COS (`chief-of-staff-agent.md`).
3. COS confirms all 7 criteria + type-specific rules pass.
4. COS writes the log row directly to the target Drive Sheet under Level 1.
5. COS does NOT post the item to the per-item Approve queue.
6. COS adds the item to that day's **Routine Auto-Log Digest** (delivered with the COS Daily Packet at 9:00 AM local).
7. `#foundry-bot-log` records the auto-log with all 7 criterion values and the cite-back to the source artifact.

The reviewer sees the digest, not 30 separate Approve prompts. The reviewer can spot-check any auto-logged row and reverse it with one click (see Reversal below).

---

## Routine Auto-Log Digest — Format

Appended to the COS Daily Packet under a new section between sections 6 (Out-of-Scope) and 7 (Monitoring):

```
────────────────────────────────────────
ROUTINE AUTO-LOG DIGEST (no action requested)
────────────────────────────────────────
[N] items auto-logged under Level 1 Routine sub-mode.

Breakdown by type:
  • delivery-confirmation: [N]
  • sub-weekly-status: [N]
  • minor-RFI-acknowledgment: [N]
  • status-update: [N]
  • vendor-receipt-acknowledgment: [N]

Breakdown by source agent:
  • Construction: [N]
  • Procurement: [N]
  • Financial: [N]
  • Warranty: [N]
  • Executive: [N]

Spot-check ([N] random samples):
  • [LOG-ID] [type] — [one-line summary] — [source agent] — [link to Drive row] — [Reverse]
  • [LOG-ID] [type] — [one-line summary] — [source agent] — [link to Drive row] — [Reverse]
  • [LOG-ID] [type] — [one-line summary] — [source agent] — [link to Drive row] — [Reverse]
  • [LOG-ID] [type] — [one-line summary] — [source agent] — [link to Drive row] — [Reverse]
  • [LOG-ID] [type] — [one-line summary] — [source agent] — [link to Drive row] — [Reverse]

→ View full digest: [link to Drive sheet "Routine Auto-Log Audit"]
```

**Spot-check rules:**
- 5 random samples shown by default
- If reviewer reverses any sample, 5 more samples are surfaced the next day
- If reviewer reverses ≥ 2 samples in a day, **auto-log halts** for that item type until reviewer re-enables it (see Halt below)

---

## Reversal

Every auto-logged row is reversible by a single human click. Reversal:

1. Marks the Drive Sheet row as `REVERSED` (does not delete — preserves audit trail).
2. Posts the reversal to `#foundry-bot-log` with reviewer ID and timestamp.
3. Increments the **reversal counter** for that item type for the current pilot window.
4. If reversal counter ≥ 3 for any item type within a 5-business-day window → that item type is auto-removed from Routine eligibility (Halt).

---

## Halt Conditions (Auto-Revocation)

Any of these conditions immediately disables Routine Auto-Log for the specified scope. Operator action is not required.

| Trigger | Scope of halt | Re-enable |
|---|---|---|
| ≥ 2 spot-check reversals on a single day | That item type, all projects | Reviewer command: `/foundry resume routine [type]` |
| ≥ 3 reversal-counter hits on an item type within 5 business days | That item type, all projects | New spec review required — not just a command |
| Any auto-log that violates §3 scope (logs an out-of-scope function) | All Routine Auto-Log, all types | Full Level 1 expansion revoked. Per-item Approve restored. Spec review required. |
| Classifier confidence drift > 5 pp downward over 7 days | All Routine Auto-Log | Investigate before resuming |
| Circuit Breaker triggered on Level 1 | All Level 1 (not just Routine) | Per §7 Circuit Breaker re-activation process |

Halt logs to `#foundry-bot-log` with full context. Halt is not the same as Circuit Breaker — Halt is mechanical, automatic, and item-type-scoped; Circuit Breaker is human-triggered and authority-level-scoped.

---

## Authority Mapping

| Action | Currently allowed under Level 1? | Allowed under Routine Auto-Log expansion? |
|---|---|---|
| Write log row to Drive Sheet after per-item human Approve | Yes | Yes |
| Write log row to Drive Sheet without per-item Approve, when all 7 criteria pass | **No** | **Yes** (this is the expansion) |
| Write log row for an item failing any of the 7 criteria | No | No — falls back to per-item Approve |
| Write log row for out-of-scope function | No | No |
| Write to any system of record other than Drive Sheets | No | No |
| Modify or delete a logged row | No | No (only mark as `REVERSED`) |

---

## Hard Rules

1. Routine Auto-Log **only** applies to items within Level 1's existing scope (Drive Sheets).
2. Routine Auto-Log **never** auto-logs an invoice. Invoices have their own gate.
3. Routine Auto-Log **never** auto-logs an item with any dollar exposure > $2,500 (per project, configurable lower; never configurable higher without spec update).
4. Routine Auto-Log **never** auto-logs an item with cross-agent flags.
5. Routine Auto-Log **never** infers a missing field. If a routine criterion can't be evaluated, the item is not routine.
6. Reversal is **always** one click. There is no "are you sure" dialog. The cost of an undo is lower than the cost of a not-undone bad row.
7. Halt triggers are **automatic and item-type-scoped**. They do not require human approval to fire.
8. The Routine Auto-Log Digest is **always part of the COS Daily Packet** when this expansion is active. It is not optional and cannot be hidden.
9. Every auto-logged row cites its source artifact (Email message-ID or Slack thread-ID). Rows without cite are rejected at the boundary.
10. This expansion can be revoked at any time via the Circuit Breaker (`CLAUDE.md` §7) — at which point Level 1 returns to per-item Approve mode.

---

## Pilot Activation

This expansion is **NOT ACTIVE**. Activation requires the following sequence:

1. Human reviewer approves this spec (Approval gate, §6).
2. Reviewer edits `CLAUDE.md` §7 to add a row: `Level 1 — Routine Auto-Log (sub-mode) | ACTIVE | [date] | [date+7]`.
3. Per-project routing tables in `pilot-sandbox-config.md` updated with the dollar threshold for that project (default $2,500).
4. Reversal counters initialized at 0.
5. First 5 business days run in **shadow mode**: items meeting all 7 criteria are queued for auto-log but NOT actually auto-logged — they go through per-item Approve as before, and the reviewer compares their decision against what the auto-log would have done. Mismatch rate must be ≤ 5%.
6. After 5 days, if mismatch rate ≤ 5% and no halt triggers fired: enable real auto-log.
7. Probation window: 7 business days from real auto-log activation. Revocable immediately per Circuit Breaker.
8. KPIs (during probation):
   - Reversal rate per item type (target: < 3% per type)
   - Reversal rate overall (target: < 2%)
   - Halt triggers fired (target: 0)
   - Reviewer-reported time savings (target: ≥ 30 minutes/day vs. pre-expansion baseline — measured against the COS-baseline study from R2)
   - Out-of-scope auto-logs (target: 0; any > 0 → permanent halt + spec review)

---

## What This Does NOT Do

- Does not change what counts as a valid log entry under Level 1.
- Does not expand Level 1's scope to any system of record other than Drive Sheets.
- Does not auto-approve drafts produced by any other agent.
- Does not change the COS Daily Packet structure for non-routine items.
- Does not change the Invoice Gate.
- Does not allow auto-log of items above the dollar threshold "if confidence is really high." There is no override.

---

## Related Documents

- `CLAUDE.md` — §3 (active scope), §4 (boundaries), §6 (Log gate), §7 (Level 1 activation + Circuit Breaker)
- `chief-of-staff-agent.md` — emits the Routine Auto-Log Digest
- `intake-classifier-spec.md` — produces the confidence score consumed by criterion 1
- `pilot-sandbox-config.md` — per-project dollar threshold
- `watcher-system.md` — function watchers whose output feeds this expansion
