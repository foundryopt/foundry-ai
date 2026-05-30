"""
Financial Guardian Agent - Dimension 1
Proforma carry-cost and hard-cost auditor.
Monitors budget variances and enforces threshold guardrails.
"""

import os
import json
import sqlite3
import logging
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, asdict
from decimal import Decimal
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CONFIG_PATH = Path(__file__).parent.parent / "config" / "threshold_guardrails.json"
DB_PATH = Path(__file__).parent.parent.parent / "data" / "variance_ledger.db"


@dataclass
class BudgetVariance:
    """A budget variance record."""
    id: str
    project_id: str
    category: str
    description: str
    original_amount: Decimal
    adjusted_amount: Decimal
    variance_amount: Decimal
    variance_type: str  # "overrun" or "savings"
    action_taken: str  # "auto_contingency" or "manual_lock"
    created_at: str
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None


@dataclass
class ProformaAudit:
    """A proforma audit result."""
    project_id: str
    audit_date: str
    carry_cost_monthly: Decimal
    hard_costs_to_date: Decimal
    hard_costs_remaining: Decimal
    contingency_balance: Decimal
    contingency_utilization_pct: float
    at_risk_items: list[dict]
    recommendations: list[str]


class FinancialGuardian:
    """
    Dimension 1 Agent: Financial oversight and budget variance management.
    Enforces threshold guardrails for auto-contingency vs manual approval.
    """

    def __init__(self):
        self.guardrails = self._load_guardrails()
        self._init_database()

    def _load_guardrails(self) -> dict:
        """Load threshold guardrails from config."""
        try:
            with open(CONFIG_PATH) as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning("Guardrails config not found, using defaults")
            return {
                "budget_variance": {
                    "auto_contingency_threshold_usd": 500,
                    "action_below_threshold": "auto_contingency_draw",
                    "action_above_threshold": "manual_approval_lock"
                }
            }

    def _init_database(self):
        """Initialize the SQLite variance ledger."""
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS budget_variances (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                category TEXT,
                description TEXT,
                original_amount REAL,
                adjusted_amount REAL,
                variance_amount REAL,
                variance_type TEXT,
                action_taken TEXT,
                created_at TEXT,
                approved_by TEXT,
                approved_at TEXT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contingency_draws (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                variance_id TEXT,
                amount REAL,
                reason TEXT,
                auto_approved INTEGER,
                created_at TEXT,
                FOREIGN KEY (variance_id) REFERENCES budget_variances(id)
            )
        """)

        conn.commit()
        conn.close()
        logger.info("Financial database initialized")

    @property
    def auto_threshold(self) -> Decimal:
        """Get the auto-contingency threshold."""
        return Decimal(str(
            self.guardrails.get("budget_variance", {}).get("auto_contingency_threshold_usd", 500)
        ))

    def assess_variance(
        self,
        project_id: str,
        category: str,
        description: str,
        original_amount: Decimal,
        adjusted_amount: Decimal
    ) -> dict:
        """
        Assess a budget variance and determine required action.
        Returns action recommendation and logging result.
        """
        variance = adjusted_amount - original_amount
        variance_type = "overrun" if variance > 0 else "savings"
        abs_variance = abs(variance)

        if abs_variance <= self.auto_threshold:
            action = "auto_contingency_draw"
            requires_approval = False
            status = "auto_approved"
        else:
            action = "manual_approval_lock"
            requires_approval = True
            status = "pending_approval"

        variance_id = f"VAR-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        record = BudgetVariance(
            id=variance_id,
            project_id=project_id,
            category=category,
            description=description,
            original_amount=original_amount,
            adjusted_amount=adjusted_amount,
            variance_amount=variance,
            variance_type=variance_type,
            action_taken=action,
            created_at=datetime.utcnow().isoformat()
        )

        self._log_variance(record)

        if action == "auto_contingency_draw" and variance_type == "overrun":
            self._draw_contingency(project_id, variance_id, abs_variance, description)

        return {
            "variance_id": variance_id,
            "variance_amount": float(variance),
            "variance_type": variance_type,
            "action": action,
            "requires_approval": requires_approval,
            "status": status,
            "threshold": float(self.auto_threshold),
            "message": self._generate_message(action, abs_variance, category)
        }

    def _log_variance(self, variance: BudgetVariance):
        """Log a variance to the SQLite ledger."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO budget_variances
            (id, project_id, category, description, original_amount, adjusted_amount,
             variance_amount, variance_type, action_taken, created_at, approved_by, approved_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            variance.id, variance.project_id, variance.category, variance.description,
            float(variance.original_amount), float(variance.adjusted_amount),
            float(variance.variance_amount), variance.variance_type, variance.action_taken,
            variance.created_at, variance.approved_by, variance.approved_at
        ))

        conn.commit()
        conn.close()
        logger.info(f"Logged variance {variance.id}: {variance.variance_amount}")

    def _draw_contingency(
        self,
        project_id: str,
        variance_id: str,
        amount: Decimal,
        reason: str
    ):
        """Record an automatic contingency draw."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        draw_id = f"DRAW-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        cursor.execute("""
            INSERT INTO contingency_draws
            (id, project_id, variance_id, amount, reason, auto_approved, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            draw_id, project_id, variance_id, float(amount), reason, 1,
            datetime.utcnow().isoformat()
        ))

        conn.commit()
        conn.close()
        logger.info(f"Auto-drew contingency {draw_id}: ${amount}")

    def _generate_message(self, action: str, amount: Decimal, category: str) -> str:
        """Generate a human-readable message for the variance action."""
        if action == "auto_contingency_draw":
            return (
                f"Budget variance of ${amount:.2f} in {category} is within auto-approval "
                f"threshold (${self.auto_threshold:.2f}). Contingency draw recorded automatically."
            )
        else:
            return (
                f"Budget variance of ${amount:.2f} in {category} exceeds auto-approval "
                f"threshold (${self.auto_threshold:.2f}). Thread locked for manual approval. "
                f"Required approvers: SHB Group or Foundry Fund."
            )

    def approve_variance(self, variance_id: str, approved_by: str) -> dict:
        """Manually approve a variance that exceeded the threshold."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        approved_at = datetime.utcnow().isoformat()

        cursor.execute("""
            UPDATE budget_variances
            SET approved_by = ?, approved_at = ?, action_taken = 'manual_approved'
            WHERE id = ? AND action_taken = 'manual_approval_lock'
        """, (approved_by, approved_at, variance_id))

        if cursor.rowcount == 0:
            conn.close()
            return {"success": False, "error": "Variance not found or already approved"}

        conn.commit()
        conn.close()

        logger.info(f"Variance {variance_id} approved by {approved_by}")
        return {
            "success": True,
            "variance_id": variance_id,
            "approved_by": approved_by,
            "approved_at": approved_at
        }

    def audit_proforma(
        self,
        project_id: str,
        carry_cost_monthly: Decimal,
        hard_costs_to_date: Decimal,
        hard_costs_remaining: Decimal,
        total_contingency: Decimal
    ) -> ProformaAudit:
        """
        Audit a project's proforma and identify risks.
        """
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT SUM(amount) FROM contingency_draws
            WHERE project_id = ?
        """, (project_id,))

        result = cursor.fetchone()
        contingency_used = Decimal(str(result[0] or 0))
        contingency_balance = total_contingency - contingency_used

        cursor.execute("""
            SELECT category, SUM(variance_amount) as total_variance
            FROM budget_variances
            WHERE project_id = ? AND variance_type = 'overrun'
            GROUP BY category
            ORDER BY total_variance DESC
            LIMIT 5
        """, (project_id,))

        at_risk = [
            {"category": row[0], "total_variance": float(row[1])}
            for row in cursor.fetchall()
        ]

        conn.close()

        utilization = (float(contingency_used) / float(total_contingency) * 100) if total_contingency > 0 else 0

        recommendations = []
        if utilization > 75:
            recommendations.append("CRITICAL: Contingency utilization above 75%. Request additional contingency or value engineering review.")
        if utilization > 50:
            recommendations.append("WARNING: Contingency utilization above 50%. Increase variance monitoring frequency.")
        if at_risk:
            top_category = at_risk[0]["category"]
            recommendations.append(f"Focus cost control efforts on {top_category} - highest variance category.")

        return ProformaAudit(
            project_id=project_id,
            audit_date=datetime.utcnow().isoformat(),
            carry_cost_monthly=carry_cost_monthly,
            hard_costs_to_date=hard_costs_to_date,
            hard_costs_remaining=hard_costs_remaining,
            contingency_balance=contingency_balance,
            contingency_utilization_pct=utilization,
            at_risk_items=at_risk,
            recommendations=recommendations
        )

    async def provide_dimension_feedback(self, query: str, plan: dict) -> dict:
        """
        Provide financial dimension feedback for the Dispatcher.
        This is called by the Dispatcher when coordinating across dimensions.
        """
        keywords = query.lower()

        feedback = {
            "dimension": "financial",
            "query_received": query,
            "analysis": {}
        }

        if "budget" in keywords or "cost" in keywords:
            feedback["analysis"]["budget_check"] = "Requires budget variance assessment"
            feedback["analysis"]["threshold_reminder"] = f"Auto-approval threshold: ${self.auto_threshold}"

        if "contingency" in keywords:
            feedback["analysis"]["contingency_note"] = "Check contingency balance before proceeding"

        if "approval" in keywords:
            feedback["analysis"]["approval_path"] = "Variances over $500 require SHB Group or Foundry Fund sign-off"

        feedback["recommendations"] = [
            "Run assess_variance() for any cost changes",
            "Verify contingency balance if drawing funds",
            "Log all financial decisions to Drive Sheets after approval"
        ]

        return feedback


guardian = FinancialGuardian()


async def financial_dimension_handler(query: str, plan: dict) -> dict:
    """Handler function for Dispatcher integration."""
    return await guardian.provide_dimension_feedback(query, plan)
