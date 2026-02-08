# Foundry AI — Operating Instructions

## 1. Source of Truth

| Domain | Location |
|---|---|
| SOPs, schemas, RACI, SLAs, control rules | This GitHub repository |
| Project memory, documents, log Sheets | Google Drive (canonical backup for ALL functions) |
| Daily operations, intake, approvals | Slack (single command surface) + Email (intake) |

GitHub stores governance only — not daily operations.
Drive is the canonical project memory and backup for all functions.
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

A "Project" includes the full lifecycle: Development, Design, Construction/CA, Procurement, Marketing, Sales/Showroom, Fund/Investors, Property Management, Warranty, Executive/Decisions.

All functions use Email and Slack for intake.

## 4. AI Boundaries (Non-Negotiable)

**AI may:**

- Monitor intake (email, Slack, Drive, logs)
- Classify, detect missing info, flag SLA / budget / schedule drift
- Draft responses, log entries, escalations, follow-ups
- Recommend next steps (including bidding outreach lists)
- Generate daily review packets and role-based summaries

**AI may NOT:**

- Approve, publish, send, or execute without explicit human confirmation
- Write to any system of record (Drive Sheets, Smartsheet, Adaptive Build, QBO)
- Reply to or forward email
- Send SMS, make calls, or send external-facing messages
- Trigger CRM automations or marketing sends
- Bypass decision gates or replace human sign-off

All AI output is a draft. Humans decide.

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
- **Log gate** — AI formats entry, human pastes into Drive Sheet
- **Route gate** — AI suggests routing per RACI, human confirms
- **Invoice gate** — AI extracts and checks, human confirms before Adaptive Build
- **Escalation gate** — AI drafts escalation, human reviews and sends
- **Approval gate** — AI summarizes for decision maker, human decides
- **Send gate** — AI drafts external message, human sends via GHL/email
- **Close gate** — AI suggests closure, human verifies and updates Sheet

## 7. Current Phase: Pilot Execution — SandBox

One active project. No automatic sending, approving, or posting.

- Watchers generate daily review packets
- Slack is the interaction surface
- Google Drive is the system of record
- Downstream tools (Adaptive Build, Smartsheet, GHL, etc.) are unchanged
- Email is read-only intake — AI does not reply or forward

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
| `integration-architecture.md` | System layers, data flows, full application inventory, human gates |
| `dashboards-by-role.md` | Role-based dashboards (pilot: PM, Executive, Procurement) |
| `slack-command-flows.md` | Slash command UI specs and routing |
| `slack-workspace-setup.md` | Channel architecture, bot config, notifications |
| `drive-project-structure.md` | Drive folder template, log Sheets, permissions |
| `pilot-plan.md` | 4-week pilot plan |
| `pilot-sandbox-config.md` | SandBox project: email, Drive, Slack, watchers, dashboards |
| `pilot-sandbox-day1-simulation.md` | Day 1 watcher output simulation |
