# Hermes — Phase 0 Skeleton

Spec: `drafts/platform-design/hermes-sms-watcher.md`
Governance: `CLAUDE.md` §5 (SMS intake), §6 (Identity gate)

## What this is

The Hermes watcher in skeleton form. It runs end-to-end against **simulator adapters** today (no secrets needed) and swaps to real adapters when env vars are present. This matches the existing `backend/src/simulators/` pattern.

## Pipeline

```
POST /api/hermes/sms
   │
   ▼
normalizeGhlSms()           ← dashboard/src/lib/hermes/normalizer.ts
   │
   ▼
runHermes(inquiry)          ← dashboard/src/lib/hermes/orchestrator.ts
   │
   ├─ identityAdapter().resolve()    ← identity.ts   (sim ↔ GHL Contacts API)
   ├─ intentAdapter().classify()     ← intent.ts     (heuristic ↔ Anthropic)
   ├─ retrieverFor(intent).retrieve() ← retrievers.ts (sim ↔ Drive + Smartsheet)
   ├─ composeDraft()                 ← drafter.ts
   ├─ slackAdapter().postDraft()     ← slack.ts      (sim ↔ chat.postMessage)
   └─ logBotEvent()                  ← logger.ts     (sim ↔ #foundry-bot-log)
```

## How to test locally

```bash
cd dashboard
npm install
npm run dev
# in another shell:
curl -X POST http://localhost:3000/api/hermes/sms \
  -H 'content-type: application/json' \
  -d '{"phone":"+15551110002","message":"when does CO-14 start?"}'
```

You should see a formatted Hermes draft printed to the dev-server stdout (the simulator's "Slack post"). The HTTP response includes the draft JSON.

Try other inputs:

- `"what's in the tile contract scope?"` → `contract_scope`
- `"when does tile start?"` → `schedule`
- `"latest A-301?"` → `drawings_specs`
- `"random text"` → `unknown` (routes to PM)
- `phone: "+15559999999"` → identity gate blocks (still posts a holding draft)

## Env vars (Phase 0 → live)

All are **optional** for Phase 0 — adapters default to simulators when unset. See `.env.example`.

| Var | Adapter | Phase needed |
|---|---|---|
| `GHL_WEBHOOK_SECRET` | webhook signature verification | Phase 0 live |
| `GHL_API_KEY` | identity (GHL Contacts lookup) | Phase 0 live |
| `ANTHROPIC_API_KEY` | intent classification via LLM | Phase 0 live (recommended) |
| `SLACK_BOT_TOKEN` | post to `#foundry-ask` | Phase 0 live |
| `SLACK_HERMES_CHANNEL` | channel id (e.g. `C0XXX`) | Phase 0 live |
| `SLACK_BOTLOG_CHANNEL` | channel id for `#foundry-bot-log` | Phase 0 live |
| `DRIVE_SERVICE_ACCOUNT_JSON` | retrievers: contracts, CO log, drawings index | Phase 0 live |
| `SMARTSHEET_API_TOKEN` | retriever: schedule | Phase 0 live |
| `GHL_OUTBOUND_NUMBER_ID` | outbound SMS via GHL on ✅ reaction | **Phase 1 only** |

## What's NOT in this skeleton (intentional)

- **No outbound SMS.** Phase 0 is shadow-only. Phase 1 adds a reaction handler that calls GHL's outbound SMS endpoint after PM ✅, and writes the approved Q&A to `Inquiries_Log`.
- **No real Slack reaction handler.** Comes in Phase 1.
- **No real adapter implementations.** Each `Real*` class throws with a clear message pointing here. Replace stubs with real API calls once credentials are provisioned and end-to-end test is scheduled.
- **No persistence.** Phase 0 events are stdout-logged. Drive Sheet writes land with Phase 1.

## Adding the real adapters

When credentials are ready, each adapter file has a `Real*` class with a documented endpoint. Pattern: implement the method, keep the simulator class intact (used in tests), let `*Adapter()` choose based on env var presence.
