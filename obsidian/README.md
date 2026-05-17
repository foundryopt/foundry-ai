# Obsidian Knowledge Vault

This folder is an [Obsidian](https://obsidian.md) vault mirroring the core operating instructions from [`../CLAUDE.md`](../CLAUDE.md) as linked, queryable notes.

## Open it

1. Open Obsidian.
2. **Open folder as vault** → select this `obsidian/` directory.
3. Open `Home.md` — it is the Map of Content (MOC) and entry point.

## Layout

```
obsidian/
├── Home.md                  # MOC — start here
├── Foundations/             # Source of Truth, Project Scope, Interface Strategy, Design Principles, Change Control
├── Entities/                # SHB Inc., SHB Studio, SHB Group, Builiq Inc.
├── AI Boundaries/           # What AI may / may with approval / may not do
├── Human Gates/             # Draft, Log, Route, Invoice, Escalation, Approval, Send, Close
└── Phases/                  # Phase 2 - SandBox + all authority levels and future phases
```

## Conventions

- **Wikilinks** (`[[Note Name]]`) cross-link everywhere.
- **YAML frontmatter** carries a `type` field (`foundation`, `entity`, `gate`, `authority`, `phase`, `boundary`, `moc`) plus contextual fields (`status`, `role`, `actor`, etc.) for filtering.
- **Dataview** queries are included in `Home.md`. Enable the Dataview community plugin to make them render.

## Source of truth

`CLAUDE.md` at the repo root is canonical. If this vault drifts from it, edit `CLAUDE.md` first and update the vault to match. See [[Source of Truth]] and [[Change Control]] inside the vault.
