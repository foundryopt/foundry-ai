"""
Dispatcher Agent - Primary Scrum Master / Subtask Decomposer
Uses Chain-of-Thought (CoT) to decompose requests into independent subtasks
with dependency chains, then queries dimension agents for feedback.
"""

import os
import json
import logging
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, field, asdict
from enum import Enum

import google.generativeai as genai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    AWAITING_FEEDBACK = "awaiting_feedback"
    COMPLETE = "complete"


class DimensionType(Enum):
    FINANCIAL = "financial"
    TIMELINE = "timeline"
    QUALITY = "quality"
    RELATIONSHIP = "relationship"


@dataclass
class Subtask:
    """A decomposed subtask with dependencies."""
    id: str
    title: str
    description: str
    dependencies: list[str] = field(default_factory=list)
    assigned_dimension: Optional[DimensionType] = None
    status: TaskStatus = TaskStatus.PENDING
    feedback: dict = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class DecomposedPlan:
    """A fully decomposed plan with subtasks and dependency graph."""
    request_id: str
    original_request: str
    subtasks: list[Subtask]
    dependency_graph: dict[str, list[str]]
    dimension_feedback: dict[str, dict]
    status: str = "draft"
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


DISPATCHER_SYSTEM_INSTRUCTION = """You are the Foundry AI Dispatcher - a Scrum Master and Task Decomposer for a vertically integrated real estate development operation.

## Your Core Directive
NEVER solve a request linearly. Always use Chain-of-Thought (CoT) reasoning to decompose incoming requests into independent subtasks with strict dependency chains.

## Decomposition Protocol
For every incoming request:
1. ANALYZE: Identify the core intent and all implicit requirements
2. DECOMPOSE: Break into the smallest independent subtasks possible
3. DEPENDENCY MAP: Identify which tasks must complete before others can start
4. DIMENSION ASSIGNMENT: Route each subtask to the appropriate dimension agent:
   - FINANCIAL: Cost impacts, budget variances, proforma effects
   - TIMELINE: Schedule impacts, critical path dependencies
   - QUALITY: Compliance, documentation, warranty implications
   - RELATIONSHIP: Stakeholder communication, approval chains

## Output Format
Always return a structured JSON with:
{
  "analysis": {
    "core_intent": "...",
    "implicit_requirements": ["..."],
    "risk_factors": ["..."]
  },
  "subtasks": [
    {
      "id": "T001",
      "title": "...",
      "description": "...",
      "dependencies": [],
      "assigned_dimension": "FINANCIAL|TIMELINE|QUALITY|RELATIONSHIP",
      "estimated_effort": "hours",
      "blocking_risks": ["..."]
    }
  ],
  "dependency_graph": {
    "T001": [],
    "T002": ["T001"],
    "T003": ["T001", "T002"]
  },
  "critical_path": ["T001", "T002", "T003"],
  "dimension_queries": {
    "FINANCIAL": "What is the budget impact of...?",
    "TIMELINE": "Does this affect the critical path...?",
    "QUALITY": "Are there compliance requirements...?",
    "RELATIONSHIP": "Who needs to be notified...?"
  }
}

## Entity Context
You coordinate across 6 vertical entities:
- SHB Group: Development, Property Management, Executive Decisions
- SHB Studio: Design, RFIs, Architectural Documentation
- Simple Home Builders: Construction, Build Execution, Warranties
- Builiq Inc: Wholesale, Imports, Procurement
- Foundry Rooms: Venue, Showroom, Retail Experience
- Foundry Fund: Finance, Investment Pools, Investor Relations

## Human Gates
Remember: AI drafts, humans decide. Every plan must identify:
- Draft gates (what needs human review)
- Approval gates (what needs sign-off)
- Log gates (what gets recorded after approval)
"""


class Dispatcher:
    """Central orchestrator for task decomposition and dimension coordination."""

    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            system_instruction=DISPATCHER_SYSTEM_INSTRUCTION
        ) if GEMINI_API_KEY else None
        self.plans: dict[str, DecomposedPlan] = {}
        self.dimension_agents: dict[DimensionType, callable] = {}

    def register_dimension_agent(self, dimension: DimensionType, agent: callable):
        """Register a dimension agent for feedback queries."""
        self.dimension_agents[dimension] = agent
        logger.info(f"Registered {dimension.value} dimension agent")

    async def decompose_request(self, request: str, context: Optional[dict] = None) -> DecomposedPlan:
        """
        Decompose an incoming request using CoT reasoning.
        Returns a structured plan with subtasks and dependencies.
        """
        request_id = f"REQ-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        prompt = f"""
## Incoming Request
{request}

## Additional Context
{json.dumps(context or {}, indent=2)}

## Instructions
Decompose this request following the CoT protocol. Return ONLY valid JSON.
"""

        if self.model:
            response = self.model.generate_content(prompt)
            try:
                result = json.loads(response.text)
            except json.JSONDecodeError:
                start = response.text.find('{')
                end = response.text.rfind('}') + 1
                if start != -1 and end > start:
                    result = json.loads(response.text[start:end])
                else:
                    raise ValueError("Could not parse Gemini response as JSON")
        else:
            result = self._fallback_decomposition(request)

        subtasks = [
            Subtask(
                id=st["id"],
                title=st["title"],
                description=st["description"],
                dependencies=st.get("dependencies", []),
                assigned_dimension=DimensionType(st["assigned_dimension"].lower()) if st.get("assigned_dimension") else None
            )
            for st in result.get("subtasks", [])
        ]

        plan = DecomposedPlan(
            request_id=request_id,
            original_request=request,
            subtasks=subtasks,
            dependency_graph=result.get("dependency_graph", {}),
            dimension_feedback={}
        )

        self.plans[request_id] = plan

        await self._query_dimensions(plan, result.get("dimension_queries", {}))

        return plan

    async def _query_dimensions(self, plan: DecomposedPlan, queries: dict[str, str]):
        """Query each dimension agent for feedback on the plan."""
        for dimension_name, query in queries.items():
            try:
                dimension = DimensionType(dimension_name.lower())
                if dimension in self.dimension_agents:
                    agent = self.dimension_agents[dimension]
                    feedback = await agent(query, plan)
                    plan.dimension_feedback[dimension.value] = feedback
                    logger.info(f"Received {dimension.value} feedback")
            except (ValueError, KeyError) as e:
                logger.warning(f"Could not query dimension {dimension_name}: {e}")

    def _fallback_decomposition(self, request: str) -> dict:
        """Fallback decomposition when Gemini is not available."""
        return {
            "analysis": {
                "core_intent": f"Process request: {request[:100]}...",
                "implicit_requirements": ["Review required", "Human approval needed"],
                "risk_factors": ["Manual decomposition - verify subtasks"]
            },
            "subtasks": [
                {
                    "id": "T001",
                    "title": "Review incoming request",
                    "description": f"Analyze and categorize: {request[:200]}",
                    "dependencies": [],
                    "assigned_dimension": "QUALITY",
                    "estimated_effort": "1 hour"
                },
                {
                    "id": "T002",
                    "title": "Assess financial impact",
                    "description": "Evaluate budget and cost implications",
                    "dependencies": ["T001"],
                    "assigned_dimension": "FINANCIAL",
                    "estimated_effort": "2 hours"
                },
                {
                    "id": "T003",
                    "title": "Check timeline impact",
                    "description": "Verify schedule and dependencies",
                    "dependencies": ["T001"],
                    "assigned_dimension": "TIMELINE",
                    "estimated_effort": "1 hour"
                },
                {
                    "id": "T004",
                    "title": "Notify stakeholders",
                    "description": "Communicate with relevant parties",
                    "dependencies": ["T002", "T003"],
                    "assigned_dimension": "RELATIONSHIP",
                    "estimated_effort": "30 minutes"
                }
            ],
            "dependency_graph": {
                "T001": [],
                "T002": ["T001"],
                "T003": ["T001"],
                "T004": ["T002", "T003"]
            },
            "critical_path": ["T001", "T002", "T004"],
            "dimension_queries": {
                "FINANCIAL": "What is the estimated budget impact?",
                "TIMELINE": "Does this affect the current schedule?",
                "QUALITY": "Are there compliance requirements?",
                "RELATIONSHIP": "Who needs to approve this?"
            }
        }

    def export_plan_to_markdown(self, plan: DecomposedPlan) -> str:
        """Export the decomposed plan to markdown format for logging."""
        md = f"""# Decomposed Plan: {plan.request_id}

**Created:** {plan.created_at}
**Status:** {plan.status}

## Original Request
{plan.original_request}

## Subtasks

| ID | Title | Dependencies | Dimension | Status |
|----|-------|--------------|-----------|--------|
"""
        for st in plan.subtasks:
            deps = ", ".join(st.dependencies) if st.dependencies else "None"
            dim = st.assigned_dimension.value if st.assigned_dimension else "Unassigned"
            md += f"| {st.id} | {st.title} | {deps} | {dim} | {st.status.value} |\n"

        md += "\n## Dependency Graph\n```mermaid\ngraph TD\n"
        for task_id, deps in plan.dependency_graph.items():
            if deps:
                for dep in deps:
                    md += f"    {dep} --> {task_id}\n"
            else:
                md += f"    {task_id}\n"
        md += "```\n"

        if plan.dimension_feedback:
            md += "\n## Dimension Feedback\n"
            for dim, feedback in plan.dimension_feedback.items():
                md += f"\n### {dim.title()}\n"
                md += f"{json.dumps(feedback, indent=2)}\n"

        return md

    def get_ready_tasks(self, plan: DecomposedPlan) -> list[Subtask]:
        """Get tasks that are ready to execute (all dependencies complete)."""
        completed_ids = {st.id for st in plan.subtasks if st.status == TaskStatus.COMPLETE}

        ready = []
        for st in plan.subtasks:
            if st.status != TaskStatus.PENDING:
                continue
            if all(dep in completed_ids for dep in st.dependencies):
                ready.append(st)

        return ready

    def mark_task_complete(self, plan: DecomposedPlan, task_id: str):
        """Mark a task as complete and check for newly unblocked tasks."""
        for st in plan.subtasks:
            if st.id == task_id:
                st.status = TaskStatus.COMPLETE
                logger.info(f"Task {task_id} marked complete")
                break

        all_complete = all(st.status == TaskStatus.COMPLETE for st in plan.subtasks)
        if all_complete:
            plan.status = "complete"
            logger.info(f"Plan {plan.request_id} complete")


dispatcher = Dispatcher()


async def process_incoming_request(request: str, context: Optional[dict] = None) -> dict:
    """
    Main entry point for processing incoming requests.
    Returns the decomposed plan as a dictionary.
    """
    plan = await dispatcher.decompose_request(request, context)

    markdown = dispatcher.export_plan_to_markdown(plan)
    logger.info(f"Generated plan markdown:\n{markdown[:500]}...")

    return {
        "request_id": plan.request_id,
        "status": plan.status,
        "subtasks": [asdict(st) for st in plan.subtasks],
        "dependency_graph": plan.dependency_graph,
        "dimension_feedback": plan.dimension_feedback,
        "ready_tasks": [asdict(st) for st in dispatcher.get_ready_tasks(plan)],
        "markdown": markdown
    }
