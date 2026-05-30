"""
Relationship EQ Agent - Dimension 4
3-Way dynamic SMS group threads and conference loops.
Manages stakeholder communication and approval chains.
"""

import os
import json
import sqlite3
import logging
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, field
from pathlib import Path
from enum import Enum

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).parent.parent.parent / "data" / "relationship_ledger.db"


class StakeholderType(Enum):
    OWNER = "owner"
    SUBCONTRACTOR = "subcontractor"
    VENDOR = "vendor"
    DESIGN = "design"
    INTERNAL = "internal"
    INVESTOR = "investor"


class CommunicationType(Enum):
    SMS = "sms"
    EMAIL = "email"
    SLACK = "slack"
    PHONE = "phone"
    IN_PERSON = "in_person"


class ThreadStatus(Enum):
    ACTIVE = "active"
    WAITING_RESPONSE = "waiting_response"
    RESOLVED = "resolved"
    ESCALATED = "escalated"
    ARCHIVED = "archived"


@dataclass
class Stakeholder:
    """A project stakeholder."""
    id: str
    name: str
    entity: str
    type: StakeholderType
    phone: Optional[str] = None
    email: Optional[str] = None
    slack_id: Optional[str] = None
    preferred_channel: CommunicationType = CommunicationType.SMS
    timezone: str = "America/Los_Angeles"


@dataclass
class CommunicationThread:
    """A communication thread with stakeholders."""
    id: str
    project_id: str
    subject: str
    participants: list[str]
    channel: CommunicationType
    status: ThreadStatus
    created_at: str
    created_by: str
    last_activity: str
    messages: list[dict] = field(default_factory=list)
    requires_response_from: Optional[list[str]] = None
    escalation_deadline: Optional[str] = None


@dataclass
class ThreeWayGroup:
    """A 3-way SMS group configuration."""
    id: str
    project_id: str
    name: str
    owner_contact: str
    contractor_contact: str
    admin_contact: str
    ghl_group_id: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    status: str = "active"


class RelationshipEQ:
    """
    Dimension 4 Agent: Stakeholder relationship management.
    Handles 3-way SMS groups, communication threading, and approval chains.
    """

    def __init__(self):
        self._init_database()
        self.entity_contacts = self._load_entity_contacts()

    def _init_database(self):
        """Initialize the SQLite relationship ledger."""
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS stakeholders (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                entity TEXT,
                type TEXT,
                phone TEXT,
                email TEXT,
                slack_id TEXT,
                preferred_channel TEXT,
                timezone TEXT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS communication_threads (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                subject TEXT,
                participants TEXT,
                channel TEXT,
                status TEXT,
                created_at TEXT,
                created_by TEXT,
                last_activity TEXT,
                messages TEXT,
                requires_response_from TEXT,
                escalation_deadline TEXT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS three_way_groups (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                name TEXT,
                owner_contact TEXT,
                contractor_contact TEXT,
                admin_contact TEXT,
                ghl_group_id TEXT,
                created_at TEXT,
                status TEXT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS approval_requests (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                request_type TEXT,
                description TEXT,
                requested_by TEXT,
                requested_from TEXT,
                status TEXT,
                created_at TEXT,
                responded_at TEXT,
                response TEXT
            )
        """)

        conn.commit()
        conn.close()
        logger.info("Relationship database initialized")

    def _load_entity_contacts(self) -> dict:
        """Load default entity contact mappings."""
        return {
            "shb_group": {
                "escalation_contact": "kc@foundryfund.com",
                "slack_channel": "#shb-dispatcher"
            },
            "shb_studio": {
                "escalation_contact": "design@shbstudio.com",
                "slack_channel": "#design-studio"
            },
            "simple_home_builders": {
                "escalation_contact": "ops@simplehomebuilders.com",
                "slack_channel": "#simple-home-builders"
            },
            "builiq_inc": {
                "escalation_contact": "supply@builiq.com",
                "slack_channel": "#builiq-supply"
            },
            "foundry_rooms": {
                "escalation_contact": "events@foundryrooms.com",
                "slack_channel": "#foundry-rooms"
            },
            "foundry_fund": {
                "escalation_contact": "investors@foundryfund.com",
                "slack_channel": "#foundry-fund"
            }
        }

    def create_three_way_group(
        self,
        project_id: str,
        name: str,
        owner_contact: str,
        contractor_contact: str,
        admin_contact: str
    ) -> dict:
        """
        Create a 3-way SMS group for owner-contractor-admin communication.
        In production, this would integrate with GHL to create the actual group.
        """
        group_id = f"3WAY-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        group = ThreeWayGroup(
            id=group_id,
            project_id=project_id,
            name=name,
            owner_contact=owner_contact,
            contractor_contact=contractor_contact,
            admin_contact=admin_contact
        )

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO three_way_groups
            (id, project_id, name, owner_contact, contractor_contact, admin_contact,
             created_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            group.id, group.project_id, group.name, group.owner_contact,
            group.contractor_contact, group.admin_contact, group.created_at, group.status
        ))

        conn.commit()
        conn.close()

        logger.info(f"Created 3-way group {group_id}: {name}")

        return {
            "group_id": group_id,
            "name": name,
            "participants": {
                "owner": owner_contact,
                "contractor": contractor_contact,
                "admin": admin_contact
            },
            "status": "active",
            "message": f"3-way SMS group '{name}' created. Ready for GHL integration."
        }

    def start_communication_thread(
        self,
        project_id: str,
        subject: str,
        participants: list[str],
        channel: CommunicationType,
        created_by: str,
        initial_message: Optional[str] = None,
        requires_response_from: Optional[list[str]] = None
    ) -> dict:
        """Start a new communication thread with stakeholders."""
        thread_id = f"THREAD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        created_at = datetime.utcnow().isoformat()

        messages = []
        if initial_message:
            messages.append({
                "sender": created_by,
                "content": initial_message,
                "timestamp": created_at
            })

        thread = CommunicationThread(
            id=thread_id,
            project_id=project_id,
            subject=subject,
            participants=participants,
            channel=channel,
            status=ThreadStatus.ACTIVE if not requires_response_from else ThreadStatus.WAITING_RESPONSE,
            created_at=created_at,
            created_by=created_by,
            last_activity=created_at,
            messages=messages,
            requires_response_from=requires_response_from
        )

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO communication_threads
            (id, project_id, subject, participants, channel, status, created_at,
             created_by, last_activity, messages, requires_response_from)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            thread.id, thread.project_id, thread.subject,
            json.dumps(thread.participants), thread.channel.value, thread.status.value,
            thread.created_at, thread.created_by, thread.last_activity,
            json.dumps(thread.messages), json.dumps(thread.requires_response_from)
        ))

        conn.commit()
        conn.close()

        logger.info(f"Started thread {thread_id}: {subject}")

        return {
            "thread_id": thread_id,
            "subject": subject,
            "participants": participants,
            "channel": channel.value,
            "status": thread.status.value,
            "message": f"Communication thread started via {channel.value}."
        }

    def add_message_to_thread(
        self,
        thread_id: str,
        sender: str,
        content: str
    ) -> dict:
        """Add a message to an existing thread."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT messages, requires_response_from FROM communication_threads
            WHERE id = ?
        """, (thread_id,))

        row = cursor.fetchone()
        if not row:
            conn.close()
            return {"success": False, "error": "Thread not found"}

        messages = json.loads(row[0] or "[]")
        requires_response = json.loads(row[1] or "[]") or []

        timestamp = datetime.utcnow().isoformat()
        messages.append({
            "sender": sender,
            "content": content,
            "timestamp": timestamp
        })

        if sender in requires_response:
            requires_response.remove(sender)

        new_status = ThreadStatus.ACTIVE.value if not requires_response else ThreadStatus.WAITING_RESPONSE.value

        cursor.execute("""
            UPDATE communication_threads
            SET messages = ?, last_activity = ?, status = ?, requires_response_from = ?
            WHERE id = ?
        """, (
            json.dumps(messages), timestamp, new_status,
            json.dumps(requires_response) if requires_response else None, thread_id
        ))

        conn.commit()
        conn.close()

        return {
            "success": True,
            "thread_id": thread_id,
            "message_count": len(messages),
            "status": new_status
        }

    def request_approval(
        self,
        project_id: str,
        request_type: str,
        description: str,
        requested_by: str,
        requested_from: list[str]
    ) -> dict:
        """Create an approval request to stakeholders."""
        request_id = f"APPR-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        created_at = datetime.utcnow().isoformat()

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO approval_requests
            (id, project_id, request_type, description, requested_by, requested_from,
             status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            request_id, project_id, request_type, description, requested_by,
            json.dumps(requested_from), "pending", created_at
        ))

        conn.commit()
        conn.close()

        logger.info(f"Created approval request {request_id}: {request_type}")

        return {
            "request_id": request_id,
            "request_type": request_type,
            "requested_from": requested_from,
            "status": "pending",
            "message": f"Approval request sent to {', '.join(requested_from)}."
        }

    def respond_to_approval(
        self,
        request_id: str,
        responder: str,
        approved: bool,
        response_note: Optional[str] = None
    ) -> dict:
        """Record a response to an approval request."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        responded_at = datetime.utcnow().isoformat()
        status = "approved" if approved else "rejected"
        response = f"{'Approved' if approved else 'Rejected'} by {responder}"
        if response_note:
            response += f": {response_note}"

        cursor.execute("""
            UPDATE approval_requests
            SET status = ?, responded_at = ?, response = ?
            WHERE id = ?
        """, (status, responded_at, response, request_id))

        if cursor.rowcount == 0:
            conn.close()
            return {"success": False, "error": "Request not found"}

        conn.commit()
        conn.close()

        return {
            "success": True,
            "request_id": request_id,
            "status": status,
            "responder": responder
        }

    def get_entity_escalation_path(self, entity: str) -> dict:
        """Get the escalation path for an entity."""
        if entity not in self.entity_contacts:
            return {"error": f"Unknown entity: {entity}"}

        return {
            "entity": entity,
            "escalation_contact": self.entity_contacts[entity]["escalation_contact"],
            "slack_channel": self.entity_contacts[entity]["slack_channel"],
            "ultimate_authority": "shb_group"
        }

    def get_pending_responses(self, project_id: str) -> list[dict]:
        """Get all threads and requests awaiting response."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        pending = []

        cursor.execute("""
            SELECT id, subject, requires_response_from, last_activity
            FROM communication_threads
            WHERE project_id = ? AND status = 'waiting_response'
        """, (project_id,))

        for row in cursor.fetchall():
            pending.append({
                "type": "thread",
                "id": row[0],
                "subject": row[1],
                "awaiting_from": json.loads(row[2] or "[]"),
                "since": row[3]
            })

        cursor.execute("""
            SELECT id, request_type, description, requested_from, created_at
            FROM approval_requests
            WHERE project_id = ? AND status = 'pending'
        """, (project_id,))

        for row in cursor.fetchall():
            pending.append({
                "type": "approval",
                "id": row[0],
                "request_type": row[1],
                "description": row[2],
                "awaiting_from": json.loads(row[3] or "[]"),
                "since": row[4]
            })

        conn.close()
        return pending

    async def provide_dimension_feedback(self, query: str, plan: dict) -> dict:
        """
        Provide relationship dimension feedback for the Dispatcher.
        """
        keywords = query.lower()

        feedback = {
            "dimension": "relationship",
            "query_received": query,
            "analysis": {}
        }

        if "notify" in keywords or "communicate" in keywords:
            feedback["analysis"]["communication_check"] = "Identify stakeholders to notify"
            feedback["analysis"]["channel_recommendation"] = "Use preferred channel per stakeholder"

        if "approval" in keywords or "sign-off" in keywords:
            feedback["analysis"]["approval_routing"] = "Route to appropriate authority per RACI"

        if "escalate" in keywords:
            feedback["analysis"]["escalation_path"] = "All escalations route to SHB Group"

        if "homeowner" in keywords or "owner" in keywords:
            feedback["analysis"]["owner_communication"] = "Homeowner comms via 3-way SMS group"

        if "subcontractor" in keywords or "vendor" in keywords:
            feedback["analysis"]["trade_communication"] = "Trade comms route through GHL to Slack"

        feedback["recommendations"] = [
            "Use 3-way groups for owner-contractor-admin threads",
            "Track response requirements for accountability",
            "Escalate unresponsive threads after 24 hours"
        ]

        return feedback


eq_agent = RelationshipEQ()


async def relationship_dimension_handler(query: str, plan: dict) -> dict:
    """Handler function for Dispatcher integration."""
    return await eq_agent.provide_dimension_feedback(query, plan)
