"""
Timeline Manager Agent - Dimension 2
Schedule tracking and critical path dependency monitor.
Monitors time variances and enforces threshold guardrails.
"""

import os
import json
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass, field
from pathlib import Path
from enum import Enum

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CONFIG_PATH = Path(__file__).parent.parent / "config" / "threshold_guardrails.json"
DB_PATH = Path(__file__).parent.parent.parent / "data" / "variance_ledger.db"


class TaskPriority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class DependencyType(Enum):
    FINISH_TO_START = "FS"  # Predecessor must finish before successor starts
    START_TO_START = "SS"  # Both start together
    FINISH_TO_FINISH = "FF"  # Both finish together
    START_TO_FINISH = "SF"  # Predecessor starts before successor finishes


@dataclass
class ScheduleTask:
    """A scheduled task with dependencies."""
    id: str
    name: str
    project_id: str
    planned_start: datetime
    planned_end: datetime
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    dependencies: list[str] = field(default_factory=list)
    priority: TaskPriority = TaskPriority.MEDIUM
    is_critical_path: bool = False
    percent_complete: float = 0.0
    assigned_entity: Optional[str] = None


@dataclass
class TimeVariance:
    """A time variance record."""
    id: str
    task_id: str
    project_id: str
    description: str
    planned_hours: float
    actual_hours: float
    variance_hours: float
    action_taken: str
    created_at: str
    impacts_critical_path: bool = False


class TimelineManager:
    """
    Dimension 2 Agent: Schedule oversight and critical path monitoring.
    Enforces threshold guardrails for silent logging vs active alerts.
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
                "time_variance": {
                    "silent_threshold_hours": 4,
                    "action_below_threshold": "silent_log",
                    "action_above_threshold": "slack_alert"
                }
            }

    def _init_database(self):
        """Initialize the SQLite variance ledger."""
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS time_variances (
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                project_id TEXT NOT NULL,
                description TEXT,
                planned_hours REAL,
                actual_hours REAL,
                variance_hours REAL,
                action_taken TEXT,
                impacts_critical_path INTEGER,
                created_at TEXT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS schedule_tasks (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                project_id TEXT NOT NULL,
                planned_start TEXT,
                planned_end TEXT,
                actual_start TEXT,
                actual_end TEXT,
                dependencies TEXT,
                priority TEXT,
                is_critical_path INTEGER,
                percent_complete REAL,
                assigned_entity TEXT
            )
        """)

        conn.commit()
        conn.close()
        logger.info("Timeline database initialized")

    @property
    def silent_threshold(self) -> float:
        """Get the silent logging threshold in hours."""
        return float(
            self.guardrails.get("time_variance", {}).get("silent_threshold_hours", 4)
        )

    def assess_variance(
        self,
        task_id: str,
        project_id: str,
        description: str,
        planned_hours: float,
        actual_hours: float,
        impacts_critical_path: bool = False
    ) -> dict:
        """
        Assess a time variance and determine required action.
        Returns action recommendation and logging result.
        """
        variance = actual_hours - planned_hours
        abs_variance = abs(variance)

        if abs_variance <= self.silent_threshold and not impacts_critical_path:
            action = "silent_log"
            requires_alert = False
            status = "logged_silently"
        else:
            action = "slack_alert"
            requires_alert = True
            status = "alert_sent"

        variance_id = f"TVAR-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        record = TimeVariance(
            id=variance_id,
            task_id=task_id,
            project_id=project_id,
            description=description,
            planned_hours=planned_hours,
            actual_hours=actual_hours,
            variance_hours=variance,
            action_taken=action,
            impacts_critical_path=impacts_critical_path,
            created_at=datetime.utcnow().isoformat()
        )

        self._log_variance(record)

        return {
            "variance_id": variance_id,
            "variance_hours": variance,
            "action": action,
            "requires_alert": requires_alert,
            "status": status,
            "threshold": self.silent_threshold,
            "impacts_critical_path": impacts_critical_path,
            "message": self._generate_message(action, variance, description, impacts_critical_path)
        }

    def _log_variance(self, variance: TimeVariance):
        """Log a variance to the SQLite ledger."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO time_variances
            (id, task_id, project_id, description, planned_hours, actual_hours,
             variance_hours, action_taken, impacts_critical_path, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            variance.id, variance.task_id, variance.project_id, variance.description,
            variance.planned_hours, variance.actual_hours, variance.variance_hours,
            variance.action_taken, 1 if variance.impacts_critical_path else 0,
            variance.created_at
        ))

        conn.commit()
        conn.close()
        logger.info(f"Logged time variance {variance.id}: {variance.variance_hours}h")

    def _generate_message(
        self,
        action: str,
        variance: float,
        description: str,
        impacts_critical_path: bool
    ) -> str:
        """Generate a human-readable message for the variance action."""
        direction = "over" if variance > 0 else "under"

        if action == "silent_log":
            return (
                f"Time variance of {abs(variance):.1f}h ({direction}) for '{description}' "
                f"is within silent threshold ({self.silent_threshold}h). Logged to ledger."
            )
        else:
            critical_note = " CRITICAL PATH IMPACT." if impacts_critical_path else ""
            return (
                f"ALERT: Time variance of {abs(variance):.1f}h ({direction}) for '{description}' "
                f"exceeds threshold ({self.silent_threshold}h).{critical_note} "
                f"Slack alert sent to #schedule-alerts."
            )

    def calculate_critical_path(self, project_id: str) -> list[str]:
        """
        Calculate the critical path for a project.
        Returns list of task IDs on the critical path.
        """
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, name, planned_start, planned_end, dependencies
            FROM schedule_tasks
            WHERE project_id = ?
            ORDER BY planned_start
        """, (project_id,))

        tasks = {}
        for row in cursor.fetchall():
            deps = json.loads(row[4]) if row[4] else []
            tasks[row[0]] = {
                "name": row[1],
                "start": datetime.fromisoformat(row[2]) if row[2] else None,
                "end": datetime.fromisoformat(row[3]) if row[3] else None,
                "dependencies": deps,
                "duration": 0,
                "early_start": None,
                "early_finish": None,
                "late_start": None,
                "late_finish": None,
                "float": 0
            }
            if tasks[row[0]]["start"] and tasks[row[0]]["end"]:
                tasks[row[0]]["duration"] = (tasks[row[0]]["end"] - tasks[row[0]]["start"]).days

        conn.close()

        if not tasks:
            return []

        for task_id, task in tasks.items():
            if not task["dependencies"]:
                task["early_start"] = task["start"]
            else:
                max_finish = max(
                    tasks[dep]["early_finish"] or tasks[dep]["end"]
                    for dep in task["dependencies"]
                    if dep in tasks
                )
                task["early_start"] = max_finish

            if task["early_start"]:
                task["early_finish"] = task["early_start"] + timedelta(days=task["duration"])

        project_end = max(
            (t["early_finish"] for t in tasks.values() if t["early_finish"]),
            default=None
        )

        for task_id in reversed(list(tasks.keys())):
            task = tasks[task_id]
            successors = [
                tid for tid, t in tasks.items()
                if task_id in t["dependencies"]
            ]

            if not successors:
                task["late_finish"] = project_end
            else:
                task["late_finish"] = min(
                    tasks[s]["late_start"] or tasks[s]["start"]
                    for s in successors
                )

            if task["late_finish"]:
                task["late_start"] = task["late_finish"] - timedelta(days=task["duration"])

            if task["early_start"] and task["late_start"]:
                task["float"] = (task["late_start"] - task["early_start"]).days

        critical_path = [
            task_id for task_id, task in tasks.items()
            if task["float"] == 0
        ]

        return critical_path

    def get_schedule_health(self, project_id: str) -> dict:
        """Get overall schedule health metrics for a project."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT COUNT(*),
                   AVG(percent_complete),
                   SUM(CASE WHEN is_critical_path = 1 THEN 1 ELSE 0 END)
            FROM schedule_tasks
            WHERE project_id = ?
        """, (project_id,))

        row = cursor.fetchone()
        total_tasks = row[0] or 0
        avg_completion = row[1] or 0
        critical_tasks = row[2] or 0

        cursor.execute("""
            SELECT COUNT(*), AVG(variance_hours)
            FROM time_variances
            WHERE project_id = ? AND variance_hours > 0
        """, (project_id,))

        row = cursor.fetchone()
        variance_count = row[0] or 0
        avg_variance = row[1] or 0

        conn.close()

        health_score = 100
        if avg_variance > self.silent_threshold:
            health_score -= 20
        if variance_count > total_tasks * 0.3:
            health_score -= 15
        if avg_completion < 50:
            health_score -= 10

        return {
            "project_id": project_id,
            "health_score": max(0, health_score),
            "total_tasks": total_tasks,
            "critical_path_tasks": critical_tasks,
            "average_completion": round(avg_completion, 1),
            "variance_count": variance_count,
            "average_variance_hours": round(avg_variance, 1),
            "status": "healthy" if health_score >= 70 else "at_risk" if health_score >= 50 else "critical"
        }

    async def provide_dimension_feedback(self, query: str, plan: dict) -> dict:
        """
        Provide timeline dimension feedback for the Dispatcher.
        This is called by the Dispatcher when coordinating across dimensions.
        """
        keywords = query.lower()

        feedback = {
            "dimension": "timeline",
            "query_received": query,
            "analysis": {}
        }

        if "schedule" in keywords or "timeline" in keywords:
            feedback["analysis"]["schedule_check"] = "Requires schedule impact assessment"
            feedback["analysis"]["threshold_reminder"] = f"Alert threshold: {self.silent_threshold} hours"

        if "critical" in keywords or "path" in keywords:
            feedback["analysis"]["critical_path_note"] = "Any critical path impacts trigger immediate alerts"

        if "delay" in keywords or "late" in keywords:
            feedback["analysis"]["delay_handling"] = "Log variance and assess downstream impacts"

        feedback["recommendations"] = [
            "Run assess_variance() for any schedule changes",
            "Check critical path before approving timeline changes",
            "Variances over 4 hours require Slack notification"
        ]

        return feedback


manager = TimelineManager()


async def timeline_dimension_handler(query: str, plan: dict) -> dict:
    """Handler function for Dispatcher integration."""
    return await manager.provide_dimension_feedback(query, plan)
