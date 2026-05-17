---
type: moc
title: Foundry AI Knowledge Vault
tags: [moc, index]
updated: 2026-05-17
---

# Foundry AI — Knowledge Vault

Operating knowledge for Foundry AI, derived from [[CLAUDE]] (the canonical operating instructions in the repo root). Notes are linked; frontmatter is structured for Dataview queries.

## Foundations

- [[Source of Truth]]
- [[Project Scope]]
- [[Interface Strategy]]
- [[Design Principles]]
- [[Change Control]]

## Entities

- [[SHB Inc]] — GC / CM
- [[SHB Studio]] — Design
- [[SHB Group]] — Owner's Rep & Principal
- [[Builiq Inc]] — Procurement

## AI Boundaries

- [[AI Boundaries Overview]]
- [[What AI May Do]]
- [[What AI May Do With Approval]]
- [[What AI May Not Do]]

## Human Gates

- [[Draft Gate]]
- [[Log Gate]]
- [[Route Gate]]
- [[Invoice Gate]]
- [[Escalation Gate]]
- [[Approval Gate]]
- [[Send Gate]]
- [[Close Gate]]

## Phases & Authority

- [[Phase 2 - SandBox]] — current phase
- [[Level 1 - Auto-Log]] — ACTIVE
- [[Level 2 - Auto-Notify]] — ACTIVE
- [[Level 3 - Auto-Forward Invoice]]
- [[Level 4 - GHL Draft-to-Send]]
- [[Phase 3 - Limited Dashboard Interaction]]
- [[Phase 4 - Status and Resolution]]
- [[Phase F - Live Human Pilot]]

## Dataview Queries

Active authority levels:

```dataview
TABLE status, activated, probation_ends
FROM "Phases"
WHERE type = "authority" AND status = "ACTIVE"
```

All human gates:

```dataview
TABLE actor, sor_target
FROM "Human Gates"
WHERE type = "gate"
```

Entities and roles:

```dataview
TABLE role
FROM "Entities"
WHERE type = "entity"
```

## Conventions

- `type` frontmatter field drives Dataview filtering: `foundation`, `entity`, `gate`, `authority`, `phase`, `boundary`, `moc`.
- Every note links upward to its parent concept and laterally to related notes.
- Edits to operating rules belong in [[CLAUDE]] first; this vault mirrors that source.
