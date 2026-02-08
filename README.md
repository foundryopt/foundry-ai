# Foundry AI

Platform repository for automation, SOPs, and templates supporting The Foundry's portfolio of companies.

## Structure

```
foundry-ai/
├── development/          # Real estate development workflows
├── design/               # Design and creative workflows
├── construction/         # Construction management workflows
├── procurement/          # Procurement and sourcing workflows
├── sales-showroom/       # Sales and showroom operations
├── fund-management/      # Fund and investor operations
├── entities/             # Entity-specific overrides only (see entities/README.md)
├── examples/             # Canonical starter templates (single source of truth)
├── data/                 # Non-sensitive sample inputs (see data/README.md)
├── drafts/               # Experimental / work-in-progress
└── archive/              # Retired assets (never deleted)
```

Each functional vertical contains `sops/`, `automation/`, and `templates/` subfolders.

## Quick Start

1. Find the functional vertical for your work (e.g. `development/`).
2. Copy a starter template from `examples/` into the appropriate subfolder.
3. Fill in the front matter (`status`, `owner`, `last-reviewed`).
4. If your asset is experimental, start it in `drafts/` and promote later.

## Governance

See [GOVERNANCE.md](GOVERNANCE.md) for ownership, review, and promotion rules.
See [CONTRIBUTING.md](CONTRIBUTING.md) for naming conventions and commit format.
