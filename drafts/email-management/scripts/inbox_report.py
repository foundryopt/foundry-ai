"""
Multi-Account Inbox Report Generator

Produces a formatted Slack report matrix showing email status across all managed accounts.
Used by the daily-inbox-report cron and on-demand requests.

This script provides the report DATA and FORMATTING functions.
The actual Gmail API calls are made by the cron agent using SDK functions.
"""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class AccountReport:
    """Report for a single email account."""
    account: str
    email: str
    total_unread: int = 0
    action_required: int = 0
    flagged_important: int = 0
    fyi: int = 0
    promos_archived: int = 0
    waiting_reply: int = 0
    emails: list = field(default_factory=list)  # List of classified email dicts


@dataclass
class InboxReport:
    """Combined report across all accounts."""
    generated_at: str = ""
    accounts: list = field(default_factory=list)  # List of AccountReport

    def to_slack_blocks(self) -> list[dict]:
        """Generate Slack Block Kit blocks for the report."""
        blocks = []

        # Header
        blocks.append({
            "type": "header",
            "text": {"type": "plain_text", "text": f"📬 Daily Inbox Report — {self.generated_at}"}
        })

        # Summary matrix
        matrix_lines = ["```"]
        matrix_lines.append(f"{'Account':<25} {'Unread':>7} {'Action':>7} {'🚨':>4} {'FYI':>5} {'Promo':>6}")
        matrix_lines.append("-" * 60)

        total_unread = 0
        total_action = 0
        total_flagged = 0
        total_fyi = 0
        total_promo = 0

        for acct in self.accounts:
            matrix_lines.append(
                f"{acct.email:<25} {acct.total_unread:>7} "
                f"{acct.action_required:>7} {acct.flagged_important:>4} "
                f"{acct.fyi:>5} {acct.promos_archived:>6}"
            )
            total_unread += acct.total_unread
            total_action += acct.action_required
            total_flagged += acct.flagged_important
            total_fyi += acct.fyi
            total_promo += acct.promos_archived

        matrix_lines.append("-" * 60)
        matrix_lines.append(
            f"{'TOTAL':<25} {total_unread:>7} "
            f"{total_action:>7} {total_flagged:>4} "
            f"{total_fyi:>5} {total_promo:>6}"
        )
        matrix_lines.append("```")

        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": "\n".join(matrix_lines)}
        })

        # Per-account details
        for acct in self.accounts:
            if not acct.emails:
                continue

            blocks.append({"type": "divider"})
            blocks.append({
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*{acct.email}* — {acct.total_unread} unread"}
            })

            # Group by priority
            p1 = [e for e in acct.emails if e.get("priority") == "P1"]
            p2 = [e for e in acct.emails if e.get("priority") == "P2"]
            p3 = [e for e in acct.emails if e.get("priority") == "P3"]

            if p1:
                lines = ["*🚨 Flagged Important:*"]
                for e in p1[:5]:
                    lines.append(f"• {e.get('sender', 'Unknown')} — _{e.get('subject', 'No subject')}_")
                    lines.append(f"  → {e.get('suggested_action', '')}")
                blocks.append({
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": "\n".join(lines)}
                })

            if p2:
                lines = ["*📋 Action Required:*"]
                for e in p2[:10]:
                    lines.append(f"• {e.get('sender', 'Unknown')} — _{e.get('subject', 'No subject')}_")
                    lines.append(f"  → {e.get('suggested_action', '')}")
                blocks.append({
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": "\n".join(lines)}
                })

            if p3:
                lines = [f"*ℹ️ FYI ({len(p3)} emails):*"]
                for e in p3[:5]:
                    lines.append(f"• {e.get('sender', 'Unknown')} — _{e.get('subject', 'No subject')}_")
                if len(p3) > 5:
                    lines.append(f"  _...and {len(p3) - 5} more_")
                blocks.append({
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": "\n".join(lines)}
                })

        return blocks

    def to_summary_text(self) -> str:
        """Generate a short summary string."""
        total = sum(a.total_unread for a in self.accounts)
        flagged = sum(a.flagged_important for a in self.accounts)
        action = sum(a.action_required for a in self.accounts)
        promo = sum(a.promos_archived for a in self.accounts)

        parts = [f"{total} unread across {len(self.accounts)} accounts"]
        if flagged:
            parts.append(f"🚨 {flagged} flagged")
        if action:
            parts.append(f"📋 {action} need action")
        if promo:
            parts.append(f"🗑️ {promo} promos archived")

        return " • ".join(parts)


def create_report(accounts_data: list[dict], timestamp: str = "") -> InboxReport:
    """
    Create an InboxReport from account data.

    Args:
        accounts_data: List of dicts with keys:
            - account: str (account identifier)
            - email: str (email address)
            - emails: list of classified email dicts (from classify_batch)
            - promos_archived: int (count of promos archived this run)
        timestamp: Report timestamp string (e.g., "Tuesday, May 20 — 5:00 PM CT")
    """
    report = InboxReport(generated_at=timestamp or datetime.now().strftime("%A, %B %d — %I:%M %p CT"))

    for acct_data in accounts_data:
        emails = acct_data.get("emails", [])
        acct_report = AccountReport(
            account=acct_data["account"],
            email=acct_data["email"],
            total_unread=len(emails),
            action_required=sum(1 for e in emails if e.get("priority") == "P2"),
            flagged_important=sum(1 for e in emails if e.get("priority") == "P1"),
            fyi=sum(1 for e in emails if e.get("priority") == "P3"),
            promos_archived=acct_data.get("promos_archived", 0),
            waiting_reply=sum(1 for e in emails if e.get("category") == "Waiting-Reply"),
            emails=emails,
        )
        report.accounts.append(acct_report)

    return report


if __name__ == "__main__":
    # Test with sample data
    test_report = create_report([
        {
            "account": "foundryfund",
            "email": "kc@foundryfund.com",
            "emails": [
                {"sender": "investor@test.com", "subject": "Capital call Q2", "priority": "P1",
                 "category": "Investor-Relations", "suggested_action": "Review and respond"},
                {"sender": "bank@chase.com", "subject": "Wire confirmation", "priority": "P2",
                 "category": "Fund-Operations", "suggested_action": "Log wire receipt"},
            ],
            "promos_archived": 5,
        },
        {
            "account": "admin",
            "email": "admin@shb.studio",
            "emails": [
                {"sender": "ludo@shb.studio", "subject": "Need Wieland docs", "priority": "P2",
                 "category": "Action-Required", "suggested_action": "Find and send docs"},
            ],
            "promos_archived": 2,
        },
    ], timestamp="Tuesday, May 20 — 5:00 PM CT")

    blocks = test_report.to_slack_blocks()
    import json
    print(json.dumps(blocks, indent=2))
    print("\nSummary:", test_report.to_summary_text())
