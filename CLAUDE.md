# Foundry AI — Operating Instructions

## 1. Source of Truth

The platform distinguishes three kinds of "truth." Conflating them causes drift.

| Truth domain | Location | Role |
|---|---|---|
| **Governance truth** | This GitHub repository | SOPs, schemas, RACI, SLAs, control rules, CLAUDE.md |
| **Intake truth** | Email (per function) | First arrival of real-world events (invoices, RFIs, submittals, warranty reports). Treated as the most trusted *ingestion* source — see `watcher-system.md` §"Email as First-Class Intake". |
| **Record truth** | Google Drive (Sheets + documents) | Canonical system of record. Approved entries land here after the Log gate. Drive is the backup for ALL functions. |
| Command surface | Slack (single — not Google Chat) | Slash commands, approvals, daily briefs, watcher output. Not a source of truth — an interaction layer over the three above. |

GitHub stores governance only — not daily operations.
Email is the most trusted *intake*; Drive is the canonical *record*. An item is not a record until a human has approved it through the Log gate (§6).
Do not invent workflows, roles, or timelines outside what is defined here. Flag gaps instead of assuming.

## 2. Entity Mapping (Authoritative)

| Role | Entity |
|---|---|
| GC / CM | SHB Inc. |
| Design | SHB Studio |
| Owner's Representative | SHB Group |
| Principal (Escalation / Threshold Sign-off) | SHB Group |
| Procurement | Builiq Inc. |

Do not introduce alternate mappings.

## 3. Project Scope

A "Project" currently covers **five operational functions** instrumented by watchers:

1. **Construction / CA** — RFIs, submittals, field issues, sub coordination
2. **Procurement** — vendor inquiries, bidding outreach, purchase orders
3. **Financial Controls** — invoices, budget drift, cost-code routing (Invoice gate to Adaptive Build)
4. **Warranty** — defect reports, tenant complaints, contractor follow-up
5. **Executive / Decisions** — cross-function escalations, threshold sign-off (SHB Group), risk register

These five are the platform's authoritative scope today. All five use Email and Slack for intake; all five route to Drive Sheets as records (§1).

**Deferred functions** (no watcher, no AI coverage in Phase 2): Development, Design, Marketing, Sales/Showroom, Fund/Investors, Property Management. These remain operated manually by the human team. Adding a watcher for any of them requires a new spec in `drafts/platform-design/` and a Phase advancement entry in §7 — it does not happen by accretion.

If an inbound item falls outside the five active functions, the AI does not classify, draft, or log it. It surfaces "out-of-scope — no watcher" and stops.

## 4. AI Boundaries (Non-Negotiable)

**AI may:**

- Monitor intake (email, Slack, Drive, logs)
- Classify, detect missing info, flag SLA / budget / schedule drift
- Draft responses, log entries, escalations, follow-ups
- Recommend next steps (including bidding outreach lists)
- Generate daily review packets and role-based summaries

**AI may (with human approval — Phase 2 authority):**

- Write approved log entries to Drive Sheets after human clicks "Approve & Log" (Level 1: Auto-Log)
- Post internal Slack notifications for SLA breaches, new item classifications, and delivery confirmations (Level 2: Auto-Notify)

**AI may NOT:**

- Approve, publish, or execute without explicit human confirmation
- Write to Smartsheet, Adaptive Build, QBO, or any SOR other than Drive Sheets via Auto-Log
- Reply to or forward email
- Send SMS, make calls, or send external-facing messages (including Slack DMs to external guests)
- Trigger CRM automations or marketing sends
- Bypass decision gates or replace human sign-off

All AI output that is not covered by an active authority level is a draft. Humans decide.

## 5. Interface Strategy

| Layer | Tool | Role |
|---|---|---|
| Command surface | **Slack** (single — not Google Chat) | Slash commands, approvals, daily briefs, watcher output |
| Intake | **Email** (all functions) | First-class input. AI reads, classifies, drafts review prompts. |
| System of record | **Google Drive** | Documents, attachments, log Sheets, final records |
| Dashboards | Read-only, mobile-first | Fed by watcher summaries — not raw tool screens |
| Governance | **GitHub** | SOPs, schemas, CLAUDE.md only |

## 6. Human Gates (Non-Negotiable)

Every workflow has explicit points where AI stops and a human acts:

- **Draft gate** — AI produces draft, human reviews and approves
- **Log gate** — AI formats entry, human clicks "Approve & Log," Open Task writes to Drive Sheet (Level 1 active)
- **Route gate** — AI suggests routing per RACI, human confirms
- **Invoice gate** — AI extracts and checks, human confirms before Adaptive Build
- **Escalation gate** — AI drafts escalation, human reviews and sends
- **Approval gate** — AI summarizes for decision maker, human decides
- **Send gate** — AI drafts external message, human sends via GHL/email
- **Close gate** — AI suggests closure, human verifies and updates Sheet

## 7. Current Phase: Phase 2 — SandBox

One active project. Two authority levels active.

| Authority | Status | Activated | Probation Ends |
|---|---|---|---|
| Level 1: Auto-Log | **ACTIVE** | 2026-02-08 | 2026-02-15 |
| Level 2: Auto-Notify | **ACTIVE** | 2026-02-08 | 2026-02-15 |
| Level 3: Auto-Forward Invoice | NOT ACTIVE | — | — |
| Level 4: GHL Draft-to-Send | NOT ACTIVE | — | — |
| Phase 3: Limited Dashboard Interaction | NOT ACTIVE | — | — |
| Phase 4: Status & Resolution | NOT ACTIVE | — | — |
| Phase F: Live Human Pilot | NOT ACTIVE | — | — |

- Open Tasks generate daily review packets and write approved log entries to Drive Sheets
- Open Tasks post internal Slack notifications (SLA breaches, new items, deliveries)
- Slack is the interaction surface
- Google Drive is the system of record
- Downstream tools (Adaptive Build, Smartsheet, GHL, etc.) are unchanged
- Email is read-only intake — AI does not reply or forward
- Either authority can be revoked immediately during probation

> **Phase naming.** The mixed numeric/letter labels above (Phase 2 / 3 / 4 / F) predate a consolidated roadmap. A linear renumbering proposal lives in `drafts/platform-design/phase-renumbering-proposal.md`. Until that proposal is adopted, the labels in this section are authoritative; the proposal is informational only.

### Circuit Breaker (Post-Probation)

Authority levels remain revocable after the probation window closes. This is not optional — it is the kill switch the platform depends on.

| Who may revoke | What they revoke | How | Effect |
|---|---|---|---|
| Principal (SHB Group) | Any active authority level | Post `/foundry revoke level-N reason="…"` in `#foundry-bot-log` **or** edit this §7 table to `REVOKED` and push to `main` | Open Task agents stop the corresponding action at the next polling cycle. No further log writes, notifications, or downstream actions for that level. |
| Owner's Rep (SHB Group) | Any active authority level | Same | Same |
| GC/CM lead (SHB Inc.) | Levels 1–2 (Auto-Log, Auto-Notify) | Same | Same |
| Any team member | Their own function's watcher output (pause posting, not the level itself) | Slack `/foundry pause [watcher] reason="…"` | The named watcher's packet is generated but not posted until unpaused. |

Revocation rules:

1. **Single-command kill is required.** No multi-step ceremony, no waiting period, no review meeting.
2. **Audit trail is non-negotiable.** Every revoke command writes to `#foundry-bot-log` and the COS Log Sheet with the actor, level, reason, and timestamp.
3. **Restoration is not automatic.** A revoked level returns to `NOT ACTIVE` and re-activating it requires the same activation process used originally (entry in this §7 table with new activation date and probation window).
4. **Default behavior on ambiguity is revoke.** If a team member is unsure whether to revoke, they revoke. The cost of a quiet day is lower than the cost of a runaway agent.

If the `/foundry` slash command is unavailable for any reason, editing this §7 table directly and pushing to `main` is the canonical fallback. The agents read this file as governance truth (§1).

## 8. Design Principles

- Work with a small team
- Manual-first, AI-assisted
- Mobile-friendly, minimal data entry
- No tool lock-in or over-automation
- Calm, clarity, and control — not speed

## 9. Change Control

- Preserve existing structure unless clearly broken
- Do not add tools or integrations without instruction
- Do not create new documents unless they enable pilot execution
- Prioritize clarity, accountability, and reviewability

## 10. Detailed Specs (Reference)

All detailed specifications live in `drafts/platform-design/`:

| Document | Contents |
|---|---|
| `watcher-system.md` | Function-level watchers, email intake, invoice gate, daily packets, bidding/outreach |
| `chief-of-staff-agent.md` | Meta-watcher that consolidates other agents' drafts into one daily review packet. Draft-only, stops at Approval gate. |
| `integration-architecture.md` | System layers, data flows, full application inventory, human gates |
| `dashboard-human-simple-v1.md` | Human-Simple Open Task Dashboard — role-based views, Cost/Time/Quality visuals (Smartsheet), Phase 3 interactions, Phase 4 preview |
| `phase-f-live-human-pilot.md` | Phase F — live human pilot for instrumentation validation, consent protocol, exit criteria, KPI gating |
| `dashboards-by-role.md` | Role-based dashboards — superseded by Human-Simple for v1, retained for v2+ reference |
| `slack-command-flows.md` | Slash command UI specs and routing |
| `slack-workspace-setup.md` | Channel architecture, bot config, notifications |
| `drive-project-structure.md` | Drive folder template, log Sheets, permissions |
| `pilot-plan.md` | 4-week pilot plan |
| `pilot-sandbox-config.md` | SandBox project: email, Drive, Slack, watchers, dashboards |
| `pilot-sandbox-day1-simulation.md` | Day 1 watcher output simulation |
| `intake-classifier-spec.md` | Email/Slack Intake Classifier — what it does, what it produces, where it stops. Referenced by `chief-of-staff-agent.md` and `watcher-system.md`. |
| `phase-renumbering-proposal.md` | Proposal to replace the current mixed Phase 2 / 3 / 4 / F / E / G labels with a linear sequence. Informational only until adopted in §7. |
