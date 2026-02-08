---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Pilot Configuration — SandBox

## Project

**Name:** SandBox
**Project code:** SANDBOX
**Pilot duration:** 4 weeks (per `pilot-plan.md`)
**Command surface:** Slack (single — not Google Chat)
**All functions use:** Email + Slack for intake

---

## Team Roster

| Role | Entity | Name | Confirmed |
|---|---|---|---|
| PM | SHB Inc. | _TBD_ | [ ] |
| Superintendent | SHB Inc. | _TBD_ | [ ] |
| Design Lead | SHB Studio | _TBD_ | [ ] |
| Procurement Lead | Builiq Inc. | _TBD_ | [ ] |
| Owner's Rep | SHB Group | _TBD_ | [ ] |
| Principal (escalation) | SHB Group | _TBD_ | [ ] |
| CO Approval Threshold | — | $_TBD_ | [ ] |

---

## Email Inboxes

| Inbox | Function | Watcher | Status |
|---|---|---|---|
| `sandbox@shb.studio` | SandBox project communication | Construction | [ ] Confirmed |
| `info@shb.studio` | General intake, invoices, vendor inquiries | Financial / Procurement | [ ] Confirmed |
| `support@shb.studio` | Warranty and maintenance | Warranty | [ ] Confirmed |
| `shb-studio@adaptive.build` | Expenses, pay apps | Financial | [ ] Confirmed |

### Email Routing Rules (Watcher Assignment)

| Sender Pattern / Subject Pattern | Watcher | Classification |
|---|---|---|
| Any email to `sandbox@shb.studio` with drawing/spec reference | Construction | Likely RFI |
| Any email to `sandbox@shb.studio` with cost/change/scope language | Construction | Likely PCO |
| Invoice attachment (PDF with "invoice" in filename or subject) to `info@` or `shb-studio@adaptive.build` | Financial | Invoice → gate |
| Pay application attachment to `shb-studio@adaptive.build` | Financial | Pay app → checklist |
| Any email to `support@shb.studio` with defect/leak/broken/damage language | Warranty | Likely warranty claim |
| Submittal package attachment to `sandbox@shb.studio` or `info@shb.studio` | Procurement | Likely submittal |
| Unclassifiable | Construction (default) | Human classification required |

---

## Google Drive Structure

```
Foundry Projects/
└── SandBox/
    ├── 01-admin/
    │   ├── contracts/
    │   ├── insurance/
    │   ├── permits/
    │   └── correspondence/
    │
    ├── 02-design/
    │   ├── drawings-ifc/
    │   ├── submittals/
    │   ├── specifications/
    │   └── rfi-responses/
    │
    ├── 03-construction/
    │   ├── logs/
    │   │   ├── SANDBOX_rfi-log          (Google Sheet)
    │   │   ├── SANDBOX_co-log           (Google Sheet)
    │   │   └── SANDBOX_decision-log     (Google Sheet)
    │   ├── daily-reports/
    │   ├── photos/
    │   ├── inspections/
    │   └── safety/
    │
    ├── 04-procurement/
    │   ├── purchase-orders/
    │   ├── vendor-docs/
    │   ├── lead-time-tracker/
    │   │   └── SANDBOX_lead-time-tracker  (Google Sheet)
    │   ├── submittal-register/
    │   │   └── SANDBOX_submittal-register (Google Sheet)
    │   └── receiving-qc/
    │
    ├── 05-financial/
    │   ├── pay-applications/
    │   ├── lien-waivers/
    │   ├── change-orders/
    │   ├── vendor-invoices/
    │   └── budget/
    │
    ├── 06-closeout/
    │   ├── as-builts/
    │   ├── om-manuals/
    │   ├── warranties/
    │   ├── punch-list/
    │   └── final-lien-waivers/
    │
    ├── 08-property-management/
    │   ├── onboarding-checklist/
    │   ├── warranty-claims/
    │   │   └── SANDBOX_warranty-claim-log  (Google Sheet)
    │   ├── lease-up-tracking/
    │   └── maintenance/
    │
    └── 09-fund-investors/
        ├── investor-updates/
        ├── draw-requests/
        ├── distributions/
        └── reporting/
```

### Setup Checklist (Drive)

- [ ] Create `Foundry Projects/SandBox/` folder
- [ ] Create all subfolders per structure above (including `09-fund-investors/`)
- [ ] Create `SANDBOX_rfi-log` Sheet from `construction/templates/rfi-log.csv` headers
- [ ] Create `SANDBOX_co-log` Sheet from `construction/templates/change-order-log.csv` headers
- [ ] Create `SANDBOX_decision-log` Sheet from `construction/templates/decision-log-schema.md`
- [ ] Create `SANDBOX_submittal-register` Sheet from `construction/templates/submittal-register-schema.md`
- [ ] Create `SANDBOX_lead-time-tracker` Sheet from `procurement/templates/lead-time-tracker-schema.md`
- [ ] Create `SANDBOX_warranty-claim-log` Sheet from `property-management/warranty/warranty-claim-log-schema.md`
- [ ] Apply conditional formatting per SOP appendices (aging highlights, risk flags, SLA formulas)
- [ ] Set folder permissions per `drive-project-structure.md` permission table
- [ ] Backfill existing RFIs, COs, and submittals into Sheets

---

## Log Sheets — Schema Source Mapping

| Sheet | Location in Drive | Schema Source in Repo | Fields |
|---|---|---|---|
| `SANDBOX_rfi-log` | `03-construction/logs/` | `construction/templates/rfi-log.csv` | 22 fields |
| `SANDBOX_co-log` | `03-construction/logs/` | `construction/templates/change-order-log.csv` | 26 fields |
| `SANDBOX_decision-log` | `03-construction/logs/` | `construction/templates/decision-log-schema.md` | 21 fields |
| `SANDBOX_submittal-register` | `04-procurement/submittal-register/` | `construction/templates/submittal-register-schema.md` | 23 fields |
| `SANDBOX_lead-time-tracker` | `04-procurement/lead-time-tracker/` | `procurement/templates/lead-time-tracker-schema.md` | 20 fields |
| `SANDBOX_warranty-claim-log` | `08-property-management/warranty-claims/` | `property-management/warranty/warranty-claim-log-schema.md` | 26 fields |

---

## Slack Channels

| Channel | Purpose | Members | Status |
|---|---|---|---|
| `#proj-sandbox` | Primary project channel. All RFI, CO, decision, submittal activity. | PM, Super, Design, Procurement, Owner's Rep | [ ] Created |
| `#proj-sandbox-field` | Field-only: daily reports, safety, QC, deliveries. | Super, PM, field staff | [ ] Created |
| `#construction-ops` | Cross-project construction issues. | All PMs, Supers, Owner's Rep | [ ] Created |
| `#procurement` | Submittal status, lead-time flags. | Procurement, PMs | [ ] Created |
| `#design-review` | RFIs and submittals awaiting design response. | Design, PMs | [ ] Created |
| `#decisions` | Decision log items pending approval. | Owner's Rep, Concierge, PMs | [ ] Created |
| `#warranty` | Open warranty claims. | Property Mgmt, PMs | [ ] Created |
| `#foundry-bot-log` | Audit log of all bot actions. | Kuan, Owner's Rep | [ ] Created |
| `#daily-summaries` | Watcher daily review packets posted here. | All | [ ] Created |

### Slack Setup Checklist

- [ ] Create `#proj-sandbox`
- [ ] Create `#proj-sandbox-field`
- [ ] Create function channels (if not yet created)
- [ ] Create system channels (if not yet created)
- [ ] Pin Drive `SandBox/` folder link in `#proj-sandbox`
- [ ] Pin all 6 log Sheet links in `#proj-sandbox`
- [ ] Configure `@foundry-ai` bot
- [ ] Register slash commands: `/rfi`, `/co`, `/decision`, `/submittal`, `/warranty`, `/daily`
- [ ] Set command access per role table in `slack-workspace-setup.md`

---

## Watcher Configuration — SandBox

### Construction Watcher

| Setting | Value |
|---|---|
| **Domain** | RFIs, COs, pre-task readiness |
| **Email source** | `sandbox@shb.studio` |
| **Drive sources** | `SANDBOX_rfi-log`, `SANDBOX_co-log` |
| **Slack sources** | `#proj-sandbox`, `#proj-sandbox-field` |
| **Output channels** | `#proj-sandbox`, `#construction-ops`, `#daily-summaries` |
| **SLA reference** | `construction/sops/ops-rfi-intake.md` SLA table, `construction/sops/ops-change-order-workflow.md` SLA table |
| **Daily packet time** | 8:00 AM |

### Financial Watcher

| Setting | Value |
|---|---|
| **Domain** | Invoices, pay apps, budget exposure |
| **Email sources** | `info@shb.studio`, `shb-studio@adaptive.build` |
| **Drive sources** | `SANDBOX_co-log`, `05-financial/` |
| **Slack sources** | `#proj-sandbox` |
| **Output channels** | `#proj-sandbox`, `#daily-summaries` |
| **Invoice gate** | Active — all invoices require PM approval before forwarding to Adaptive Build |
| **Budget reference** | Smartsheet budget data (read-only) |
| **SLA reference** | `construction/sops/ops-pay-app-and-invoice-approval.md` |
| **Daily packet time** | 8:00 AM |

### Procurement Watcher

| Setting | Value |
|---|---|
| **Domain** | Submittals, lead times, material QC |
| **Email sources** | `info@shb.studio` (vendor correspondence), `sandbox@shb.studio` (submittal packages) |
| **Drive sources** | `SANDBOX_submittal-register`, `SANDBOX_lead-time-tracker` |
| **Slack sources** | `#proj-sandbox`, `#procurement` |
| **Output channels** | `#procurement`, `#proj-sandbox`, `#daily-summaries` |
| **SLA reference** | `procurement/sops/ops-submittals-and-lead-time-control.md`, `procurement/sops/ops-material-receiving-qc-and-damage-claims.md` |
| **Daily packet time** | 8:00 AM |

### Warranty Watcher

| Setting | Value |
|---|---|
| **Domain** | Claims, warranty expiry, contractor response |
| **Email sources** | `support@shb.studio` |
| **Drive sources** | `SANDBOX_warranty-claim-log` |
| **Slack sources** | `#warranty` |
| **Output channels** | `#warranty`, `#proj-sandbox`, `#daily-summaries` |
| **SLA reference** | `property-management/warranty/ops-warranty-claim-intake-and-resolution.md` |
| **Daily packet time** | 8:00 AM |

### Executive Watcher

| Setting | Value |
|---|---|
| **Domain** | Decisions, cost exposure, SLA breaches |
| **Email sources** | None (reads watcher summaries, not email directly) |
| **Drive sources** | `SANDBOX_decision-log`, `SANDBOX_co-log` |
| **Slack sources** | `#decisions` |
| **Other sources** | Daily packets from all other watchers (aggregated risks and escalations) |
| **Output channels** | `#decisions`, `#daily-summaries` |
| **SLA reference** | `construction/templates/decision-log-schema.md` approval authority matrix |
| **CO threshold** | $_TBD_ (set with Owner's Rep) |
| **Daily packet time** | 8:00 AM |

---

## Dashboards — SandBox

### PM Dashboard (Active)

| Section | Data Source | Watcher |
|---|---|---|
| New intake (24h) | Construction + Financial watcher packets | Construction, Financial |
| Invoices pending approval | Financial Watcher invoice gate queue | Financial |
| Budget flags | Financial Watcher budget checks | Financial |
| RFIs / COs aging | Construction Watcher SLA monitoring | Construction |
| Pay apps awaiting verification | Financial Watcher pay-app intake | Financial |
| Lead-time risk flags | Procurement Watcher risk flags | Procurement |

### Executive Dashboard (Active)

| Section | Data Source | Watcher |
|---|---|---|
| Decisions pending | Executive Watcher decision queue | Executive |
| Cost exposure | Executive Watcher CO aggregation | Executive |
| SLA breaches | All watcher escalation flags (aggregated) | Executive |
| Risk summary | All watcher risk items (aggregated) | Executive |

### Procurement Dashboard (Active)

| Section | Data Source | Watcher |
|---|---|---|
| Lead-time risks | Procurement Watcher float monitoring | Procurement |
| Open submittals | Procurement Watcher submittal pipeline | Procurement |
| Material deliveries / QC flags | Procurement Watcher delivery tracking | Procurement |

---

## Pre-Pilot Verification

Before Week 1 begins, verify all of the following:

- [ ] Team roster complete (all names confirmed)
- [ ] CO approval threshold documented
- [ ] All Drive folders created
- [ ] All 6 log Sheets created with correct headers
- [ ] Conditional formatting applied to all Sheets
- [ ] Existing project data backfilled into Sheets
- [ ] All Slack channels created and team invited
- [ ] Drive folder and Sheet links pinned in `#proj-sandbox`
- [ ] `@foundry-ai` bot installed and commands registered
- [ ] Email inboxes confirmed and AI read access configured
- [ ] Invoice gate tested with 1 sample invoice
- [ ] All 5 watchers generating test daily packets
- [ ] PM Dashboard live and showing watcher data
- [ ] Executive Dashboard live and showing watcher data
- [ ] Procurement Dashboard live and showing watcher data
- [ ] Team briefing completed (PM, Super, Procurement, Design)
- [ ] This pilot plan shared with all participants
