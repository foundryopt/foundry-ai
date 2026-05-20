---
name: email_management
description: Full email lifecycle management across SHB accounts — inbox reports, AI labeling, promo cleanup, calendar sync. Use when managing kc@shb.studio, kc@foundryfund.com, info@builiq.com, or admin@shb.studio.
---

# Email Management System

## Overview

Viktor manages email across SHB Group's accounts with AI-driven triage, labeling, promo cleanup, and daily reporting. Each account has tailored rules; the labeling taxonomy and cron infrastructure are shared.

## Managed Accounts

| Account | Integration | Role | Status |
|---|---|---|---|
| `admin@shb.studio` | Gmail "Support" (`pd_gmail`) | Viktor's own mailbox — coworker requests, task reminders | ✅ Active |
| `kc@foundryfund.com` | Gmail_2 "Foundryfund" (`pd_gmail_2`) | Kuan's fund email — investor relations, fund ops | ✅ Active |
| `kc@shb.studio` | ❌ Not yet connected | Kuan's primary work email — projects, team, vendors | 🔜 Pending |
| `info@builiq.com` | ❌ Not yet connected | Builiq intake — leads, support, partnerships | 🔜 Pending |

## Label Taxonomy

All Viktor-managed labels use the `Viktor/` prefix for easy identification and filtering.

### Universal Labels (applied across all accounts)

| Label | Color | Purpose |
|---|---|---|
| `Viktor/Action-Required` | 🔴 Red | Needs human response or decision |
| `Viktor/FYI` | 🟢 Green | Informational — no action needed |
| `Viktor/Waiting-Reply` | 🟠 Orange | Reply sent, awaiting response |
| `Viktor/Archived-Promo` | ⚪ Gray | Promotional, archived by Viktor |
| `Viktor/Flagged-Important` | 🔴 Dark Red | High priority, escalated to Kuan |

### Account-Specific Labels

#### kc@foundryfund.com
| Label | Purpose |
|---|---|
| `Viktor/Investor-Relations` | LP comms, investor inquiries, capital calls |
| `Viktor/Fund-Operations` | Fund admin, legal, compliance, banking |

#### kc@shb.studio (when connected)
| Label | Purpose |
|---|---|
| `Viktor/Project` | Project-specific correspondence |
| `Viktor/Team` | Internal SHB team comms |
| `Viktor/Vendor` | Subcontractor / vendor emails |
| `Viktor/Financial` | Invoices, payments, billing |

#### info@builiq.com (when connected)
| Label | Purpose |
|---|---|
| `Viktor/Lead` | Potential customer inquiry |
| `Viktor/Support` | Customer support request |
| `Viktor/Partnership` | Vendor / partnership inquiry |

## Cron Jobs

### 1. Multi-Account Daily Inbox Report — 5 PM CT Weekdays
- **Path:** `/email/daily-inbox-report`
- **Schedule:** `0 22 * * 1-5`
- **What:** Scans all connected accounts, produces a matrix report:
  - Unread count per account
  - Emails grouped by label/category
  - Proposed actions for each
  - Promo/spam count archived

### 2. Promo Cleanup — Daily 6 AM CT
- **Path:** `/email/promo-cleanup`
- **Schedule:** `0 11 * * *`
- **What:** For each account:
  - Archive promotional/social emails
  - Label as `Viktor/Archived-Promo`
  - Track unsubscribe candidates (frequent senders, never opened)
  - Weekly: propose batch unsubscribe list to Kuan

### 3. Email Triage & Labeling — Every 30 min, business hours
- **Path:** `/email/triage`
- **Schedule:** `*/30 8-18 * * 1-5`
- **What:** Scan unread emails, classify with AI, apply labels, flag urgent items

### 4. Calendar Daily Brief — 7 AM CT Weekdays
- **Path:** `/calendar/daily-brief`
- **Schedule:** `0 12 * * 1-5`
- **What:** Pull today's + tomorrow's events from kc@shb.studio and kc@foundryfund.com calendars, surface conflicts, prep notes

## Scripts

### `scripts/classify_email.py`
AI email classifier — takes email metadata, returns label + priority + proposed action.

### `scripts/promo_cleanup.py`
Scans for promotional emails, archives them, tracks unsubscribe candidates.

### `scripts/inbox_report.py`
Generates the multi-account inbox report matrix.

### `scripts/calendar_brief.py`
Generates daily calendar briefing across accounts.

## Classification Logic

Emails are classified using a combination of:
1. **Gmail categories** (CATEGORY_PROMOTIONS, CATEGORY_SOCIAL, CATEGORY_UPDATES)
2. **Sender domain analysis** (known vendors, team members, investors, newsletters)
3. **Subject/content keywords** (invoice, RFI, urgent, meeting, etc.)
4. **Thread context** (reply to existing conversation vs. new thread)

Priority scoring:
- **P1 (Flagged-Important):** Contains "urgent", "ASAP", from known VIP senders, legal/compliance, money >$5K
- **P2 (Action-Required):** Direct questions, requests, invitations, invoices
- **P3 (FYI):** Updates, notifications, CC'd emails, newsletters from relevant sources
- **P4 (Archived-Promo):** Marketing, social media notifications, product updates

## Adding a New Account

When a new Gmail integration is connected:
1. Create Viktor/* labels using the appropriate `pd_gmail_*_create_label` functions
2. Add account to `scripts/inbox_report.py` accounts list
3. Add account-specific labels per the taxonomy above
4. Update cron descriptions to include the new account
5. Run initial promo cleanup pass
6. Update this SKILL.md

## GitHub Sync

This skill is mirrored to `foundryopt/foundry-ai` under the appropriate path.
Commit with: `git -c user.email=viktor@shb.studio -c user.name="Viktor AI" commit -m "type(scope): description"`
