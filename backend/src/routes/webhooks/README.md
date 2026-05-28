# GHL SMS → Slack Integration

This integration forwards SMS messages from GoHighLevel to Slack.

## Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SMS_CHANNEL=#ghl-sms

# GHL Webhook Security (optional)
GHL_WEBHOOK_SECRET=your-secret-key
```

### 2. Create Slack Bot

1. Go to https://api.slack.com/apps
2. Create New App → From scratch
3. Name: `Foundry GHL` (or similar)
4. Select your workspace

**Bot Token Scopes needed:**
- `chat:write` - Post messages
- `chat:write.public` - Post to channels the bot isn't in

5. Install to Workspace
6. Copy the Bot User OAuth Token (`xoxb-...`)

### 3. Create Slack Channel

Create `#ghl-sms` (or your preferred channel name) in Slack.

### 4. Configure GHL Webhook

1. In GoHighLevel, go to **Settings → Webhooks**
2. Add a new webhook:
   - **URL**: `https://your-domain.com/api/webhooks/ghl/sms`
   - **Events**: Select "SMS" or "Inbound Message" / "Outbound Message"
3. If using `GHL_WEBHOOK_SECRET`, add header: `x-ghl-api-key: your-secret`

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/ghl/sms` | POST | Receive SMS events from GHL |
| `/api/webhooks/ghl/call` | POST | Receive call events (placeholder) |
| `/api/webhooks/ghl/health` | GET | Health check |

## Testing

```bash
# Test the webhook locally
curl -X POST http://localhost:3001/api/webhooks/ghl/sms \
  -H "Content-Type: application/json" \
  -d '{
    "type": "InboundMessage",
    "from": "+15551234567",
    "body": "Test message from GHL",
    "contact": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "dateAdded": "2026-01-15T10:30:00Z"
  }'
```

## Slack Message Format

Inbound SMS appear as:

```
📥 Inbound SMS
From: John Doe
Phone: +15551234567

Message:
Test message from GHL

📅 1/15/2026, 10:30:00 AM | 🔗 Contact ID: ghl-123
```
