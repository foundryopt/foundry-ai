"""
Memory Router - Playbook Engine
Local script linking Obsidian markdown file parsing to agent actions.
Searches the Living Playbook for historical case matches and feeds
context to the Dispatcher.
"""

import os
import re
import json
import logging
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, field
from pathlib import Path
from difflib import SequenceMatcher

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OBSIDIAN_VAULT_PATH = Path.home() / "Documents" / "SHB_Master_Vault" / "04_The_Living_Playbook" / "Case_Chronicles"

FALLBACK_PLAYBOOK_PATH = Path(__file__).parent.parent.parent / "data" / "playbook_cache"


@dataclass
class PlaybookCase:
    """A historical case from the Living Playbook."""
    id: str
    title: str
    file_path: str
    issue: str
    solution: str
    keywords: list[str]
    category: str
    created_at: str
    last_accessed: Optional[str] = None
    access_count: int = 0
    related_cases: list[str] = field(default_factory=list)


@dataclass
class NewEdgeCase:
    """A new edge case detected for potential logging."""
    id: str
    description: str
    context: dict
    detected_at: str
    suggested_category: str
    requires_human_input: bool = True
    approved: bool = False
    logged_as: Optional[str] = None


class MemoryRouter:
    """
    Playbook engine that searches Obsidian vault for historical cases
    and manages new edge case detection and logging.
    """

    def __init__(self, vault_path: Optional[Path] = None):
        self.vault_path = vault_path or OBSIDIAN_VAULT_PATH
        self.fallback_path = FALLBACK_PLAYBOOK_PATH
        self.case_index: dict[str, PlaybookCase] = {}
        self.pending_edge_cases: dict[str, NewEdgeCase] = {}

        self._ensure_paths()
        self._build_index()

    def _ensure_paths(self):
        """Ensure playbook paths exist."""
        self.fallback_path.mkdir(parents=True, exist_ok=True)

        if not self.vault_path.exists():
            logger.warning(f"Obsidian vault not found at {self.vault_path}, using fallback")
            self.vault_path = self.fallback_path

    def _build_index(self):
        """Build an index of all playbook cases."""
        if not self.vault_path.exists():
            logger.warning("Playbook path does not exist")
            return

        for md_file in self.vault_path.glob("**/*.md"):
            try:
                case = self._parse_case_file(md_file)
                if case:
                    self.case_index[case.id] = case
            except Exception as e:
                logger.error(f"Failed to parse {md_file}: {e}")

        logger.info(f"Indexed {len(self.case_index)} playbook cases")

    def _parse_case_file(self, file_path: Path) -> Optional[PlaybookCase]:
        """Parse a markdown case file into a PlaybookCase."""
        content = file_path.read_text(encoding="utf-8")

        case_id = file_path.stem
        title = case_id.replace("_", " ").replace("-", " ").title()

        issue = ""
        solution = ""
        keywords = []
        category = "general"

        issue_match = re.search(r"##\s*Issue\s*\n(.*?)(?=\n##|\Z)", content, re.DOTALL | re.IGNORECASE)
        if issue_match:
            issue = issue_match.group(1).strip()

        solution_match = re.search(r"##\s*Solution\s*\n(.*?)(?=\n##|\Z)", content, re.DOTALL | re.IGNORECASE)
        if solution_match:
            solution = solution_match.group(1).strip()

        tags_match = re.search(r"tags:\s*\[(.*?)\]", content, re.IGNORECASE)
        if tags_match:
            keywords = [k.strip().strip('"\'') for k in tags_match.group(1).split(",")]

        category_match = re.search(r"category:\s*(\w+)", content, re.IGNORECASE)
        if category_match:
            category = category_match.group(1)

        title_match = re.search(r"#\s+(.+?)(?:\n|$)", content)
        if title_match:
            title = title_match.group(1).strip()

        if not issue and not solution:
            paragraphs = [p.strip() for p in content.split("\n\n") if p.strip() and not p.startswith("#")]
            if paragraphs:
                issue = paragraphs[0]
                if len(paragraphs) > 1:
                    solution = paragraphs[1]

        return PlaybookCase(
            id=case_id,
            title=title,
            file_path=str(file_path),
            issue=issue,
            solution=solution,
            keywords=keywords,
            category=category,
            created_at=datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
        )

    def search_cases(
        self,
        query: str,
        category: Optional[str] = None,
        min_similarity: float = 0.3,
        max_results: int = 5
    ) -> list[dict]:
        """
        Search the playbook for cases matching the query.
        Returns ranked matches with similarity scores.
        """
        query_lower = query.lower()
        query_words = set(query_lower.split())

        matches = []

        for case_id, case in self.case_index.items():
            if category and case.category.lower() != category.lower():
                continue

            keyword_score = len(query_words & set(kw.lower() for kw in case.keywords)) / max(len(query_words), 1)

            issue_similarity = SequenceMatcher(None, query_lower, case.issue.lower()).ratio()
            solution_similarity = SequenceMatcher(None, query_lower, case.solution.lower()).ratio()
            title_similarity = SequenceMatcher(None, query_lower, case.title.lower()).ratio()

            combined_score = (
                keyword_score * 0.4 +
                issue_similarity * 0.3 +
                title_similarity * 0.2 +
                solution_similarity * 0.1
            )

            if combined_score >= min_similarity:
                matches.append({
                    "case_id": case_id,
                    "title": case.title,
                    "category": case.category,
                    "issue_preview": case.issue[:200] + "..." if len(case.issue) > 200 else case.issue,
                    "solution_preview": case.solution[:200] + "..." if len(case.solution) > 200 else case.solution,
                    "similarity_score": round(combined_score, 3),
                    "keywords": case.keywords
                })

        matches.sort(key=lambda x: x["similarity_score"], reverse=True)
        return matches[:max_results]

    def get_case_context(self, case_id: str) -> Optional[dict]:
        """
        Get full context for a specific case to inject into Dispatcher.
        Updates access tracking.
        """
        case = self.case_index.get(case_id)
        if not case:
            return None

        case.last_accessed = datetime.utcnow().isoformat()
        case.access_count += 1

        return {
            "case_id": case.id,
            "title": case.title,
            "category": case.category,
            "issue": case.issue,
            "solution": case.solution,
            "keywords": case.keywords,
            "related_cases": case.related_cases,
            "historical_law": f"HISTORICAL PRECEDENT: {case.title}\n\nISSUE: {case.issue}\n\nSOLUTION: {case.solution}"
        }

    def detect_edge_case(
        self,
        description: str,
        context: dict,
        suggested_category: str = "general"
    ) -> dict:
        """
        Detect a potential new edge case that doesn't match existing playbook.
        Returns edge case details and generates approval button payload.
        """
        existing_matches = self.search_cases(description, max_results=3)

        if existing_matches and existing_matches[0]["similarity_score"] > 0.7:
            return {
                "is_new_edge_case": False,
                "matched_case": existing_matches[0],
                "message": "Matched existing playbook case with high confidence."
            }

        edge_case_id = f"EDGE-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        edge_case = NewEdgeCase(
            id=edge_case_id,
            description=description,
            context=context,
            detected_at=datetime.utcnow().isoformat(),
            suggested_category=suggested_category
        )

        self.pending_edge_cases[edge_case_id] = edge_case

        logger.info(f"Detected new edge case: {edge_case_id}")

        slack_button_payload = {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f":bulb: *New Edge Case Detected*\n\n{description[:500]}"
            }
        }

        approve_button = {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Approve & Log", "emoji": True},
                    "style": "primary",
                    "action_id": "approve_and_log",
                    "value": json.dumps({
                        "edge_case_id": edge_case_id,
                        "description": description[:200],
                        "category": suggested_category
                    })
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Dismiss", "emoji": True},
                    "action_id": "dismiss_edge_case",
                    "value": edge_case_id
                }
            ]
        }

        return {
            "is_new_edge_case": True,
            "edge_case_id": edge_case_id,
            "description": description,
            "suggested_category": suggested_category,
            "similar_cases": existing_matches,
            "slack_blocks": [slack_button_payload, approve_button],
            "message": "New edge case detected. Approval required to log to playbook."
        }

    def approve_edge_case(
        self,
        edge_case_id: str,
        approved_by: str,
        final_issue: Optional[str] = None,
        final_solution: Optional[str] = None,
        keywords: Optional[list[str]] = None
    ) -> dict:
        """
        Approve and log a new edge case to the playbook.
        Creates a new markdown file in the vault.
        """
        edge_case = self.pending_edge_cases.get(edge_case_id)
        if not edge_case:
            return {"success": False, "error": "Edge case not found"}

        case_title = final_issue[:50] if final_issue else edge_case.description[:50]
        safe_title = re.sub(r"[^\w\s-]", "", case_title).replace(" ", "_")
        filename = f"{safe_title}_{datetime.utcnow().strftime('%Y%m%d')}.md"

        file_path = self.vault_path / edge_case.suggested_category / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)

        keywords_list = keywords or []
        keywords_str = ", ".join(f'"{k}"' for k in keywords_list)

        content = f"""---
category: {edge_case.suggested_category}
tags: [{keywords_str}]
created: {datetime.utcnow().isoformat()}
approved_by: {approved_by}
---

# {case_title}

## Issue
{final_issue or edge_case.description}

## Solution
{final_solution or "Solution pending documentation."}

## Context
{json.dumps(edge_case.context, indent=2)}

## Source
- Edge Case ID: {edge_case_id}
- Detected: {edge_case.detected_at}
- Approved: {datetime.utcnow().isoformat()}
- Approved By: {approved_by}
"""

        file_path.write_text(content, encoding="utf-8")

        new_case = PlaybookCase(
            id=safe_title,
            title=case_title,
            file_path=str(file_path),
            issue=final_issue or edge_case.description,
            solution=final_solution or "",
            keywords=keywords_list,
            category=edge_case.suggested_category,
            created_at=datetime.utcnow().isoformat()
        )
        self.case_index[new_case.id] = new_case

        edge_case.approved = True
        edge_case.logged_as = new_case.id
        del self.pending_edge_cases[edge_case_id]

        logger.info(f"Logged edge case {edge_case_id} as {new_case.id}")

        return {
            "success": True,
            "case_id": new_case.id,
            "file_path": str(file_path),
            "message": f"Edge case logged to playbook as '{case_title}'."
        }

    def inject_context_for_dispatcher(self, query: str) -> dict:
        """
        Main entry point for Dispatcher integration.
        Searches for relevant cases and returns context to inject.
        """
        matches = self.search_cases(query, max_results=3)

        if not matches:
            return {
                "has_historical_context": False,
                "message": "No matching playbook cases found.",
                "suggest_edge_case_check": True
            }

        top_match = matches[0]
        full_context = self.get_case_context(top_match["case_id"])

        return {
            "has_historical_context": True,
            "top_match": full_context,
            "additional_matches": matches[1:],
            "inject_prompt": full_context["historical_law"] if full_context else None,
            "message": f"Found {len(matches)} relevant playbook case(s)."
        }


router = MemoryRouter()


def search_playbook(query: str, category: Optional[str] = None) -> list[dict]:
    """Convenience function for playbook search."""
    return router.search_cases(query, category=category)


def get_dispatcher_context(query: str) -> dict:
    """Get context injection for the Dispatcher."""
    return router.inject_context_for_dispatcher(query)


def log_new_case(
    description: str,
    context: dict,
    category: str = "general"
) -> dict:
    """Detect and prepare a new edge case for logging."""
    return router.detect_edge_case(description, context, category)
