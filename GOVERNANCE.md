# Governance

## Ownership

- **Founder approval required** on all merges to `main`.
- Single owner today. When the team grows, assign per-vertical owners.

## Asset Lifecycle

### Statuses

Every Markdown file must include front matter with:

```yaml
---
status: draft | active | archived
owner: <name>
last-reviewed: YYYY-MM-DD
---
```

### Promotion Workflow

1. New or experimental work starts in `drafts/`.
2. When ready, move the asset to its functional vertical (e.g. `development/sops/`).
3. Set `status: active` and fill in `owner` and `last-reviewed`.

**Self-review checklist before promotion:**
- [ ] Front matter is complete
- [ ] File follows naming conventions (see CONTRIBUTING.md)
- [ ] Content is accurate and actionable
- [ ] No client data, credentials, or sensitive information

### Archiving

- **Archive, don't delete.** Move deprecated assets to `archive/` with a note explaining why.
- Set `status: archived` in the front matter.

## Entities

The `entities/` directory holds **only overrides and compliance-specific differences** for individual legal entities. 80-90% of assets are shared and belong in functional verticals. See `entities/README.md`.

## Branching Strategy

- **Trunk-based** on `main` for now.
- Create `feat/<topic>` branches when collaborators join.
- No direct pushes to `main` once branch protection is enabled.
