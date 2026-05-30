"""
Quality Auditor Agent - Dimension 3
Photo OCR, architectural RFI logs, and warranty tracking.
Ensures compliance and documentation quality.
"""

import os
import json
import sqlite3
import logging
import hashlib
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, field
from pathlib import Path
from enum import Enum

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).parent.parent.parent / "data" / "quality_ledger.db"


class RFIStatus(Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    RESPONDED = "responded"
    CLOSED = "closed"
    VOID = "void"


class WarrantyStatus(Enum):
    ACTIVE = "active"
    CLAIMED = "claimed"
    RESOLVED = "resolved"
    EXPIRED = "expired"


class InspectionResult(Enum):
    PASS = "pass"
    FAIL = "fail"
    CONDITIONAL = "conditional"
    PENDING = "pending"


@dataclass
class RFI:
    """Request for Information record."""
    id: str
    project_id: str
    number: str
    subject: str
    question: str
    submitted_by: str
    submitted_to: str
    status: RFIStatus
    created_at: str
    due_date: Optional[str] = None
    response: Optional[str] = None
    responded_by: Optional[str] = None
    responded_at: Optional[str] = None
    spec_section: Optional[str] = None
    drawing_reference: Optional[str] = None
    cost_impact: Optional[float] = None
    schedule_impact_days: Optional[int] = None


@dataclass
class WarrantyClaim:
    """Warranty claim record."""
    id: str
    project_id: str
    unit_id: str
    item_description: str
    claimed_by: str
    claim_date: str
    status: WarrantyStatus
    category: str
    priority: str
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None
    resolved_date: Optional[str] = None
    photos: list[str] = field(default_factory=list)


@dataclass
class PhotoInspection:
    """Photo inspection record with OCR data."""
    id: str
    project_id: str
    photo_url: str
    photo_hash: str
    inspection_type: str
    location: str
    captured_at: str
    captured_by: str
    ocr_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    result: InspectionResult = InspectionResult.PENDING
    notes: Optional[str] = None
    linked_rfi: Optional[str] = None


class QualityAuditor:
    """
    Dimension 3 Agent: Quality oversight, RFI management, and warranty tracking.
    Handles photo OCR processing and compliance documentation.
    """

    def __init__(self):
        self._init_database()

    def _init_database(self):
        """Initialize the SQLite quality ledger."""
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rfis (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                number TEXT NOT NULL,
                subject TEXT,
                question TEXT,
                submitted_by TEXT,
                submitted_to TEXT,
                status TEXT,
                created_at TEXT,
                due_date TEXT,
                response TEXT,
                responded_by TEXT,
                responded_at TEXT,
                spec_section TEXT,
                drawing_reference TEXT,
                cost_impact REAL,
                schedule_impact_days INTEGER
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS warranty_claims (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                unit_id TEXT,
                item_description TEXT,
                claimed_by TEXT,
                claim_date TEXT,
                status TEXT,
                category TEXT,
                priority TEXT,
                assigned_to TEXT,
                resolution TEXT,
                resolved_date TEXT,
                photos TEXT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS photo_inspections (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                photo_url TEXT,
                photo_hash TEXT,
                inspection_type TEXT,
                location TEXT,
                captured_at TEXT,
                captured_by TEXT,
                ocr_text TEXT,
                ocr_confidence REAL,
                result TEXT,
                notes TEXT,
                linked_rfi TEXT
            )
        """)

        conn.commit()
        conn.close()
        logger.info("Quality database initialized")

    def create_rfi(
        self,
        project_id: str,
        subject: str,
        question: str,
        submitted_by: str,
        submitted_to: str = "SHB Studio",
        spec_section: Optional[str] = None,
        drawing_reference: Optional[str] = None,
        due_days: int = 7
    ) -> dict:
        """Create a new RFI and return its details."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT COUNT(*) FROM rfis WHERE project_id = ?
        """, (project_id,))
        count = cursor.fetchone()[0]
        rfi_number = f"RFI-{count + 1:04d}"

        rfi_id = f"RFI-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        created_at = datetime.utcnow().isoformat()
        due_date = (datetime.utcnow() + __import__('datetime').timedelta(days=due_days)).isoformat()

        rfi = RFI(
            id=rfi_id,
            project_id=project_id,
            number=rfi_number,
            subject=subject,
            question=question,
            submitted_by=submitted_by,
            submitted_to=submitted_to,
            status=RFIStatus.SUBMITTED,
            created_at=created_at,
            due_date=due_date,
            spec_section=spec_section,
            drawing_reference=drawing_reference
        )

        cursor.execute("""
            INSERT INTO rfis
            (id, project_id, number, subject, question, submitted_by, submitted_to,
             status, created_at, due_date, spec_section, drawing_reference)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            rfi.id, rfi.project_id, rfi.number, rfi.subject, rfi.question,
            rfi.submitted_by, rfi.submitted_to, rfi.status.value, rfi.created_at,
            rfi.due_date, rfi.spec_section, rfi.drawing_reference
        ))

        conn.commit()
        conn.close()

        logger.info(f"Created RFI {rfi_number}: {subject}")

        return {
            "rfi_id": rfi_id,
            "rfi_number": rfi_number,
            "subject": subject,
            "submitted_to": submitted_to,
            "due_date": due_date,
            "status": "submitted",
            "message": f"RFI {rfi_number} submitted to {submitted_to}. Response due by {due_date[:10]}."
        }

    def respond_to_rfi(
        self,
        rfi_id: str,
        response: str,
        responded_by: str,
        cost_impact: Optional[float] = None,
        schedule_impact_days: Optional[int] = None
    ) -> dict:
        """Record a response to an RFI."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        responded_at = datetime.utcnow().isoformat()

        cursor.execute("""
            UPDATE rfis
            SET response = ?, responded_by = ?, responded_at = ?, status = ?,
                cost_impact = ?, schedule_impact_days = ?
            WHERE id = ?
        """, (
            response, responded_by, responded_at, RFIStatus.RESPONDED.value,
            cost_impact, schedule_impact_days, rfi_id
        ))

        if cursor.rowcount == 0:
            conn.close()
            return {"success": False, "error": "RFI not found"}

        conn.commit()
        conn.close()

        logger.info(f"RFI {rfi_id} responded by {responded_by}")

        return {
            "success": True,
            "rfi_id": rfi_id,
            "responded_by": responded_by,
            "cost_impact": cost_impact,
            "schedule_impact_days": schedule_impact_days,
            "status": "responded"
        }

    def create_warranty_claim(
        self,
        project_id: str,
        unit_id: str,
        item_description: str,
        claimed_by: str,
        category: str,
        priority: str = "medium",
        photos: Optional[list[str]] = None
    ) -> dict:
        """Create a new warranty claim."""
        claim_id = f"WAR-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        claim_date = datetime.utcnow().isoformat()

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO warranty_claims
            (id, project_id, unit_id, item_description, claimed_by, claim_date,
             status, category, priority, photos)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            claim_id, project_id, unit_id, item_description, claimed_by, claim_date,
            WarrantyStatus.CLAIMED.value, category, priority, json.dumps(photos or [])
        ))

        conn.commit()
        conn.close()

        logger.info(f"Created warranty claim {claim_id}: {item_description}")

        return {
            "claim_id": claim_id,
            "unit_id": unit_id,
            "category": category,
            "priority": priority,
            "status": "claimed",
            "message": f"Warranty claim {claim_id} created for {unit_id}. Category: {category}, Priority: {priority}."
        }

    def process_photo_inspection(
        self,
        project_id: str,
        photo_url: str,
        inspection_type: str,
        location: str,
        captured_by: str,
        ocr_text: Optional[str] = None,
        ocr_confidence: Optional[float] = None
    ) -> dict:
        """
        Process a photo inspection and extract OCR data.
        In production, this would integrate with a vision API.
        """
        photo_hash = hashlib.md5(photo_url.encode()).hexdigest()
        inspection_id = f"INSP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        captured_at = datetime.utcnow().isoformat()

        inspection = PhotoInspection(
            id=inspection_id,
            project_id=project_id,
            photo_url=photo_url,
            photo_hash=photo_hash,
            inspection_type=inspection_type,
            location=location,
            captured_at=captured_at,
            captured_by=captured_by,
            ocr_text=ocr_text,
            ocr_confidence=ocr_confidence
        )

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO photo_inspections
            (id, project_id, photo_url, photo_hash, inspection_type, location,
             captured_at, captured_by, ocr_text, ocr_confidence, result)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            inspection.id, inspection.project_id, inspection.photo_url,
            inspection.photo_hash, inspection.inspection_type, inspection.location,
            inspection.captured_at, inspection.captured_by, inspection.ocr_text,
            inspection.ocr_confidence, InspectionResult.PENDING.value
        ))

        conn.commit()
        conn.close()

        logger.info(f"Processed photo inspection {inspection_id}")

        extracted_data = {}
        if ocr_text:
            if "$" in ocr_text or "amount" in ocr_text.lower():
                extracted_data["possible_invoice"] = True
            if "rfi" in ocr_text.lower():
                extracted_data["possible_rfi_reference"] = True
            if any(word in ocr_text.lower() for word in ["warranty", "defect", "damage"]):
                extracted_data["possible_warranty_issue"] = True

        return {
            "inspection_id": inspection_id,
            "photo_hash": photo_hash,
            "inspection_type": inspection_type,
            "location": location,
            "ocr_extracted": bool(ocr_text),
            "ocr_confidence": ocr_confidence,
            "extracted_data": extracted_data,
            "status": "pending_review",
            "message": f"Photo inspection {inspection_id} processed. OCR {'extracted' if ocr_text else 'not available'}."
        }

    def get_open_rfis(self, project_id: str) -> list[dict]:
        """Get all open RFIs for a project."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, number, subject, submitted_to, status, due_date, created_at
            FROM rfis
            WHERE project_id = ? AND status NOT IN ('closed', 'void')
            ORDER BY created_at DESC
        """, (project_id,))

        rfis = [
            {
                "id": row[0],
                "number": row[1],
                "subject": row[2],
                "submitted_to": row[3],
                "status": row[4],
                "due_date": row[5],
                "created_at": row[6]
            }
            for row in cursor.fetchall()
        ]

        conn.close()
        return rfis

    def get_active_warranty_claims(self, project_id: str) -> list[dict]:
        """Get all active warranty claims for a project."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, unit_id, item_description, category, priority, status, claim_date
            FROM warranty_claims
            WHERE project_id = ? AND status IN ('active', 'claimed')
            ORDER BY
                CASE priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                END,
                claim_date DESC
        """, (project_id,))

        claims = [
            {
                "id": row[0],
                "unit_id": row[1],
                "item_description": row[2],
                "category": row[3],
                "priority": row[4],
                "status": row[5],
                "claim_date": row[6]
            }
            for row in cursor.fetchall()
        ]

        conn.close()
        return claims

    async def provide_dimension_feedback(self, query: str, plan: dict) -> dict:
        """
        Provide quality dimension feedback for the Dispatcher.
        """
        keywords = query.lower()

        feedback = {
            "dimension": "quality",
            "query_received": query,
            "analysis": {}
        }

        if "rfi" in keywords or "clarification" in keywords:
            feedback["analysis"]["rfi_check"] = "May require RFI submission to design team"
            feedback["analysis"]["rfi_routing"] = "RFIs route to SHB Studio for response"

        if "warranty" in keywords or "defect" in keywords:
            feedback["analysis"]["warranty_check"] = "Check warranty coverage and create claim if applicable"

        if "photo" in keywords or "inspection" in keywords:
            feedback["analysis"]["photo_handling"] = "Photos will be processed for OCR and logged"

        if "compliance" in keywords or "code" in keywords:
            feedback["analysis"]["compliance_note"] = "Verify against applicable building codes and specs"

        feedback["recommendations"] = [
            "Document any design clarifications via RFI",
            "Attach photos to warranty claims for faster resolution",
            "Use OCR extraction for invoice and document processing"
        ]

        return feedback


auditor = QualityAuditor()


async def quality_dimension_handler(query: str, plan: dict) -> dict:
    """Handler function for Dispatcher integration."""
    return await auditor.provide_dimension_feedback(query, plan)
