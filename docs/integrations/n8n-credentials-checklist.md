# n8n Credentials Checklist

**Purpose**: Full list of credential types to add in n8n for easier configuration and process management.  
**Source**: Synta-MCP `n8n_manage_credentials` (get_schema + check_workflow across your instance).  
**Last updated**: 2026-02-06

Use this list to:
1. Mark which credentials you **already have**
2. Mark which you **don’t want to use**
3. Add any missing ones you need

---

## How to use this list

- **Credential type (n8n)** = internal name used in n8n (e.g. when creating via API or in `check_workflow`).
- **Main fields** = main schema fields (from Synta-MCP get_schema). Required fields are noted.
- **Used in your workflows** = workflow names that reference this credential (from check_workflow).

At the end, add your notes: ✅ Already have | ❌ Don’t use | ⬜ To add.

---

## 1. AI / LLM

| # | Credential type (n8n) | Display name (typical) | Main fields | Used in your workflows |
|---|------------------------|-------------------------|-------------|-------------------------|
| 1 | **openRouterApi** | OpenRouter | `apiKey` (required) | 68 Instagram Prod Access |
| 2 | **openAiApi** | OpenAi | `apiKey` (required), optional: `organizationId`, `url`, `header`/`headerName`/`headerValue` | RAG Chatbot (Qdrant + Open AI), Chat with Google Sheet, Telegram AI bot, SlackBot, WhatsApp Chatbot, Notion AI, Gmail AI, Postgres Chat, Lead Capture, others |

---

## 2. Messaging & social

| # | Credential type (n8n) | Display name (typical) | Main fields | Used in your workflows |
|---|------------------------|-------------------------|-------------|-------------------------|
| 3 | **telegramApi** | Telegram API | `accessToken`, `baseUrl` | Agentic Telegram AI bot; *Instagram doc uses env vars for Telegram, but Telegram nodes use this* |
| 4 | **slackApi** | Slack API | (token-based; schema may vary) | IT Ops AI SlackBot |
| 5 | **slackOAuth2Api** | Slack OAuth2 API | `serverUrl` or `clientId`+`clientSecret`, `oauthTokenData`, conditionals | Alternative to Slack API for OAuth2 apps |
| 6 | **whatsAppApi** | WhatsApp API | (OAuth / API key style) | Building Your First WhatsApp Chatbot |
| 7 | **whatsAppTriggerApi** | WhatsApp OAuth API | (OAuth for trigger) | Building Your First WhatsApp Chatbot |
| 8 | **linkedInOAuth2Api** | LinkedIn OAuth2 API | OAuth2 (clientId, clientSecret, etc.) | Lead Capture & DM Auto-Response — **currently missing** |

---

## 3. Google

| # | Credential type (n8n) | Display name (typical) | Main fields | Used in your workflows |
|---|------------------------|-------------------------|-------------|-------------------------|
| 9 | **googleSheetsOAuth2Api** | Google Sheets OAuth2 API | `clientId`, `clientSecret`, `oauthTokenData` (or `serverUrl` if dynamic) | Chat with a Google Sheet using AI |
| 10 | **googleDriveOAuth2Api** | Google Drive OAuth2 API | Same OAuth2 pattern | RAG Chatbot (Google Drive + Gemini) |
| 11 | **googlePalmApi** | Google Gemini(PaLM) Api | `host`, `apiKey` (both required) | RAG with Google Drive and Gemini, Gemini chat/embeddings |

---

## 4. Databases & data

| # | Credential type (n8n) | Display name (typical) | Main fields | Used in your workflows |
|---|------------------------|-------------------------|-------------|-------------------------|
| 12 | **postgres** | Postgres | `host`, `database`, `user`, `password`, `port`, `ssl`, optional SSH tunnel | Chat with Postgresql Database |
| 13 | **notionApi** | Notion API | `apiKey` | Notion knowledge base AI assistant, Lead Capture |

---

## 5. Vector stores & integrations

| # | Credential type (n8n) | Display name (typical) | Main fields | Used in your workflows |
|---|------------------------|-------------------------|-------------|-------------------------|
| 14 | **qdrantApi** | QdrantApi | (API key / URL style) | Building RAG Chatbot (Qdrant + Open AI) |
| 15 | **pineconeApi** | PineconeApi | (API key / environment) | RAG Chatbot (Google Drive + Gemini) |
| 16 | **githubApi** | GitHub API | (token) | Building RAG Chatbot (Qdrant + Open AI) |

---

## 6. Generic HTTP / auth (for custom APIs)

Use these for **HTTP Request** nodes (e.g. Meta/Instagram API, Telegram send via HTTP, or any REST API).

| # | Credential type (n8n) | Display name (typical) | Main fields | Used in your workflows |
|---|------------------------|-------------------------|-------------|-------------------------|
| 17 | **httpBasicAuth** | HTTP Basic Auth | `user`, `password` | Optional for any HTTP Request with Basic auth |
| 18 | **httpHeaderAuth** | HTTP Header Auth | `name`, `value` (header name/value) | Optional for APIs that use a single header (e.g. `Authorization: Bearer …`) |
| 19 | **httpQueryAuth** | HTTP Query Auth | `name`, `value` (query param) | Optional for APIs that use query-based auth |
| 20 | **oAuth2Api** | OAuth2 API (generic) | `grantType`, `accessTokenUrl`, `clientId`, `clientSecret`, `scope`, `authentication`, optional `authUrl`, `authQueryParameters` | Generic OAuth2 for any HTTP Request |

---

## 7. n8n itself

| # | Credential type (n8n) | Display name (typical) | Main fields | Used in your workflows |
|---|------------------------|-------------------------|-------------|-------------------------|
| 21 | **n8nApi** | n8n API | `apiKey`, `baseUrl` | For workflows or external tools calling your n8n API (e.g. trigger, manage workflows) |

---

## Summary table (for your checklist)

Copy or use this to mark status: **Already have** | **Don’t want to use** | **To add**.

| # | Credential type | Your status |
|---|------------------|-------------|
| 1 | openRouterApi | |
| 2 | openAiApi | |
| 3 | telegramApi | |
| 4 | slackApi | |
| 5 | slackOAuth2Api | |
| 6 | whatsAppApi | |
| 7 | whatsAppTriggerApi | |
| 8 | linkedInOAuth2Api | |
| 9 | googleSheetsOAuth2Api | |
| 10 | googleDriveOAuth2Api | |
| 11 | googlePalmApi | |
| 12 | postgres | |
| 13 | notionApi | |
| 14 | qdrantApi | |
| 15 | pineconeApi | |
| 16 | githubApi | |
| 17 | httpBasicAuth | |
| 18 | httpHeaderAuth | |
| 19 | httpQueryAuth | |
| 20 | oAuth2Api | |
| 21 | n8nApi | |

---

## Notes from your instance

- **68 Instagram Prod Access**: Uses **openRouterApi** only for AI; Instagram token is in **Data Tables**; Telegram is via **env vars** (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`). If you later move Telegram to a credential, use **telegramApi** (or keep env vars).
- **Lead Capture & DM Auto-Response**: One node (**Send Auto-Response**) is missing **linkedInOAuth2Api**. Add that credential if you want the workflow to run end-to-end.
- **Generic HTTP**: If you use HTTP Request nodes for Meta, Telegram, or other APIs with Bearer/header auth, **httpHeaderAuth** is the usual choice.

---

## Getting schema for a credential type (Synta-MCP)

To see required/optional fields for any type:

```text
n8n_manage_credentials(mode='get_schema', credentialTypeName='<type>')
```

Example: `credentialTypeName='openRouterApi'` → `apiKey` required.

---

*Generated with Synta-MCP (`n8n_manage_credentials` get_schema + check_workflow).*
