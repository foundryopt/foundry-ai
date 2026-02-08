---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Single-Project Pilot — Plan

## Objective

Validate the full operational system on **one active project** before scaling. Confirm that dashboards, AI triage, and Slack commands reduce PM/Super friction and work for a small team.

## Pilot Criteria

Select a project that:

- Is in **active construction** (mid-build preferred — enough history to test aging, enough runway to test workflows)
- Has **active RFIs, COs, and submittals**
- Involves all four entity roles (SHB Inc., SHB Studio, SHB Group, Builiq Inc.)
- Has a **PM and Superintendent willing to use the system daily** for the pilot duration

## Pilot Duration

**4 weeks.** Enough time to see a full weekly cycle repeat and catch edge cases.

## Pilot Scope

### Week 0 — Setup (before pilot starts)

**Step 1: Select project and confirm team**

| Task | Owner | Deliverable |
|---|---|---|
| Select pilot project | Kuan | Project name confirmed |
| Confirm PM and Super are available and willing | Kuan | Names confirmed |
| Set project-defined CO approval threshold | Kuan + Owner's Rep | Dollar amount documented |

**Step 2: Google Drive setup (per `drive-project-structure.md`)**

| Task | Owner | Deliverable |
|---|---|---|
| Create project folder from template structure | PM | `Foundry Projects/[PROJECT-NAME]/` with all subfolders |
| Create RFI Log Sheet (from `rfi-log.csv` headers) | PM | Sheet in `03-construction/logs/` |
| Create CO Log Sheet (from `change-order-log.csv` headers) | PM | Sheet in `03-construction/logs/` |
| Create Decision Log Sheet (from `decision-log-schema.md`) | PM | Sheet in `03-construction/logs/` |
| Create Submittal Register Sheet (from `submittal-register-schema.md`) | PM + Procurement | Sheet in `04-procurement/submittal-register/` |
| Create Lead-Time Tracker Sheet (from `lead-time-tracker-schema.md`) | Procurement | Sheet in `04-procurement/lead-time-tracker/` |
| Apply conditional formatting per SOP Google Sheets appendices | PM | Aging highlights, risk flags, SLA formulas active |
| Set folder permissions per Drive structure permission table | PM | Confirmed |
| Backfill existing RFIs, COs, and submittals into Sheets | PM | Logs populated with current project data |

**Step 3: Slack setup (per `slack-workspace-setup.md`)**

| Task | Owner | Deliverable |
|---|---|---|
| Create project channel `#proj-[name]` | Kuan | Channel live, team invited |
| Create field channel `#proj-[name]-field` | Kuan | Channel live, field staff invited |
| Create function channels (if not yet created) | Kuan | `#construction-ops`, `#procurement`, `#design-review`, `#decisions`, `#warranty` |
| Create system channels | Kuan | `#foundry-bot-log`, `#daily-summaries` |
| Pin Drive project folder link in project channel | PM | Pinned |
| Pin all log Sheet links in project channel | PM | Pinned |
| Configure `@foundry-ai` bot | Kuan | Bot installed, commands registered |
| Register slash commands: `/rfi`, `/co`, `/decision`, `/submittal`, `/warranty`, `/daily` | Kuan | Commands active in draft mode |

**Step 4: Team briefing**

| Task | Owner | Deliverable |
|---|---|---|
| Brief PM and Super (30 min): channel structure, commands, draft→log flow | Kuan | Completed |
| Brief Procurement lead (15 min): submittal and lead-time commands | Kuan | Completed |
| Brief Design lead (15 min): how RFIs and submittals arrive, how to respond | Kuan | Completed |
| Share this pilot plan with all participants | Kuan | Distributed |

### Week 1 — Baseline

**Goal:** Use the system for daily operations. Capture friction points.

| Day | Activity |
|---|---|
| Monday | PM runs first `/daily` summary. Review accuracy. Note any missing data sources. |
| Daily | PM and Super use logs for all new RFIs, COs, and submittals. Use `/rfi` and `/co` for drafting. |
| Daily | Super uses pre-task readiness checklist for any upcoming tasks. |
| Friday | PM runs weekly log maintenance (RFI + CO). Generates aging report. Shares with Owner's Rep. |
| Friday | Kuan reviews: What worked? What was friction? What was missing? |

### Week 2 — Expand

**Goal:** Add procurement and pay-app workflows. Test AI drafting.

| Activity | Owner |
|---|---|
| Procurement begins using lead-time tracker and submittal register daily | Builiq Inc. |
| If a pay app is received, PM uses the pay-app checklist | PM |
| AI triage drafts escalation messages for any overdue items | AI → PM reviews |
| Test `/decision` command for at least one real decision | PM or Concierge |
| Kuan reviews: Are dashboards useful? Is the daily summary accurate? | Kuan |

### Week 3 — Stress Test

**Goal:** Test edge cases and escalation paths.

| Scenario | How to Test |
|---|---|
| SLA breach | Let one non-critical item age past its SLA. Verify escalation rules fire correctly. |
| Proceed-at-risk | If applicable, test the "no work without written response" control on a real RFI. |
| Lead-time critical flag | Identify an item with tight float. Verify risk flag logic and escalation routing. |
| Threshold CO | If a CO approaches the project-defined threshold, test Principal escalation routing. |
| Missing document | Intentionally leave a field blank. Verify AI flags it. |

### Week 4 — Review & Decide

| Activity | Owner | Deliverable |
|---|---|---|
| Collect feedback from PM, Super, Procurement | Kuan | Written feedback notes |
| Measure: How many items were caught by AI that would have been missed? | Kuan | Count |
| Measure: Average time to log an RFI (before vs during pilot) | PM | Estimate |
| Measure: SLA compliance rate during pilot | AI | Report |
| Decision: Scale to all projects, adjust, or pause | Kuan + SHB Group | Go / adjust / pause |

## Success Criteria

| Metric | Target |
|---|---|
| Daily summary accuracy | > 90% of items correct (no phantom items, no missing overdue items) |
| Slash command adoption | PM uses `/rfi` or `/co` for > 75% of new entries |
| SLA breach detection | 100% of breaches flagged within 24 hours |
| PM friction rating | PM reports "same or less effort" vs. current process |
| Super friction rating | Super reports pre-task checklist is "useful, not bureaucratic" |
| Zero false approvals | AI never approves, closes, or executes anything |

## What We Are NOT Testing

- Full automation
- Multi-project dashboards
- Tool migration (Smartsheet → anything else)
- External-facing features
- Financial system integration

## After the Pilot

If the pilot passes success criteria:

1. Scale to all active projects (same setup process per project)
2. Promote dashboard designs from `drafts/` to `design/` or `development/`
3. Evaluate whether to build a lightweight custom web app for dashboards (vs. continuing with Sheets + Slack)
4. Evaluate Adaptive Build role once its capabilities are confirmed

If the pilot reveals significant issues:

1. Document issues in `drafts/platform-design/pilot-retro.md`
2. Adjust SOPs, schemas, or dashboard designs
3. Re-run a 2-week mini-pilot on the adjusted system
