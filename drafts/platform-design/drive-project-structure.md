---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Google Drive — Project Structure Template

## Purpose

Define the standard folder structure for each project in Google Drive. Drive is the **system of record** for all project data. Every Slack command, AI draft, and log entry ultimately references or lives in Drive.

## Root Structure

```
Foundry Projects/
└── [PROJECT-NAME]/
    ├── 01-admin/
    │   ├── contracts/
    │   ├── insurance/
    │   ├── permits/
    │   └── correspondence/
    │
    ├── 02-design/
    │   ├── drawings-ifc/          # Issued-for-construction sets
    │   ├── submittals/            # Submittal packages and responses
    │   ├── specifications/
    │   └── rfi-responses/         # Architect/engineer written responses
    │
    ├── 03-construction/
    │   ├── logs/                  # RFI log, CO log, decision log (Sheets)
    │   ├── daily-reports/
    │   ├── photos/                # CompanyCam sync or manual uploads
    │   ├── inspections/
    │   └── safety/
    │
    ├── 04-procurement/
    │   ├── purchase-orders/
    │   ├── vendor-docs/
    │   ├── lead-time-tracker/     # Sheet
    │   ├── submittal-register/    # Sheet
    │   └── receiving-qc/         # QC checklists and photo evidence
    │
    ├── 05-financial/
    │   ├── pay-applications/
    │   ├── lien-waivers/
    │   ├── change-orders/         # Executed CO PDFs
    │   ├── vendor-invoices/
    │   └── budget/                # Smartsheet link or export
    │
    ├── 06-closeout/
    │   ├── as-builts/
    │   ├── om-manuals/
    │   ├── warranties/
    │   ├── punch-list/
    │   └── final-lien-waivers/
    │
    ├── 07-showroom/               # If applicable
    │   ├── leasing/
    │   ├── events/
    │   └── feedback/
    │
    ├── 08-property-management/    # Post-handoff
    │   ├── onboarding-checklist/
    │   ├── warranty-claims/
    │   ├── lease-up-tracking/
    │   └── maintenance/
    │
    └── 09-fund-investors/          # If project has investor reporting
        ├── investor-updates/
        ├── draw-requests/
        ├── distributions/
        └── reporting/
```

## Log Files (Google Sheets)

These live in their respective `logs/` or tracker folders. Created from the CSV headers and schemas in the repo.

| Sheet | Location | Schema Source |
|---|---|---|
| RFI Log | `03-construction/logs/` | `construction/templates/rfi-log.csv` |
| Change Order Log | `03-construction/logs/` | `construction/templates/change-order-log.csv` |
| Decision Log | `03-construction/logs/` | `construction/templates/decision-log-schema.md` |
| Submittal Register | `04-procurement/submittal-register/` | `construction/templates/submittal-register-schema.md` |
| Lead-Time Tracker | `04-procurement/lead-time-tracker/` | `procurement/templates/lead-time-tracker-schema.md` |
| Vendor Invoice Tracker | `05-financial/vendor-invoices/` | `construction/templates/vendor-invoice-intake-schema.md` |
| Warranty Claim Log | `08-property-management/warranty-claims/` | `property-management/warranty/warranty-claim-log-schema.md` |
| Inquiries Log (Hermes) | `01-project-admin/logs/` | `hermes-sms-watcher.md` (Logging section) — records approved Q&A from SMS/email/Slack inbound |

## Naming Convention

- Folders: `NN-category` (numbered for sort order)
- Files: `YYYY-MM-DD_type_description.ext` (e.g., `2026-02-08_rfi-047_tile-layout-conflict.pdf`)
- Sheets: `[PROJECT-CODE]_rfi-log`, `[PROJECT-CODE]_co-log`, etc.

## Permissions

| Folder | SHB Inc. (GC/CM) | SHB Studio (Design) | SHB Group (Owner's Rep) | Builiq Inc. (Procurement) |
|---|---|---|---|---|
| 01-admin | Edit | View | Edit | View |
| 02-design | View | Edit | View | View |
| 03-construction | Edit | View | View | View |
| 04-procurement | View | View | View | Edit |
| 05-financial | Edit | — | Edit | View |
| 06-closeout | Edit | Edit | Edit | View |
| 07-showroom | View | View | Edit | — |
| 08-property-management | View | — | Edit | — |
| 09-fund-investors | — | — | Edit | — |

## Setup Checklist (Per Project)

- [ ] Create project folder from this template
- [ ] Create log Sheets from CSV headers / schemas
- [ ] Apply conditional formatting per Google Sheets quickstart appendices in SOPs
- [ ] Set folder permissions per table above
- [ ] Share log Sheet links in Slack project channel
- [ ] Confirm all team members have access
