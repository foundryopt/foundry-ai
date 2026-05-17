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

## Read-only on phone (no git)

Fastest way to get the vault onto a phone without setting up git:

1. Go to https://download-directory.github.io/
2. Paste the URL of this folder on GitHub (the `obsidian/` directory on the branch or `main`) and download the zip.
3. Extract it somewhere your phone's file manager can see (e.g. `Internal storage / obsidian-vaults/`).
4. Install **Obsidian** from your app store.
5. In Obsidian → **Open folder as vault** → pick the extracted `obsidian` folder.
6. Open `Home.md`.

Edits made this way stay local to the phone — they won't sync back to the repo. For two-way sync, see below.

## Two-way sync on phone (edit and push back)

### Android

1. Install **Obsidian** from the Play Store.
2. Install **Termux** from **F-Droid** (https://f-droid.org/packages/com.termux/). The Play Store version is abandoned and breaks.
3. In Termux:
   ```
   pkg update && pkg install git openssh
   termux-setup-storage
   cd ~/storage/shared && mkdir -p obsidian-vaults && cd obsidian-vaults
   git clone <repo-url>
   ```
   Use a GitHub Personal Access Token when prompted for a password.
4. In Obsidian → **Open folder as vault** → pick `obsidian-vaults/foundry-ai/obsidian`.
5. Install the **Obsidian Git** community plugin (Settings → Community plugins → Browse). Configure auto-pull and auto-backup intervals.

### iOS

1. Install **Working Copy** (free for read, paid tier for write/push).
2. Clone the repo in Working Copy.
3. Install **Obsidian**, then **Open folder as vault** and pick the `obsidian/` subfolder inside the Working Copy repo (it exposes itself via the Files app).
4. Install the **Obsidian Git** plugin only if you want commits from inside Obsidian — otherwise commit and push from Working Copy.

## Source of truth

`CLAUDE.md` at the repo root is canonical. If this vault drifts from it, edit `CLAUDE.md` first and update the vault to match. See [[Source of Truth]] and [[Change Control]] inside the vault.
