---
status: draft
owner: Kuan
last-reviewed: 2026-05-17
---

# Intake Classifier — Design Specification

## Concept

The Intake Classifier is the **first agent every inbound item touches**. Email arrives, Slack message arrives, Drive upload arrives — the classifier reads it, decides which function watcher (if any) should handle it, and produces a draft routing entry. It is the seam between raw intake and the function watchers.

Without an explicit classifier, each watcher must scan every inbox and pick out its own items — which means N watchers reading the same email N times, with N different opinions on classification. The classifier centralizes that decision.

The classifier is bound by the same rules as every other agent in this platform: **draft only, human gates, no execution authority**. It does not route anything to a watcher autonomously; it produces a routing draft that the human (or the COS, on the human's behalf, via the Approval gate) confirms.

> Per `CLAUDE.md` §4 and §6, AI may not "Approve, publish, or execute without explicit human confirmation." The classifier honors this. Routing a misclassified item to a watcher is an execution-grade action and is gated.

---

## What the Classifier Does

| # | Function | Output |
|---|---|---|
| 1 | Read raw intake (email, Slack message, Drive upload notification) | Raw item buffered with metadata (sender, timestamp, channel, attachment list) |
| 2 | Detect function | One of: Construction/CA, Procurement, Financial Controls, Warranty, Executive/Decisions, **or** `out-of-scope` |
| 3 | Detect type within function | Invoice, RFI, submittal, defect report, vendor inquiry, escalation, status update, ambiguous |
| 4 | Detect missing fields | Project name, dollar amount, due date, owner — flag whichever are absent |
| 5 | Detect duplicates | Same email thread, same attachment hash, same Slack thread — mark as `duplicate-of` rather than as a new item |
| 6 | Produce a routing draft | One row per item, see Format below |
| 7 | Hand off | Route the draft to the target function watcher's intake queue. The watcher then drafts the actual response/log entry as it would today. |

## What the Classifier Does Not Do

1. Does not reply, forward, or send any external message.
2. Does not write to any system of record. The classifier's outputs live in the intake queue (a Drive Sheet) and Slack `#foundry-bot-log` only.
3. Does not approve another agent's draft. It produces *its own* routing draft, which goes through the Route gate (`CLAUDE.md` §6).
4. Does not classify items outside the five active functions (§3). If detection lands on `out-of-scope`, the item is surfaced as `out-of-scope — no watcher` in the daily packet and stops. A human decides whether to handle manually.
5. Does not infer dollar amounts, due dates, or owners from natural language. If a field isn't explicit in the source, the classifier flags it missing rather than guessing.

---

## Inputs (Authoritative List)

| Source | Path | Cadence |
|---|---|---|
| Project email inboxes | `project-name@shb.studio`, `info@shb.studio`, `support@shb.studio` | Real-time (poll every 60s) |
| Slack channels listed in `slack-workspace-setup.md` as intake-bearing | `#proj-[name]`, `#procurement`, `#warranty`, `#decisions`, `#field` | Real-time (event subscription) |
| Drive upload notifications | Project folder per `drive-project-structure.md` | Real-time (push) |

The classifier does **not** read any agent's output. It is upstream of every watcher and the COS.

---

## Function Detection — Decision Rules

Detection is **rule-based first, model-assisted second**. The rules below are hard. The model is only used to break ties or assign within an already-detected function.

### Hard routing rules (deterministic)

1. **Sender domain or address match** — if the From: address matches an SOP-listed routing for a given function, route there. (Routing table lives in `pilot-sandbox-config.md`.)
2. **Inbox match** — `support@shb.studio` → Warranty. `info@shb.studio` → Procurement *or* Financial (model decides between the two using subject + attachment signals).
3. **Slack channel match** — `#warranty` → Warranty Watcher. `#procurement` → Procurement Watcher. Channel is authoritative; cross-posted items get the channel they were posted in, not the cross-post.
4. **Attachment-type match** — `.pdf` with `invoice` in filename OR vendor letterhead detected → Financial.
5. **Threshold match** — explicit dollar amount in body ≥ Principal threshold (from SOP) → also flag for Executive Watcher in parallel.

### Model-assisted detection

Used only when hard rules produce no match or ambiguity. Returns:
- `function`: one of the five active functions or `out-of-scope`
- `confidence`: 0.0–1.0
- `reason`: one-sentence justification citing the signal used

If `confidence < 0.7`, the item is marked **ambiguous** and surfaced in the daily packet for the human to assign. The classifier does not pick a function it isn't confident about.

---

## Routing Draft — Format

One row per item, written to the Intake Queue Sheet in Drive and posted to the COS for the daily packet.

```
[INTAKE-ID]   [received-at]   [source]
  From:        [sender]
  Subject:     [subject or first 60 chars]
  Function:    [function]   (confidence: [0.0-1.0])
  Type:        [invoice|RFI|submittal|defect|inquiry|escalation|status|ambiguous]
  Missing:     [list of missing fields, or "none"]
  Dup:         [INTAKE-ID of original, or "no"]
  Routing:     [target watcher]
  Draft:       [one-line summary the classifier would hand to the watcher]
  Status:      AWAITING ROUTE GATE
```

**Status values:**
- `AWAITING ROUTE GATE` — classifier has produced the draft; human or COS packet must confirm routing.
- `ROUTED` — human confirmed; item handed to the target watcher's queue.
- `OUT-OF-SCOPE` — function detected as outside the five active functions; no watcher routing.
- `AMBIGUOUS — NEEDS HUMAN` — confidence below 0.7 or hard rules conflict.
- `DUPLICATE` — references an earlier INTAKE-ID; no further routing.

---

## Authority Mapping (Phase 2)

| Action | Authority Required | Status (2026-05-17) | Classifier Behavior |
|---|---|---|---|
| Read inboxes and channels | None (read-only) | Always allowed | Allowed |
| Write routing draft to Intake Queue Sheet | Level 1 (Auto-Log) | ACTIVE | Allowed (after human clicks Approve & Log on each row, **or** after COS packet approval batch-clears them) |
| Post `#foundry-bot-log` audit entries | Level 2 (Auto-Notify) | ACTIVE | Allowed |
| Hand off to target watcher's queue | Route gate (human confirmation) | Always required | Allowed only after human or COS-packet-approved Route gate clearance |
| Reply to email or forward email | — | NOT defined | **Blocked** |
| Auto-route without Route gate | — | NOT defined | **Blocked** |

A future authority level (e.g., "Level 5: Auto-Route High-Confidence Items") could permit the classifier to skip the Route gate for items above a confidence threshold. That level does not exist today. Adding it requires the same process as Levels 1–2 (§7).

---

## Hard Rules

1. The classifier **observes and proposes**. It does not act.
2. The classifier **never replies, forwards, or sends** anything external.
3. The classifier **never writes to a system of record other than the Intake Queue Sheet** under Level 1.
4. The classifier **never picks an out-of-scope function** as a fallback. `out-of-scope` is a valid output. Forcing an in-scope label on an out-of-scope item is forbidden.
5. The classifier **never guesses missing fields**. Missing means flag, not infer.
6. The classifier **never re-classifies an already-routed item** without human instruction.
7. The classifier **logs every read and every classification** to `#foundry-bot-log`.
8. The classifier **does not consume any other agent's output** — see `chief-of-staff-agent.md` Hard Rule #8 for the symmetric constraint on COS output.

---

## Failure Modes & Mitigations

| Failure Mode | Risk | Mitigation |
|---|---|---|
| Misclassification | Wrong watcher gets the item | Route gate is mandatory. Confidence is shown to the reviewer. Reviewer can pick a different function in one click. |
| Hallucinated field | Phantom invoice / phantom RFI in queue | Hard rule: classifier never invents fields. Missing fields are flagged, not filled. |
| Duplicate routed as new | Watcher does double work | Attachment hash + thread-ID dedup runs before routing draft is produced. Suspected dups are marked `DUPLICATE` not `AWAITING ROUTE GATE`. |
| Out-of-scope item force-classified | AI silently expands its own scope | Hard Rule #4. `out-of-scope` is a first-class output; daily packet shows the count. |
| High volume → reviewer fatigue | Route gate becomes rubber stamp | COS packet aggregates routing drafts; reviewer can batch-approve a confidence band (≥ 0.95) with one click but lower-confidence items remain single-click per item. Batch-approve threshold is configurable per project. |
| Classifier and watcher disagree on type | Confusion downstream | COS cross-agent flag (see `chief-of-staff-agent.md` §"Cross-Agent Checks"). Human decides. |

---

## Pilot Activation

1. Deploy classifier in **shadow mode** for 5 business days. Routing drafts are written to the Intake Queue Sheet but the Route gate is forced manual (no batch-approve, no COS-packet routing).
2. After 5 days, if function-detection accuracy ≥ 95% on a human-labeled sample of ≥ 50 items: enable COS-packet batched Route gate for items at confidence ≥ 0.95.
3. Probation window: 7 business days from batched-Route activation. Revocable immediately per the Circuit Breaker (§7).
4. KPIs:
   - Function-detection accuracy on labeled sample (target: ≥ 95%)
   - Out-of-scope items force-classified as in-scope (target: 0; any > 0 → halt)
   - Field-inference violations — classifier filling a missing field (target: 0; any > 0 → halt)
   - Route gate override rate by reviewer (target: < 10%; higher → re-tune rules)

---

## Out of Scope (Explicitly)

The following are **not** part of this spec and require separate proposals:

- Classifier replying, forwarding, or sending any external message.
- Classifier auto-routing without the Route gate (would require new authority level in `CLAUDE.md` §7).
- Classifier reading agent outputs (would create a feedback loop — symmetric to `chief-of-staff-agent.md` Hard Rule #8).
- Classifier handling functions outside the five active ones (would require §3 scope expansion).

---

## Related Documents

- `CLAUDE.md` — §1 (truth domains), §3 (active functions), §4 (boundaries), §6 (Route gate), §7 (authority levels + circuit breaker)
- `watcher-system.md` — function watchers that receive the classifier's routed items
- `chief-of-staff-agent.md` — consumes classifier drafts in its daily packet
- `pilot-sandbox-config.md` — routing tables, inbox-to-function mapping, threshold values
- `slack-command-flows.md` — `/foundry pause` and `/foundry revoke` commands for circuit-breaker integration
- `drive-project-structure.md` — Intake Queue Sheet location and schema
