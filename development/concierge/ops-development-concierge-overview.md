---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Development Concierge — Overview

## Purpose

Define the Development Concierge role as the single point of coordination across the project lifecycle — ensuring developers, investors, and internal teams have a consistent, responsive interface from pre-development through asset stabilization.

## What the Concierge Does

- **Single point of contact** for the developer/investor during active projects.
- **Routes requests** to the correct functional team (Design, GC, Procurement, Fund Management, Sales/Showroom) within defined SLAs.
- **Tracks decisions** through the project decision log (`construction/templates/decision-log-schema.md`) and escalates per threshold rules.
- **Maintains project continuity** across phase transitions (development → construction → showroom → property management).
- **Provides status updates** to the developer on a defined cadence (weekly minimum during active phases).
- **Flags risks and blockers** before they become delays.

## What the Concierge Does Not Do

- **Does not make design or engineering decisions.** Routes to SHB Studio (Design) or SHB Inc. (GC/CM).
- **Does not approve change orders or expenditures.** Routes to SHB Group (Owner's Rep) per CO approval workflow (`construction/sops/ops-change-order-workflow.md`).
- **Does not negotiate contracts or vendor terms.** Routes to Builiq Inc. (Procurement) or SHB Group.
- **Does not manage construction field operations.** SHB Inc. (GC/CM) retains field authority.
- **Does not provide legal, tax, or financial advice.** Routes to appropriate advisors.

## Authority Limits

| Authority | Concierge Can | Concierge Cannot |
|---|---|---|
| Scheduling | Schedule meetings, set review deadlines | Commit to construction milestones |
| Information | Access and share project status, logs, and reports | Release confidential financial data without Owner's Rep approval |
| Routing | Assign requests to functional teams | Override team-level decisions |
| Escalation | Escalate to Owner's Rep and Principal per SLA | Approve scope, cost, or schedule changes |
| Communication | Represent the platform to the developer | Bind the entity to contractual terms |

## RACI — Concierge vs. Functional Roles

| Activity | Concierge | SHB Inc. (GC/CM) | SHB Studio (Design) | SHB Group (Owner's Rep) | Builiq Inc. (Procurement) |
|---|---|---|---|---|---|
| Developer intake and onboarding | **R** | I | I | **A** | I |
| Route requests to functional teams | **R** | I | I | I | I |
| Provide weekly status updates | **R** | C | C | I | C |
| Track decisions in decision log | **R** | C | C | **A** | — |
| Escalate overdue items | **R** | I | I | **A** | I |
| Approve scope/cost/schedule changes | I | C | C | **R** | — |
| Manage field operations | — | **R** | — | I | — |
| Manage design decisions | — | — | **R** | I | — |
| Manage procurement | — | — | — | I | **R** |
| Execute phase handoffs | **R** | **R** | I | **A** | I |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

## Review Schedule

- Reviewed every 6 months.
- Next review: 2026-08-08.
