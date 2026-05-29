---
status: ready-for-deployment
owner: Kuan
last-reviewed: 2026-05-29
version: 1.0.0
---

# Warranty System — Development Partner Integration Guide

## Overview

Complete technical specification for integrating with the SHB Studio warranty system. This guide covers the backend API, GHL webhooks, signoff protocol, and frontend integration requirements.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WARRANTY SYSTEM ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   Homeowners     │
                              │   (End Users)    │
                              └────────┬─────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  www.shb.studio  │      │ support@shb.studio│     │   Phone/Walk-in  │
│  /warranty       │      │     (Email)       │      │   (Manual)       │
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                         │                         │
         │ GHL Form                │ Email Parser            │ Slack /warranty
         ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           GHL PLATFORM                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Warranty     │  │ Contact      │  │ SMS/Email    │                  │
│  │ Intake Form  │  │ Database     │  │ Automation   │                  │
│  └──────┬───────┘  └──────────────┘  └──────────────┘                  │
└─────────┼───────────────────────────────────────────────────────────────┘
          │
          │ Webhook POST /api/warranty/webhook/ghl
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Node.js/Express)                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     /api/warranty/*                               │  │
│  │  • POST /claims           — Create new claim                      │  │
│  │  • GET  /claims/:id       — Get claim details                     │  │
│  │  • PATCH /claims/:id      — Update claim                          │  │
│  │  • POST /claims/:id/signoff/pm     — PM signoff (Gate 1)          │  │
│  │  • POST /claims/:id/signoff/gc     — GC signoff (Gate 2)          │  │
│  │  • POST /claims/:id/photos         — Before/after photos (Gate 3) │  │
│  │  • POST /claims/:id/signoff/repair — Repair signoff (Gate 4)      │  │
│  │  • POST /claims/:id/signoff/homeowner — Homeowner signoff (Gate 5)│  │
│  │  • POST /claims/:id/signoff/close  — Closure signoff (Gate 6)     │  │
│  │  • GET  /public/status    — Public status lookup                  │  │
│  │  • GET  /claims/metrics   — Dashboard metrics                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
          │
          │ Prisma ORM
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL DATABASE                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ warranty_claims  │  │ warranty_claim_  │  │ warranty_items   │      │
│  │                  │  │ activities       │  │ (legacy)         │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
          │
          │ Read/Sync
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE SHEETS (SOR)                             │
│  • [PROJECT]_warranty-claim-log                                         │
│  • Full signoff tracking                                                │
│  • Backup & reporting                                                   │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SLACK NOTIFICATIONS                             │
│  • #warranty channel                                                    │
│  • /warranty slash commands                                             │
│  • Approval buttons                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Signoff Protocol Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          6-GATE SIGNOFF PROTOCOL                        │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐                                                           
    │  START  │  Claim submitted via GHL, email, or manual                
    └────┬────┘                                                           
         │                                                                
         ▼                                                                
┌─────────────────┐     ┌────────────────────────────────────────────────┐
│   GATE 1: PM    │     │ POST /claims/:id/signoff/pm                    │
│  Intake Signoff │────▶│ • Verify claim entry                           │
│                 │     │ • Confirm warranty coverage                    │
│  Who: PM        │     │ • Set covered = covered | excluded             │
└────────┬────────┘     └────────────────────────────────────────────────┘
         │ pm_signoff = true                                              
         ▼                                                                
┌─────────────────┐     ┌────────────────────────────────────────────────┐
│   GATE 2: GC    │     │ POST /claims/:id/signoff/gc                    │
│ Assignment      │────▶│ • Assign responsible_contractor                │
│  Signoff        │     │ • Set response_due date                        │
│                 │     │ • Status → assigned                            │
│  Who: GC/CM     │     └────────────────────────────────────────────────┘
└────────┬────────┘                                                       
         │ gc_signoff = true                                              
         ▼                                                                
┌─────────────────┐     ┌────────────────────────────────────────────────┐
│   GATE 3:       │     │ POST /claims/:id/photos                        │
│ Photo Docs      │────▶│ • Upload before_photos_url                     │
│                 │     │ • Upload after_photos_url                      │
│  Who: PM/       │     │ • BOTH required before Gate 4                  │
│  Contractor     │     └────────────────────────────────────────────────┘
└────────┬────────┘                                                       
         │ before_photos_url + after_photos_url                           
         ▼                                                                
┌─────────────────┐     ┌────────────────────────────────────────────────┐
│   GATE 4:       │     │ POST /claims/:id/signoff/repair                │
│ Repair Signoff  │────▶│ • Verify repair quality                        │
│                 │     │ • Set repair_description                       │
│  Who: PM        │     │ • Status → resolved                            │
└────────┬────────┘     └────────────────────────────────────────────────┘
         │ repair_signoff = true                                          
         ▼                                                                
┌─────────────────┐     ┌────────────────────────────────────────────────┐
│   GATE 5:       │     │ POST /claims/:id/signoff/homeowner/send        │
│ Homeowner       │────▶│ Then: POST /claims/:id/signoff/homeowner       │
│  Signoff        │     │ Or:   POST /claims/:id/signoff/homeowner/auto  │
│                 │     │                                                │
│  Who: Homeowner │     │ • satisfied=yes → signed                       │
│  24hr auto-     │     │ • satisfied=no  → reopened (back to Gate 4)    │
│  approval       │     │ • No response 24h → auto-approved              │
└────────┬────────┘     └────────────────────────────────────────────────┘
         │ homeowner_signoff = true                                       
         ▼                                                                
┌─────────────────┐     ┌────────────────────────────────────────────────┐
│   GATE 6:       │     │ POST /claims/:id/signoff/close                 │
│ Closure Signoff │────▶│ • Final review                                 │
│                 │     │ • Status → closed                              │
│  Who: Owner's   │     │ • date_closed set                              │
│  Rep            │     └────────────────────────────────────────────────┘
└────────┬────────┘                                                       
         │ close_signoff = true                                           
         ▼                                                                
    ┌─────────┐                                                           
    │  DONE   │  Claim fully resolved with complete audit trail           
    └─────────┘                                                           
```

---

## API Reference

### Base URL

```
Production: https://api.foundry-ai.com/api/warranty
Staging:    https://staging-api.foundry-ai.com/api/warranty
```

### Authentication

All endpoints except `/public/*` and `/webhook/*` require Bearer token authentication:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

### Core Endpoints

#### Create Warranty Claim

```http
POST /api/warranty/claims
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": "belmont",
  "unitLocation": "Unit 204",
  "reportedBy": "John Smith",
  "reportedByEmail": "john.smith@email.com",
  "reportedByPhone": "+1-555-123-4567",
  "priority": "standard",           // emergency | urgent | standard
  "defectDescription": "HVAC making rattling noise in bedroom",
  "category": "mechanical",         // general | roofing | mechanical | plumbing | electrical | waterproofing | appliance | finish | structural
  "photoEvidence": true,
  "intakeSource": "manual"          // ghl-form | email | manual | phone
}
```

**Response:**

```json
{
  "id": "clxyz123",
  "claimNumber": "WC-BEL-001",
  "projectId": "belmont",
  "status": "open",
  "signoffProgress": {
    "current": 0,
    "total": 5,
    "gates": [
      { "name": "PM Intake", "complete": false, "date": null, "by": null },
      { "name": "GC Assignment", "complete": false, "date": null, "by": null },
      { "name": "Repair Verification", "complete": false, "date": null, "by": null },
      { "name": "Homeowner Signoff", "complete": false, "date": null, "by": null },
      { "name": "Closure", "complete": false, "date": null, "by": null }
    ]
  },
  ...
}
```

---

#### Get Claim Details

```http
GET /api/warranty/claims/WC-BEL-001
Authorization: Bearer <token>
```

**Response:** Full claim object with activity log

---

#### Signoff Endpoints

##### Gate 1: PM Intake Signoff

```http
POST /api/warranty/claims/WC-BEL-001/signoff/pm
Authorization: Bearer <token>

{
  "covered": "covered"    // covered | excluded | under-review
}
```

##### Gate 2: GC Assignment Signoff

```http
POST /api/warranty/claims/WC-BEL-001/signoff/gc
Authorization: Bearer <token>

{
  "responsibleContractor": "Crown Mechanical",
  "responseDue": "2026-06-05"
}
```

##### Gate 3: Photo Upload

```http
POST /api/warranty/claims/WC-BEL-001/photos
Authorization: Bearer <token>

{
  "beforePhotosUrl": "https://drive.google.com/...",
  "afterPhotosUrl": "https://drive.google.com/..."
}
```

##### Gate 4: Repair Signoff

```http
POST /api/warranty/claims/WC-BEL-001/signoff/repair
Authorization: Bearer <token>

{
  "repairDescription": "Replaced loose duct connection and balanced fan-coil",
  "dateRepairCompleted": "2026-06-03"
}
```

##### Gate 5: Homeowner Signoff

Send signoff request:

```http
POST /api/warranty/claims/WC-BEL-001/signoff/homeowner/send
Authorization: Bearer <token>
```

Homeowner responds (via GHL or direct):

```http
POST /api/warranty/claims/WC-BEL-001/signoff/homeowner

{
  "satisfied": true,
  "signature": "John Smith"
}
```

Or auto-approve after 24 hours:

```http
POST /api/warranty/claims/WC-BEL-001/signoff/homeowner/auto
Authorization: Bearer <token>
```

##### Gate 6: Closure Signoff

```http
POST /api/warranty/claims/WC-BEL-001/signoff/close
Authorization: Bearer <token>
```

---

### Public Endpoints (No Auth)

#### Status Lookup (for landing page)

```http
GET /api/warranty/public/status?claimNumber=WC-BEL-001
# or
GET /api/warranty/public/status?email=john.smith@email.com
```

**Response:**

```json
{
  "claims": [
    {
      "claimNumber": "WC-BEL-001",
      "dateReported": "2026-05-29T10:00:00Z",
      "status": "in-repair",
      "statusFriendly": "Repair In Progress",
      "category": "mechanical",
      "nextStep": "Repair in progress",
      "beforePhotosUrl": null,
      "afterPhotosUrl": null,
      "signoffUrl": null
    }
  ]
}
```

---

### GHL Webhook Endpoints

#### New Claim Webhook

```http
POST /api/warranty/webhook/ghl
Content-Type: application/json

{
  "contact_id": "ghl_contact_123",
  "full_name": "John Smith",
  "email": "john.smith@email.com",
  "phone": "+1-555-123-4567",
  "unit_location": "Unit 204",
  "issue_description": "HVAC rattling noise",
  "category": "mechanical",
  "is_emergency": "no",
  "photo_url": "https://...",
  "project_id": "belmont"
}
```

#### Homeowner Signoff Webhook

```http
POST /api/warranty/webhook/ghl/signoff
Content-Type: application/json

{
  "claim_number": "WC-BEL-001",
  "satisfied": "yes",
  "issue_description": null,
  "signature": "John Smith"
}
```

---

### Metrics & Reporting

#### Dashboard Metrics

```http
GET /api/warranty/claims/metrics?projectId=belmont
Authorization: Bearer <token>
```

**Response:**

```json
{
  "summary": {
    "open": 5,
    "assigned": 3,
    "inRepair": 2,
    "resolved": 1,
    "closed": 10,
    "total": 21,
    "pendingSignoffs": 4
  },
  "avgResolutionDays": 4.5,
  "byCategory": [
    { "category": "mechanical", "count": 8 },
    { "category": "plumbing", "count": 5 }
  ],
  "byContractor": [
    { "contractor": "Crown Mechanical", "count": 6 }
  ]
}
```

#### Signoff Status Report

```http
GET /api/warranty/claims/signoff-status?projectId=belmont
Authorization: Bearer <token>
```

**Response:**

```json
{
  "gates": [
    { "gate": "PM Intake", "complete": 20, "total": 21, "percentage": 95 },
    { "gate": "GC Assignment", "complete": 18, "total": 20, "percentage": 90 },
    { "gate": "Repair Verification", "complete": 12, "total": 18, "percentage": 67 },
    { "gate": "Homeowner Signoff", "complete": 11, "total": 12, "percentage": 92 },
    { "gate": "Closure", "complete": 10, "total": 11, "percentage": 91 }
  ],
  "totalClaims": 21,
  "fullyCompleted": 10
}
```

---

## Database Schema

### warranty_claims

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| claim_number | String | Unique identifier (WC-XXX-NNN) |
| project_id | String | Project reference |
| unit_location | String | Unit or location |
| reported_by | String | Name of reporter |
| reported_by_email | String? | Email for communication |
| reported_by_phone | String? | Phone number |
| date_reported | DateTime | When claim was filed |
| priority | String | emergency / urgent / standard |
| status | String | open / assigned / in-repair / resolved / disputed / closed |
| defect_description | String | Issue description |
| category | String | Category (mechanical, plumbing, etc.) |
| pm_signoff | Boolean | Gate 1 complete |
| pm_signoff_date | DateTime? | Gate 1 timestamp |
| pm_signoff_by | String? | Gate 1 approver |
| gc_signoff | Boolean | Gate 2 complete |
| gc_signoff_date | DateTime? | Gate 2 timestamp |
| gc_signoff_by | String? | Gate 2 approver |
| before_photos_url | String? | Before photos link |
| after_photos_url | String? | After photos link |
| repair_signoff | Boolean | Gate 4 complete |
| repair_signoff_date | DateTime? | Gate 4 timestamp |
| repair_signoff_by | String? | Gate 4 approver |
| homeowner_signoff | Boolean | Gate 5 complete |
| homeowner_signoff_date | DateTime? | Gate 5 timestamp |
| homeowner_signoff_sent | DateTime? | When request was sent |
| homeowner_signoff_method | String? | signed / auto-approved / reopened |
| homeowner_signoff_notes | String? | Additional notes |
| close_signoff | Boolean | Gate 6 complete |
| close_signoff_date | DateTime? | Gate 6 timestamp |
| close_signoff_by | String? | Gate 6 approver |
| ghl_contact_id | String? | GHL contact reference |
| ghl_conversation_id | String? | GHL conversation thread |
| intake_source | String | ghl-form / email / manual / phone |
| created_at | DateTime | Record creation |
| updated_at | DateTime | Last update |

### warranty_claim_activities

| Column | Type | Description |
|--------|------|-------------|
| id | CUID | Primary key |
| claim_id | String | Claim reference |
| action | String | created / status_change / signoff / assignment / note / escalation / photo_upload |
| description | String | Human-readable description |
| performed_by | String | User or system |
| performed_at | DateTime | Timestamp |
| metadata | JSON | Additional data |

---

## GHL Configuration

### Warranty Claim Form Fields

| Field | GHL Field Type | Maps To |
|-------|---------------|---------|
| Full Name | Text | full_name |
| Email | Email | email |
| Phone | Phone | phone |
| Unit/Location | Text | unit_location |
| Issue Description | Long Text | issue_description |
| Category | Dropdown | category |
| Is Emergency? | Radio (Yes/No) | is_emergency |
| Photo Upload | File | photo_url |

### Webhook Configuration

1. Go to GHL → Automation → Workflows
2. Create new workflow triggered by "Form Submitted"
3. Add HTTP action:
   - Method: POST
   - URL: `https://api.foundry-ai.com/api/warranty/webhook/ghl`
   - Headers: `Content-Type: application/json`
   - Body: Map form fields to JSON

### Homeowner Signoff Form Fields

| Field | GHL Field Type | Maps To |
|-------|---------------|---------|
| Claim Number | Hidden | claim_number |
| Satisfied with repair? | Radio (Yes/No) | satisfied |
| If no, describe issue | Long Text | issue_description |
| Digital Signature | Signature | signature |

---

## Frontend Integration

### Landing Page Components

#### www.shb.studio/warranty

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    SHB Studio — Warranty Service                        │
│                                                                         │
│   We stand behind our work. Use this portal to report warranty issues   │
│   or check the status of an existing claim.                             │
│                                                                         │
│      ┌─────────────────────┐        ┌─────────────────────┐            │
│      │                     │        │                     │            │
│      │   FILE A NEW CLAIM  │        │  CHECK CLAIM STATUS │            │
│      │                     │        │                     │            │
│      └─────────────────────┘        └─────────────────────┘            │
│                                                                         │
│   ─────────────────────────────────────────────────────────────────    │
│                                                                         │
│   What's Covered:                    Not Covered:                       │
│   • Defects in workmanship           • Normal wear and tear             │
│   • Building system issues           • Tenant-caused damage             │
│   • Waterproofing failures           • Cosmetic preferences             │
│                                                                         │
│   Questions? Email support@shb.studio                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### /warranty/status

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Check Warranty Status                            │
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │  Enter Claim Number    OR    Email Address                       │ │
│   │  ┌───────────────────┐      ┌───────────────────┐               │ │
│   │  │ WC-BEL-001        │      │ john@email.com    │               │ │
│   │  └───────────────────┘      └───────────────────┘               │ │
│   │                                                                  │ │
│   │             [  LOOK UP STATUS  ]                                 │ │
│   └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │  Claim: WC-BEL-001                                               │ │
│   │  Status: Repair In Progress                                      │ │
│   │  Category: Mechanical (HVAC)                                     │ │
│   │  Filed: May 29, 2026                                             │ │
│   │                                                                  │ │
│   │  Next Step: Awaiting contractor response                         │ │
│   │                                                                  │ │
│   │  Progress: ████████░░░░░░░░ 50%                                  │ │
│   │                                                                  │ │
│   │  ✓ Intake Review      ✓ Contractor Assigned                     │ │
│   │  ○ Repair Complete    ○ Your Confirmation                       │ │
│   │  ○ Closed                                                        │ │
│   └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

### API Tests

- [ ] Create claim via API
- [ ] Create claim via GHL webhook
- [ ] Complete full 6-gate signoff flow
- [ ] Test 24-hour auto-approval
- [ ] Test homeowner rejection (reopens claim)
- [ ] Test public status lookup by claim number
- [ ] Test public status lookup by email
- [ ] Test metrics endpoint
- [ ] Test signoff-status endpoint
- [ ] Verify audit trail (activities) logged correctly

### Integration Tests

- [ ] GHL form → webhook → claim created
- [ ] GHL signoff form → webhook → homeowner signoff recorded
- [ ] Email intake → Slack notification
- [ ] Status change → Slack notification

### Frontend Tests

- [ ] Landing page renders correctly
- [ ] New claim form submits to GHL
- [ ] Status lookup returns correct data
- [ ] Signoff progress visualization
- [ ] Before/after photos display
- [ ] Mobile responsive

---

## Deployment Checklist

- [ ] Run Prisma migration: `npx prisma migrate deploy`
- [ ] Configure GHL webhooks
- [ ] Set up DNS for www.shb.studio/warranty
- [ ] Configure Slack webhook for #warranty channel
- [ ] Test end-to-end flow in staging
- [ ] Run security review
- [ ] Deploy to production

---

## Contact

For integration support, contact:
- **Technical**: dev@foundry-ai.com
- **Product**: kc@foundryfund.com
