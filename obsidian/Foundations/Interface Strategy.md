---
type: foundation
title: Interface Strategy
tags: [foundation, interfaces]
section: "5"
---

# Interface Strategy

| Layer | Tool | Role |
|---|---|---|
| Command surface | **Slack** (single — not Google Chat) | Slash commands, approvals, daily briefs, watcher output |
| Intake | **Email** (all functions) | First-class input. AI reads, classifies, drafts review prompts. |
| System of record | **Google Drive** | Documents, attachments, log Sheets, final records |
| Dashboards | Read-only, mobile-first | Fed by watcher summaries — not raw tool screens |
| Governance | **GitHub** | SOPs, schemas, [[CLAUDE]] only |

## Notes

- Slack is the **single** command surface — Google Chat is not used.
- Email is **read-only intake**. AI does not reply or forward. See [[What AI May Not Do]].
- Dashboards surface watcher summaries, not raw tool views.

## Related

- [[Source of Truth]]
- [[Phase 2 - SandBox]]
- [[Home]]
