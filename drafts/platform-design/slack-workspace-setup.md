---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Slack Workspace — Setup Specification

## Purpose

Define the Slack workspace structure, channel architecture, bot configuration, and command routing for the Foundry platform. Slack is the **primary user interface** — every workflow starts here and routes to Drive (system of record).

---

## Channel Architecture

### Project Channels

One channel per active project. All project-specific commands, drafts, and notifications go here.

| Channel | Purpose | Members |
|---|---|---|
| `#proj-[name]` | Primary project channel. All RFI, CO, decision, submittal activity. | PM, Super, Design lead, Procurement lead, Owner's Rep |
| `#proj-[name]-field` | Field-only: daily reports, safety, QC, delivery confirmations. | Super, PM, field staff |

### Function Channels

Cross-project channels for functional teams.

| Channel | Purpose | Members |
|---|---|---|
| `#construction-ops` | Cross-project construction issues, weekly summaries, escalations | All PMs, Supers, Owner's Rep |
| `#procurement` | Submittal status, lead-time flags, vendor issues | Procurement team, PMs |
| `#design-review` | RFIs and submittals awaiting design response | Design team, PMs |
| `#decisions` | Decision log items pending Owner's Rep or Principal action | Owner's Rep, Concierge, PMs |
| `#fund` | Investor updates, draw requests, fund-level decisions | Fund Manager, Owner's Rep, Principal |
| `#warranty` | Open warranty claims, contractor follow-up | Property Mgmt, PMs (as needed) |
| `#foundry-ask` | Hermes inbound-inquiry drafts (SMS/email/mentions). Each inbound = one thread. PM/Super approves with reactions. | PMs, Supers, Owner's Rep |

### System Channels

| Channel | Purpose | Members |
|---|---|---|
| `#foundry-bot-log` | Audit log of all bot actions (drafts created, commands run, escalations surfaced) | Kuan, Owner's Rep |
| `#daily-summaries` | AI-generated daily summaries by role, posted each morning | All |

### Reaction-Approver User Groups

| Group | Members | Purpose |
|---|---|---|
| `@hermes-approvers` | PMs + Supers on active projects | Only these users' ✅ / ✏️ reactions on Hermes drafts trigger the Send gate. Reactions from non-members are ignored. |

---

## Bot Configuration

### Bot Name

`@foundry-ai`

### Bot Behavior Rules

1. **Draft only.** Bot never posts final outputs. Every output is labeled `DRAFT` and requires human action.
2. **Channel-scoped.** Bot responds in the channel where the command was issued. No DM-based workflows (keeps everything visible).
3. **Audit logged.** Every bot action is mirrored to `#foundry-bot-log` with: timestamp, user, command, channel, and output summary.
4. **No external reach.** Bot does not send email, SMS, or post to GHL. It drafts messages that humans copy and send.
5. **Threaded responses.** Bot replies in threads to keep channels clean. Summary notifications go to the main channel.

---

## Slash Command Routing

### Command → Action → Destination

| Command | What Happens | Data Source | Output Destination |
|---|---|---|---|
| `/rfi` | Bot presents intake form. AI pre-fills fields. User submits draft. | RFI log schema | Draft posted in project channel thread. On approve: user copies to Drive RFI log Sheet. |
| `/co` | Bot presents CO intake form. AI flags threshold. User submits draft. | CO log schema | Draft posted in project channel thread. On approve: user copies to Drive CO log Sheet. |
| `/decision` | Bot presents decision request form. AI routes to correct approver. | Decision log schema | Draft posted in `#decisions` + project channel. |
| `/submittal` | Bot presents submittal intake. AI links to spec section and suggests reviewer. | Submittal register schema | Draft posted in project channel. On approve: user copies to Drive submittal register. |
| `/warranty` | Bot presents claim intake. AI checks warranty expiry and identifies contractor. | Warranty claim log schema | Draft posted in `#warranty` + project channel. |
| `/fund` | Bot generates investor update draft from project data. | CO log, decision log, lease-up data | Draft posted in `#fund`. Fund manager edits, then sends via GHL. |
| `/daily` | Bot generates role-appropriate daily summary. | All logs | Posted in `#daily-summaries` and optionally in project channel. |

### Command Access by Role

| Command | PM | Super | Procurement | Design | Owner's Rep | Fund Mgr | Property Mgmt |
|---|---|---|---|---|---|---|---|
| `/rfi` | Yes | Yes | — | — | — | — | — |
| `/co` | Yes | — | — | — | — | — | — |
| `/decision` | Yes | — | — | — | Yes | — | — |
| `/submittal` | Yes | — | Yes | — | — | — | — |
| `/warranty` | — | — | — | — | — | — | Yes |
| `/fund` | — | — | — | — | — | Yes | — |
| `/daily` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |

---

## Notification Routing

AI surfaces items to the right people at the right time. Notifications are **passive** (posted to channels), not **push** (no DMs, no pings unless explicitly configured by the user).

### Morning Digest (8:00 AM, automated post to `#daily-summaries`)

For each role, a threaded summary:

```
@PM Daily — 2026-02-08

🔴 Overdue (3)
  • RFI-041 — 3 days past due [Drive link]
  • PCO-009 — sub pricing late [Drive link]
  • WC-001 — contractor response late [Drive link]

🟡 Due Today (2)
  • RFI-047 — routing deadline
  • Pre-task checklist — concrete pour tomorrow

📊 Exposure: $127K open | Contract sum: $4.2M

[View in Drive] [/daily for full details]
```

### Event-Driven Notifications

| Event | Channel | Notification |
|---|---|---|
| RFI response received (Design posts in thread) | `#proj-[name]` | Bot tags PM: "RFI-047 response received. Run `/rfi review` to draft review notes." |
| SLA breach | `#proj-[name]` + `#construction-ops` | Bot posts: "SLA BREACH: RFI-041 is 3 days overdue. Escalation drafted. PM review required." |
| CO above threshold | `#decisions` | Bot posts: "PCO-012 ($45K) exceeds project threshold. Principal sign-off required." |
| Lead-time critical | `#procurement` + `#proj-[name]` | Bot posts: "CRITICAL: Lobby lighting float is -14 days. Escalation drafted." |
| Warranty claim filed | `#warranty` | Bot posts: "WC-003 filed — Urgent — plumbing, Unit 204. Contractor: ABC Plumbing." |

---

## Integration Points

### Slack → Drive (Manual, AI-Assisted)

```
User runs /rfi
  → Bot drafts entry in Slack thread
  → User clicks "Approve & Log"
  → Bot formats the entry as a copy-pasteable row
  → User pastes into the Drive RFI log Sheet
  → User replies "logged" in thread
  → Bot marks the draft as logged in #foundry-bot-log
```

Future state (when approved): Bot writes directly to the Sheet via Google Sheets API. But **not in pilot** — manual copy-paste first.

### Slack → GHL (Manual)

```
User runs /fund
  → Bot drafts investor update in Slack
  → Fund manager edits in Slack
  → Fund manager copies text to GHL
  → Fund manager sends via GHL
  → Fund manager replies "sent" in thread
```

### Slack → Fieldwire / OpenSpace / CompanyCam (Reference Only)

Bot may include links to Fieldwire tasks, OpenSpace captures, or CompanyCam albums in summaries and drafts. Bot does not create, edit, or close items in these tools.

---

## Setup Checklist (Pilot)

- [ ] Create Slack workspace or use existing
- [ ] Create project channel: `#proj-[pilot-name]`
- [ ] Create project field channel: `#proj-[pilot-name]-field`
- [ ] Create function channels: `#construction-ops`, `#procurement`, `#design-review`, `#decisions`, `#fund`, `#warranty`
- [ ] Create system channels: `#foundry-bot-log`, `#daily-summaries`
- [ ] Install or configure `@foundry-ai` bot
- [ ] Register slash commands: `/rfi`, `/co`, `/decision`, `/submittal`, `/warranty`, `/fund`, `/daily`
- [ ] Set command access per role table above
- [ ] Pin Drive project folder link in project channel
- [ ] Pin log Sheet links in project channel
- [ ] Brief team on channel purpose and command usage
