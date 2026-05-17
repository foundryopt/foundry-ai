---
status: proposal — not adopted
owner: Kuan
last-reviewed: 2026-05-17
---

# Phase Renumbering Proposal

## Why

The current phase labels in `CLAUDE.md` §7 and across `drafts/platform-design/` mix three numbering schemes:

- **Numeric phases**: Phase 2, Phase 3, Phase 4
- **Authority levels** (numeric, separate axis): Level 1, Level 2, Level 3, Level 4
- **Letter phases**: Phase E, Phase F, Phase G

This is incoherent in three ways:

1. **Two "Phase 3"s exist.** §7 lists "Phase 3: Limited Dashboard Interaction" *and* "Level 3: Auto-Forward Invoice." Different things, same number-ish.
2. **Phase F is between Phase 4 and an undefined Phase 5.** Letter suffixes signal "out-of-band" but readers can't tell what they mean.
3. **Phases E and G appear in `phase-f-live-human-pilot.md` but not in `CLAUDE.md` §7.** Drift between governance and spec.

This proposal collapses the schemes into one linear sequence and keeps **authority levels as a separate, parallel axis** (which they already are conceptually).

This document is **informational only** until adopted in `CLAUDE.md` §7. Until adoption, the labels in §7 remain authoritative.

---

## Proposed Renumbering

### Phases (linear, single axis)

| New | Name | Replaces | Definition |
|---|---|---|---|
| **Phase 1** | Pre-pilot | (implicit) | Before 2026-02-08. No AI authority active. Manual ops only. |
| **Phase 2** | SandBox | Phase 2 (unchanged) | Current state. One active project. Levels 1–2 active. |
| **Phase 3** | Dashboard Interaction | "Phase 3: Limited Dashboard Interaction" | Human-Simple dashboard (`dashboard-human-simple-v1.md`) gains limited write-capable interactions. Gated by Level 3 authority (renamed — see below). |
| **Phase 4** | Status & Resolution | "Phase 4: Status & Resolution" | Watchers can mark items resolved/closed after human review, with single-click rollback. |
| **Phase 5** | Live Human Pilot | "Phase F: Live Human Pilot" | Live instrumentation validation per `phase-f-live-human-pilot.md`. |
| **Phase 6** | Multi-Project | "Phase E" (referenced, undefined in §7) | Platform supports more than one active project simultaneously. |
| **Phase 7** | Revenue-side Watchers | (new) | Adds at least one revenue-side function (Sales/Showroom, Marketing, or Fund) per the R-roadmap. Specific function chosen at Phase 6 close. |
| **Phase 8** | Full-Function Coverage | "Phase G" (referenced, undefined in §7) | All deferred functions (§3) have watchers. |

### Authority Levels (parallel axis, unchanged)

Authority levels stay numeric and stay separate from phases. They describe **what the AI is allowed to do**; phases describe **what is being piloted**. Levels can activate inside any phase ≥ 2.

| Level | Name | Status (2026-05-17) |
|---|---|---|
| Level 1 | Auto-Log | ACTIVE |
| Level 2 | Auto-Notify | ACTIVE |
| Level 3 | Auto-Forward Invoice | NOT ACTIVE |
| Level 4 | GHL Draft-to-Send | NOT ACTIVE |

(Note: the existing "Level 3: Auto-Forward Invoice" in §7 is preserved — see the conflict resolution below.)

---

## Old → New Mapping (complete)

| Old label | Where used | New label | Notes |
|---|---|---|---|
| Phase 2: SandBox | §7, `pilot-sandbox-config.md`, `pilot-plan.md` | Phase 2: SandBox | Unchanged. |
| Phase 3: Limited Dashboard Interaction | §7, `dashboard-human-simple-v1.md` | Phase 3: Dashboard Interaction | Title trimmed; meaning identical. |
| Phase 4: Status & Resolution | §7, `dashboard-human-simple-v1.md` | Phase 4: Status & Resolution | Unchanged. |
| Phase F: Live Human Pilot | §7, `phase-f-live-human-pilot.md` | Phase 5: Live Human Pilot | Letter dropped. |
| Phase E (referenced) | `phase-f-live-human-pilot.md` only | Phase 6: Multi-Project | Letter dropped; definition firmed up. |
| Phase G (referenced) | `phase-f-live-human-pilot.md` only | Phase 8: Full-Function Coverage | Letter dropped; placed after Phase 7 (revenue-side). |
| Level 1: Auto-Log | §7, `chief-of-staff-agent.md`, classifier spec | Level 1: Auto-Log | Unchanged. |
| Level 2: Auto-Notify | Same | Level 2: Auto-Notify | Unchanged. |
| Level 3: Auto-Forward Invoice | §7 | Level 3: Auto-Forward Invoice | Unchanged. |
| Level 4: GHL Draft-to-Send | §7 | Level 4: GHL Draft-to-Send | Unchanged. |

---

## Conflict Resolution: "Phase 3" vs "Level 3"

Today, §7 lists both:
- `Level 3: Auto-Forward Invoice` (an authority level)
- `Phase 3: Limited Dashboard Interaction` (a pilot phase)

Both exist because the axes are different. The proposal **keeps both** but renames them to make the axis explicit:

| Surface text | Refers to |
|---|---|
| "Phase 3" | The pilot phase (Dashboard Interaction). |
| "Level 3" | The authority level (Auto-Forward Invoice). |
| "Phase 3 + Level 3" | Used together when the activation of a phase depends on a level being active. |

Documents must always include the word "Phase" or "Level" before the number. Bare `3` is forbidden.

---

## Adoption Path

This proposal is not adopted automatically. To adopt:

1. Human reviewer approves this proposal (Approval gate, §6).
2. Edit `CLAUDE.md` §7 to replace the current Phase/Level table with the renumbered version.
3. Sweep `drafts/platform-design/*.md` for every old label and replace with the new label per the mapping above. Suggested order: `phase-f-live-human-pilot.md`, `dashboard-human-simple-v1.md`, `pilot-plan.md`, `pilot-sandbox-config.md`. The COS spec and the classifier spec already use Level-only references and need no changes.
4. Rename `phase-f-live-human-pilot.md` → `phase-5-live-human-pilot.md`. Update the `CLAUDE.md` §10 table accordingly.
5. Add an audit-trail entry to `#foundry-bot-log` noting the renumbering took effect.

Adoption is a single human-approved sweep. It is not done piecemeal; partial renumbering creates exactly the inconsistency this proposal is meant to remove.

---

## What this proposal explicitly does NOT change

- Authority level numbers, names, or scopes.
- Activation dates or probation windows.
- The circuit breaker (§7 — Circuit Breaker section).
- The active scope of Phase 2 (Levels 1–2).
- Any agent spec (COS, watchers, classifier).
- The dashboards or any Smartsheet/Adaptive Build/QBO/GHL integration.

---

## Related Documents

- `CLAUDE.md` §7 — current phase / authority labels (authoritative until this proposal is adopted)
- `phase-f-live-human-pilot.md` — Phase F (→ Phase 5) live pilot spec
- `dashboard-human-simple-v1.md` — references "Phase 3" and "Phase 4"
- `pilot-plan.md` — references "Phase 2"
