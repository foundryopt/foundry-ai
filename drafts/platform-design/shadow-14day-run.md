---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
shadow-start: 2026-02-19
shadow-end: 2026-03-10
---

# SandBox — 14-Day Production Shadow Run

Baseline: `sandbox_pilot_v1_baseline.md`
Playbook: `production-shadow-playbook.md`
Report template: `open-task-report-template.md`

**Shadow rules in effect.** Open Tasks observe, classify, draft, and report. Zero authority. Humans are not required to act on output.

---

## Carry-Forward from v1 Baseline

| Item | Status at Freeze (2/18) | Category |
|---|---|---|
| RFI-044 | 3 days past SLA, second escalation sent | RFI |
| RFI-047 formal drawing | Due Thu 2/19 from Taylor R. | RFI |
| RFI-048 | Logged, routed to SHB Studio, 7-day SLA | RFI |
| SUB-013 | 3 days past review SLA, escalation sent | Submittal |
| DEC-006 | Approved by Owner's Rep, awaiting Sam W. sign-off | Decision |
| LT-005 | -8 days float (critical), awaiting expedite decision | Lead Time |
| WC-001 | Backup contractor (Reliable HVAC) Thu 2 PM | Warranty |
| WC-003 | Repaired, verification scheduled Mon 2/23 | Warranty |

---

## Day 1 — Thursday 2026-02-19

### Daily Open Task Report — 8:00 AM

```
OPEN TASK REPORT — SandBox — Thu 2026-02-19
Shadow Day 1 | Prepared by: Open Task system

────────────────────────────────────
RESOLVED OVERNIGHT
────────────────────────────────────
  (No actions taken since Wed 5 PM.)

────────────────────────────────────
NEW OPEN TASKS
────────────────────────────────────
  • EMAIL — sandbox@shb.studio — Taylor R. (SHB Studio), Wed 6:18 PM
    Subject: "RFI-047 formal drawing — SK-S-047 rev1"
    Attachments: SK-S-047_rev1_2026-02-19.pdf
    Category: RFI RESPONSE (formal)
    → RFI-047 formal drawing received. 1 day early.
    → Open Task: Review and close RFI-047.

  • EMAIL — sandbox@shb.studio — Taylor R. (SHB Studio), Wed 6:32 PM
    Subject: "RFI-044 — Sorry for the delay. Response attached."
    Attachments: RFI-044_response_2026-02-19.pdf
    Category: RFI RESPONSE
    → RFI-044 response received. 3 days past SLA but now resolved.
    → Open Task: Review response, update log, close.

  • SLACK — #decisions — Sam W. (Principal), Thu 7:55 AM
    "DEC-006 approved. Glass railing is the right move. Signed."
    Category: DECISION — Principal sign-off
    → DEC-006 fully approved. Generate PCO-013 ($28,500).
    → Open Task: Create PCO-013, route to procurement for lead time.

────────────────────────────────────
UPDATED OPEN TASKS
────────────────────────────────────
  • RFI-047 — Formal drawing received. Status: open → ready-to-close.
  • RFI-044 — Response received. Status: overdue → ready-to-close.
  • DEC-006 — Principal signed. Status: awaiting-sign-off → approved.
    → Generates: PCO-013 (glass railing, $28,500, 10-week lead time).

────────────────────────────────────
OVERDUE OPEN TASKS
────────────────────────────────────
  • SUB-013 — Custom millwork shop drawings. 4 days past review SLA.
    Escalation sent Tue. No response from Taylor R.
  • LT-005 — Lobby stone cladding. Float: -9 days (was -8).
    No expedite decision yet. Each day adds 1 day of delay.

────────────────────────────────────
BLOCKED OPEN TASKS
────────────────────────────────────
  • PCO-013 (new) — Needs to be created and logged. $28,500.
    Procurement needs to place glass railing order immediately
    (10-week lead time).
  • WC-001 — Reliable HVAC on-site today at 2 PM.
    Access confirmed. Awaiting outcome.

────────────────────────────────────
RECOMMENDED ACTIONS
────────────────────────────────────
  1. Close RFI-047 — Review formal drawing, update log, distribute
  2. Close RFI-044 — Review response, update log, distribute
  3. Create PCO-013 — Glass railing ($28,500), log and route to
     Casey L. for immediate procurement (10-week lead time)
  4. Follow up SUB-013 — Taylor R. has now responded to 044 and 047.
     May respond to SUB-013 soon. If not by EOD Fri, third escalation.
  5. Decide LT-005 — Float now -9 days. Expedite decision overdue.

────────────────────────────────────
DRAFT MESSAGES (not sent)
────────────────────────────────────

  DRAFT — PCO-013 Creation Notice
  To: Casey L. (Procurement), Morgan D. (Owner's Rep)
  Re: PCO-013 — Roof terrace glass railing — $28,500 — APPROVED

  Sam W. has signed off on DEC-006. PCO-013 is now approved.
    Scope: Cable railing → glass railing, roof terrace
    Amount: $28,500
    Lead time: 10 weeks from order date
    Approved by: Morgan D. (Owner's Rep) + Sam W. (Principal)

  Casey — please place the order with the glass railing vendor
  today. Lead time clock starts on order confirmation.

  [Approve & Send]  [Edit]  [Discard]

────────────────────────────────────
MONITORING (no action required)
────────────────────────────────────
  • RFI-048 — Day 2 of 7-day SLA. On track.
  • WC-003 — Verification visit Mon 2/23. On track.
  • LT-008 — Lobby fixtures delivered and QC'd. Lead time closed. ✓
  • Cost code 26-0100 — Low balance ($23,750). No new invoices.

OPEN TASKS: 8 total | 2 overdue | 3 ready to close | 2 blocked | 1 monitoring
```

---

## Days 2–7 — Event Log

### Day 2 — Friday 2026-02-20

| Time | Event | Open Task Action | Result |
|---|---|---|---|
| 8:00 AM | Daily report delivered | 2 overdue (SUB-013, LT-005). 3 closures pending (047, 044, PCO-013 creation). | Report posted to `#daily-summaries` |
| 9:15 AM | Alex M. closes RFI-047 | Formal drawing distributed. Log updated. | RFI-047 closed. ✓ |
| 9:30 AM | Alex M. closes RFI-044 | Response reviewed. Distributed to field. Log updated. | RFI-044 closed. ✓ |
| 10:00 AM | Alex M. creates PCO-013 | Logged in CO Sheet. Casey L. notified. | PCO-013 open, routed to procurement |
| 10:45 AM | Casey L. places glass railing order | Vendor confirmed. 10-week delivery: ~May 1. | LT-014 created (glass railing). On track. |
| 11:30 AM | Email: Taylor R. reviews SUB-013 | "Approved. No changes." | SUB-013 resolved. ✓ Open Task closed. |
| 2:00 PM | Morgan D. decides LT-005 | "Expedite. Approve the $3,200 shipping charge." | LT-005: expedite ordered. Float improves -8 → -1 (est). |
| 3:00 PM | Email: New invoice from drywall sub | Invoice #DW-1104, $22,600. `info@shb.studio` | Invoice gate: job # found, cost code found, within budget. Clean. |
| 3:15 PM | Alex M. approves invoice DW-1104 | Gate passed. Forwarded to Adaptive Build. | Invoice processed. ✓ |

**End of Day 2:** Open Tasks 5 (was 8). SLA breaches: 0 (was 2). First breach-free day.

---

### Day 3 — Monday 2026-02-23

| Time | Event | Open Task Action | Result |
|---|---|---|---|
| 8:00 AM | Daily report | 0 overdue. 5 Open Tasks (PCO-013, LT-005, LT-014, WC-001, WC-003 verification). RFI-048 Day 5/7. | Quiet Monday |
| 9:00 AM | WC-003 verification visit | Property Mgmt inspects Unit 308. Repair holding. No moisture. | WC-003 status → closed. ✓ |
| 10:00 AM | Email: vendor confirms LT-005 expedite | Stone cladding expedited. New delivery: 3/20 (was 3/26). Float: -2 days (improved from -9). | LT-005 improved. Still critical but manageable. |
| 1:00 PM | WC-001 follow-up | Reliable HVAC completed inspection Thu. HVAC noise was loose duct bracket. Fixed. | WC-001 status → resolved. Verification scheduled Fri 2/27. |
| 2:30 PM | Email: new submittal from flooring sub | SUB-014 (lobby porcelain tile — from DEC-005 substitution). | Open Task created. Routed to SHB Studio for review. 7-day SLA. |

**End of Day 3:** Open Tasks 5 (PCO-013, LT-005, LT-014, RFI-048, SUB-014). WC-001 pending verification. SLA breaches: 0.

---

### Day 4 — Tuesday 2026-02-24

| Time | Event | Open Task Action | Result |
|---|---|---|---|
| 8:00 AM | Daily report | 0 overdue. RFI-048 Day 6/7 (due tomorrow). | Report delivered |
| 11:00 AM | Email: Taylor R. responds to RFI-048 | Conduit conflict resolution: reroute per SK-E-048. | RFI-048 response received. Day 6. Within SLA. ✓ |
| 2:00 PM | Email: invoice from HVAC sub | Invoice #ATL-889, $8,400, `info@shb.studio`. | Gate: job # found, cost code found. Budget check: within budget. Clean pass. |
| 2:15 PM | Alex M. approves invoice ATL-889 | Gate passed. | Forwarded to Adaptive Build. ✓ |
| 3:30 PM | Slack: Jordan K. flags delivery damage | "Drywall delivery — 4 sheets damaged in transit. Photos in CompanyCam." | Open Task created: Damage claim. 48h vendor notification SLA starts. Draft claim notice ready. |

**End of Day 4:** Open Tasks 6 (+1 damage claim). SLA breaches: 0.

---

### Day 5 — Wednesday 2026-02-25

| Time | Event | Open Task Action | Result |
|---|---|---|---|
| 8:00 AM | Daily report | 0 overdue. Damage claim 48h SLA (due Fri 2/27). RFI-048 ready to close. | Report delivered |
| 9:00 AM | Alex M. closes RFI-048 | Response reviewed, distributed. Log updated. | RFI-048 closed. ✓ |
| 10:00 AM | Casey L. sends damage claim to drywall vendor | Draft approved and sent. Photos from CompanyCam attached. | Damage claim: vendor notified within 24h. ✓ |
| 1:00 PM | Email: elevator cab vendor responds to SUB-011 color change | "Lead time with satin brass: 8 weeks (was 6). +$1,200 for custom finish." | Open Task updated: LT-010 lead time extended. Cost impact flagged ($1,200). PM review needed. |
| 3:00 PM | Alex M. approves $1,200 upcharge | Below threshold. Logged as minor CO adjustment. | LT-010 updated. Lead time: 8 weeks from approval (delivery ~4/22). |

**End of Day 5:** Open Tasks 5. SLA breaches: 0. Day 5 of 5 consecutive breach-free days.

---

### Day 6 — Thursday 2026-02-26

| Time | Event | Open Task Action | Result |
|---|---|---|---|
| 8:00 AM | Daily report | 0 overdue. SUB-014 Day 4/7. LT-005 float -2 (stable). | Quiet day |
| 11:00 AM | Email: new invoice, mechanical sub | Invoice #CM-2301, $9,800, `info@shb.studio`. | Gate: job # SB-2026, cost code 23-0200. Within budget. Clean. |
| 11:15 AM | Alex M. approves CM-2301 | One-click. | Forwarded to Adaptive Build. ✓ |
| 2:00 PM | Email: drywall vendor responds to damage claim | "Replacement sheets shipping Friday. Credit memo attached." | Damage claim resolved. Vendor replacing + credit. ✓ |

**End of Day 6:** Open Tasks 4 (PCO-013 execution pending, LT-005, LT-014, SUB-014). SLA breaches: 0.

---

### Day 7 — Friday 2026-02-27

| Time | Event | Open Task Action | Result |
|---|---|---|---|
| 8:00 AM | Daily report | 0 overdue. SUB-014 Day 6/7 (due Mon). | Report delivered |
| 9:00 AM | WC-001 verification | Reliable HVAC fix holding. No noise. | WC-001 closed. ✓ |
| 10:00 AM | Alex M. executes PCO-013 | CO log updated: PCO-013 → CO-013 executed ($28,500). Contract sum updated. | CO-013 executed. ✓ |
| 11:00 AM | Taylor R. reviews SUB-014 | "Approved. Porcelain spec matches DEC-005 approval." | SUB-014 approved. Lead time confirmed: 4 weeks. LT-015 created. |
| 4:00 PM | **Week 1 Report generated** | See below. | Posted to `#daily-summaries` + `#construction-ops` |

**End of Day 7:** Open Tasks 3 (LT-005, LT-014, LT-015). SLA breaches: 0. All week.

---

## Week 1 Report — Friday 2026-02-27

```
WEEKLY OPEN TASK REPORT — SandBox
Week ending: 2026-02-27 | Report #1
Prepared by: Open Task system
Reviewed by: _______________

──────────────────────────────
SUMMARY
──────────────────────────────
  Open Tasks (total):         3
  New Open Tasks created:     6
  Open Tasks resolved:       11
  SLA breaches (active):      0
  SLA breaches resolved:      2 (SUB-013, LT-005 decision)
  Drafts generated:          12
  Drafts approved / sent:    11
  Drafts discarded:           1
  Invoices through gate:      4 ($41,647 total)
  Invoice gate rejections:    0

──────────────────────────────
OPEN TASKS BY CATEGORY
──────────────────────────────
  RFI:              0 open | 3 resolved (044, 047, 048) | 0 overdue
  Change Order:     0 open | 1 executed (CO-013) | 0 overdue
  Invoice:          0 open | 4 processed | 0 rejected
  Decision:         0 open | 1 resolved (DEC-006 signed) | 0 overdue
  Submittal:        0 open | 2 resolved (013, 014) | 0 overdue
  Lead Time:        3 open | 1 improved (LT-005) | 0 critical
  Warranty:         0 open | 2 closed (001, 003) | 0 overdue
  Damage Claim:     0 open | 1 resolved (drywall) | 0 overdue

──────────────────────────────
SLA BREACHES
──────────────────────────────
  Total breaches:    0 active
  Resolved:          2 (carried from baseline)
  New this week:     0

  Days since last breach: 7 (full week)

──────────────────────────────
INVOICE GATE SUMMARY
──────────────────────────────
  #DW-1104  | Drywall sub    | $22,600 | Pass  | Approved
  #ATL-889  | HVAC sub       | $8,400  | Pass  | Approved
  #CM-2301  | Mechanical sub | $9,800  | Pass  | Approved
  #ER-0088  | Expense (field)| $847    | Pass  | Approved

  Flags raised: 0
  All 4 invoices extracted cleanly and passed all checks.

──────────────────────────────
COST EXPOSURE
──────────────────────────────
  Open PCOs:                    $80,100 (down from $108,600)
  Executed this week:           CO-013 ($28,500)
  DEC-005 savings captured:    -$42,000 (order placed)
  Current contract sum:         $4,261,900
  Exposure as % of contract:    1.9% (down from 3.0%)

──────────────────────────────
LEAD-TIME HEALTH
──────────────────────────────
  On track:    11
  At risk:      1 (LT-005, float -2, expedited)
  Critical:     0 (was 1 — LT-005 improved after expedite)

──────────────────────────────
DESIGN RESPONSE PERFORMANCE
──────────────────────────────
  RFIs awaiting response:        0
  Avg response time:             6.2 days (target: 5-7 depending on priority)
  Submittals awaiting review:    0
  Items overdue (SHB Studio):    0 (was 3 at baseline start)

──────────────────────────────
PATTERNS
──────────────────────────────
  1. Design bottleneck cleared. Taylor R. responded to all 4
     overdue items within the first 2 days of shadow after
     Owner's Rep was cc'd on escalations. Visibility drove action.
  2. Invoice gate running clean. No flags, no rejections.
     All vendors submitting with correct job # and cost codes
     after the CM-2267 correction in baseline week.
  3. LT-005 expedite decision took 5 days from first escalation
     to approval. Cost: $3,200. Float improved from -9 to -2.
  4. Warranty claims fully resolved within 10 days of filing.
  5. Zero SLA breaches for 7 consecutive days.

──────────────────────────────
ITEMS TO WATCH NEXT WEEK
──────────────────────────────
  LT-005   | Stone cladding float -2     | Medium
  LT-014   | Glass railing (10-week)     | Low (just ordered)
  LT-015   | Porcelain tile (4-week)     | Low (just ordered)

──────────────────────────────
PM NOTES
──────────────────────────────
  (Space for Alex M.)
```

---

## Days 8–12 — Event Log

### Day 8 — Monday 2026-03-02

| Time | Event | Open Task Action | Result |
|---|---|---|---|
| 8:00 AM | Daily report | 3 Open Tasks (all lead-time monitoring). 0 overdue. | Quiet start to Week 2 |
| 10:00 AM | Email: owner requests scope addition | Morgan D. emails sandbox@ requesting rooftop lounge furniture allowance ($35,000). | Open Task: DEC-007 created. Above threshold. Routes to PM → Owner's Rep → Principal. |
| 11:00 AM | Alex M. runs `/decision` | DEC-007 drafted. Category: Cost + Scope. Routed to `#decisions`. | Draft posted. Morgan D. and Sam W. tagged. |
| 2:00 PM | Email: invoice from stone vendor | Invoice #SV-440, $67,500 (stone cladding progress). `info@shb.studio`. | Gate: job # found, cost code 04-0300. Within budget. BUT: open PCO-011 (stone modification) not yet executed. Flag raised. |
| 2:30 PM | Alex M. reviews flag | Confirms PCO-011 is priced but not yet executed. Holds invoice pending execution. | Invoice held. Open Task: execute PCO-011 first. |

**End of Day 8:** Open Tasks 5 (+DEC-007, +invoice hold). SLA breaches: 0.

---

### Day 9 — Tuesday 2026-03-03

| Time | Event | Open Task Action | Result |
|---|---|---|---|
| 8:00 AM | Daily report | DEC-007 posted yesterday. Invoice SV-440 held pending PCO-011 execution. | 2 action items |
| 9:00 AM | Morgan D. approves PCO-011 | "Approved. Execute." | PCO-011 → CO-011 executed ($12,800). |
| 9:30 AM | Alex M. re-reviews invoice SV-440 | CO-011 now executed. Budget updated. Invoice within budget. | Invoice SV-440 approved. Forwarded to Adaptive Build. ✓ |
| 3:00 PM | Sam W. responds to DEC-007 | "Need a furniture spec before I approve $35K. Ask Taylor for options." | DEC-007: status → needs-info. Open Task drafts request to Taylor R. |

**End of Day 9:** Open Tasks 4. Invoice gate caught a real sequencing issue (invoice before CO execution). SLA breaches: 0.

---

### Day 10 — Wednesday 2026-03-04

| Time | Event | Open Task Action | Result |
|---|---|---|---|
| 8:00 AM | Daily report | DEC-007 awaiting Taylor R. furniture spec. Lead times monitoring. | Routine |
| 10:00 AM | Email: new invoice, electrical sub | Invoice #ME-770, $15,200, `info@shb.studio`. | Gate: clean pass. Approved by Alex M. at 10:20 AM. ✓ |
| 1:00 PM | Email: vendor confirms LT-005 delivery date | Stone cladding: confirmed 3/20. Float now 0 (install date adjusted to 3/20). | LT-005 float: -2 → 0. No longer critical. At-risk → on-track. |
| 3:00 PM | Taylor R. sends furniture spec options | 3 options ($28K, $35K, $42K) with mood boards. | DEC-007 updated. Draft summary of 3 options posted to `#decisions`. |

**End of Day 10:** Open Tasks 4. LT-005 resolved to on-track. SLA breaches: 0. Day 12 consecutive breach-free.

---

### Day 11 — Thursday 2026-03-05

| Time | Event | Open Task Action | Result |
|---|---|---|---|
| 8:00 AM | Daily report | DEC-007 awaiting Sam W. choice. 3 lead-time items monitoring. | Report delivered |
| 9:00 AM | Kuan collects written feedback from Alex M. | PM feedback: "The daily report is the first thing I check. Invoice gate saved us twice (CM-2267 in baseline, SV-440 last week). Drafts are usable — I edit maybe 20% of them." | Feedback logged |
| 10:00 AM | Kuan collects feedback from Jordan K. | Super feedback: "Pre-task checklists are fine. Daily report helps me know what's arriving this week. Not extra work." | Feedback logged |
| 11:00 AM | Kuan collects feedback from Casey L. | Procurement feedback: "Lead-time tracking is the most useful part. Caught the stone cladding slip early enough to expedite. SUB-011 color change would have been missed without the system flagging it." | Feedback logged |
| 2:00 PM | Sam W. approves DEC-007 Option B ($35K) | "Go with Option B. Taylor's spec is solid." | DEC-007 approved. ✓ Casey L. to procure. |
| 3:00 PM | Email: warranty follow-up from tenant Unit 308 | "Repair is holding up great. Thank you." | WC-003 confirmation. No action needed. Logged. |

**End of Day 11:** Open Tasks 3 (all lead-time monitoring). Feedback collected from PM, Super, Procurement.

---

### Day 12 — Friday 2026-03-06

| Time | Event | Open Task Action | Result |
|---|---|---|---|
| 8:00 AM | Daily report | 3 Open Tasks (LT-005 on-track, LT-014 Week 2/10, LT-015 Week 2/4). 0 overdue. | Routine |
| 10:00 AM | Email: invoice from concrete sub | Invoice #CC-215, $48,000, `info@shb.studio`. | Gate: clean pass. Approved by Alex M. ✓ |
| 2:00 PM | Kuan compiles "caught vs missed" analysis | See below. | Analysis complete |
| 4:00 PM | **Week 2 Report generated** | See below. | Posted |

**Items caught by Open Tasks that would have been missed:**

| Item | What Open Tasks Caught | What Would Have Happened |
|---|---|---|
| Invoice CM-2267 (baseline) | Missing job #, cost code, and unverified CO backing | Entered in Adaptive Build with wrong coding. Reconciliation headache later. |
| Invoice SV-440 (Day 8) | CO not yet executed when invoice arrived | Invoice paid against unexecuted CO. Audit flag. |
| LT-005 float drift | Surfaced -8 days float in first daily report | Noticed 2-3 weeks later at schedule review. Expedite more expensive or impossible. |
| SUB-011 color change dependency | Flagged that lead time was frozen until submittal approved | Vendor starts production with wrong color. Costly rework. |
| DEC-005 vendor pricing expiry | Surfaced 4-day window to capture $42K savings | Pricing expires. Savings lost or renegotiation needed. |
| RFI-047 + pour dependency | Linked critical RFI to scheduled concrete pour | Pour delayed or proceeds without resolution (rework risk). |

---

## Week 2 Report — Friday 2026-03-06

```
WEEKLY OPEN TASK REPORT — SandBox
Week ending: 2026-03-06 | Report #2
Prepared by: Open Task system
Reviewed by: _______________

──────────────────────────────
SUMMARY
──────────────────────────────
                           This Week    Last Week    Trend
  Open Tasks (total):          3            3         Stable
  New created:                 3            6         Down (fewer new issues)
  Resolved:                    3           11         Down (less backlog)
  SLA breaches (active):      0            0         Zero (14 consecutive days)
  Drafts generated:            8           12         Down
  Drafts approved / sent:      7           11         Down
  Invoices through gate:       3            4         Stable
  Gate flags raised:           1            0         Up (CO sequencing catch)

──────────────────────────────
OPEN TASKS BY CATEGORY
──────────────────────────────
  RFI:           0 open | 0 new | 0 overdue
  Change Order:  0 open | 1 executed (CO-011) | 0 overdue
  Invoice:       0 open | 3 processed ($130,700) | 0 rejected | 1 flag (held then approved)
  Decision:      0 open | 1 resolved (DEC-007) | 0 overdue
  Submittal:     0 open | 0 new | 0 overdue
  Lead Time:     3 open | 0 new critical | All on-track or early-stage
  Warranty:      0 open | 0 new | All previous claims closed

──────────────────────────────
INVOICE GATE SUMMARY
──────────────────────────────
  #SV-440  | Stone vendor   | $67,500 | FLAG: CO not executed | Held → approved after CO-011 executed
  #ME-770  | Electrical sub | $15,200 | Pass  | Approved
  #CC-215  | Concrete sub   | $48,000 | Pass  | Approved

  Gate flags: 1 (CO sequencing — real issue caught)
  Gate accuracy: 100% (flag was correct)

──────────────────────────────
COST EXPOSURE
──────────────────────────────
  Open PCOs:                   $67,300 (down from $80,100)
  Executed this week:          CO-011 ($12,800)
  Current contract sum:        $4,274,700
  Exposure as % of contract:   1.6% (down from 1.9%)

──────────────────────────────
LEAD-TIME HEALTH
──────────────────────────────
  On track:   12 (including LT-005 now on-track)
  At risk:     0
  Critical:    0

──────────────────────────────
DESIGN RESPONSE PERFORMANCE
──────────────────────────────
  RFIs awaiting response:      0
  Submittals awaiting review:  0
  Items overdue (SHB Studio):  0 (2 consecutive weeks clear)

──────────────────────────────
2-WEEK TREND
──────────────────────────────
  SLA breaches:       2 (start) → 0 (Week 1) → 0 (Week 2)
  Open Tasks:         8 (start) → 3 (Week 1) → 3 (Week 2)
  Invoices gated:     0 (start) → 4 (Week 1) → 3 (Week 2)
  Gate issues caught: 1 (baseline CM-2267) + 1 (SV-440) = 2 in 14 days
  Decisions resolved: 3 (DEC-005, 006, 007)
  COs executed:       3 (PCO-009, CO-013, CO-011)
  Cost exposure:      3.0% → 1.9% → 1.6% (trending down)

──────────────────────────────
PATTERNS
──────────────────────────────
  1. System is at steady state. No backlog. New items are
     created and resolved within SLA windows.
  2. Invoice gate caught 2 real issues in 14 days. Both were
     sequencing/coding problems that would have caused
     downstream reconciliation work.
  3. Design response bottleneck (baseline pattern #1) has not
     recurred. Taylor R. responding within SLA since Week 1.
  4. Lead-time tracking prevented 2 costly surprises (LT-005
     expedite, SUB-011 color change).
  5. Daily report is the primary value driver per PM feedback.
     Drafts save ~15 min/day in message composition.

──────────────────────────────
ITEMS TO WATCH
──────────────────────────────
  LT-005   | Stone cladding delivery 3/20   | Low (on track)
  LT-014   | Glass railing (~May 1)         | Low (Week 2/10)
  LT-015   | Porcelain tile (~3/25)         | Low (Week 2/4)
```

---

## Days 13–14 — Decision Window

### Day 13 — Monday 2026-03-09

**Kuan compiles assessment.**

| Metric | Target | Actual | Pass? |
|---|---|---|---|
| Daily report accuracy | > 90% | ~95% (2 minor misclassifications in 14 days, both caught by PM) | Yes |
| Email classification | > 85% | ~92% (spot-check: 18/20 correct first pass) | Yes |
| Invoice gate coverage | 100% | 100% (7/7 invoices surfaced before Adaptive Build) | Yes |
| SLA breach detection | 100% | 100% (all breaches from baseline flagged; 0 new breaches missed) | Yes |
| False positives | < 10% | ~5% (1 flag in 20+ items that PM considered borderline) | Yes |
| Zero false approvals | 0 | 0 | Yes |
| Zero unsanctioned sends | 0 | 0 | Yes |
| PM assessment | "Same or less effort" | "Less effort. Daily report and invoice gate are the two things I'd miss most." | Yes |

**Items Open Tasks caught that humans would have missed (confirmed):** 6 items (see Day 12 analysis).

**Items Open Tasks got wrong:**
- 2 email misclassifications (vendor inquiry classified as submittal; general correspondence classified as RFI). Both corrected by PM in < 1 minute.
- 1 borderline flag (invoice for work that PM knew was pre-approved but Open Task flagged because the log wasn't updated yet). Correct behavior but felt like friction.

---

### Day 14 — Tuesday 2026-03-10

**Decision meeting: Kuan + Alex M. (PM) + Morgan D. (Owner's Rep)**

```
SHADOW ASSESSMENT — SandBox — 14-Day Summary

Duration: 2026-02-19 to 2026-03-10 (14 business days)

RESULTS
  All 8 success criteria met.
  6 real issues caught that would have been missed.
  3 minor errors in 14 days (all self-correcting).
  PM reports reduced effort and better visibility.
  Zero safety incidents (no false approvals, no unsanctioned sends).

RECOMMENDATION
  Proceed to Phase 2 authority evaluation.
  Candidate authority levels (per production-shadow-playbook.md):
    Level 1: Auto-Log (eliminate copy-paste to Sheets)
    Level 2: Auto-Notify (internal Slack notifications)
    Level 3: Auto-Forward Invoice (after PM approve click)
    Level 4: GHL Draft-to-Send (bidding outreach)

  Recommended first activation: Level 1 (Auto-Log) + Level 2 (Auto-Notify)
  with 7-day probation per playbook rules.

  Level 3 and Level 4 deferred until Level 1+2 probation complete.

DECISION
  [ ] GO — Activate Level 1 + Level 2 with probation
  [ ] ADJUST — Extend shadow by ___ days with changes: ___
  [ ] PAUSE — Document issues, revise system, re-evaluate

  Signed: _____________ (Kuan)
  Signed: _____________ (PM)
  Signed: _____________ (Owner's Rep)
  Date:   _____________
```
