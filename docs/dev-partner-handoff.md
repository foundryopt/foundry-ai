# Development Partner Handoff — Warranty Tracking System

**Date**: 2026-05-29  
**Project**: SHB Warranty Tracking System with GHL Integration

---

## Executive Summary

Complete backend API for warranty claim tracking with:
- 6-gate signoff protocol (PM → GC → Photos → Repair → Homeowner → Close)
- GHL webhook integration for form intake and homeowner signoff
- 24-hour auto-approval for non-responsive homeowners
- Public status lookup API for landing page
- Full audit trail for all actions

---

## Repository

**GitHub**: `foundryopt/foundry-ai`  
**Backend Location**: `backend/`

### Key Files

| File | Purpose |
|------|---------|
| `backend/src/routes/warranty.ts` | All warranty API endpoints (824 lines) |
| `backend/prisma/schema.prisma` | Database schema with WarrantyClaim + Activity models |
| `backend/Dockerfile` | Production container build |
| `backend/DEPLOY.md` | Deployment instructions |
| `property-management/warranty/ghl-form-config.md` | GHL form setup |
| `property-management/warranty/landing-page-spec.md` | www.shb.studio/warranty spec |
| `docs/dev-partner-integration-guide.md` | Full API reference |

---

## Quick Start (Local Development)

```bash
# Clone repo
git clone https://github.com/foundryopt/foundry-ai.git
cd foundry-ai/backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Create database (PostgreSQL required)
createdb foundry_warranty

# Run migrations
npx prisma migrate dev

# Seed sample data (optional)
npm run db:seed

# Start dev server
npm run dev
# API running at http://localhost:3001
```

---

## Deployment Options

### Option 1: Railway (Fastest)

```bash
cd backend
./scripts/deploy-railway.sh
```

Or manually:
1. https://railway.app → New Project → GitHub
2. Connect `foundryopt/foundry-ai`, root directory `backend`
3. Add PostgreSQL database
4. Set env vars: `JWT_SECRET`, `CORS_ORIGIN=https://www.shb.studio`
5. Deploy

### Option 2: Render

1. https://render.com → New → Blueprint
2. Connect repo, select `backend/render.yaml`
3. Auto-deploys with PostgreSQL

### Option 3: Docker (Any Host)

```bash
cd backend
docker build -t foundry-warranty .
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e CORS_ORIGIN="https://www.shb.studio" \
  foundry-warranty
```

---

## API Overview

### Public Endpoints (No Auth)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| GET | `/api/warranty/status/public` | Homeowner status lookup |
| POST | `/api/warranty/webhook/ghl-intake` | GHL form submission |
| POST | `/api/warranty/webhook/homeowner-signoff` | Homeowner signoff |

### Protected Endpoints (JWT Auth)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/warranty/claims/all` | List all claims |
| GET | `/api/warranty/claims/:claimNumber` | Get claim details + activity |
| POST | `/api/warranty/claims` | Create claim manually |
| PATCH | `/api/warranty/claims/:claimNumber/status` | Update status |
| POST | `/api/warranty/claims/:claimNumber/signoff/:gate` | Record signoff |
| POST | `/api/warranty/claims/:claimNumber/photos` | Upload photo URLs |
| GET | `/api/warranty/claims/metrics` | Dashboard metrics |

---

## Signoff Protocol

```
1. PM Signoff      → Claim reviewed, coverage confirmed
2. GC Signoff      → Contractor assigned, scope confirmed
3. Before Photos   → Photo evidence before repair
4. After Photos    → Photo evidence after repair
5. Repair Signoff  → Contractor confirms completion
6. Homeowner Signoff → Homeowner approves (or 24hr auto-approve)
7. Close Signoff   → Final admin closure
```

Status Progression:
```
open → assigned → in-repair → resolved → closed
```

---

## GHL Integration

### Intake Webhook

**URL**: `POST /api/warranty/webhook/ghl-intake`

```json
{
  "project_id": "sandbox",
  "unit": "Unit 101",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-0100",
  "category": "plumbing",
  "description": "Leaking faucet in master bath",
  "priority": "standard",
  "has_photos": true,
  "photo_urls": ["https://..."],
  "ghl_contact_id": "contact_123",
  "ghl_conversation_id": "conv_456"
}
```

**Response**:
```json
{
  "success": true,
  "claimNumber": "WC-SAN-001",
  "message": "Warranty claim created successfully"
}
```

### Homeowner Signoff Webhook

**URL**: `POST /api/warranty/webhook/homeowner-signoff`

```json
{
  "claim_number": "WC-SAN-001",
  "email": "john@example.com",
  "satisfied": "yes",
  "signature_url": "https://...",
  "notes": "Looks great, thank you!"
}
```

---

## Database Schema

### WarrantyClaim

```sql
-- 43+ fields including:
id, claim_number, project_id, unit_location, reported_by, 
reported_by_email, reported_by_phone, date_reported, priority, 
status, defect_description, category, photo_evidence, 
warranty_expiry, covered, responsible_contractor, date_assigned,
response_due, date_repair_scheduled, date_repair_completed,
repair_description, repair_verified, date_closed,

-- Signoff fields:
pm_signoff, pm_signoff_date, pm_signoff_by,
gc_signoff, gc_signoff_date, gc_signoff_by,
before_photos_url, after_photos_url,
repair_signoff, repair_signoff_date, repair_signoff_by,
homeowner_signoff, homeowner_signoff_date, homeowner_signoff_sent,
homeowner_signoff_method, homeowner_signoff_notes,
close_signoff, close_signoff_date, close_signoff_by,

-- GHL fields:
ghl_contact_id, ghl_conversation_id, intake_source
```

### WarrantyClaimActivity

```sql
id, claim_id, action, description, performed_by, performed_at, metadata
```

Action types: `created`, `status_change`, `signoff`, `assignment`, `note`, `escalation`, `photo_upload`

---

## Testing Checklist

### Backend
- [ ] Health check returns 200
- [ ] GHL intake webhook creates claim
- [ ] Claim number auto-generated correctly
- [ ] Status lookup works with claim# + email
- [ ] All signoff gates record correctly
- [ ] Activity log captures all actions
- [ ] 24-hour auto-approve logic works

### GHL
- [ ] Form submits and webhook fires
- [ ] Contact created with custom fields
- [ ] Signoff workflow triggers on tag
- [ ] SMS/Email sent for signoff request

### Landing Page
- [ ] Form embedded and functional
- [ ] Status check calls API correctly
- [ ] Status card renders all states
- [ ] Mobile responsive

---

## Support Contacts

- **Project Lead**: kc@foundryfund.com
- **Repository**: https://github.com/foundryopt/foundry-ai

---

## Timeline

| Task | Owner | Due |
|------|-------|-----|
| Deploy backend to Railway/Render | Dev Partner | Today |
| Configure GHL form + webhooks | Dev Partner | Today |
| Build landing page | Dev Partner | Today |
| Test end-to-end flow | Dev Partner | Today |
| Go-live verification | KC | Today |
