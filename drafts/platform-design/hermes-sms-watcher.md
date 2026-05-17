---
status: draft
owner: Kuan
last-reviewed: 2026-05-17
---

# Hermes — SMS-to-Slack Inquiry Watcher

## Concept

Hermes is a **watcher** (in the sense of `watcher-system.md`), not a chatbot. It gives the team and trusted subs one number to text for the four most common field questions — change order status, contract scope, schedule, drawings/specs — and turns each text into a threaded Slack draft that a PM/Super approves before any reply is sent.

Hermes does not send. GHL sends, after a human reacts `✅` in Slack. Hermes does not write to SoR beyond the existing Level 1 Auto-Log authority.

---

## Why a New Watcher

Existing watchers (Construction, Procurement, Financial, Warranty, Executive) are **outbound-facing** — they monitor inboxes and surface items for the team. Field subs currently have no fast read-path back to the system of record. They call/text PMs directly, which fragments truth, loses audit trail, and creates SLA risk.

Hermes is the inbound read-path. A single phone number → a single Slack channel → a single source of truth.

---

## Scope (Phase 1)

In scope:

- Inbound SMS to one GHL project number
- Intent classification (4 intents + fallback)
- RAG retrieval from Drive + Smartsheet (read-only)
- Drafted reply posted in Slack thread
- Reaction-based human gate
- Outbound SMS sent by GHL after approval
- Auto-Log of approved Q&A to Drive Sheet

Out of scope (Phase 1):

- Auto-reply without human approval (deferred — see "Future Authority")
- Inbound from unknown numbers (auto-route to PM, no draft attempted)
- Voice/MMS handling
- Two-way conversation memory across threads
- Writing back to Smartsheet, Adaptive Build, QBO

---

## Intake

### Channel

| Channel | Provider | Direction | Notes |
|---|---|---|---|
| Project SMS number | GHL (existing) | Inbound + Outbound | One number per project; matches SandBox config |
| Email forwarding | Existing inboxes | Inbound | Already handled by other watchers; Hermes only reads if the sender's question matches a Hermes intent |
| Slack mention | `@hermes` in `#foundry-ask` | Inbound | Internal team use; bypasses identity gate |

### Identity Gate (new)

Every inbound SMS is identity-checked **before** retrieval runs:

1. Lookup sender phone → GHL contact
2. Match contact → project + role (sub trade, PM, owner)
3. Determine entitlement set (what intents this sender may ask about)

Outcomes:

| Identity result | Behavior |
|---|---|
| Known sub on this project | Proceed to intent classification |
| Known contact, wrong project | Draft: "Got it — routing to the right team." Route to RACI owner for that contact's project. |
| Unknown number | Draft: "Thanks for reaching out — a PM will respond shortly." No retrieval. Route to PM. |
| Sender on block list | Suppress draft. Log to `#foundry-bot-log`. |

### Intake Normalizer

A small service (lives under `backend/src/ai/`) converts SMS, email, and Slack mentions into one event shape:

```
{
  source: "sms" | "email" | "slack",
  from: { phone | email | slack_user_id, ghl_contact_id?, role?, project? },
  body: string,
  attachments: [{ url, type }],
  received_at: timestamp,
  thread_key: string   // groups follow-ups within 30 min window
}
```

This is what Hermes consumes. Future watchers should reuse the same normalizer.

---

## Intents (Phase 1)

| Intent | Trigger signals | Retriever | Draft output |
|---|---|---|---|
| **CO status** | "CO", "change order", "extra", "approved?", "$ amount" | CO log Sheet (Drive) + contract clauses | CO #, status, $ impact, approver, current step |
| **Contract scope** | "scope", "in contract", "included", "specs say" | Contract PDF (Drive `Contracts/Executed/`) | Bullet summary + clause ID + page link |
| **Schedule** | "when", "schedule", "start", "finish", date words | Smartsheet read (master schedule) | Task name, planned start/finish, predecessor, float |
| **Drawings / specs** | sheet # pattern (`A-101`, `S2.1`), "detail", "spec section" | Drive `Drawings/Current/` index | Latest sheet link, revision date, RFI cross-refs if any |
| **Unknown / ambiguous** | classification confidence < 0.7 | none | "I'm not sure — routing to {PM per RACI}. Will follow up." |

Intent classifier runs on the normalized event body. Confidence threshold and trigger signals are tuned during Phase 0 shadow.

---

## Retrievers

Each retriever is a thin, read-only adapter. Hermes never writes through these paths.

| Retriever | Source | Auth | Returns |
|---|---|---|---|
| `co_log` | Drive Sheet `CO_Log` for project | Service account (read) | Rows matching CO # or natural-language match |
| `contract` | Drive PDF in `Contracts/Executed/` | Service account (read) | Top-k chunks (semantic) + clause/page refs |
| `schedule` | Smartsheet API | Read-only token | Task rows matching activity or date range |
| `drawings_index` | Drive folder index of `Drawings/Current/` | Service account (read) | Filename, sheet #, revision date, link |
| `ghl_contact` | GHL API | Read-only token | Contact ID, project tag, role |

All retrievals include source citations. Drafts always show the source — sheet link, drawing filename + revision date, Smartsheet row link, contract clause reference. **No citation, no draft.**

---

## Draft Format

Every Hermes draft in `#foundry-ask` follows the same shape:

```
🤖 Hermes draft — {intent} — confidence: {high|med|low}

From: {Sub Name} ({Trade}) · Project: {Project}
"{verbatim inbound SMS body}"

Answer:
{1–3 sentence answer}

Sources:
• {source 1 with link}
• {source 2 with link}

Suggested reply (GHL → {phone}):
> {drafted SMS reply, <= 320 chars}

React: ✅ approve  ✏️ edit  ❓ unsure  🚫 suppress
```

The verbatim inbound is always included so the PM can sanity-check that retrieval matched the actual question.

---

## Human Gates

Hermes uses Slack reactions on the draft message:

| Reaction | Trigger | System action |
|---|---|---|
| ✅ | PM/Super approves verbatim | GHL sends the suggested reply. Q&A logged via Auto-Log. |
| ✏️ | PM/Super wants edits | Slack opens edit modal; on save, GHL sends edited reply. Q&A logged. |
| ❓ | PM/Super unsure | Hermes posts holding reply ("PM verifying — back shortly"). RACI route triggered. No retrieval-based answer sent. |
| 🚫 | Draft is wrong / off-topic | Suppress; no SMS sent. Logged for evaluation. |

Only PM and Super roles can trigger ✅/✏️ — other reactions are ignored. Role check via Slack user group membership.

These map to existing CLAUDE.md gates:

- ✅ / ✏️ → **Send gate** (§6)
- ❓ → **Escalation gate** + **Route gate**
- 🚫 → no gate; eval signal only

---

## Logging

Every approved Q&A writes one row to a new Drive Sheet `Inquiries_Log` (under each project folder):

| Column | Source |
|---|---|
| Timestamp | Inbound `received_at` |
| Sender | GHL contact name + phone |
| Project | Identity gate output |
| Intent | Classifier output |
| Inbound body | Verbatim SMS |
| Reply sent | Final approved text |
| Approver | Slack user who reacted ✅ / ✏️ |
| Sources | Source URLs (semicolon-joined) |
| Latency (min) | Receive → reply sent |

Uses **Level 1: Auto-Log** authority (currently ACTIVE per CLAUDE.md §7). No new authority required.

Suppressed (🚫) and unsure (❓) drafts are logged to `#foundry-bot-log` only, not to the project Sheet.

---

## Phased Rollout

| Phase | Scope | Duration | Exit criteria |
|---|---|---|---|
| **0 — Shadow** | Hermes drafts in `#foundry-ask` from real inbound SMS. **No outbound reply sent.** PM reacts but reactions are evaluation only. | 2 weeks | ≥80% drafts judged "would have sent as-is" by PM. <5% retrieval errors. |
| **1 — Internal pilot** | Team-only inbound (PM/Super phone numbers in GHL). Human ✅ → GHL sends. | 2 weeks | 0 wrong-info incidents. 100% Auto-Log rows have citations. |
| **2 — One trusted sub** | Add 1 known sub on SandBox project. Identity gate fully enforced. | 2 weeks | Sub feedback neutral-to-positive. <10 min median reply latency in business hours. |
| **3 — SandBox subs** | All subs on SandBox project, gated by GHL contact entitlement. | Phase-gate review with Principal | Phase 2 SandBox exit criteria met. |

Phase 0 → 1 transition requires **explicit Principal sign-off** because Phase 1 is the first time AI-drafted text reaches an external party via SMS. CLAUDE.md §4 currently says "AI may NOT: send SMS." The human-send-via-GHL pattern keeps this intact in letter (GHL sends, not AI) but the spirit needs Principal confirmation. See "Governance Dependencies" below.

---

## Evaluation Metrics

Tracked weekly during Phase 0–2:

| Metric | Target | Source |
|---|---|---|
| Intent classification accuracy | ≥95% | Manual review of all unsure (❓) + 10% sample of approved |
| Retrieval precision (citations correct) | 100% | All approved drafts |
| % drafts approved as-is (✅) | ≥80% by end of Phase 1 | Reaction counts |
| % drafts suppressed (🚫) | ≤5% by end of Phase 1 | Reaction counts |
| Median reply latency (business hours) | ≤10 min | Inquiries_Log |
| Wrong-info incidents | 0 | Manual post-hoc audit + sub feedback |

Any wrong-info incident in Phase 1+ pauses Hermes pending root-cause review.

---

## Governance Dependencies

This watcher requires (before Phase 1 launch) the following changes elsewhere:

1. **CLAUDE.md §5** — add SMS as intake channel. Keep "AI does not send SMS" intact (sending is GHL-via-human).
2. **CLAUDE.md §6** — add **Identity gate** as a named human gate.
3. **`slack-workspace-setup.md`** — add `#foundry-ask` channel + PM/Super reaction-approver user group.
4. **`drive-project-structure.md`** — add `Inquiries_Log` Sheet to project folder template.
5. **`watcher-system.md`** — add Hermes row to the watchers table.

These edits are not in scope of this spec doc — they will be redlined in a follow-up PR before Phase 1 starts. Phase 0 (shadow, no outbound) can run under existing governance.

---

## Future Authority (deferred)

After 30 days of clean Phase 2/3 operation, consider a new authority:

- **Level 5: Auto-Reply for Safe Intents** — Hermes auto-sends replies for `schedule` and `drawings/specs` intents only, when classifier confidence ≥ 0.9 and retrieval returns single unambiguous match. CO and contract intents remain human-gated permanently.

This is not active. Document only.

---

## Open Questions

1. **Number ownership.** One GHL number per project (cleaner attribution) or one shared Hermes number with project disambiguation in body? Recommend per-project for SandBox.
2. **After-hours behavior.** Should Hermes auto-reply "Received — PM will respond at 7am" outside business hours, or stay silent? Recommend silent for Phase 0–1, revisit.
3. **Slack edit modal.** Custom Slack app needed for the ✏️ edit flow, or use a thread reply convention (`/hermes edit: <text>`)? Recommend slash command — simpler, no app needed.
4. **Smartsheet read scope.** Master schedule only, or also baseline + look-ahead sheets? Recommend master only for Phase 0; add look-ahead if PM feedback requests it.
