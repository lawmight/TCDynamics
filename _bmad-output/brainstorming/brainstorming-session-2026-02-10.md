---
stepsCompleted: [1]
inputDocuments: []
session_topic: 'Post-login app (TCDynamics) + growth/monetization — improve empty shell using Nia-indexed advanced app configuration ideas'
session_goals: 'Prioritized roadmap (task queue for today/tomorrow), not weeks; lenses E (Product/UX after login) + F (Growth/monetization hooks)'
selected_approach: '2 (AI-Recommended) + 1 (User-Selected) — Nia-driven suggestions with user curation; lenses E + F'
techniques_used: []
ideas_generated: []
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** Tomco  
**Date:** 2026-02-10

## Session Overview

**Topic:** Post-login app (TCDynamics monorepo, app behind Clerk) and growth/monetization. Use Nia-indexed resources about advanced app configuration to improve the current “empty shell” and produce a concrete, short-horizon roadmap.

**Goals:** A tight, prioritized task list you can execute today or tomorrow (no “weeks” framing). Focus: **E** (Product/UX after login) and **F** (Growth/monetization hooks).

### Context Guidance

- **App today:** `/app` behind `ProtectedRoute`: Chat (Vertex), Files/KB (upload + list), Analytics (summary), Settings/email. Polar checkout (starter/professional/enterprise) exists; pricing/checkout-success/demo/get-started are in place.
- **Gap:** App is structurally there but feels empty: no onboarding, no plan-aware UX, no in-app usage limits or upgrade prompts. Analytics API is global (chat count, uploads, active users), not per-user or plan-aware.
- **Nia (user-nia):** Searched indexed sources. Findings: Adapty (subscriptions, access levels, product config); Shopify App Billing (one-time charges, lifecycle); Twenty (feature flags); Next.js SaaS Starter (auth, Stripe, dashboard). Recommendation from Nia: add more docs/sources if you want deeper “advanced app configuration” coverage; current index is strong on billing/subscription patterns and dashboard-style apps.

### Session Setup

- Approach: **AI-Recommended (2) + User-Selected (1)**. Lenses: **E** (Product/UX after login), **F** (Growth/monetization).
- Roadmap below is a prioritized task queue derived from codebase review + Nia-inspired patterns (access levels, usage limits, dashboard configuration, billing lifecycle).

---

## Prioritized Roadmap (E + F)

Execute in order when you want maximum impact per unit time. Each item is scoped so it can be done in a short burst (today/tomorrow).

### E — Product/UX after login

1. **Post-login onboarding (first-time only)**  
   - Detect first visit to `/app` (e.g. localStorage or backend “onboarding completed” flag).  
   - Short flow: what’s Chat / Files / Analytics + one guided action (e.g. “Send a message” or “Upload a file”).  
   - Dismissible; don’t block power users.

2. **Empty states with clear CTAs**  
   - Chat: when no messages yet, explain value + “Send your first message.”  
   - Files: you already have upload UI; add a short line like “Your first document will be used to ground answers in Chat.”  
   - Analytics: if no data, “Use Chat and upload files to see insights here.”

3. **App shell polish**  
   - Ensure nav labels and mobile sidebar match the product (e.g. “Chat”, “Knowledge base”, “Usage”).  
   - Consider one “Account” or “App settings” entry that groups profile, email prefs, and (later) plan/upgrade.

4. **Chat session UX**  
   - Option A: “New chat” creates a new session (new `sessionId`), show a simple list of recent sessions (titles or “Chat 1, 2…”).  
   - Option B: Keep single thread but add a “Clear and start over” so it doesn’t feel stuck.  
   - Improves perceived “product” without changing backend yet.

### F — Growth / monetization hooks

5. **Plan-aware app**  
   - Get current plan per user: from Polar (existing checkout/session) or a small “plan” field on user/org in MongoDB, synced by webhook or after checkout-success.  
   - Show plan in app (e.g. “Starter” badge in sidebar or settings).  
   - No enforcement yet—just visibility.

6. **Usage limits by plan**  
   - Define limits (e.g. messages/month, files, or storage) per plan in config.  
   - Backend: in chat and file-upload handlers, resolve user → plan, check usage vs limit, return 402 or a clear “limit reached” payload.  
   - Frontend: before send/upload, optionally check usage (or show after 4xx) and display “3/10 messages this month” + upgrade CTA.

7. **In-app upgrade CTA**  
   - When at or near limit: banner or modal “You’ve hit your Starter limit. Upgrade to Professional for more.” Link to existing `/checkout?plan=professional` (or pricing).  
   - In Settings/Account: “Current plan: Starter” + “Upgrade” button.

8. **Usage tracking for billing**  
   - Extend analytics (or new “usage” store) to record per-user/per-org: messages, uploads, storage.  
   - Use for: (a) in-app “usage this month” and (b) future billing webhooks or Polar metered usage if you add it.  
   - Keeps you ready for “usage-based” plans without big refactors later.

### Optional (next after 1–8)

- **Free tier with hard limits**  
  - If you add a free plan: low caps (e.g. 5 messages, 2 files). Same “limit reached” + upgrade flow.  
- **Feature flags**  
  - For gradual rollouts (e.g. “new onboarding” or “usage dashboard”). Nia pointed to Twenty’s feature-flag docs; you could add a minimal in-app or env-based flag later.

---

## Next Steps (workflow)

- **Technique selection:** When you’re ready to go deeper on one area (e.g. only onboarding, or only limits), we can run a focused technique from the brain-methods library (e.g. “What if?” or “Worst idea”) on that slice.  
- **Refinement:** If you want to trim or reorder the roadmap, say which numbers to drop or move; we can update this doc and keep it as the single source of truth for “what to work on.”
