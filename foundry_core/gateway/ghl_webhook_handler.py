"""
GoHighLevel Webhook Handler
Routes incoming GHL payloads from phone groups to appropriate Slack channels.

Routing Rules:
- Subcontractor → #simple-home-builders
- Vendor/Importer → #builiq-supply
- Homeowner → #shb-dispatcher
"""

import os
import json
import logging
import hashlib
import hmac
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Request, HTTPException, Header
from pydantic import BaseModel, Field
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Foundry GHL Webhook Handler",
    description="Routes GoHighLevel payloads to Slack channels",
    version="1.0.0"
)

SLACK_BOT_TOKEN = os.environ.get("SLACK_BOT_TOKEN")
GHL_WEBHOOK_SECRET = os.environ.get("GHL_WEBHOOK_SECRET")

CHANNEL_ROUTING = {
    "subcontractor": "simple-home-builders",
    "vendor": "builiq-supply",
    "importer": "builiq-supply",
    "homeowner": "shb-dispatcher",
    "employee": "shb-dispatcher",
}

GROUP_TYPE_KEYWORDS = {
    "subcontractor": ["sub", "contractor", "trade", "crew"],
    "vendor": ["vendor", "supplier", "importer", "wholesale", "builiq"],
    "homeowner": ["owner", "client", "homeowner", "buyer"],
    "employee": ["employee", "staff", "team", "internal"],
}


class GHLPayload(BaseModel):
    """GoHighLevel webhook payload structure."""
    event_type: str = Field(..., description="Type of GHL event")
    contact_id: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    message_body: Optional[str] = None
    media_urls: Optional[list[str]] = Field(default_factory=list)
    group_name: Optional[str] = None
    group_type: Optional[str] = None
    timestamp: Optional[str] = None
    location_id: Optional[str] = None


class SlackMessage(BaseModel):
    """Slack message structure for posting."""
    channel: str
    text: str
    attachments: Optional[list[dict]] = None
    blocks: Optional[list[dict]] = None


def verify_ghl_signature(payload: bytes, signature: str) -> bool:
    """Verify the GHL webhook signature for security."""
    if not GHL_WEBHOOK_SECRET:
        logger.warning("GHL_WEBHOOK_SECRET not set - skipping signature verification")
        return True

    expected = hmac.new(
        GHL_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected, signature)


def classify_group_type(group_name: str, explicit_type: Optional[str] = None) -> str:
    """Classify the group type based on name keywords or explicit type."""
    if explicit_type and explicit_type.lower() in CHANNEL_ROUTING:
        return explicit_type.lower()

    if group_name:
        group_lower = group_name.lower()
        for group_type, keywords in GROUP_TYPE_KEYWORDS.items():
            if any(kw in group_lower for kw in keywords):
                return group_type

    return "homeowner"


def get_target_channel(group_type: str) -> str:
    """Get the Slack channel for the given group type."""
    return CHANNEL_ROUTING.get(group_type, "shb-dispatcher")


def format_slack_message(payload: GHLPayload, group_type: str) -> SlackMessage:
    """Format the GHL payload as a Slack message."""
    channel = get_target_channel(group_type)

    timestamp = payload.timestamp or datetime.utcnow().isoformat()
    sender = payload.contact_name or payload.contact_phone or "Unknown"

    header_emoji = {
        "subcontractor": ":construction_worker:",
        "vendor": ":package:",
        "importer": ":ship:",
        "homeowner": ":house:",
        "employee": ":office:",
    }.get(group_type, ":speech_balloon:")

    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"{header_emoji} GHL Incoming: {group_type.title()}",
                "emoji": True
            }
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*From:*\n{sender}"},
                {"type": "mrkdwn", "text": f"*Group:*\n{payload.group_name or 'Direct'}"},
                {"type": "mrkdwn", "text": f"*Time:*\n{timestamp}"},
                {"type": "mrkdwn", "text": f"*Type:*\n{payload.event_type}"}
            ]
        }
    ]

    if payload.message_body:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Message:*\n> {payload.message_body}"
            }
        })

    if payload.media_urls:
        media_text = "\n".join([f"• <{url}|Attachment {i+1}>" for i, url in enumerate(payload.media_urls)])
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Attachments:*\n{media_text}"
            }
        })

    blocks.append({
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {"type": "plain_text", "text": "Acknowledge", "emoji": True},
                "style": "primary",
                "action_id": "ghl_acknowledge"
            },
            {
                "type": "button",
                "text": {"type": "plain_text", "text": "Escalate", "emoji": True},
                "style": "danger",
                "action_id": "ghl_escalate"
            },
            {
                "type": "button",
                "text": {"type": "plain_text", "text": "View in GHL", "emoji": True},
                "action_id": "ghl_view_contact"
            }
        ]
    })

    text_fallback = f"GHL {group_type} message from {sender}: {payload.message_body or '[No text]'}"

    return SlackMessage(channel=channel, text=text_fallback, blocks=blocks)


async def post_to_slack(message: SlackMessage) -> dict:
    """Post a message to Slack using the Bot API."""
    if not SLACK_BOT_TOKEN:
        raise HTTPException(status_code=500, detail="SLACK_BOT_TOKEN not configured")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://slack.com/api/chat.postMessage",
            headers={
                "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
                "Content-Type": "application/json"
            },
            json={
                "channel": message.channel,
                "text": message.text,
                "blocks": message.blocks
            }
        )

        result = response.json()

        if not result.get("ok"):
            logger.error(f"Slack API error: {result.get('error')}")
            raise HTTPException(status_code=500, detail=f"Slack error: {result.get('error')}")

        return result


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "ghl-webhook-handler",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/webhook/ghl")
async def handle_ghl_webhook(
    request: Request,
    x_ghl_signature: Optional[str] = Header(None)
):
    """
    Handle incoming GoHighLevel webhook payloads.
    Routes messages to appropriate Slack channels based on group type.
    """
    raw_body = await request.body()

    if x_ghl_signature and not verify_ghl_signature(raw_body, x_ghl_signature):
        logger.warning("Invalid GHL webhook signature")
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        data = json.loads(raw_body)
        payload = GHLPayload(**data)
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"Failed to parse GHL payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload format")

    group_type = classify_group_type(
        payload.group_name or "",
        payload.group_type
    )

    logger.info(f"Processing GHL webhook: type={payload.event_type}, group={group_type}")

    message = format_slack_message(payload, group_type)
    result = await post_to_slack(message)

    return {
        "status": "routed",
        "channel": message.channel,
        "group_type": group_type,
        "slack_ts": result.get("ts")
    }


@app.post("/webhook/ghl/test")
async def test_ghl_webhook():
    """Test endpoint to simulate a GHL webhook."""
    test_payload = GHLPayload(
        event_type="IncomingSms",
        contact_name="Test Subcontractor",
        contact_phone="+15551234567",
        message_body="Test message from GHL integration",
        group_name="Subcontractor Group",
        group_type="subcontractor",
        timestamp=datetime.utcnow().isoformat()
    )

    group_type = classify_group_type(test_payload.group_name, test_payload.group_type)
    message = format_slack_message(test_payload, group_type)

    return {
        "status": "test_generated",
        "would_route_to": message.channel,
        "message_preview": message.text
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
