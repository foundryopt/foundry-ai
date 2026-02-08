# Contributing

## Naming Conventions

| Rule | Example |
|---|---|
| Lowercase kebab-case for all files and folders | `client-onboarding.md` |
| Prefix SOPs with category | `ops-client-onboarding.md`, `creative-brand-review.md` |
| Prefix automation scripts with verb | `generate-invoice.sh`, `sync-drive-assets.py` |
| Templates named by deliverable | `pitch-deck.md`, `project-brief.md` |
| No spaces, no uppercase, no special characters | — |

## Front Matter

Every Markdown file requires:

```yaml
---
status: draft | active | archived
owner: <name>
last-reviewed: YYYY-MM-DD
---
```

## Starter Templates

All canonical starter templates live in `examples/` as the single source of truth:

- `examples/sops/_template.md` — SOP format
- `examples/templates/_template-brief.md` — template format
- `examples/scripts/_template-script.md` — script format

Copy from `examples/` into your functional vertical. Never modify `examples/` originals without founder approval.

## Where to Put Assets

1. **Default**: Place assets in their functional vertical (`development/`, `design/`, etc.).
2. **Experimental**: Start in `drafts/`, promote when ready.
3. **Entity-specific**: Only if the asset genuinely differs per legal entity — place in `entities/<entity-name>/`.

## Commit Messages

Format: `type(scope): description`

**Types:** `add`, `update`, `fix`, `archive`, `chore`

Examples:
- `add(development/sops): site-acquisition checklist`
- `update(procurement/templates): vendor-evaluation criteria`
- `archive(design/sops): deprecated brand-review process`
