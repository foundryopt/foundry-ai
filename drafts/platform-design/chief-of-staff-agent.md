---
status: draft
owner: Kuan
last-reviewed: 2026-05-17
---

# Chief of Staff Agent — Design Specification

## Concept

The Chief of Staff (COS) Agent is a **meta-watcher**. It does not monitor a domain. It monitors **the other agents**.

The COS reads every watcher's Daily Review Packet, every intake classifier's draft, and every Invoice Gate prompt, then produces **one consolidated review packet per business day** for the human reviewer. It replaces N separate reviews with 1.

The COS is bound by the same rules as every other agent in this platform: **draft only, human gates, no execution authority**. It does not approve other agents' drafts, does not loop directions back to them, and does not bypass any decision gate. It compresses review load. It does not replace review.

> Per `CLAUDE.md` §4 and §6, AI may not "Approve, publish, or execute without explicit human confirmation" and may not "Bypass decision gates or replace human sign-off." The COS honors both.

---

## What the COS Does

| # | Function | Output |
|---|---|---|
| 1 | Ingest outputs from every agent | Internal queue of items pending review |
| 2 | Deduplicate across agents | Single item per real-world event (e.g., one invoice surfaced by Financial + cross-referenced by Executive) |
| 3 | Cross-check for consistency | Flag if two agents disagree on classification, owner, or SLA |
| 4 | RACI check per item | Confirm the proposed Responsible / Accountable / Consulted / Informed match SOP |
| 5 | Threshold check | Flag items above Principal sign-off thresholds (escalate to SHB Group) |
| 6 | SLA / budget / schedule drift summary | Roll up all watcher risk flags into a single risk register |
| 7 | Order by priority | Rank items by severity × SLA-remaining × dollar exposure |
| 8 | Produce one packet | The COS Daily Packet — see Format below |

## What the COS Does Not Do

1. Does not approve any draft on the human's behalf.
2. Does not send instructions back to other agents based on its own judgment.
3. Does not modify any other agent's draft (it can flag a draft as inconsistent; the human edits or rejects).
4. Does not write to any system of record other than the COS Log Sheet (Level 1 Auto-Log scope) and `#foundry-bot-log` audit trail.
5. Does not post external messages (Slack DMs to guests, email, SMS) — same constraint as every other agent.
6. Does not chain agents. If Watcher A's output implies Watcher B should act, the COS surfaces the implication to the human; the human decides.

---

## Inputs (Authoritative List)

The COS consumes only outputs already produced by agents listed in `watcher-system.md` and `integration-architecture.md`:

| Source | Path | Cadence |
|---|---|---|
| Construction Watcher Daily Packet | Slack `#proj-[name]` + Drive | Daily, 8:00 AM |
| Procurement Watcher Daily Packet | Slack `#procurement` + Drive | Daily, 8:00 AM |
| Financial Watcher Daily Packet | Slack `#proj-[name]` + Drive | Daily, 8:00 AM |
| Warranty Watcher Daily Packet | Slack `#warranty` + Drive | Daily, 8:00 AM |
| Executive Watcher Daily Packet | Slack `#decisions` + Drive | Daily, 8:00 AM |
| Email/Slack Intake Classifier drafts | Slack threads + Drive intake log | Real-time (batched by COS) |
| Invoice Gate prompts | Slack `#proj-[name]` invoice queue | Real-time (batched by COS) |

The COS does **not** open new inboxes, watch new channels, or read raw email. Everything it sees has already been triaged by a domain agent.

---

## Cross-Agent Checks

These are the rules the COS applies. Each check produces a flag, never an action.

### 1. Consistency

- Same email or Slack thread classified differently by two agents → flag.
- Same invoice surfaced by Financial and Executive with different cost-code assumptions → flag.
- Same RFI referenced by Construction and Procurement with conflicting owners → flag.

### 2. RACI Alignment

- Proposed Responsible role must match `CLAUDE.md` §2 entity mapping (GC/CM = SHB Inc., Design = SHB Studio, etc.).
- If item proposes routing to a role not present in the mapping → flag.

### 3. Threshold / Escalation

- Any dollar exposure ≥ Principal threshold (read from SOP, not hard-coded here) → mark for SHB Group sign-off in the packet.
- Any item with SLA remaining ≤ 24h → mark URGENT.
- Any item blocked > 3 business days → escalate in packet.

### 4. Duplicate / Stale

- Same item appearing in two packets without resolution → consolidate into one row, note both sources.
- Item present in packet ≥ 3 days with no human action → flag as stale.

### 5. Authority Scope

- If any agent's draft requests an action outside the **currently active** authority levels (see `CLAUDE.md` §7), the COS marks it `OUT-OF-SCOPE — requires authority activation` and does not include it in the actionable queue.

---

## COS Daily Packet — Format

One packet, posted to Slack `#cos-daily` and archived to Drive. Mobile-first.

```
CHIEF OF STAFF — Daily Packet — [DATE]
Project: [name]   |   Items: [N]   |   URGENT: [N]   |   Stale: [N]

────────────────────────────────────────
1. URGENT (SLA ≤ 24h or blocked > 3d)
────────────────────────────────────────
  • [ID] [type] — [one-line summary]
        Owner: [role]   |   Source agent: [watcher]
        Why urgent: [SLA / blocker]
        Draft attached: [yes/no]
        → [ Approve & Log ]  [ Edit ]  [ Reject ]

────────────────────────────────────────
2. THRESHOLD / PRINCIPAL SIGN-OFF
────────────────────────────────────────
  • [ID] [type] — [summary] — $[amount] vs $[threshold]
        Routing: SHB Group (per §2)
        Draft attached: [yes/no]
        → [ Forward to Principal ]  [ Edit ]  [ Reject ]

────────────────────────────────────────
3. RISK REGISTER (consolidated)
────────────────────────────────────────
  • [item] — [risk] — [SOP ref] — [source agent]

────────────────────────────────────────
4. CROSS-AGENT FLAGS
────────────────────────────────────────
  • [item] — classified as [X] by [Agent A], [Y] by [Agent B]
        → [ Pick A ]  [ Pick B ]  [ Edit ]

────────────────────────────────────────
5. ACTIONABLE QUEUE (in priority order)
────────────────────────────────────────
  [ordered list of every remaining draft awaiting your approval,
   one row per item, with the same Approve/Edit/Reject controls]

────────────────────────────────────────
6. OUT-OF-SCOPE (requires authority activation)
────────────────────────────────────────
  • [item] — proposed action: [X] — current authority: [Level N]
        Status: parked. No action taken.

────────────────────────────────────────
7. MONITORING (no action requested)
────────────────────────────────────────
  • [N] items in monitoring across all watchers. No new movement.
```

### Delivery Rules

- One packet per business day, posted by 9:00 AM local (one hour after watcher packets).
- If no items: packet says `No items requiring review. [N] items in monitoring across [M] agents.`
- Never replaces the individual watcher packets — they continue to post for full-fidelity audit.
- COS packet links to each source watcher packet for traceability.

---

## Authority Mapping (Phase 2)

The COS operates strictly within the authority levels active per `CLAUDE.md` §7.

| Action | Authority Required | Status (2026-05-17) | COS Behavior |
|---|---|---|---|
| Read other agents' packets | None (read-only) | Always allowed | Allowed |
| Produce consolidated packet | None (draft only) | Always allowed | Allowed |
| Post COS packet to `#cos-daily` | Level 2 (Auto-Notify) | ACTIVE | Allowed |
| Post `#foundry-bot-log` audit entries | Level 2 (Auto-Notify) | ACTIVE | Allowed |
| Write packet archive row to COS Log Sheet in Drive | Level 1 (Auto-Log) | ACTIVE | Allowed (after human clicks Approve & Log on each row) |
| Auto-approve another agent's draft | — | NOT defined | **Blocked** |
| Send instructions to another agent | — | NOT defined | **Blocked** |
| Modify another agent's draft | — | NOT defined | **Blocked** |
| Write to Smartsheet / Adaptive Build / QBO / GHL | — | NOT defined | **Blocked** |

If a future authority level (e.g., "Level 5: COS Auto-Route") is proposed, it must be added to `CLAUDE.md` §7 with activation date, probation window, and revocation criteria — same process as Levels 1–2 on 2026-02-08. This spec does not introduce that level.

---

## Hard Rules (mirror Watcher Constraints)

1. The COS **observes and consolidates**. It does not act.
2. The COS **waits for human approval** before any logging, posting, or routing of a reviewed item.
3. The COS **does not send email, SMS, or external messages** under any circumstances.
4. The COS **does not write to systems of record** other than the COS Log Sheet under Level 1.
5. The COS **does not create, close, or modify items** in any tool.
6. The COS **logs every read and every consolidation** to `#foundry-bot-log`.
7. The COS **cites the source agent** for every item in its packet.
8. The COS **does not chain agents** — its packet is consumed by a human, not by another agent.
9. The COS **does not loop directions back to other agents**. If an agent's draft is wrong, the human edits or rejects it; the COS does not "correct" it.
10. The COS **cannot expand its own scope**. New checks, new inputs, or new outputs require a spec update to this file and human approval.

---

## Failure Modes & Mitigations

| Failure Mode | Risk | Mitigation |
|---|---|---|
| Source agent silent or late | COS packet incomplete | Packet lists each source agent and its last-seen timestamp. Missing agent = explicit "no packet received" line. |
| Two agents disagree | Human gets noisy packet | Cross-agent flags section isolates disagreements; rest of packet is unaffected. |
| COS misranks priority | Human misses urgent item | URGENT section is rule-based (SLA ≤ 24h, blocked > 3d), not heuristic. Human can resort. |
| COS hallucinates an item | False entry in packet | Every row cites the source agent + source packet ID. No source ID = item rejected before packet is posted. |
| COS overruns Phase 2 authority | Boundary violation | Authority Mapping table above is a hard allowlist. Any other action is blocked at the agent boundary. |
| Reviewer rubber-stamps packet | Defeats the human gate | Packet structure forces one click per item (Approve & Log / Edit / Reject) — no batch-approve button. |

---

## Pilot Activation

Per `pilot-sandbox-config.md` conventions:

1. Deploy COS in **read-only mode** for 5 business days. Packet is generated and archived to Drive but **not posted to Slack**. Human reviews via Drive only.
2. After 5 days, if cross-agent flag accuracy ≥ 90% and no out-of-scope actions attempted: enable Slack posting under Level 2 Auto-Notify.
3. Probation window: 7 business days from Slack activation. Revocable immediately.
4. KPIs:
   - Review time per day (target: ≤ 50% of pre-COS review time)
   - Items missed by COS but caught in watcher packets (target: 0)
   - Out-of-scope action attempts (target: 0; any > 0 → halt)
   - Reviewer override rate on COS priority (target: < 20%; higher → re-tune ranking)

---

## Out of Scope (Explicitly)

The following are **not** part of this spec and require separate proposals:

- COS sending directions to other agents without human review (would require new authority level in `CLAUDE.md` §7).
- COS auto-approving low-risk drafts on the human's behalf (same).
- COS triggering automations in Smartsheet, Adaptive Build, QBO, or GHL.
- COS replying to email or forwarding email.
- COS interacting with external parties on any channel.

If any of these are desired in the future, the path is: update `CLAUDE.md` §7 with the new authority level, define its probation and revocation criteria, then update this spec.

---

## Related Documents

- `CLAUDE.md` — operating instructions, AI boundaries, current phase
- `watcher-system.md` — source of the agent outputs the COS consumes
- `integration-architecture.md` — system layers and human gates
- `dashboard-human-simple-v1.md` — role-based dashboard fed in part by COS output
- `pilot-sandbox-config.md` — pilot project configuration this spec activates inside
