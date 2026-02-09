---
status: draft
owner: Kuan
last-reviewed: 2026-02-08
---

# Phase F — Live Human Pilot (Shadow + Consent)

## Purpose

Validate dashboard instrumentation with **real humans and real data**, without behavior change risk. This phase determines **whether KPI visibility should ever exist**. No metrics, no scores, no rankings are shown to any user. The system observes silently — humans behave normally.

Phase F runs after:
- Phase 2 probation is confirmed (Level 1 + Level 2 active)
- Dashboard v1 is deployed and stable
- Dashboard instrumentation (Phase E) is complete and tested against mock data

---

## Objective

Answer one question: **Can the system reliably track task lifecycle events from live data?**

Specifically:
- Can we determine when a task was opened, acknowledged, and resolved using only system-of-record data?
- Do real humans create patterns that match our event model, or does reality break our definitions?
- Is the event stream clean enough that derived metrics (if ever enabled) would be trustworthy?

If event tracking is unreliable, noisy, or ambiguous, KPIs must not be built on top of it.

---

## Pilot Users

Select **2–3 real users** across different roles:

| Slot | Role | Rationale |
|---|---|---|
| Pilot User 1 | PM | Highest Open Task volume, most diverse categories |
| Pilot User 2 | Superintendent or Procurement | Field or vendor-facing, different workflow patterns |
| Pilot User 3 (optional) | Principal or Owner's Rep | Escalation/decision role, lower volume, longer response times |

### Selection Criteria

- Must be willing (explicit opt-in, not assigned)
- Must understand this is testing **system accuracy, not people performance**
- Must be told they can withdraw at any time with zero consequence
- Must be a current active user of Smartsheet, Slack, and the dashboard

### Consent Protocol

Tell each pilot user **exactly this**:

> "We are testing system accuracy, not people performance. We're checking whether our system can correctly track when tasks are opened, acknowledged, and resolved. We are not measuring how fast you respond. We are not scoring you. No one will see individual metrics. You don't need to change how you work. If you want to stop at any time, just tell me."

Document consent:
- Date of consent conversation
- User acknowledged the statement above
- No written signature required — verbal consent is sufficient for internal pilot
- Log consent in `#foundry-bot-log` with timestamp

---

## Data Sources (Read-Only)

All connections are **read-only**. No writes to any system during Phase F.

| Source | What We Read | What We Do NOT Read |
|---|---|---|
| Smartsheet | Tasks, assignments, dates, status changes | Cell-level edit history, user activity logs |
| Slack | Thread views, reply timestamps, reaction metadata (pilot users only) | Message content, DMs, private channels |
| Dashboard | View events, tab switches, detail panel opens (pilot users only) | Nothing written back to dashboard |

### Access Controls

- Instrumentation enabled **only for pilot users**
- All other users remain on mock data or no-tracking mode
- Pilot users are flagged internally (server-side config, not in UI)
- No visual indicator in the dashboard distinguishes pilot from non-pilot users
- Pilot user flag stored in environment config, not in client code

---

## What We Collect

During the 7-day pilot, collect **only** the following. No other data is captured.

### 1. Event Counts

| Event | Source | Example |
|---|---|---|
| Task created | Smartsheet row added | RFI-049 created |
| Task assigned | Smartsheet assignment field | RFI-049 assigned to Taylor R. |
| Task acknowledged | Slack thread reply by owner | Taylor R. replied in RFI-049 thread |
| Task resolved | Smartsheet status → closed | RFI-049 status changed to Resolved |
| Dashboard view | Dashboard event log | Taylor R. opened RFI-049 detail panel |

Count only. No content. No text. No attachments.

### 2. Error Code Frequencies

| Error Code | Meaning |
|---|---|
| `E-NO-ASSIGN` | Task exists but no owner assigned |
| `E-NO-TIMESTAMP` | Event detected but timestamp cannot be determined |
| `E-AMBIG-ACK` | Cannot determine if a Slack reply is an acknowledgment or a question |
| `E-MULTI-OWNER` | Task reassigned — unclear which owner's timeline to track |
| `E-PHANTOM-CLOSE` | Task marked resolved with no intermediate events |
| `E-REOPEN` | Task reopened after resolution — timeline model broken |
| `E-SOURCE-GAP` | Event expected (based on SLA) but no matching source event found |
| `E-DUPLICATE` | Same event detected from multiple sources |

### 3. Event Ordering Patterns

For each task with a clean timeline, record the event sequence:

```
Created → Assigned → Acknowledged → [Working] → Resolved
```

Flag deviations:
- Acknowledged before Assigned
- Resolved without Acknowledged
- Multiple Acknowledged events
- Assigned → Reassigned → Acknowledged (by which owner?)

### 4. Missing or Ambiguous Cases

Free-form log of cases where the system cannot determine what happened:

```
2026-02-XX | RFI-0XX | Cannot determine acknowledgment — owner replied
    in a different Slack thread that references this RFI
2026-02-XX | INV-XXXX | Invoice resolved in Adaptive Build but no
    corresponding Smartsheet status change
```

---

## What We Do NOT Collect

**Explicitly forbidden** during Phase F:

| Prohibited | Why |
|---|---|
| Response time calculations | This is a KPI — Phase F determines if KPIs should exist |
| Any ranking or scoring | No user is compared to any other user |
| Manager access to individual metrics | No individual data leaves the instrumentation log |
| Corrective nudges | No notification says "you haven't responded to X" |
| Any KPI visibility to any user | The word "KPI" does not appear in any user-facing surface |
| Behavior change prompts | No message implies a user should work differently |
| Performance dashboards | No view shows who is fast or slow |

If any of the above is accidentally generated, the pilot stops immediately.

---

## Pilot Duration

**Minimum 7 calendar days.** Can extend if:
- First 3 days have insufficient event volume (fewer than 10 total events)
- A critical ambiguity pattern emerges on day 6–7 that needs more data
- A pilot user is unavailable for 3+ days (extend to compensate)

Maximum extension: 7 additional days (14 total). If 14 days is insufficient, the answer is "event model needs redesign."

### Daily Routine During Pilot

| Time | Action | Who |
|---|---|---|
| 8:00 AM | Review overnight event log for errors | Kuan |
| — | Check error code counts | Kuan |
| — | Flag any ambiguous cases | Kuan |
| 5:00 PM | Day-end event count snapshot | Automated |
| — | No communication to pilot users about progress | — |

### Pilot Calendar

| Day | Focus | Notes |
|---|---|---|
| Day 1 | Baseline event capture | Expect high error rate — calibration day |
| Day 2 | First pattern check | Are events arriving in expected order? |
| Day 3 | Ambiguity review | Catalog all `E-AMBIG-*` cases |
| Day 4 | Mid-pilot check | Error rate trending down? |
| Day 5 | Source gap analysis | Which events are we missing and why? |
| Day 6 | Pre-report data freeze | No instrumentation changes after this point |
| Day 7 | Final data collection | Compile all metrics for report |

---

## End-of-Pilot Report

Produce **one report only**. No interim reports. No dashboards. One document.

### Report Structure

#### 1. Timeline Cleanliness

**Metric:** % of tasks with clean timelines (Created → Assigned → Acknowledged → Resolved, all timestamps present, no errors)

| Rating | Threshold | Meaning |
|---|---|---|
| Clean | All events present, correct order, no errors | Event model works for this task |
| Minor gap | 1 missing event, inferrable from context | Event model works with minor enhancement |
| Ambiguous | Cannot determine one or more events | Event model needs work for this pattern |
| Broken | Events contradict or timeline impossible | Event model fails for this pattern |

Target: **>80% Clean or Minor Gap** to proceed.

#### 2. Top 5 Ambiguity Patterns

Ranked by frequency. For each pattern:
- Description of what happened
- How many tasks were affected
- Why the system couldn't resolve it
- Proposed fix (definition change, new source, or "unfixable")

Example:

> **Pattern 1: Cross-thread acknowledgment** (4 tasks)
> Owner replied to the RFI in a different Slack channel than the one the system monitors. System recorded no acknowledgment. Fix: Expand Slack source to include `#construction-ops` channel.

#### 3. Error Rate Trend

| Day | Total Events | Errors | Error Rate |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |

Target: **Error rate <1% by day 7.**

Acceptable trajectory: High on day 1 (calibration), declining through the week.

#### 4. Recommendation

One of three outcomes:

| Recommendation | Condition | Next Step |
|---|---|---|
| **Proceed** | Error rate <1% by day 7, >80% clean timelines, no pilot user discomfort, "what counts as a response" is explainable in plain English | Design KPI visibility spec (Phase G) |
| **Adjust Definitions** | Error rate 1–5%, 60–80% clean timelines, ambiguity patterns are fixable | Revise event definitions, re-run Phase F for 7 more days |
| **Pause KPI Concept** | Error rate >5%, <60% clean timelines, or fundamental ambiguity in "what counts as a response" | KPIs are not viable with current data sources. Revisit after system-of-record improvements. |

---

## Exit Criteria

**All must be true** to proceed past Phase F:

1. Error rate <1% by day 7
2. No pilot user discomfort (verified by direct conversation, not survey)
3. You can clearly explain **"what counts as a response"** in plain English, with no exceptions or caveats that require technical knowledge
4. >80% of tracked tasks have clean or minor-gap timelines
5. Top ambiguity patterns have identified fixes (even if not yet implemented)

If any criterion fails, Phase F outcome is "Adjust Definitions" or "Pause KPI Concept."

---

## Safeguards

### Pilot User Protection

- No pilot user's name appears in any report except the consent log
- Report uses anonymized identifiers (User A, User B, User C)
- No manager, executive, or stakeholder sees individual-level data
- Pilot users can withdraw at any time — their data is deleted from the event log
- If a pilot user asks "how am I doing?", the answer is always: "We're testing the system, not you. We don't have any performance data."

### System Protection

- All instrumentation writes to a **separate event log**, not to any system of record
- Event log is append-only during the pilot — no edits, no deletions (except user withdrawal)
- Event log is deleted 30 days after the pilot report is finalized
- No instrumentation code runs in production paths — it is a parallel observer

### Escalation

If at any point during the pilot:
- A pilot user expresses discomfort → pause their participation, continue with remaining users
- The event log captures data outside the permitted scope → stop the pilot, audit the log, delete excess data
- A non-pilot user's data is accidentally captured → delete immediately, document the incident

---

## Relationship to Other Phases

| Phase | Relationship |
|---|---|
| Phase 2 (Active) | Phase F requires Level 1 + Level 2 to be confirmed (probation passed) |
| Phase 3 (Not Active) | Phase F is independent of Phase 3. Phase 3 can activate before, during, or after Phase F |
| Phase 4 (Not Active) | Phase 4 cannot activate until Phase F produces a "Proceed" recommendation |
| Phase E (Dashboard instrumentation) | Phase F validates Phase E instrumentation against real data |
| Phase G (KPI visibility, not yet defined) | Phase G is designed only if Phase F produces "Proceed" |

---

## What Phase F Is Not

- It is **not a performance review** of any human
- It is **not a validation of the dashboard UI** (that's covered by Phase E + deployment)
- It is **not a test of whether humans will change behavior** (that's Phase G territory)
- It is **not a production launch** of any new feature — it's silent observation
- It is **not optional** — KPI visibility cannot be built without passing Phase F
