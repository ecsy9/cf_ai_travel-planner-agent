# Travel Planner Agent

An AI chat app for travel planning, built on Cloudflare's edge platform. Ask for itineraries, hotel suggestions, or travel tips — responses stream live using Llama 3.1.

**Live Demo:** https://travel-planner-simple.elinorcsy.workers.dev

## Features

- Real-time streaming responses via SSE
- Per-user persistent conversation history (each browser gets its own isolated session)
- Markdown rendering — bold, bullet points formatted in the UI
- Edge-deployed globally via Cloudflare Workers

## Architecture

- **Cloudflare Workers** — handles HTTP routing and serves static assets
- **Durable Objects** — one instance per user (keyed by a `localStorage` UUID), each with its own SQLite-backed conversation history
- **Workers AI** — runs Llama 3.1 8B at the edge via the `AI` binding
- **Vercel AI SDK (`ai`) + `workers-ai-provider`** — `streamText` with SSE streaming back to the client
- **Vanilla JS frontend** — no framework, served from `public/`

## Setup

Requires Node.js v20+ 

```bash
git clone https://github.com/YOUR_USERNAME/travel-planner-agent.git
cd travel-planner-agent
npm install
```

**Dev:**
```bash
npx wrangler dev --remote
```
Open http://localhost:8787

**Deploy:**
```bash
npx wrangler deploy
```

## Structure

```
public/       # HTML + JS frontend
src/
  server.js            # Worker entry point, request routing
  travelPlannerAgent.js # AIChatAgent subclass — streaming AI logic
wrangler.jsonc         # Cloudflare config (DO bindings, AI, Assets)
```

