---
status: draft — NOT ACTIVE
owner: Kuan
last-reviewed: 2026-05-17
proposed-activation-order: 4 of 4 (highest risk; introduces a NEW authority level; first level that sends external email; mutates `CLAUDE.md` §4)
---

# Level 5 (NEW) — Auto-Reply Templated Vendor Email

## Concept

Today, `CLAUDE.md` §4 explicitly says **"AI may NOT: Reply to or forward email."** This proposal defines a new authority level (Level 5) that creates one narrow exception: AI may send a strictly-templated **acknowledgment-only** auto-reply to a vendor email, from a dedicated mailbox, after passing every cleanliness check in this spec.

This is the **single largest authority increase** in the platform's history. Every other authority level has been internal-only (Drive, internal Slack, internal Adaptive Build write). Level 5 is the first that puts AI's words in front of an external party. That asymmetry — they see it, you can't unsee it — is why this spec has the longest exclusion list, the most aggressive halt triggers, and the smallest template library.

Auto-reply means **acknowledge receipt and state who will respond**. It does not answer questions, confirm commitments, restate amounts, or agree to anything. The actual reply remains a human action.

> Auto-reply requires editing `CLAUDE.md` §4 — specifically, replacing the blanket "AI may NOT reply to or forward email" line with a narrow exception that points to this spec. The §4 edit is part of activation, not part of this spec.

---

## When Auto-Reply Fires

An incoming vendor email triggers auto-reply only if **all** of the following hold. Any failure → no auto-reply, falls back to manual Send gate.

### A. Sender and Vendor

| # | Criterion | Threshold |
|---|---|---|
| 1 | Sender email | Matches a single vendor record in Drive |
| 2 | Vendor `AUTO-REPLY-ELIGIBLE` | `yes` on the vendor record (default `no`) |
| 3 | Vendor first-contact-history | At least 5 prior emails exchanged with this vendor (human-to-human) over ≥ 30 days |
| 4 | Sender domain | Not on the Sender Block List (`pilot-sandbox-config.md`) |
| 5 | Sender authentication | SPF + DKIM + DMARC all pass on the incoming email |
| 6 | Reply-to is a person | The vendor's `From:` is a real, named individual (not `noreply@`, not `info@`, not `accounts@`) |

### B. Content

| # | Criterion | Threshold |
|---|---|---|
| 7 | Classifier confidence on function detection | ≥ 0.95 |
| 8 | Classifier-detected type | One of: `intake-receipt`, `routing-confirmation`, `out-of-office-equivalent` |
| 9 | Body length | ≤ 2,000 characters of body text (long emails trigger manual) |
| 10 | Attachments | Zero attachments, or only attachments classified as non-actionable (signature image, vendor logo) |
| 11 | Body kill-phrase scan | Passes (see Kill-Phrases below) |
| 12 | Subject kill-phrase scan | Passes |
| 13 | Thread depth | Zero (first email in thread) **or** prior thread is closed in Foundry as `RESOLVED` for ≥ 7 days |
| 14 | Language detected | English (other languages route to manual until language-specific templates exist) |

### C. Timing and Rate Limits

| # | Criterion | Threshold |
|---|---|---|
| 15 | Time-of-receipt | Within last 6 hours (older emails → manual) |
| 16 | Vendor cooldown | No auto-reply to this vendor in last 24 hours (prevents AI-to-AI loops, prevents flooding) |
| 17 | Global cooldown | No more than 20 auto-replies platform-wide in any 60-minute window |
| 18 | Business hours | Local business hours (Mon-Fri 08:00–18:00, project timezone) **or** vendor record explicitly allows after-hours auto-reply |

### D. Hard Exclusions (any → manual gate, regardless of A/B/C)

- **Dollar exposure mentioned** — any `$`, `usd`, `dollar`, number-followed-by-`k`, `million`, etc.
- **Commitment language** — `commit`, `promise`, `guarantee`, `binding`, `accept`, `agree`, `confirm` (except in specific allowed phrasing inside templates)
- **Schedule changes** — `delay`, `slip`, `expedite`, `rush`, `priority`, `deadline change`
- **Change-order language** — `change order`, `CO #`, `CCO`, `PCO`, `extra`, `additional cost`
- **Legal / dispute** — `lien`, `claim`, `attorney`, `legal`, `cease`, `desist`, `litig`, `breach`, `dispute`
- **Safety** — `unsafe`, `injury`, `accident`, `OSHA`, `incident`, `near miss`
- **Confidentiality** — `confidential`, `NDA`, `do not share`, `proprietary`
- **Urgency** — `urgent`, `ASAP`, `emergency`, `today`, `now`, `immediately`
- **Tone signals** — `escalate`, `frustrated`, `concerned`, `disappointed`, `unacceptable`
- **Out-of-scope** — function detected as one of the 5 deferred functions per §3

All 18 criteria pass + zero hard exclusions → eligible. Any failure → manual.

---

## Allowed Templates

The template library is **deliberately small**. Three templates, total. Expanding requires a spec update — not a config change.

### Template T1: intake-receipt (first email in thread)

```
Subject prefix: [AUTO-ACK] {original_subject}

Hi {sender_first_name},

Your email has been received and routed to {owner_role} ({owner_name}).
{owner_name} will follow up by {response_due_date} ({hours_remaining}h from now).

This is an auto-acknowledgment from a triage system. {owner_name} is the
person handling your message — please send any urgent follow-up directly
to {owner_email}.

Reference: {foundry_intake_id}

— {entity_name} Operations
   (Auto-acknowledgment. Not a commitment, schedule, or approval.)
```

### Template T2: routing-confirmation (vendor sent to wrong contact)

```
Subject prefix: [AUTO-ACK — ROUTING] {original_subject}

Hi {sender_first_name},

Your email has been received. For matters related to {topic_category},
the correct contact is {owner_role} ({owner_name}, {owner_email}).
I've forwarded your message to {owner_name}, who will follow up by
{response_due_date}.

This is an auto-acknowledgment from a triage system. Please direct
future correspondence on this topic to {owner_email}.

Reference: {foundry_intake_id}

— {entity_name} Operations
   (Auto-acknowledgment. Not a commitment, schedule, or approval.)
```

### Template T3: out-of-office-equivalent (the named owner is OOO)

```
Subject prefix: [AUTO-ACK — DEFERRED] {original_subject}

Hi {sender_first_name},

Your email has been received. {owner_name} is out of office until
{owner_return_date}. {backup_owner_name} ({backup_owner_email}) is
covering and will respond by {response_due_date}.

This is an auto-acknowledgment from a triage system.

Reference: {foundry_intake_id}

— {entity_name} Operations
   (Auto-acknowledgment. Not a commitment, schedule, or approval.)
```

**Hard rules on templates:**

- No template contains a dollar amount.
- No template contains a commitment ("we will," "we promise," "we agree").
- No template contains a schedule change.
- Every template ends with the disclaimer: `(Auto-acknowledgment. Not a commitment, schedule, or approval.)` — this line is non-negotiable.
- Every template includes `Reference: {foundry_intake_id}` for traceability.
- Every template includes the **named human owner's direct email** so the vendor can escalate around the bot.
- Every template uses a `[AUTO-ACK]` (or `[AUTO-ACK — ...]`) subject prefix, before the original subject, so a vendor's mail filter can route or hide auto-acks.

---

## Sender Identity and Mailbox

Auto-replies are sent **only** from a dedicated mailbox: `auto-ack@{entity-domain}`. Reasoning:

1. The mailbox itself signals (to anyone who looks) that this is automated.
2. Replies to the auto-ack go to a separate inbox that the watcher processes specifically as "vendor responded to our auto-ack" — different handling rules apply.
3. If the vendor's reply contains substantive content, it routes to manual immediately (see Vendor Response Handling below).
4. Auto-ack mailbox is never used for any human-sent communication. The mailbox is one-way out.

Email setup requirements (must be in place before activation):
- DKIM, SPF, DMARC configured for `auto-ack@{entity-domain}`
- An automated `Auto-Submitted: auto-generated` header on every outbound (RFC 3834 compliance)
- A `Precedence: bulk` header on every outbound
- A `List-Unsubscribe` header that points to an internal page where vendors can request to be removed from the auto-reply allowlist (which adds them to the Sender Block List)

---

## Vendor Response Handling

When a vendor replies to an auto-ack:

| Vendor reply type | Foundry behavior |
|---|---|
| Substantive reply (any body text > 50 chars, or any attachment) | Manual Send gate. No further auto-reply on this thread, ever. Watcher Draft + per-item Approve. |
| One-liner ack (`thanks`, `ok`, `received`) | Logged. No further action. |
| Out-of-office bounce | Logged. No further action. |
| Bounce / undeliverable | Logged. Vendor's `AUTO-REPLY-ELIGIBLE` automatically flips to `no`. Halt trigger if pattern emerges. |
| Hostile / complaint language (kill-phrase scan) | Vendor's `AUTO-REPLY-ELIGIBLE` automatically flips to `no`. **Permanent halt** for this vendor; spec review required to re-enable. |

---

## Audit and Reversal

Every auto-reply logs to:

1. `#foundry-bot-log` — timestamp, vendor, sender, recipient, classifier outputs, criterion evaluation, template name+version, full body of auto-reply as sent.
2. **Auto-Reply Audit Sheet** in Drive — same data, queryable.
3. The auto-ack mailbox's Sent folder — full message as RFC 5322 source.
4. The original project's Drive folder — message archived under `Vendor Correspondence`.

**Reversal:** an auto-reply cannot be unsent, but the platform supports a **retraction**:

1. Reviewer clicks `Retract` in the COS Daily Packet (or `/foundry retract [intake-id]` in Slack).
2. A retraction email is composed using a fixed template:

```
Subject: [CORRECTION] re: {original_subject}

Hi {sender_first_name},

The earlier auto-acknowledgment sent at {auto_ack_time} was sent in error.
Please disregard it. {owner_name} will follow up directly.

— {entity_name} Operations
```

3. Retraction must be sent within **1 hour** of original auto-reply for one-click reviewer action. After 1 hour, retraction requires Principal approval (because the vendor may have taken action on the auto-ack).
4. Retraction increments the **retraction counter**. ≥ 1 retraction in a 5-business-day window → Halt.

---

## Halt Conditions (Auto-Revocation)

| Trigger | Scope of halt | Re-enable |
|---|---|---|
| ≥ 1 retraction in a 5-business-day window | All Level 5 auto-reply | Spec review required |
| Any auto-reply containing forbidden content (dollar, commitment, etc.) | **Permanent halt** of all Level 5; full spec rewrite required | — |
| Auto-reply sent to a non-allowlisted vendor | Permanent halt of all Level 5 | Spec rewrite |
| Auto-reply sent outside business hours when vendor not after-hours-eligible | All Level 5 | Spec review |
| Vendor response indicates auto-reply caused confusion or harm (hostile language detected in any vendor reply to auto-ack) | That vendor permanently; aggregate ≥ 3 vendors → all Level 5 permanent halt | Spec rewrite for aggregate |
| Bounce rate > 1% over 7 days | All Level 5 | Investigate before resuming |
| Vendor unsubscribe rate > 5% of allowlisted vendors over 30 days | All Level 5 | Spec review |
| Cooldown violation (auto-reply to same vendor within 24h) | All Level 5 | Bug-fix + spec review |
| Global cooldown violation (> 20 auto-replies in 60 min) | All Level 5 | Bug-fix + spec review |
| Hard-exclusion bypass (any of the 9 hard-exclusion categories matched but auto-reply sent anyway) | **Permanent halt**; spec rewrite required | — |
| Circuit Breaker triggered on Level 5 | All Level 5 | Per §7 Circuit Breaker re-activation process |

The Halt conditions for Level 5 are **deliberately more aggressive** than Levels 1–3. Single-incident halt is the default for external-facing failure.

---

## Authority Mapping

| Action | Currently allowed? | Allowed under Level 5? |
|---|---|---|
| Reply to vendor email with templated acknowledgment, all 18 criteria pass | **No** (§4 forbids any email reply) | **Yes** (this is the new authority) |
| Reply to vendor email with free-form content | No | No |
| Reply to vendor email containing dollar amount | No | No |
| Reply to internal email | No | No (not in scope — Level 2 internal Slack is different) |
| Forward vendor email | No | No |
| Send unsolicited email to a vendor | No | No |
| Send any email from a mailbox other than `auto-ack@{entity-domain}` | No | No |
| Send email after vendor has opted out | No | No |

---

## Hard Rules

1. Auto-reply is **only** from `auto-ack@{entity-domain}`.
2. Auto-reply is **only** from the three approved templates (T1, T2, T3). No free-form, no template-mixing.
3. Auto-reply **never** contains a dollar amount, commitment, schedule change, or approval.
4. The disclaimer line `(Auto-acknowledgment. Not a commitment, schedule, or approval.)` is **non-negotiable** on every auto-reply.
5. Vendor allowlist (`AUTO-REPLY-ELIGIBLE: yes`) is **opt-in per vendor**, defaults to `no`, and requires ≥ 5 prior human-to-human emails over ≥ 30 days.
6. Vendor cooldown is **24 hours** between auto-replies to the same vendor; global cooldown is **20 / 60 min** platform-wide.
7. Retraction window for one-click is **1 hour**; after that, Principal approval required.
8. Hostile vendor response → that vendor flips to `AUTO-REPLY-ELIGIBLE: no` automatically.
9. ≥ 1 retraction per 5-business-day window halts Level 5.
10. Any hard-exclusion bypass → **permanent halt of Level 5** until spec rewrite.
11. Auto-reply is **never** sent in response to an email older than 6 hours.
12. Auto-reply is **never** sent in a thread that has prior substantive vendor responses (thread depth = 0, or prior thread fully `RESOLVED` ≥ 7 days).
13. Auto-reply is **never** sent if the vendor's sender email lacks SPF + DKIM + DMARC pass.
14. This activation can be revoked at any time via the Circuit Breaker.
15. AI may **never** approve an outbound auto-reply on a human's behalf for an item failing any criterion. There is no override.

---

## Pilot Activation

This level is **NOT ACTIVE** and does **not exist** in `CLAUDE.md` §7 yet. Activation requires:

1. Human reviewer approves this spec (Approval gate, §6).
2. Reviewer edits `CLAUDE.md` §4 — modifies the "AI may NOT: Reply to or forward email" line to add narrow exception pointing here.
3. Reviewer edits `CLAUDE.md` §7 — adds a new row: `Level 5: Auto-Reply Templated Vendor Email | ACTIVE | [date] | [date+14]` (probation is **14 days** for Level 5, not 7, because external-facing).
4. Email infrastructure: `auto-ack@{entity-domain}` set up with DKIM/SPF/DMARC, `Auto-Submitted`, `Precedence`, `List-Unsubscribe` headers configured. Setup audit posted to `#foundry-bot-log`.
5. Vendor allowlist reviewed: zero vendors marked `AUTO-REPLY-ELIGIBLE: yes` at activation. Each vendor flip requires explicit human action.
6. Template library finalized in `pilot-sandbox-config.md` with version tags. Templates rendered and reviewed against this spec.
7. Kill-phrase list finalized.
8. First **10 business days** run in **strict shadow mode**: auto-replies are composed and logged to the Audit Sheet but **not sent**. Reviewer compares each draft to what they would have done. Mismatch rate must be ≤ 1% (stricter than other levels).
9. After 10 days, if mismatch rate ≤ 1% and no kill-phrase bypass attempts: enable real send, but **only for vendors explicitly added to the allowlist**.
10. Begin with **at most 2 vendors** on the allowlist for the first 5 days post-activation. Expand only if KPIs remain green.
11. Probation window: **14 business days** from real send activation. Revocable immediately per Circuit Breaker.
12. KPIs (during probation):
    - Retraction rate (target: 0; > 0 → halt)
    - Vendor bounce rate (target: < 0.5%)
    - Vendor unsubscribe rate (target: < 2% of allowlisted vendors per month)
    - Hostile vendor response rate (target: 0; > 0 → halt for that vendor permanently)
    - Hard-exclusion bypass rate (target: 0; > 0 → permanent halt + spec rewrite)
    - Reviewer time savings (target: ≥ 45 minutes/day across allowlisted vendor volume)

---

## What This Does NOT Do

- Does not authorize free-form email replies. Templates only. Three of them.
- Does not authorize external Slack DMs, SMS, calls, or any other external channel. Email-only, vendor-only.
- Does not authorize any commitment, dollar reference, schedule change, or approval.
- Does not authorize sending from any mailbox other than `auto-ack@{entity-domain}`.
- Does not authorize replies to internal email.
- Does not authorize replies to customer email (vendor-only — customer-facing email requires a separate spec).
- Does not change the Send gate for non-Clean cases.
- Does not interact with GHL or any other marketing/sales system (those are Level 4 scope).

---

## Why the Bar Is So High

Levels 1–3 fail loudly inside the platform: a bad auto-log creates a wrong Drive row that the reviewer sees in the next digest. A bad auto-forward creates a wrong Adaptive Build entry that the Adaptive Build approver sees before paying.

Level 5 fails **outside** the platform: a bad auto-reply lands in a vendor's inbox. The reviewer doesn't see it until the vendor either (a) responds confused, (b) responds angry, or (c) takes the auto-reply as a commitment and acts on it. Reversal is a retraction email — better than nothing, but worse than not having sent the original.

That asymmetry is the only reason this spec is the longest and most restrictive. It's not paranoia. It's a recognition that the cost function changed when "external" entered scope.

---

## Related Documents

- `CLAUDE.md` — §3 (active scope), §4 (the line that changes at activation), §6 (Send gate), §7 (Level 5 activation row — added at activation, not in this spec)
- `chief-of-staff-agent.md` — emits the Level 5 audit summary in the Daily Packet
- `intake-classifier-spec.md` — produces confidence + type detection consumed by criteria 7, 8
- `watcher-system.md` — function watchers feeding into the auto-reply queue
- `integration-architecture.md` — `auto-ack@{entity-domain}` mailbox setup
- `pilot-sandbox-config.md` — vendor records, allowlist, kill-phrase list, template version registry
- `slack-command-flows.md` — `/foundry retract [intake-id]` and `/foundry resume level-5` commands
- `slack-workspace-setup.md` — `#foundry-bot-log` audit channel
