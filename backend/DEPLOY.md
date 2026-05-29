# Foundry Warranty Backend — Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended — Fastest)

1. **Create Railway Account**: https://railway.app
2. **New Project from GitHub**:
   - Connect your GitHub repo: `foundryopt/foundry-ai`
   - Set root directory: `backend`
3. **Add PostgreSQL**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-sets `DATABASE_URL`
4. **Set Environment Variables**:
   ```
   JWT_SECRET=<generate-32-char-secret>
   CORS_ORIGIN=https://www.shb.studio
   NODE_ENV=production
   ```
5. **Deploy** — Railway builds from Dockerfile automatically
6. **Get URL**: Railway provides `https://your-app.up.railway.app`

### Option 2: Render

1. **Create Render Account**: https://render.com
2. **New Blueprint**:
   - Connect GitHub repo
   - Select `backend/render.yaml`
3. Render creates web service + PostgreSQL automatically
4. **Get URL**: Render provides `https://foundry-warranty-api.onrender.com`

### Option 3: Fly.io

```bash
cd backend
fly launch --name foundry-warranty-api
fly postgres create --name foundry-warranty-db
fly postgres attach foundry-warranty-db
fly secrets set JWT_SECRET=$(openssl rand -base64 32)
fly secrets set CORS_ORIGIN=https://www.shb.studio
fly deploy
```

---

## Post-Deployment Checklist

### 1. Verify Health Check
```bash
curl https://YOUR-API-URL/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Configure GHL Webhooks

In GHL (GoHighLevel), configure these webhook URLs:

| Event | Webhook URL |
|-------|-------------|
| Warranty Form Submit | `https://YOUR-API-URL/api/warranty/webhook/ghl-intake` |
| Homeowner Signoff | `https://YOUR-API-URL/api/warranty/webhook/homeowner-signoff` |

### 3. Test Claim Creation
```bash
curl -X POST https://YOUR-API-URL/api/warranty/webhook/ghl-intake \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "sandbox",
    "unit": "Unit 101",
    "name": "Test Homeowner",
    "email": "test@example.com",
    "phone": "555-0100",
    "category": "plumbing",
    "description": "Test claim from deployment",
    "priority": "standard",
    "has_photos": false
  }'
```

### 4. Test Public Status Lookup
```bash
curl "https://YOUR-API-URL/api/warranty/status/public?claimNumber=WC-SAN-001&email=test@example.com"
```

---

## API Endpoints

### Public (No Auth)
- `GET /health` — Health check
- `GET /api/warranty/status/public?claimNumber=X&email=Y` — Homeowner status lookup
- `POST /api/warranty/webhook/ghl-intake` — GHL form webhook
- `POST /api/warranty/webhook/homeowner-signoff` — Homeowner signoff webhook

### Protected (JWT Auth)
- `GET /api/warranty/claims/all` — List all claims
- `GET /api/warranty/claims/:claimNumber` — Get claim details
- `POST /api/warranty/claims` — Create claim manually
- `PATCH /api/warranty/claims/:claimNumber/status` — Update status
- `POST /api/warranty/claims/:claimNumber/signoff/:gate` — Record signoff
- `POST /api/warranty/claims/:claimNumber/photos` — Upload photo URLs
- `GET /api/warranty/claims/metrics` — Dashboard metrics

---

## Landing Page Integration

### www.shb.studio/warranty

The landing page needs two integrations:

1. **File Claim Form** — Embed GHL form or redirect to GHL page
2. **Check Status** — Call the public status API:

```javascript
async function checkStatus(claimNumber, email) {
  const res = await fetch(
    `https://YOUR-API-URL/api/warranty/status/public?claimNumber=${claimNumber}&email=${email}`
  );
  return res.json();
}
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Min 32 chars, for auth tokens |
| `CORS_ORIGIN` | Yes | `https://www.shb.studio` for production |
| `PORT` | No | Default: 3001 |
| `NODE_ENV` | No | `production` for deployed |
| `GHL_WEBHOOK_SECRET` | No | For webhook signature verification |

---

## Troubleshooting

### Database Migration Failed
```bash
# Manual migration
npx prisma migrate deploy
```

### CORS Errors
- Ensure `CORS_ORIGIN` matches your frontend domain exactly
- Include protocol: `https://www.shb.studio` not `www.shb.studio`

### Webhook Not Receiving
- Check GHL workflow is active
- Verify webhook URL is correct (no trailing slash)
- Check Railway/Render logs for incoming requests
