"""
Slack Socket Mode Client
Securely connects local Mac Mini to Slack via Socket Mode.
Handles real-time events and interactive components.
"""

import os
import json
import logging
from datetime import datetime
from typing import Callable, Optional

from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

SLACK_BOT_TOKEN = os.environ.get("SLACK_BOT_TOKEN")
SLACK_APP_TOKEN = os.environ.get("SLACK_APP_TOKEN")

if not SLACK_BOT_TOKEN or not SLACK_APP_TOKEN:
    raise EnvironmentError(
        "Missing required environment variables: SLACK_BOT_TOKEN and SLACK_APP_TOKEN"
    )

app = App(token=SLACK_BOT_TOKEN)
client = WebClient(token=SLACK_BOT_TOKEN)

event_handlers: dict[str, list[Callable]] = {}


def register_event_handler(event_type: str, handler: Callable):
    """Register a handler for a specific event type."""
    if event_type not in event_handlers:
        event_handlers[event_type] = []
    event_handlers[event_type].append(handler)
    logger.info(f"Registered handler for event type: {event_type}")


def dispatch_to_handlers(event_type: str, event_data: dict):
    """Dispatch an event to all registered handlers."""
    handlers = event_handlers.get(event_type, [])
    for handler in handlers:
        try:
            handler(event_data)
        except Exception as e:
            logger.error(f"Handler error for {event_type}: {e}")


@app.event("message")
def handle_message(event: dict, say: Callable):
    """Handle incoming messages."""
    logger.info(f"Received message: {event.get('text', '')[:50]}...")
    dispatch_to_handlers("message", event)


@app.event("app_mention")
def handle_mention(event: dict, say: Callable):
    """Handle app mentions."""
    user = event.get("user")
    text = event.get("text", "")
    channel = event.get("channel")

    logger.info(f"App mentioned by {user} in {channel}")
    dispatch_to_handlers("app_mention", event)

    say(
        text=f"Hi <@{user}>! I received your message. Processing...",
        thread_ts=event.get("ts")
    )


@app.action("ghl_acknowledge")
def handle_ghl_acknowledge(ack: Callable, body: dict, client: WebClient):
    """Handle GHL message acknowledgment."""
    ack()

    user_id = body["user"]["id"]
    channel_id = body["channel"]["id"]
    message_ts = body["message"]["ts"]

    logger.info(f"GHL message acknowledged by {user_id}")

    try:
        client.reactions_add(
            channel=channel_id,
            timestamp=message_ts,
            name="white_check_mark"
        )

        client.chat_postMessage(
            channel=channel_id,
            thread_ts=message_ts,
            text=f":white_check_mark: Acknowledged by <@{user_id}> at {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        )
    except SlackApiError as e:
        logger.error(f"Failed to acknowledge: {e}")


@app.action("ghl_escalate")
def handle_ghl_escalate(ack: Callable, body: dict, client: WebClient):
    """Handle GHL message escalation."""
    ack()

    user_id = body["user"]["id"]
    channel_id = body["channel"]["id"]
    message_ts = body["message"]["ts"]
    original_message = body["message"].get("text", "")

    logger.info(f"GHL message escalated by {user_id}")

    try:
        client.chat_postMessage(
            channel="executive-escalations",
            text=f":rotating_light: *Escalation from <#{channel_id}>*\n\nEscalated by: <@{user_id}>\nOriginal message: {original_message}\n\n<https://slack.com/archives/{channel_id}/p{message_ts.replace('.', '')}|View original>",
            unfurl_links=False
        )

        client.reactions_add(
            channel=channel_id,
            timestamp=message_ts,
            name="rotating_light"
        )

        client.chat_postMessage(
            channel=channel_id,
            thread_ts=message_ts,
            text=f":rotating_light: Escalated to #executive-escalations by <@{user_id}>"
        )
    except SlackApiError as e:
        logger.error(f"Failed to escalate: {e}")


@app.action("ghl_view_contact")
def handle_ghl_view_contact(ack: Callable, body: dict):
    """Handle view in GHL button click."""
    ack()
    logger.info("GHL view contact action received")


@app.action("approve_and_log")
def handle_approve_and_log(ack: Callable, body: dict, client: WebClient):
    """
    Handle Approve & Log button for new playbook entries.
    This is the Level 1: Auto-Log authority action.
    """
    ack()

    user_id = body["user"]["id"]
    channel_id = body["channel"]["id"]
    message_ts = body["message"]["ts"]

    action_value = body["actions"][0].get("value", "{}")
    try:
        log_data = json.loads(action_value)
    except json.JSONDecodeError:
        log_data = {}

    logger.info(f"Approve & Log triggered by {user_id}: {log_data}")

    dispatch_to_handlers("approve_and_log", {
        "user_id": user_id,
        "channel_id": channel_id,
        "message_ts": message_ts,
        "log_data": log_data
    })

    try:
        client.reactions_add(
            channel=channel_id,
            timestamp=message_ts,
            name="memo"
        )

        client.chat_postMessage(
            channel=channel_id,
            thread_ts=message_ts,
            text=f":memo: Logged by <@{user_id}> at {datetime.now().strftime('%Y-%m-%d %H:%M')}\nEntry added to Drive Sheets."
        )
    except SlackApiError as e:
        logger.error(f"Failed to log approval: {e}")


@app.shortcut("create_task")
def handle_create_task_shortcut(ack: Callable, shortcut: dict, client: WebClient):
    """Handle create task shortcut."""
    ack()

    client.views_open(
        trigger_id=shortcut["trigger_id"],
        view={
            "type": "modal",
            "callback_id": "create_task_modal",
            "title": {"type": "plain_text", "text": "Create Task"},
            "submit": {"type": "plain_text", "text": "Create"},
            "blocks": [
                {
                    "type": "input",
                    "block_id": "task_title",
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "title_input"
                    },
                    "label": {"type": "plain_text", "text": "Task Title"}
                },
                {
                    "type": "input",
                    "block_id": "task_description",
                    "element": {
                        "type": "plain_text_input",
                        "multiline": True,
                        "action_id": "description_input"
                    },
                    "label": {"type": "plain_text", "text": "Description"}
                },
                {
                    "type": "input",
                    "block_id": "task_entity",
                    "element": {
                        "type": "static_select",
                        "action_id": "entity_select",
                        "options": [
                            {"text": {"type": "plain_text", "text": "SHB Group"}, "value": "shb_group"},
                            {"text": {"type": "plain_text", "text": "SHB Studio"}, "value": "shb_studio"},
                            {"text": {"type": "plain_text", "text": "Simple Home Builders"}, "value": "simple_home_builders"},
                            {"text": {"type": "plain_text", "text": "Builiq Inc"}, "value": "builiq_inc"},
                            {"text": {"type": "plain_text", "text": "Foundry Rooms"}, "value": "foundry_rooms"},
                            {"text": {"type": "plain_text", "text": "Foundry Fund"}, "value": "foundry_fund"}
                        ]
                    },
                    "label": {"type": "plain_text", "text": "Assign to Entity"}
                }
            ]
        }
    )


@app.view("create_task_modal")
def handle_create_task_submission(ack: Callable, body: dict, client: WebClient, view: dict):
    """Handle task creation modal submission."""
    ack()

    values = view["state"]["values"]
    title = values["task_title"]["title_input"]["value"]
    description = values["task_description"]["description_input"]["value"]
    entity = values["task_entity"]["entity_select"]["selected_option"]["value"]
    user_id = body["user"]["id"]

    logger.info(f"Task created: {title} -> {entity}")

    dispatch_to_handlers("task_created", {
        "title": title,
        "description": description,
        "entity": entity,
        "created_by": user_id
    })


def post_variance_alert(
    channel: str,
    variance_type: str,
    variance_value: float,
    threshold: float,
    details: str
):
    """Post a variance alert to Slack (Level 2: Auto-Notify)."""
    emoji = ":clock1:" if variance_type == "time" else ":moneybag:"
    unit = "hours" if variance_type == "time" else "USD"

    try:
        client.chat_postMessage(
            channel=channel,
            text=f"{emoji} *{variance_type.title()} Variance Alert*",
            blocks=[
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"{emoji} {variance_type.title()} Variance Alert",
                        "emoji": True
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Variance:*\n{variance_value} {unit}"},
                        {"type": "mrkdwn", "text": f"*Threshold:*\n{threshold} {unit}"},
                        {"type": "mrkdwn", "text": f"*Status:*\n:warning: Above Threshold"},
                        {"type": "mrkdwn", "text": f"*Time:*\n{datetime.now().strftime('%Y-%m-%d %H:%M')}"}
                    ]
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": f"*Details:*\n{details}"}
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "Acknowledge"},
                            "style": "primary",
                            "action_id": "variance_acknowledge"
                        },
                        {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "Escalate"},
                            "style": "danger",
                            "action_id": "variance_escalate"
                        }
                    ]
                }
            ]
        )
        logger.info(f"Variance alert posted to {channel}")
    except SlackApiError as e:
        logger.error(f"Failed to post variance alert: {e}")


def start_socket_mode():
    """Start the Socket Mode connection."""
    logger.info("Starting Slack Socket Mode client...")
    handler = SocketModeHandler(app, SLACK_APP_TOKEN)
    handler.start()


if __name__ == "__main__":
    start_socket_mode()
