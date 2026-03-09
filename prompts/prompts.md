# AI Prompts — Travel Planner Agent

Prompts used to build and iterate on this project with AI assistance.

---

## 1. Initial build

> Build a simple AI travel planner chat app using Cloudflare Workers. It should let users type a travel question and get a streamed response from an AI model. Use Cloudflare Workers AI with Llama 3.1. Keep the frontend simple with vanilla JS.

---

## 2. Persistent conversation history

> Add persistent conversation history so the agent remembers what was said earlier in the chat. Use Cloudflare Durable Objects to store the messages.

---

## 3. Fix truncated responses

> The AI responses are getting cut off in the middle. How do I increase the max output length?

---

## 4. Fix deploy errors after npm install

> After running npm install and npx wrangler deploy I'm getting build errors: "Could not resolve agents", "Could not resolve ai", "Could not resolve workers-ai-provider". How do I fix this?

---

## 5. Fix HTTP 400 after upgrading packages

> After upgrading to ai@6 and installing @cloudflare/ai-chat, all messages return HTTP 400. The console shows "Stream Error: HTTP 400" on every send.

---

## 6. UI redesign

> Format the page better. Make it look like a proper chat app with chat bubbles, a clean layout, and render markdown formatting like bold text and bullet points.

---

## 7. Multi-user session isolation

> Currently the app uses a hardcoded /default instance so all users share the same conversation history. How do I give each user their own isolated session?

---

## 8. README

> Update the README to reflect the current state of the project — features, architecture, setup instructions, and project structure.

---

## Notes

- Responses were cut off because `ai@6` renamed `maxTokens` → `maxOutputTokens` (silently ignored, not a runtime error)
- The `ai@6` upgrade also changed `UIMessage` format from `{ role, content }` to `{ role, parts: [{ type, text }] }`, breaking `convertToModelMessages`
- `saveMessages` in the new `@cloudflare/ai-chat` triggers `onChatMessage` internally — use `persistMessages` instead in HTTP POST handlers to avoid double-firing
