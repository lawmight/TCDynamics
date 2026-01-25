# Cursor Hooks

Hooks run at specific points in the agent loop. See [Cursor Hooks](https://cursor.com/docs/agent/hooks).

## Scripts

| Hook | Script | Purpose |
|------|--------|---------|
| `sessionStart` | `status-inject.js` | Injects CI (GitHub), Vercel, and "awaiting" (contacts, demos, Polar) into context |
| `afterFileEdit` | `format.js` | Runs Prettier on edited files |
| `afterShellExecution` | `deploy-notify.js` | Optional: POSTs to webhook when deploy/test commands run |
| `beforeShellExecution` | `audit.js` | Logs and allows shell commands |
| `beforeSubmitPrompt` | `audit.js` | Logs and allows prompt submission |
| `stop` | `audit.js` | Logs when the agent stops |
| `stop` | `stop-status.js` | On `status: "error"`, if CI/Vercel has a failure, returns `followup_message` to investigate |

## Environment variables

### sessionStart (status-inject.js) + stop (stop-status.js)

| Variable | Required | Description |
|----------|----------|-------------|
| `VERCEL_TOKEN` | For Vercel | [Vercel token](https://vercel.com/account/tokens) |
| `VERCEL_PROJECT_ID` | For Vercel | Project ID from Vercel project settings |
| `GITHUB_TOKEN` | For CI | PAT with `actions: read` (or `repo` for private) |
| `GITHUB_REPO` | For CI | `owner/repo` (e.g. `myorg/tcdynamics`) |
| `INTERNAL_HOOK_TOKEN` | For awaiting | Secret for `/api/awaiting-summary`; set in **API** (Vercel) and in your **local** env |
| `API_BASE_URL` | Optional | Default `https://api.tcdynamics.fr` |

### afterShellExecution (deploy-notify.js)

| Variable | Required | Description |
|----------|----------|-------------|
| `DEPLOY_NOTIFY_WEBHOOK` | For notify | Any webhook URL (e.g. Slack incoming webhook) |
| `SLACK_WEBHOOK_URL` | Alternative | Used if `DEPLOY_NOTIFY_WEBHOOK` is unset |

If neither is set, the script no-ops.

### API: /api/awaiting-summary

- **Auth:** `x-internal-token: <INTERNAL_HOOK_TOKEN>` or `Authorization: Bearer <INTERNAL_HOOK_TOKEN>`
- **Vercel env:** Add `INTERNAL_HOOK_TOKEN` to the project that hosts the API.

## Quick setup

1. **Vercel + GitHub:** Create tokens, set `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `GITHUB_TOKEN`, `GITHUB_REPO` in your environment (e.g. `.env` or Cursor / system env).

2. **Awaiting (contacts, demos, Polar):**
   - In Vercel (or wherever the API runs): set `INTERNAL_HOOK_TOKEN` to a random secret.
   - Locally (or in Cursor): set the same `INTERNAL_HOOK_TOKEN` so `status-inject.js` can call `GET /api/awaiting-summary`.

3. **Deploy/test notify (optional):** Set `DEPLOY_NOTIFY_WEBHOOK` or `SLACK_WEBHOOK_URL` to an incoming webhook URL. If unset, `deploy-notify.js` does nothing.

## Behavior

- **sessionStart:** Fetches Vercel deployments, GitHub Actions runs, and awaiting-summary; builds an `additional_context` block. On fetch errors, that section is omitted; hook always exits 0.
- **stop (stop-status):** Only runs when `status === "error"`. If GitHub or Vercel shows a recent failure, it returns `followup_message` so Cursor can auto-submit a prompt to investigate.
- **afterShellExecution (deploy-notify):** Matches `vercel`, `git push`, `npm run deploy/ship/preview` or `npm run test` / `npm test` / `npx jest|vitest`. If a webhook is configured, it POSTs `{ "text": "..." }` (Slack-compatible).
