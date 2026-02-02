# Meta + n8n: Menus, Where You Are, and What to Do Next

**Purpose:** One place to understand every menu you see (Meta Dashboard, Instagram API setup, n8n, Permissions, Verification, Graph API Explorer), where you are in the process, and the exact steps to finish Instagram comment/message automation.

---

## 1. Menu map — what each screen is for

| Where you are                                                         | What it’s for                                                                                                                    |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Meta: My Apps → TCDynamics → Dashboard**                            | App overview: published status, rate limits, and which use cases are on (e.g. “Manage messaging & content on Instagram”).        |
| **Meta: TCDynamics → Use cases → Customize use case → Instagram API** | The **5-step Instagram API setup**: (1) Permissions, (2) Generate tokens, (3) Webhooks, (4) Business login, (5) App review.      |
| **Meta: TCDynamics → Review → Verification**                          | **Business verification** (who you are) and **Access verification** (Tech Provider, optional).                                   |
| **Meta: TCDynamics → Use cases → Permissions and features**           | List of all Instagram/Facebook permissions; status (e.g. “Ready for testing” or “Add to App Review”) and actions.                |
| **Meta: Tools → Graph API Explorer**                                  | Sandbox to **generate an access token**, pick permissions, and **test API calls** (e.g. `GET /me?fields=id,name`) before coding. |
| **n8n: Personal → Workflows**                                         | Your automation workflows. “Test Webhook Workflow” is where you’d receive Meta’s webhook (GET for verify, POST for events).      |
| **n8n: Credentials**                                                  | Where you store **tokens and API keys** (e.g. Instagram/Meta token) for use in workflows.                                        |
| **n8n: Executions**                                                   | History of workflow runs (success/fail) for debugging.                                                                           |

So: **Meta** = app config, permissions, verification, tokens, webhook URL. **n8n** = the server that hosts the webhook and runs your automation logic.

---

## 2. Where you are in the process (status from your screenshots)

Summary:

- **Meta app:** TCDynamics is **Published**, use case “Manage messaging & content on Instagram” is on, no required actions, 0% rate limit.
- **Business verification:** **Done** (e.g. “Tom coustols” verified).
- **Instagram API 5-step setup:**
  - **Step 1 – Permissions:** Done (required messaging permissions added).
  - **Steps 2–5:** Not done yet: **Generate access tokens**, **Configure webhooks**, **Set up Instagram business login**, **Complete app review**.
- **Permissions and features:** Several are **“Ready for testing”** (e.g. `instagram_business_manage_messages`, `instagram_manage_comments`, `instagram_business_basic`, `instagram_basic`, `public_profile`). Others show “+ Add to App Review” when you need them for production.
- **Access verification (Tech Provider):** Optional; only needed if you need to access **other businesses’** Meta assets. You can ignore for now unless you’re building a multi-tenant product.
- **Graph API Explorer:** TCDynamics is selected; no token generated yet — so you haven’t run real API calls from there.
- **n8n:** You have workflows (e.g. “Test Webhook Workflow”); the **webhook URL** from n8n is not yet entered in Meta, and Meta’s webhook is not yet verified/saved.

So in one sentence: **You’re past app creation and permissions; next you must generate tokens, configure the webhook in Meta (using n8n’s URL), set up business login, and then complete app review for live data.**

---

## 3. What is needed (high level)

From your `meta-instagram-automation-graph.md` and Nia-indexed Meta docs:

1. **Webhook endpoint**
   - Public HTTPS URL (your n8n webhook URL, or your domain with a reverse proxy in front of n8n, or your own API route that then calls n8n). **See § 3b** for a deep dive on **website vs n8n** (direct n8n, reverse proxy, or your app as listener).
   - **GET:** Accept `hub.mode=subscribe`, `hub.verify_token`, `hub.challenge`; if token matches, respond with `hub.challenge`.
   - **POST:** Validate `X-Hub-Signature-256`, respond 200, then process payload (comments/messages).

2. **Meta Dashboard configuration**
   - In **Instagram API → API setup with Instagram login**:
     - **Callback URL** = your webhook URL (e.g. n8n webhook or `https://api.yourdomain.com/webhook/instagram`).
     - **Verify token** = any string you choose; same value in Meta and in your endpoint (n8n).
   - Turn **on** the webhook subscription and subscribe to `comments` and/or `messages` (Instagram product → Webhooks).

3. **Access token**
   - Long-lived token with the right scopes (e.g. `instagram_manage_comments`, `instagram_business_manage_messages`, `instagram_business_basic`).
   - Generated after “Instagram business login” is set up; you can test in Graph API Explorer first.

4. **App in Live mode**
   - Already the case for TCDynamics (Published).
   - Webhooks for real comments/messages are only sent when the app is Live.

5. **App review (for production)**
   - Required for **advanced access** to live data from accounts you don’t own.
   - For your own account/testing, “Ready for testing” is enough to generate tokens and receive webhooks in development/test mode.

So: **Menus** = where you configure the above; **what’s needed** = webhook URL + verify token in Meta, working GET/POST in n8n, token with correct permissions, then app review when you go to production.

---

## 3b. Setup configuration (deep): website vs n8n, and when to use which

This section answers: **Should Meta call your website or n8n? And if you have a website, should it be the listener or just a proxy in front of n8n?**

### Three possible setups

| Option                                             | Who receives the webhook first               | Meta callback URL                                                           | When to use                                                                                                                                                                                            |
| -------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. n8n only**                                    | n8n                                          | Your n8n webhook URL (e.g. `https://n8n.yourhost.com/webhook/xxx` or ngrok) | Fastest to get going; you're fine exposing the n8n hostname or using ngrok for testing.                                                                                                                |
| **2. Your domain → reverse proxy → n8n**           | Your server (proxy), which forwards to n8n   | Your domain (e.g. `https://api.tcdynamics.fr/webhook/instagram`)            | You want **one public URL** for all integrations (Meta, Stripe, etc.), don't want to expose n8n, and you want **logic to stay in n8n** (edit workflows there).                                         |
| **3. Your website as the listener, then call n8n** | Your app (e.g. Vercel serverless or Express) | Your domain (e.g. `https://api.tcdynamics.fr/webhook/instagram`)            | You want **your code** to validate, log, or transform the payload first, then **trigger n8n** (e.g. via n8n's API or by forwarding the body). Logic is split: your app = gatekeeper, n8n = automation. |

### Option 1: n8n only (Meta → n8n directly)

- **Meta callback URL:** the URL from your n8n Webhook node (e.g. `https://your-n8n-host.com/webhook/abc123` or `https://xxx.ngrok-free.app/webhook/abc123`).
- **Pros:** Easiest; no proxy or app code. GET/POST handled entirely in n8n.
- **Cons:** You expose the n8n hostname to Meta; if you use ngrok, URL can change (paid ngrok keeps it stable).
- **Config:** Nothing else. Just use the n8n webhook URL and verify token in Meta.

### Option 2: Your domain (reverse proxy) → n8n

- **Meta callback URL:** your domain, e.g. `https://api.tcdynamics.fr/webhook/instagram`.
- **Flow:** Meta calls your domain → nginx/Cloudflare/Caddy forwards the request to n8n (e.g. `https://n8n.internal/webhook/instagram`). n8n still does GET (return `hub.challenge`) and POST (handle events). Meta never sees n8n's hostname.
- **Pros:** Single public URL; no n8n hostname exposed; all automation logic stays in n8n.
- **Config:**
  - **Reverse proxy:** Route `/webhook/instagram` (or `/webhook/`) to your n8n instance (e.g. by host or path).
  - **n8n:** Set `WEBHOOK_URL=https://api.tcdynamics.fr` (or your base URL) so n8n generates webhook URLs under your domain. Set `N8N_PROXY_HOPS=1` and ensure the proxy sends `X-Forwarded-For`, `X-Forwarded-Host`, `X-Forwarded-Proto` so n8n trusts the client and builds correct URLs.
- **Reference:** Your `meta-instagram-automation-graph.md` § 8 ("Domain + n8n (reverse proxy)").

### Option 3: Your website as the listener, then call n8n

- **Meta callback URL:** your domain, e.g. `https://api.tcdynamics.fr/webhook/instagram`.
- **Flow:** Your app (e.g. Vercel serverless `api/webhooks/instagram.js` or Express route) receives GET/POST. You implement GET (verify token, return `hub.challenge`) and POST (validate `X-Hub-Signature-256`, return 200, then optionally forward the body to n8n or call n8n's "Execute Workflow" API to run your automation).
- **Pros:** Full control in your code (logging, rate limiting, multi-tenant routing); n8n is a downstream worker.
- **Cons:** You own signature validation and GET/POST logic; you must keep n8n in sync (e.g. forward the same payload n8n expects).
- **Config:** Your endpoint must:
  - **GET:** read `hub.mode`, `hub.verify_token`, `hub.challenge`; if token matches, respond with `hub.challenge`.
  - **POST:** verify `X-Hub-Signature-256` (HMAC SHA256 of raw body with App Secret), respond 200 quickly, then either POST the body to an n8n webhook URL or trigger n8n via API.

### Recommendation for TCDynamics

- **Quickest path (testing / MVP):** **Option 1** — point Meta at your n8n webhook URL (or ngrok). No website changes.
- **If you want a single domain and logic in n8n:** **Option 2** — put a reverse proxy in front of n8n, set `WEBHOOK_URL`, use `https://api.tcdynamics.fr/webhook/instagram` (or similar) in Meta.
- **If you want your backend to be the single entry point for all webhooks (Stripe, Meta, etc.) and then delegate to n8n:** **Option 3** — implement the webhook route in your API (e.g. under `api/` or Express), then call n8n from there.

### Test with n8n first, then merge with your website later?

**Yes.** You can start with **Option 1** (Meta → n8n directly, e.g. n8n or ngrok URL) to validate the flow, then switch to your website as the middleman later.

- **Meta:** The callback URL is just a setting in the App Dashboard. Change it to your new endpoint (e.g. `https://api.tcdynamics.fr/webhook/instagram`), re-enter the same verify token, and click **Verify and save**. No lock-in.
- **n8n:** The workflow (GET/POST logic) can stay the same. If you move to **Option 2**, you only add a reverse proxy and set `WEBHOOK_URL`; if you move to **Option 3**, your new API route receives the webhook and forwards the body to the same n8n webhook URL (or triggers n8n via API). So you’re not rewriting the automation, just changing who receives the request first.

### What people usually do (Nia research: n8n docs, community, web)

- **Start direct, then centralize:** Many people first point external services (Meta, Stripe, etc.) at **n8n’s webhook URL** (or ngrok) to get something working, then later put **their own domain** in front — either via **reverse proxy to n8n** (Option 2) or **their API then n8n** (Option 3). (Sources: n8n docs “Configure webhook URLs with reverse proxy”, community threads “How can I host my own webhook URL?”, “Reverse proxy and custom webhook domain”.)
- **Keep things separate vs one gateway:** Both patterns exist. “Keep separate” = each integration (Meta, Stripe) points to its own n8n webhook URL. “Merge” = one public URL (your domain) that either proxies to n8n (reverse proxy) or your API receives and then forwards to n8n. People often move to the single-URL approach when they want one place to manage security, logging, or company policy (n8n docs, community: WEBHOOK_URL, reverse proxy, N8N_PROXY_HOPS).
- **Monorepo:** In a monorepo, “website as middleman” usually means a webhook route inside your app (e.g. `api/webhooks/instagram.js` in Vercel, or a route in `apps/backend`). That route does GET/POST (and optionally validation), then POSTs to your n8n webhook URL or calls n8n’s “Execute Workflow” API. n8n can stay in a separate deployment; your repo just gains one (or more) webhook handlers that delegate to n8n.

The rest of this guide (Steps A–F) assumes **Option 1 or 2** (n8n is the one doing GET/POST). If you choose **Option 3**, Step A becomes "Implement GET/POST in your app and optionally forward to n8n"; the verify token and callback URL still go in Meta the same way.

---

## 4. Ordered next steps (what to do)

Do these in order. Each step tells you **which menu** to use.

### Step A: Get your n8n webhook URL and verify token

- **Where:** n8n → open (or create) the workflow that will handle Instagram (e.g. “Test Webhook Workflow”).
- **What:**
  - Add a **Webhook** node.
  - Set it to respond to **GET** and **POST**.
  - For **GET:** output the value of `hub.challenge` when `hub.verify_token` equals a secret you choose (e.g. a long random string).
  - Copy the **Webhook URL** (e.g. `https://your-n8n-host.com/webhook/xxx` or ngrok URL).
  - Choose a **verify token** string and remember it (e.g. store in n8n as a constant or in Credentials).
- **Docs:** Your `meta-instagram-automation-graph.md` (§ 8) and Nia search: “Configure in App Dashboard … Set your endpoint URL … Enter your Verify Token.”

#### n8n Webhook + Respond to Webhook (official n8n docs / n8n MCP)

From [n8n Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) and [Respond to Webhook](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/):

1. **Webhook node → Respond parameter** (three options):
   - **Immediately**: Returns “Workflow got started” — no custom body; Meta verification will fail because Meta needs the `hub.challenge` value in the response body.
   - **When Last Node Finishes**: Returns the output of the last node — use if the last node outputs the challenge.
   - **Using 'Respond to Webhook' Node**: The response is defined by a **Respond to Webhook** node in the workflow — use this for Meta so you can return `hub.challenge` for GET.

2. **To fix “Unused Respond to Webhook node” / “Verify that the Webhook node’s Respond parameter is set to Using Respond to Webhook Node”:**
   - Open the **Webhook** node (the trigger).
   - In **Parameters**, set **Respond** to **“Using 'Respond to Webhook' Node”** (exact wording in n8n).
   - Save. The Respond to Webhook node is then used and the warning goes away.

3. **Respond to Webhook node:**
   - **Respond With:** e.g. **Text** or **First Incoming Item**. For Meta GET verification, the response body must be the raw challenge string.
   - For **Text**: set **Response Body** to `{{ $json.query["hub.challenge"] }}` (Webhook puts query params in `query`). Optionally add **Response Headers** → `Content-Type: text/plain`.
   - For **First Incoming Item**: ensure the incoming item has a field that equals `hub.challenge` (e.g. a **Set** node before Respond to Webhook that sets `body = {{ $json.query["hub.challenge"] }}`, then in Respond to Webhook choose to respond with that field).
   - The node runs once with the first incoming item; place it after any node that passes the challenge through.

### Step B: Configure webhooks in Meta (Step 3 of the 5-step flow)

- **Where:** Meta → TCDynamics → **Use cases** → **Customize use case** → **Instagram API** → **API setup with Instagram login** → step “Configure webhooks”.
- **What:**
  - **Callback URL:** paste your n8n webhook URL from Step A.
  - **Verify token:** same string as in n8n.
  - Click **Verify and save**.
  - After verification, **subscribe** to the fields you need (e.g. `comments`, `messages`) in the Instagram product → Webhooks.
- **Important:** Turn **on** the webhook subscription toggle; otherwise Meta won’t send POSTs even if verification succeeded (see your strategy doc § 8).
- **Note:** If your screenshot showed a different Instagram app (e.g. “n8n-IG”), do this in the app that you actually use for TCDynamics (same app as in the Dashboard).

### Step C: Generate access tokens (Step 2 of the 5-step flow)

- **Where:**
  - **Option 1:** Same 5-step page → “Generate access tokens” → “Add an Instagram account” and follow the flow.
  - **Option 2:** **Tools → Graph API Explorer** (Meta app = TCDynamics).
- **What:**
  - In Graph API Explorer: click **Generate Access Token**, choose **User or Page** (or Instagram Business Account if shown), select the permissions you need (e.g. `instagram_basic`, `instagram_manage_comments`, `instagram_business_manage_messages`, `instagram_business_basic`).
  - Complete the login/authorization.
  - Copy the token; store it in **n8n → Credentials** (or in your workflow) so your workflow can call the Graph/Messenger API to reply to comments or DMs.
- **Docs:** Nia search result: “Generate Access Token … Use the Instagram Graph API with user credentials.”

### Step D: Set up Instagram business login (Step 4)

- **Where:** Same 5-step page → “Set up Instagram business login”.
- **What:** Follow Meta’s flow so businesses can securely grant your app permissions (required for production and for long-lived tokens). For a single business (yours), this is the step that makes “Generate access tokens” and token refresh work properly.
- **Docs:** Meta’s in-product links and your strategy doc (§ 4, “Access token … Instagram User token (Business Login for Instagram)”).

### Step E: Complete app review (Step 5) when going to production

- **Where:** Meta → TCDynamics → **Review** → **App Review**.
- **What:** Submit the permissions you need for **advanced access** (e.g. comments/messages for accounts you don’t own). For your own account and “Ready for testing” permissions, you can test without this; for live data from other businesses, App Review is required.
- **Docs:** Your strategy doc (§ 4: “Business Verification … Required if the app uses Advanced Access”; § 5: “Advanced Access for comments”). Nia: “App must be in Live Mode for production webhooks … Advanced Access level needed.”

### Step F: Test end-to-end in n8n

- **Where:** n8n → your Instagram webhook workflow.
- **What:**
  - Trigger a real comment or DM on the connected Instagram account (or use Meta’s test tools if available).
  - Confirm **Executions** shows a successful run.
  - In the workflow, call the Graph/Messenger API (e.g. reply to comment or message) using the token from Step C.
  - Check that the reply appears on Instagram.
- **Docs:** `meta-instagram-automation-graph.md` (§ 3 sequence diagram, § 6 use cases).

---

## 5. How this ties to your other docs

- **meta-instagram-automation-graph.md** — Flow, prerequisites, webhook GET/POST, permissions, limits; “domain + n8n” and verification toggle (§ 8).
- **meta-tiktok-automation.md** — TikTok side (separate app/APIs); do after Instagram is working if you want TikTok posting.
- **client-onboarding-strategy.md** — Product onboarding (progress, templates, RGPD); not Meta setup.
- **PROJECT_VISUALIZATION.md** / **advanced-full-stack-graph.md** — Where TCDynamics sits (frontend, API, DB, external services); the “Webhooks” box in the architecture is what you’re configuring with Meta + n8n.
- **mcp-strategy.md** — MCP layer for AI/workflows; optional later; not required to finish Instagram automation.

---

## 6. Quick checklist (copy and tick)

- [ ] **A** – n8n webhook URL and verify token ready (GET returns `hub.challenge`).
- [ ] **B** – Meta: Callback URL + Verify token set; Verify and save; subscribe to `comments` and/or `messages`; subscription ON.
- [ ] **C** – Access token generated (Graph API Explorer or “Generate access tokens”), stored in n8n.
- [ ] **D** – Instagram business login set up.
- [ ] **E** – App review submitted (when you need advanced access / production).
- [ ] **F** – One real comment or DM received in n8n and reply sent via API.

---

## 7. Nia research used for this guide

- **Indexed Meta/Instagram docs in Nia:** `developers.facebook.com/docs/instagram-platform/webhooks`, `docs/instagram-api`, `docs/graph-api/webhooks/getting-started/webhooks-for-instagram`, and related Messenger/Instagram send-message and comment-moderation docs.
- **Nia search:** "Instagram API webhook setup callback URL verify token subscribe" — steps for endpoint, configure webhooks, verify token, subscribe to `comments`/`messages`, and Live Mode / Advanced Access.
- **Nia search:** "Instagram API setup with Instagram login generate access token webhook verify token app review" — create endpoint, verify token, configure in dashboard, app review requirements.
- Your strategy doc `meta-instagram-automation-graph.md` was built from Nia-only search over the same indexed Meta docs; § 8 (domain + n8n, verification toggle, GET/POST) aligns with the steps above.

---

**Summary:** You’re not lost — you’re at “permissions done, verification done, app published; now wire the webhook and tokens.” Use **Meta’s Instagram API 5-step page** for steps 2–5, **Graph API Explorer** to get a token, and **n8n** as the webhook endpoint. Do steps A → B → C → D in order, then E when going live, then F to validate.
