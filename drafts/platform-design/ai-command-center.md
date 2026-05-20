---
status: draft
owner: Kuan
last-reviewed: 2026-05-20
---

# AI Command Center — Multi-Agent Architecture

## Purpose

Centralize all AI tools (cloud APIs + local compute) under a single Slack-based command surface with Viktor as orchestrator. All configurations, routing logic, and agent registries live in this repo as the source of truth.

---

## Architecture Overview

```
                         S L A C K
                    ┌────────────────────────────────┐
                    │   Viktor = Orchestrator          │
                    │   Routes tasks to best AI agent  │
                    │   Returns results to Slack       │
                    └──────────────┬─────────────────┘
                                   │
        ┌────────┬────────┬────────┼────────┬────────┬────────┐
        │        │        │        │        │        │        │
     Claude   Gemini   OpenAI    Nim    Arch-    Ollama    Future
     Code     Pro      Pro       AI     Synth    Local     Agents
        │        │        │        │        │        │
     Coding   Docs    Creative  GPU     Arch    Private
     Debug    Vision   Image    Render  Design   Bulk
     Git      Long-ctx DALL-E   Batch   Plans    RAG
```

---

## Agent Registry

| Agent | Provider | Access Method | Best For | Cost Model |
|---|---|---|---|---|
| **Viktor** | Foundry.io (Cloud) | Slack native | Orchestration, email, Smartsheet, integrations | Subscription |
| **Claude Code** | Anthropic | CLI on local machines | Codebase edits, debugging, PR reviews, refactoring | API usage / Max plan |
| **Gemini Pro** | Google | REST API | Large doc analysis (1M+ token context), Drive/Sheets, vision | API usage |
| **OpenAI Pro** | OpenAI | REST API | Image generation (DALL-E), voice (Whisper), creative writing | API usage / Pro plan |
| **Nim AI** | NVIDIA | REST API / Local GPU | GPU-accelerated inference, batch processing, rendering pipelines | API usage |
| **ArchSynth** | ArchSynth | TBD (API or browser) | Floor plans, massing studies, design generation, code compliance | TBD |
| **Ollama Local** | Self-hosted | HTTP via Cloudflare Tunnel | Private doc processing, embeddings, RAG, bulk inference | Free (hardware only) |

---

## Local Compute Fleet

| Machine | Role | Hostname | Model(s) | Tunnel URL | Status |
|---|---|---|---|---|---|
| Mac Mini (M-series) | Coordinator — always-on, lightweight | `agent-macmini` | llama3:8b, mistral | TBD | Pending setup |
| GPU Workstation #1 | Heavy Lifter — large model, doc analysis | `agent-gpu1` | llama3:70b | TBD | Pending setup |
| GPU Workstation #2 | Heavy Lifter 2 — parallel, embeddings | `agent-gpu2` | llama3:70b, nomic-embed-text | TBD | Pending setup |
| Max's GPU Workstation | Flex Agent — overflow / after-hours | `agent-gpu-max` | llama3:70b or codellama:34b | TBD | Pending setup |
| Showroom Desktop | Background Agent — batch jobs off-hours | `agent-showroom` | mistral, llama3:8b | TBD | Pending setup |

### Tunnel Configuration

Each machine runs:
1. **Ollama** — serves models on `localhost:11434`
2. **Cloudflare Tunnel** — exposes Ollama API via secure HTTPS URL

Quick tunnel (temporary):
```bash
cloudflared tunnel --url http://localhost:11434
```

Named tunnel (permanent, recommended):
```bash
cloudflared tunnel login
cloudflared tunnel create <machine-name>
cloudflared tunnel route dns <machine-name> <machine-name>.shb.studio
```

---

## Routing Logic

Viktor selects the optimal agent based on task type. The routing table below defines the decision logic.

### Task → Agent Routing Table

| Task Type | Primary Agent | Fallback | Reasoning |
|---|---|---|---|
| Code review / PR / debugging | Claude Code | Viktor | Best-in-class coding |
| Codebase refactoring | Claude Code | Viktor | File-level edits, git-native |
| Large document analysis (>50 pages) | Gemini Pro | Ollama (GPU) | 1M+ token context window |
| Google Drive / Sheets analysis | Gemini Pro | Viktor | Google-native integration |
| Image generation | OpenAI (DALL-E) | Nim AI | Best quality general images |
| Architectural rendering | Nim AI / ArchSynth | OpenAI | Domain-specific generation |
| Floor plan / massing study | ArchSynth | Gemini Pro (vision) | Architecture-specific AI |
| Voice transcription | OpenAI (Whisper) | Gemini Pro | Proven accuracy |
| Embeddings / RAG indexing | Ollama Local | Gemini Pro | Free, private, parallel |
| Sensitive doc processing | Ollama Local | — | Data stays on-premises |
| Bulk email / receipt parsing | Ollama Local (GPU) | Viktor | Parallel throughput |
| Contract / legal clause search | Ollama Local (RAG) | Gemini Pro | Private + fast vector search |
| General chat / Q&A | Viktor | Ollama Local | Already in Slack |
| Email / Smartsheet / integrations | Viktor | — | Native tool access |
| GPU batch inference | Nim AI | Ollama Local (GPU) | NVIDIA-optimized |

### Routing Priority
1. **Privacy-sensitive** → Always Ollama Local
2. **Architecture-specific** → ArchSynth first
3. **Large context** → Gemini Pro first
4. **Coding** → Claude Code first
5. **Creative / image** → OpenAI first
6. **GPU compute** → Nim AI or local GPU
7. **Everything else** → Viktor handles directly

---

## Slack Channel Architecture

| Channel | Purpose | Agents Active |
|---|---|---|
| `#ai-command` | Main command center — task dispatch, status, results | Viktor (all routing) |
| `#ai-code` | Code tasks, PR reviews, debugging logs | Claude Code via Viktor |
| `#ai-design` | Architecture, renderings, massing studies | ArchSynth, Nim AI via Viktor |
| `#ai-docs` | Document analysis, Drive processing | Gemini Pro via Viktor |
| `#ai-local` | Local agent status, health checks, RAG queries | Ollama fleet via Viktor |
| `#agent-debrief` | Daily debrief (existing) | Viktor |

---

## API Key Management

| Service | Key Location | Connected By |
|---|---|---|
| Anthropic (Claude Code) | Local machine env var: `ANTHROPIC_API_KEY` | Kuan |
| Google (Gemini Pro) | TBD — env var or service account | Kuan |
| OpenAI | TBD — env var: `OPENAI_API_KEY` | Kuan |
| NVIDIA Nim | TBD — env var: `NVIDIA_API_KEY` | Kuan |
| ArchSynth | TBD — depends on access method | Kuan |
| Ollama | No key needed — tunnel URLs only | Viktor |

**Security:** API keys are stored as environment variables on local machines or in Viktor's secure config. Never committed to this repo.

---

## Data Flow & Privacy Rules

```
┌─────────────────────────────────────────────────┐
│                PRIVACY BOUNDARY                  │
│                                                  │
│  Sensitive Data (financials, PII, contracts)     │
│  → ALWAYS processed by Ollama Local              │
│  → NEVER sent to cloud APIs without approval     │
│                                                  │
│  General Data (public docs, code, creative)      │
│  → Routed to best cloud agent                    │
│  → Results cached locally if reusable            │
│                                                  │
│  All results return to Slack via Viktor           │
│  All governance stays in foundry-ai repo          │
└─────────────────────────────────────────────────┘
```

### Human Gates (per CLAUDE.md)

All AI Command Center operations follow the existing human gate framework:
- **Draft gate** — AI produces draft, human reviews
- **Send gate** — AI drafts external message, human confirms
- **Route gate** — Viktor suggests routing, auto-routes for standard tasks

---

## Implementation Phases

### Phase 1: Foundation (Current)
- [ ] Install Ollama on all machines
- [ ] Set up Cloudflare Tunnels
- [ ] Register tunnel URLs with Viktor
- [ ] Viktor builds routing logic
- [ ] Test connectivity across all agents
- [ ] Create Slack channels

### Phase 2: Cloud API Integration
- [ ] Connect Gemini Pro API
- [ ] Connect OpenAI Pro API
- [ ] Connect NVIDIA Nim API
- [ ] Investigate ArchSynth API/integration method
- [ ] Build unified response formatting

### Phase 3: RAG & Knowledge Base
- [ ] Embed SHB Google Drive docs via Ollama (nomic-embed-text)
- [ ] Build vector search index on local GPU station
- [ ] Enable natural language queries across all company docs
- [ ] Connect Smartsheet data to RAG pipeline

### Phase 4: Advanced Orchestration
- [ ] Auto-routing based on task classification
- [ ] Load balancing across local agents
- [ ] Health monitoring dashboard
- [ ] Cost tracking per agent/task
- [ ] Claude Code integration for repo-level coding tasks

---

## Health Monitoring

Viktor monitors all agents and reports status in `#ai-local`:

| Check | Frequency | Alert Threshold |
|---|---|---|
| Tunnel connectivity | Every 15 min | 2 consecutive failures |
| Model availability | Every 30 min | Model not responding |
| GPU utilization | On-demand | >90% sustained |
| Response latency | Per-request | >30s for simple tasks |

---

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-05-20 | Initial architecture document | Viktor AI |
