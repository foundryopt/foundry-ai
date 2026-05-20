"""
Calendar Daily Brief Generator

Produces a formatted daily calendar overview for Kuan across kc@shb.studio
and kc@foundryfund.com calendars.

Used by the calendar/daily-brief cron.
"""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class CalendarEvent:
    """Single calendar event."""
    summary: str
    start: str  # Formatted time string
    end: str
    location: str = ""
    attendees: list = field(default_factory=list)
    calendar: str = ""  # Which calendar it's on
    is_all_day: bool = False
    has_conflict: bool = False
    meet_link: str = ""


@dataclass
class CalendarBrief:
    """Daily calendar brief."""
    date: str  # e.g., "Tuesday, May 20, 2026"
    events_today: list = field(default_factory=list)
    events_tomorrow: list = field(default_factory=list)
    conflicts: list = field(default_factory=list)

    def to_slack_blocks(self) -> list[dict]:
        """Generate Slack blocks for the calendar brief."""
        blocks = []

        blocks.append({
            "type": "header",
            "text": {"type": "plain_text", "text": f"📅 Calendar Brief — {self.date}"}
        })

        # Today's events
        if self.events_today:
            lines = [f"*Today — {len(self.events_today)} events:*"]
            for ev in self.events_today:
                time_str = "All day" if ev.is_all_day else f"{ev.start}–{ev.end}"
                conflict_flag = " ⚠️ CONFLICT" if ev.has_conflict else ""
                cal_tag = f" _({ev.calendar})_" if ev.calendar else ""
                lines.append(f"• *{time_str}*{conflict_flag} — {ev.summary}{cal_tag}")
                if ev.location:
                    lines.append(f"  📍 {ev.location}")
                if ev.attendees:
                    lines.append(f"  👥 {', '.join(ev.attendees[:5])}")
                    if len(ev.attendees) > 5:
                        lines.append(f"  _+{len(ev.attendees) - 5} more_")
            blocks.append({
                "type": "section",
                "text": {"type": "mrkdwn", "text": "\n".join(lines)}
            })
        else:
            blocks.append({
                "type": "section",
                "text": {"type": "mrkdwn", "text": "*Today:* No events scheduled ✨"}
            })

        # Conflicts
        if self.conflicts:
            lines = ["*⚠️ Scheduling Conflicts:*"]
            for conflict in self.conflicts:
                lines.append(f"• {conflict}")
            blocks.append({
                "type": "section",
                "text": {"type": "mrkdwn", "text": "\n".join(lines)}
            })

        # Tomorrow preview
        blocks.append({"type": "divider"})
        if self.events_tomorrow:
            lines = [f"*Tomorrow — {len(self.events_tomorrow)} events:*"]
            for ev in self.events_tomorrow:
                time_str = "All day" if ev.is_all_day else f"{ev.start}–{ev.end}"
                lines.append(f"• *{time_str}* — {ev.summary}")
            blocks.append({
                "type": "section",
                "text": {"type": "mrkdwn", "text": "\n".join(lines)}
            })
        else:
            blocks.append({
                "type": "section",
                "text": {"type": "mrkdwn", "text": "*Tomorrow:* Clear schedule"}
            })

        return blocks


def detect_conflicts(events: list[CalendarEvent]) -> list[str]:
    """Find overlapping timed events."""
    conflicts = []
    timed = [e for e in events if not e.is_all_day]

    for i in range(len(timed)):
        for j in range(i + 1, len(timed)):
            # Simple overlap check using string times (HH:MM format)
            if timed[i].end > timed[j].start and timed[i].start < timed[j].end:
                conflicts.append(
                    f"_{timed[i].summary}_ ({timed[i].start}–{timed[i].end}) "
                    f"overlaps with _{timed[j].summary}_ ({timed[j].start}–{timed[j].end})"
                )
                timed[i].has_conflict = True
                timed[j].has_conflict = True

    return conflicts


if __name__ == "__main__":
    # Test
    events = [
        CalendarEvent("Team Standup", "9:00 AM", "9:30 AM", calendar="kc@shb.studio",
                       attendees=["admin@shb.studio", "mlin@shb.studio"]),
        CalendarEvent("Investor Call", "9:15 AM", "10:00 AM", calendar="kc@foundryfund.com",
                       location="Zoom"),
        CalendarEvent("Site Visit - Wieland", "2:00 PM", "4:00 PM", calendar="kc@shb.studio",
                       location="Wieland Project Site"),
    ]

    conflicts = detect_conflicts(events)
    brief = CalendarBrief(
        date="Tuesday, May 20, 2026",
        events_today=events,
        events_tomorrow=[],
        conflicts=conflicts,
    )

    import json
    print(json.dumps(brief.to_slack_blocks(), indent=2))
