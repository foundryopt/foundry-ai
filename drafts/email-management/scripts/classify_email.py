"""
Email Classifier — AI-driven email triage and labeling.

Classifies emails by priority, category, and suggested action.
Works across all SHB managed accounts.

Usage:
    from skills.email_management.scripts.classify_email import classify_email
    result = classify_email(sender, subject, snippet, label_ids, account)
"""

import re
from dataclasses import dataclass
from enum import Enum


class Priority(Enum):
    P1_FLAGGED = "P1"      # Urgent / VIP / legal / money
    P2_ACTION = "P2"       # Needs response
    P3_FYI = "P3"          # Informational
    P4_PROMO = "P4"        # Promotional / noise


class Category(Enum):
    INVESTOR = "Investor-Relations"
    FUND_OPS = "Fund-Operations"
    PROJECT = "Project"
    TEAM = "Team"
    VENDOR = "Vendor"
    FINANCIAL = "Financial"
    LEAD = "Lead"
    SUPPORT = "Support"
    PARTNERSHIP = "Partnership"
    PROMO = "Archived-Promo"
    FYI = "FYI"
    ACTION = "Action-Required"
    IMPORTANT = "Flagged-Important"


@dataclass
class EmailClassification:
    priority: Priority
    category: Category
    viktor_label: str          # Full label name, e.g. "Viktor/Action-Required"
    suggested_action: str      # Human-readable action
    is_promo: bool
    unsubscribe_candidate: bool


# --- Known sender patterns ---

VIP_SENDERS = [
    "kc@shb.studio", "ckh@shb.studio", "kc@foundryfund.com",
]

TEAM_DOMAINS = ["shb.studio", "foundryfund.com", "foundryrooms.com", "builiq.com"]

PROMO_SENDERS = [
    "noreply@", "no-reply@", "marketing@", "newsletter@", "news@",
    "promotions@", "deals@", "offers@", "hello@", "updates@",
    "notifications@", "digest@", "mailer@", "bounce@",
]

PROMO_SENDER_DOMAINS = [
    "mailchimp.com", "sendgrid.net", "constantcontact.com",
    "hubspot.com", "mailgun.org", "activehosted.com",
    "campaign-archive.com", "list-manage.com", "substack.com",
    "beehiiv.com", "convertkit.com", "drip.com",
    "linkedin.com", "facebook.com", "twitter.com", "instagram.com",
    "yelp.com", "nextdoor.com",
    "skool.com",
]

FINANCIAL_KEYWORDS = [
    "invoice", "payment", "billing", "amount due", "net 30",
    "pay app", "retainage", "draw request", "wire transfer",
    "ach", "check enclosed", "past due", "overdue",
]

URGENT_KEYWORDS = [
    "urgent", "asap", "immediately", "time-sensitive",
    "deadline", "expires today", "action required", "final notice",
    "past due", "overdue",
]

INVESTOR_KEYWORDS = [
    "investor", "lp", "limited partner", "capital call",
    "distribution", "k-1", "fund performance", "irr",
    "commitment", "subscription", "accredited",
]

PROJECT_KEYWORDS = [
    "rfi", "submittal", "change order", "punch list",
    "inspection", "permit", "warranty", "close-out",
    "schedule", "milestone", "substantial completion",
    "webster", "claremont", "wieland", "fullerton", "belmont",
]


def _extract_domain(email_addr: str) -> str:
    """Extract domain from email address."""
    match = re.search(r"@([\w.-]+)", email_addr)
    return match.group(1).lower() if match else ""


def _extract_email(sender: str) -> str:
    """Extract email from 'Name <email>' format."""
    match = re.search(r"<([^>]+)>", sender)
    return (match.group(1) if match else sender).lower().strip()


def _is_promo_sender(sender: str) -> bool:
    """Check if sender looks promotional."""
    email = _extract_email(sender)
    domain = _extract_domain(email)

    for pattern in PROMO_SENDERS:
        if email.startswith(pattern):
            return True
    for promo_domain in PROMO_SENDER_DOMAINS:
        if domain.endswith(promo_domain):
            return True
    return False


def _has_gmail_promo_label(label_ids: list[str]) -> bool:
    """Check if Gmail already categorized as promo/social."""
    promo_labels = {"CATEGORY_PROMOTIONS", "CATEGORY_SOCIAL"}
    return bool(set(label_ids or []) & promo_labels)


def _text_contains(text: str, keywords: list[str]) -> bool:
    """Case-insensitive keyword check."""
    text_lower = text.lower()
    return any(kw in text_lower for kw in keywords)


def classify_email(
    sender: str,
    subject: str,
    snippet: str,
    label_ids: list[str] | None = None,
    account: str = "general",
) -> EmailClassification:
    """
    Classify an email and return labeling + action recommendation.

    Args:
        sender: Full sender string, e.g. "Name <email@domain.com>"
        subject: Email subject line
        snippet: Email snippet/preview
        label_ids: Gmail label IDs already on the message
        account: Which account ("foundryfund", "shb", "builiq", "admin")

    Returns:
        EmailClassification with priority, category, label, and action
    """
    label_ids = label_ids or []
    email = _extract_email(sender)
    domain = _extract_domain(email)
    text = f"{subject} {snippet}".lower()

    # --- Step 1: Promo detection ---
    is_promo = _is_promo_sender(sender) or _has_gmail_promo_label(label_ids)

    if is_promo:
        return EmailClassification(
            priority=Priority.P4_PROMO,
            category=Category.PROMO,
            viktor_label="Viktor/Archived-Promo",
            suggested_action="Archive — promotional email",
            is_promo=True,
            unsubscribe_candidate=True,
        )

    # --- Step 2: Urgency check ---
    is_urgent = _text_contains(text, URGENT_KEYWORDS)

    # --- Step 3: VIP sender ---
    is_vip = email in VIP_SENDERS

    # --- Step 4: Team member ---
    is_team = any(domain.endswith(d) for d in TEAM_DOMAINS)

    # --- Step 5: Account-specific classification ---

    # Foundryfund account
    if account == "foundryfund":
        if _text_contains(text, INVESTOR_KEYWORDS):
            label = "Viktor/Investor-Relations"
            cat = Category.INVESTOR
            action = "Investor communication — review and respond"
        elif _text_contains(text, FINANCIAL_KEYWORDS):
            label = "Viktor/Fund-Operations"
            cat = Category.FUND_OPS
            action = "Fund financial matter — review"
        elif is_team:
            label = "Viktor/FYI"
            cat = Category.FYI
            action = "Internal team email — review"
        else:
            label = "Viktor/Action-Required"
            cat = Category.ACTION
            action = "Review and respond"

    # SHB account
    elif account == "shb":
        if _text_contains(text, PROJECT_KEYWORDS):
            label = "Viktor/Project"
            cat = Category.PROJECT
            action = "Project-related — review and route"
        elif _text_contains(text, FINANCIAL_KEYWORDS):
            label = "Viktor/Financial"
            cat = Category.FINANCIAL
            action = "Financial matter — review"
        elif is_team:
            label = "Viktor/Team"
            cat = Category.TEAM
            action = "Team communication — review"
        else:
            label = "Viktor/Action-Required"
            cat = Category.ACTION
            action = "Review and respond"

    # Builiq account
    elif account == "builiq":
        if _text_contains(text, ["demo", "pricing", "interested", "trial", "sign up", "quote"]):
            label = "Viktor/Lead"
            cat = Category.LEAD
            action = "Potential lead — respond promptly"
        elif _text_contains(text, ["help", "support", "issue", "bug", "problem", "error"]):
            label = "Viktor/Support"
            cat = Category.SUPPORT
            action = "Support request — investigate and respond"
        elif _text_contains(text, ["partner", "integration", "api", "collaborate", "vendor"]):
            label = "Viktor/Partnership"
            cat = Category.PARTNERSHIP
            action = "Partnership inquiry — review"
        else:
            label = "Viktor/Action-Required"
            cat = Category.ACTION
            action = "Review and respond"

    # Admin / fallback
    else:
        if is_team:
            label = "Viktor/Action-Required"
            cat = Category.ACTION
            action = "Team request — respond using available resources"
        elif _text_contains(text, FINANCIAL_KEYWORDS):
            label = "Viktor/Action-Required"
            cat = Category.FINANCIAL
            action = "Financial email — review"
        else:
            label = "Viktor/FYI"
            cat = Category.FYI
            action = "Review — determine if action needed"

    # --- Step 6: Priority override ---
    if is_urgent or is_vip:
        priority = Priority.P1_FLAGGED
        if is_urgent:
            label = "Viktor/Flagged-Important"
            cat = Category.IMPORTANT
            action = f"⚠️ URGENT: {action}"
    elif cat in (Category.ACTION, Category.INVESTOR, Category.LEAD, Category.FINANCIAL):
        priority = Priority.P2_ACTION
    else:
        priority = Priority.P3_FYI

    return EmailClassification(
        priority=priority,
        category=cat,
        viktor_label=label,
        suggested_action=action,
        is_promo=False,
        unsubscribe_candidate=False,
    )


# --- Convenience: classify a batch ---

def classify_batch(emails: list[dict], account: str) -> list[dict]:
    """
    Classify a batch of email metadata dicts.

    Each dict should have: sender, subject, snippet, labelIds (optional), id
    Returns list of dicts with classification fields added.
    """
    results = []
    for em in emails:
        classification = classify_email(
            sender=em.get("sender", ""),
            subject=em.get("subject", ""),
            snippet=em.get("snippet", ""),
            label_ids=em.get("labelIds", []),
            account=account,
        )
        results.append({
            **em,
            "priority": classification.priority.value,
            "category": classification.category.value,
            "viktor_label": classification.viktor_label,
            "suggested_action": classification.suggested_action,
            "is_promo": classification.is_promo,
            "unsubscribe_candidate": classification.unsubscribe_candidate,
        })
    return results


if __name__ == "__main__":
    # Quick test
    test = classify_email(
        sender="Harry Lee <harry@officialharrylee.com>",
        subject="2025 AI automation solutions",
        snippet="Check out our latest AI tools",
        label_ids=["CATEGORY_PROMOTIONS", "UNREAD", "INBOX"],
        account="foundryfund",
    )
    print(f"Priority: {test.priority.value}")
    print(f"Category: {test.category.value}")
    print(f"Label: {test.viktor_label}")
    print(f"Action: {test.suggested_action}")
    print(f"Is promo: {test.is_promo}")

    test2 = classify_email(
        sender="investor@example.com",
        subject="Capital call notice - urgent",
        snippet="Please wire funds by Friday",
        label_ids=["UNREAD", "INBOX"],
        account="foundryfund",
    )
    print(f"\nPriority: {test2.priority.value}")
    print(f"Category: {test2.category.value}")
    print(f"Label: {test2.viktor_label}")
    print(f"Action: {test2.suggested_action}")
