---
status: draft — NOT ACTIVE
owner: Kuan
last-reviewed: 2026-05-17
proposed-activation-order: 2 of 4 (low risk; expands an already-active level; internal-only)
---

# Level 2 Expansion — Internal Slack Ack-Reply

## Concept

Level 2 (Auto-Notify) is active today: AI can post internal Slack notifications for SLA breaches, new item classifications, and delivery confirmations. Today these are **outbound** — AI announces; humans react.

This expansion adds **inbound-triggered acknowledgments**: when a teammate pings an internal Slack channel with a routine intake, AI can post a templated acknowledgment ("received, routing to [owner], expected response by [SLA]") without waiting for human approval. It does not respond to the request itself — only acknowledges receipt and states the routing.

This is internal-only. External Slack DMs to guests remain blocked. Email replies remain blocked. The expansion does not change what AI is allowed to say externally.

> Per `CLAUDE.md` §4, AI may post internal Slack notifications under Level 2. This spec broadens that from "AI-initiated notifications" to "AI replies to internal pings with a templated acknowledgment," scoped narrowly and audited.

---

## Eligible Channels (Internal Only)

Ack-reply is permitted only in internal Slack channels. These are channels with **zero external (multi-channel guest or single-channel guest) members** at the time the ack-reply is composed.

| Channel | Function | Notes |
|---|---|---|
| `#proj-[name]` | Construction / Financial | Internal project staff only |
| `#procurement` | Procurement | Internal procurement staff |
| `#warranty` | Warranty | Internal support staff |
| `#decisions` | Executive | Internal leadership |
| `#field` | Construction (field updates) | Internal field supervisors |
| `#foundry-bot-log` | Audit trail | Internal only; ack-reply not used here, but listed for completeness |

DMs are **never** in scope, even between internal staff. Group DMs are **never** in scope. Threads in eligible channels are in scope as long as the parent message was posted in the channel.

Membership check runs every time before composing — if a guest is invited to the channel between posts, the next ack-reply attempt is **blocked** and surfaced as a per-item Approve.

---

## Eligible Triggers

An incoming message triggers an ack-reply only if **all** of the following hold:

| # | Criterion | Threshold |
|---|---|---|
| 1 | Message posted in an eligible channel (per above) | Yes |
| 2 | All current channel members are internal | Yes |
| 3 | Classifier confidence on function detection | ≥ 0.90 |
| 4 | Classifier-detected type is one of the eligible types (see below) | Yes |
| 5 | Message does NOT contain any kill-phrase (see Kill-Phrases) | True |
| 6 | Message author is a registered internal Slack user (not a guest, not a bot) | Yes |
| 7 | No ack-reply has already been posted in this thread | True |

Any failure → no ack-reply. Falls back to existing watcher Draft + per-item Approve flow.

---

## Eligible Types

The classifier-detected type must be one of:

- **intake-receipt** — initial routing of an incoming item (RFI, vendor inquiry, defect report, etc.)
- **owner-handoff** — naming the responsible person/role for an already-classified item
- **SLA-confirmation** — confirming the deadline for a response
- **status-request** — acknowledging a request for status without delivering the status itself

All four types share one property: the ack-reply is **informational, not substantive**. It tells the requester "we got this" and "here's who has it" — it does not answer the underlying question.

---

## Allowed Templates

Ack-replies are produced from a small, fixed template library. Free-form text is **not** allowed. The library lives in `pilot-sandbox-config.md` and may be edited there with human approval — but the structure is fixed here.

### Template: intake-receipt

```
Received. Routing to {owner_role} ({owner_name}). Expected first response by {response_due}.
Source: {source_artifact_link}
```

### Template: owner-handoff

```
Owner: {owner_role} — {owner_name}. RACI per §2 entity mapping.
```

### Template: SLA-confirmation

```
Deadline confirmed: {sla_deadline} (T-{hours_remaining}h). Owner: {owner_role}.
```

### Template: status-request

```
Status request received. Owner {owner_role} will respond by {response_due}. Not auto-answered.
```

**Forbidden in any template:**
- Dollar amounts
- Commitments ("we will," "we commit," "we promise")
- Schedule changes
- Approval language ("approved," "go ahead," "confirmed" — except `Deadline confirmed`)
- Any field that would, if wrong, create a downstream commitment

Templates are version-controlled. Every ack-reply records the template version used.

---

## Kill-Phrases (Immediate Per-Item Approve)

If the incoming message contains any of the following (case-insensitive substring match), ack-reply is **blocked** and the watcher's normal Draft + per-item Approve flow runs instead.

- Anything containing a dollar figure: `$`, `usd`, `dollar`, `k$`, `k usd`, `mm`, `million`, `thousand`
- Commitment language: `commit`, `promise`, `guarantee`, `binding`
- Escalation language: `escalate`, `principal`, `legal`, `attorney`, `litig`, `dispute`, `claim`, `lien`
- Change-order language: `change order`, `co`, `co#`, `cco`, `pco`
- Stop-work / safety: `stop work`, `unsafe`, `injury`, `injured`, `accident`, `osha`
- Confidentiality: `confidential`, `nda`, `do not share`, `internal only`
- Ambiguity flag: `not sure`, `unclear`, `tbd`, `?`

Kill-phrase list is configurable per project but **only by addition**, not by removal. Removing a kill-phrase requires a spec update.

---

## What Ack-Reply Looks Like in Practice

1. Internal staffer posts in `#proj-westview`: *"Got an RFI from Vendor X about the door schedule. Who owns this?"*
2. Classifier detects type=`intake-receipt`, function=Construction, confidence=0.94. No kill-phrases. Author is an internal Slack user.
3. All seven trigger criteria pass. Channel has no external members at post time.
4. Watcher composes ack-reply using `intake-receipt` template:
   *"Received. Routing to GC/CM (SHB Inc.). Expected first response by 2026-05-19 17:00. Source: [link]"*
5. Watcher posts the ack-reply in-thread to the original message.
6. `#foundry-bot-log` records: timestamp, channel, thread-TS, author, template version, all 7 criterion values, ack-reply text.
7. The underlying RFI continues through the normal Construction Watcher Draft + per-item Approve flow. The ack-reply does NOT close the loop on the RFI — it only acknowledges receipt.

---

## What This Is NOT

- Not a substantive reply. The ack-reply never answers the underlying question.
- Not a status update. Status updates remain in the watcher Draft flow.
- Not a routing decision. The classifier determines the owner per RACI; the ack-reply just states it.
- Not a commitment. The ack-reply states what's expected per SLA, not what's promised.
- Not external. Never sent to a channel with any guest member. Never sent as a DM.

---

## Audit and Reversal

Every ack-reply is logged to `#foundry-bot-log` and the **Ack-Reply Audit Sheet** in Drive with:

- Timestamp, channel, thread-TS
- Original message author and content
- Classifier outputs (function, type, confidence)
- Trigger criteria evaluation (all 7 values)
- Kill-phrase scan result
- Template name + version used
- Template fields filled
- Final ack-reply text as posted

**Reversal:** any human reading the channel can react with `:undo:` (or `/foundry undo [thread-ts]`) to:
1. Delete the ack-reply from Slack
2. Post a replacement watcher Draft for human review
3. Increment the reversal counter for that template
4. Halt the template if reversal counter ≥ 3 in any 5-business-day window

Reversal is one click. No "are you sure" dialog.

---

## Halt Conditions (Auto-Revocation)

| Trigger | Scope of halt | Re-enable |
|---|---|---|
| ≥ 2 reversals on a single template in a single day | That template only | Reviewer command: `/foundry resume ack-reply [template]` |
| ≥ 3 reversals on a template within 5 business days | That template only | Spec review required |
| Ack-reply posted in a channel that gained a guest member since the membership check | All ack-reply, all templates | Spec review + membership-check audit |
| Ack-reply contains forbidden language (dollar amount, commitment, etc.) | All ack-reply, all templates | Spec review |
| Circuit Breaker triggered on Level 2 | All Level 2 (not just ack-reply) | Per §7 Circuit Breaker re-activation process |

---

## Authority Mapping

| Action | Currently allowed under Level 2? | Allowed under Ack-Reply expansion? |
|---|---|---|
| Post AI-initiated internal Slack notification (SLA breach, new item, delivery) | Yes | Yes |
| Post templated ack-reply to internal channel ping (eligible types, criteria met) | **No** | **Yes** (this is the expansion) |
| Post ack-reply in DM | No | No |
| Post ack-reply in channel with any guest member | No | No |
| Post free-form (non-template) reply | No | No |
| Post ack-reply containing dollar amount or commitment | No | No |
| Edit or delete a posted ack-reply (other than reversal) | No | No |

---

## Hard Rules

1. Ack-reply is **only** internal Slack channels with zero external members at post time.
2. Ack-reply is **only** from the approved template library.
3. Ack-reply **never** contains dollar amounts or commitments.
4. Ack-reply **never** answers the underlying question.
5. Kill-phrase list is **add-only** at project level; removal requires spec update.
6. Membership check runs **at compose time, not at trigger time**. A guest invited mid-thread blocks the next reply.
7. Reversal is **always** one click. No confirmation dialog.
8. Every ack-reply cites the source thread and records the full criterion evaluation.
9. This expansion can be revoked at any time via the Circuit Breaker.
10. If ack-reply would conflict with a watcher Draft already in flight for the same thread, the watcher Draft wins; no ack-reply is posted.

---

## Pilot Activation

This expansion is **NOT ACTIVE**. Activation requires:

1. Human reviewer approves this spec (Approval gate, §6).
2. Reviewer edits `CLAUDE.md` §7 to add a row: `Level 2 — Internal Ack-Reply (sub-mode) | ACTIVE | [date] | [date+7]`.
3. Template library finalized in `pilot-sandbox-config.md` with version tags.
4. Kill-phrase list finalized in `pilot-sandbox-config.md`.
5. Channel allowlist (`pilot-sandbox-config.md`) reviewed — must explicitly list each channel with confirmed zero external members at activation.
6. First 5 business days run in **shadow mode**: ack-replies are composed and logged to the Audit Sheet but **not posted to Slack**. Reviewer compares draft to what they would have written. Mismatch rate must be ≤ 10%.
7. After 5 days, if mismatch rate ≤ 10% and no kill-phrase bypass attempts: enable real posting.
8. Probation window: 7 business days from real posting. Revocable immediately per Circuit Breaker.
9. KPIs (during probation):
   - Reversal rate per template (target: < 5% per template)
   - Reversal rate overall (target: < 3%)
   - Kill-phrase violations posted (target: 0; any > 0 → permanent halt + spec review)
   - Guest-membership violations (target: 0; any > 0 → permanent halt)
   - Reviewer-reported time savings (target: ≥ 20 minutes/day vs. pre-expansion baseline)
   - Author response (the human who got the ack-reply) satisfaction signal — captured by `:thumbsup:` / `:thumbsdown:` reactions (informational, not gating)

---

## What This Does NOT Do

- Does not allow external Slack messages.
- Does not allow email replies.
- Does not allow free-form text.
- Does not allow substantive answers.
- Does not change RACI assignments or commitments.
- Does not auto-approve any watcher Draft.

---

## Related Documents

- `CLAUDE.md` — §3 (active scope), §4 (boundaries), §6 (Send gate — note: ack-reply is *not* a Send gate event because it is internal Slack only), §7 (Level 2 activation + Circuit Breaker)
- `chief-of-staff-agent.md` — emits ack-reply audit counts in the Daily Packet
- `intake-classifier-spec.md` — produces the type + confidence consumed by trigger criteria
- `slack-workspace-setup.md` — channel architecture and membership rules
- `slack-command-flows.md` — `/foundry undo` and `/foundry resume ack-reply` commands
- `pilot-sandbox-config.md` — template library, kill-phrase list, channel allowlist
