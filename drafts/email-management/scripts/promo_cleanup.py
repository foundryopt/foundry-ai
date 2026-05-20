"""
Promo Cleanup Script — Archives promotional emails and tracks unsubscribe candidates.

Designed to run as part of the email/promo-cleanup cron.
Handles kc@foundryfund.com (gmail_2) and future accounts.

Usage (from cron agent prompt):
    Run /work/skills/email_management/scripts/promo_cleanup.py logic
"""

import json
import os
from datetime import datetime, timezone

# --- Label IDs per account (updated after label creation) ---

LABEL_IDS = {
    "foundryfund": {
        "archived_promo": "Label_7",  # Viktor/Archived-Promo — update after creation
    },
    "admin": {
        # Will be populated when labels are created on admin@shb.studio
    },
}

# --- Promo detection patterns ---

PROMO_SENDER_PREFIXES = [
    "noreply@", "no-reply@", "marketing@", "newsletter@", "news@",
    "promotions@", "deals@", "offers@", "hello@", "updates@",
    "notifications@", "digest@", "mailer@", "bounce@", "info@",
]

PROMO_DOMAINS = [
    "mailchimp.com", "sendgrid.net", "constantcontact.com",
    "hubspot.com", "mailgun.org", "activehosted.com",
    "campaign-archive.com", "list-manage.com", "substack.com",
    "beehiiv.com", "convertkit.com", "drip.com",
    "linkedin.com", "facebook.com", "twitter.com", "instagram.com",
    "yelp.com", "nextdoor.com", "skool.com", "medium.com",
    "producthunt.com", "glassdoor.com", "indeed.com",
    "canva.com", "figma.com", "notion.so",
    "stripe.com", "intercom.io", "zendesk.com",
]

# Domains to NEVER archive (even if they look promo-ish)
WHITELIST_DOMAINS = [
    "shb.studio", "foundryfund.com", "foundryrooms.com", "builiq.com",
    "irs.gov", "illinois.gov", "chicago.gov",
    "chase.com", "huntington.com", "bankofamerica.com",
    "docusign.com", "docusign.net",
]

UNSUBSCRIBE_LOG_PATH = "/work/logs/email_management/unsubscribe_candidates.json"


def is_promo_email(sender: str, label_ids: list[str]) -> bool:
    """Determine if an email is promotional."""
    email = ""
    if "<" in sender:
        import re
        match = re.search(r"<([^>]+)>", sender)
        email = match.group(1).lower() if match else sender.lower()
    else:
        email = sender.lower().strip()

    domain = email.split("@")[-1] if "@" in email else ""

    # Never archive whitelisted domains
    for wd in WHITELIST_DOMAINS:
        if domain.endswith(wd):
            return False

    # Gmail already categorized it
    if "CATEGORY_PROMOTIONS" in label_ids or "CATEGORY_SOCIAL" in label_ids:
        return True

    # Check sender prefix
    for prefix in PROMO_SENDER_PREFIXES:
        if email.startswith(prefix):
            return True

    # Check domain
    for pd in PROMO_DOMAINS:
        if domain.endswith(pd):
            return True

    return False


def track_unsubscribe_candidate(sender: str, subject: str):
    """Log frequent promo senders as unsubscribe candidates."""
    os.makedirs(os.path.dirname(UNSUBSCRIBE_LOG_PATH), exist_ok=True)

    candidates = {}
    if os.path.exists(UNSUBSCRIBE_LOG_PATH):
        with open(UNSUBSCRIBE_LOG_PATH) as f:
            candidates = json.load(f)

    email = ""
    if "<" in sender:
        import re
        match = re.search(r"<([^>]+)>", sender)
        email = match.group(1).lower() if match else sender.lower()
    else:
        email = sender.lower().strip()

    if email not in candidates:
        candidates[email] = {
            "display_name": sender.split("<")[0].strip().strip('"'),
            "count": 0,
            "first_seen": datetime.now(timezone.utc).isoformat(),
            "last_seen": None,
            "sample_subjects": [],
        }

    candidates[email]["count"] += 1
    candidates[email]["last_seen"] = datetime.now(timezone.utc).isoformat()
    if len(candidates[email]["sample_subjects"]) < 3:
        candidates[email]["sample_subjects"].append(subject)

    with open(UNSUBSCRIBE_LOG_PATH, "w") as f:
        json.dump(candidates, f, indent=2)


def get_top_unsubscribe_candidates(min_count: int = 3) -> list[dict]:
    """Get senders with 3+ promo emails — candidates for unsubscribe."""
    if not os.path.exists(UNSUBSCRIBE_LOG_PATH):
        return []

    with open(UNSUBSCRIBE_LOG_PATH) as f:
        candidates = json.load(f)

    results = []
    for email, data in candidates.items():
        if data["count"] >= min_count:
            results.append({"email": email, **data})

    return sorted(results, key=lambda x: x["count"], reverse=True)


if __name__ == "__main__":
    # Test
    print(is_promo_email("Harry Lee <harry@officialharrylee.com>", ["CATEGORY_PROMOTIONS"]))
    print(is_promo_email("noreply@linkedin.com", []))
    print(is_promo_email("kc@shb.studio", ["CATEGORY_PROMOTIONS"]))  # whitelisted
    print(is_promo_email("investor@example.com", ["INBOX"]))
