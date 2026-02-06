# Synta-MCP Integration — n8n Workflow Tools

**MCP server**: `user-synta-mcp`  
**Purpose**: Turns AI agents into n8n workflow experts (node search, templates, validation, execution, credentials, pinData, AI patterns, best practices).  
**Last tested**: 2026-02-06

---

## Overview

Synta-MCP exposes tools for:

- **Knowledge (no n8n instance)**: AI workflow patterns, best practices, credential schemas.
- **Instance-dependent**: Visual capture, executions, credentials CRUD/check_workflow, pinData, workflow search, trigger execution.

See [Synta-MCP 8-tool deep analysis](.cursor/plans/synta-mcp_8_tools_deep_analysis_ae80c7b1.plan.md) for full tool list, parameters, and suggested flows.

---

## Test Run (2026-02-06)

Suggested “safe without n8n” tests were run and results recorded below.

### 1. `get_ai_workflow_patterns`

**Request**: `mode='list'`

**Result**:

```json
{
  "patterns": [
    {
      "category": "AI Architectures",
      "items": [
        { "id": "ai_simple", "name": "Simple AI Agent" },
        { "id": "ai_tools", "name": "AI Agent with Tools" },
        { "id": "rag_ingest", "name": "RAG Ingestion Pipeline (Vector Store Insert)" },
        { "id": "rag_query", "name": "RAG Query (Chat with Docs)" },
        { "id": "multi_agent", "name": "Multi-Agent System (Orchestrator)" },
        { "id": "hybrid_memory", "name": "Hybrid Chat & Schedule with Shared Memory" }
      ]
    }
  ],
  "tip": "Use mode=\"detail\" with a patternId to get the MANDATORY architectural blueprint that MUST be followed"
}
```

**Analysis**: List returns 6 AI patterns under one category. Use `mode='detail'` with a `patternId` (e.g. `rag_query`, `ai_tools`) to get Mermaid diagrams, connection types (`ai_languageModel`, `ai_tool`, `ai_embedding`), and implementation requirements. **Call this first for any workflow that uses AI.**

---

### 2. `get_ai_workflow_patterns` (detail)

**Request**: `mode='detail', patternId='rag_query'`

**Result (summary)**:

- **Pattern**: RAG Query (Chat with Docs) — AI Agent that searches a vector store before responding.
- **Mermaid**: `Trigger → AI Agent`; `Chat Model -.ai_languageModel.-> Agent`; `Vector Store (retrieve-as-tool) -.ai_tool.-> Agent`; `Embeddings -.ai_embedding.-> Vector Store`.
- **Implementation requirement**: Follow the exact node types, connection types, and topology; deviating breaks the workflow.
- **Structured Output Parser**: Conditional; use when output is used programmatically (conditions, DB, API, formatted display). Connect parser → AI Agent (`ai_outputParser`), set `hasOutputParser: true` when needed.
- **Common mistake**: Never connect Document Loader to main data outputs; it is an AI sub-node for the Vector Store.

**Analysis**: Detail mode returns the full blueprint (diagram + text). Use with `search_templates` and `get_best_practices` when implementing.

---

### 3. `get_best_practices`

**Request**: `mode='list'`

**Result (summary)**:

- **Available techniques (13)**: universal, scheduling, chatbot, form_input, scraping_and_research, triage, content_generation, document_processing, data_extraction, data_analysis, data_transformation, data_persistence, notification.
- **Unavailable (4)**: monitoring, enrichment, knowledge_base, human_in_the_loop — “Documentation not yet available”.
- **Tip**: Call `mode='detail'` with a `techniques` array (2–4 IDs) for full docs.

**Analysis**: List is required first to choose technique IDs. Use 2–4 techniques that match the workflow (e.g. universal + chatbot + notification).

---

### 4. `get_best_practices` (detail)

**Request**: `mode='detail', techniques=['universal','chatbot','notification']`

**Result (summary)**:

- **Universal**: Prefer native nodes (Edit Fields, Filter, If, Switch, etc.) over Code nodes; set resource/operation and initial parameters explicitly; never rely on defaults for Vector Store mode, AI Agent `hasOutputParser`, Document Loader `textSplittingMode`.
- **Chatbot**: Use same chat node type for trigger and response; use memory; shared memory when multiple agents/schedules; disable “Append n8n Attribution”; prefer AI Agent over provider-specific nodes.
- **Notification**: Trigger → Data/Processing → Condition → Notification → Logging; multi-channel = one condition branching to multiple notification nodes; empty-notification prevention (e.g. `items.length > 0`); recommended nodes (Webhook, Schedule, Form, Email Send, Slack, Telegram, Twilio, IF, Switch, Set).

**Analysis**: Detail returns long, structured docs (tables, node recommendations, pitfalls). Use early in planning.

---

### 5. `n8n_manage_credentials` (get_schema)

**Request**: `mode='get_schema', credentialTypeName='httpBasicAuth'`

**Result**:

```json
{
  "success": true,
  "data": {
    "additionalProperties": false,
    "type": "object",
    "properties": {
      "user": { "type": "string" },
      "password": { "type": "string" }
    },
    "required": []
  }
}
```

**Analysis**: Schema returned without an n8n instance. Confirms `get_schema` is safe for local/docs use.

---

### 6. `n8n_manage_credentials` (get_schema — Slack)

**Request**: `mode='get_schema', credentialTypeName='slackOAuth2Api'`

**Result (summary)**:

- **success**: true.
- **Properties**: serverUrl, clientId, clientSecret, sendAdditionalBodyProperties, additionalBodyProperties, oauthTokenData, notice.
- **Conditional logic**: `useDynamicClientRegistration` drives required fields (e.g. serverUrl when true; clientId/clientSecret when false). Hint: set booleans explicitly to avoid validation errors.

**Analysis**: OAuth2 credential schemas include conditionals. Useful for knowing required fields before creating credentials against a real n8n instance.

---

## Dependency Overview

| Tool / mode                                              | Requires n8n instance      |
| -------------------------------------------------------- | -------------------------- |
| `get_ai_workflow_patterns`                               | No                         |
| `get_best_practices`                                     | No                         |
| `n8n_manage_credentials` (get_schema)                    | No                         |
| `n8n_manage_credentials` (create/delete/check_workflow)  | Yes                        |
| `visual_capture`                                         | Yes                        |
| `n8n_manage_executions`                                  | Yes                        |
| `n8n_manage_pindata`                                     | Yes (CRUD needs login)     |
| `n8n_search_workflow`                                    | Yes                        |
| `n8n_trigger_execution`                                  | Yes                        |

---

## Suggested agent flow

1. **Patterns**: `get_ai_workflow_patterns(mode='list')` → then `mode='detail', patternId='...'` for AI workflows.
2. **Best practices**: `get_best_practices(mode='list')` → `mode='detail', techniques=[...]`.
3. **Templates**: `search_templates` + `get_template` for proven implementations.
4. **Build/update** workflow (create/update/validate tools).
5. **Credentials**: `get_schema` for types → then with n8n: `check_workflow`, then `create` if needed.
6. **Testing**: `n8n_manage_pindata(analyzePinDataRequirement)` → add/update pinData → `n8n_trigger_execution`.
7. **Debug**: `n8n_manage_executions(action='get', mode='error')` and optionally `correlate`.
8. **Verification**: `visual_capture(id='<workflow-id>')`.

---

## Related docs

- [Instagram DM Bot](./instagram-dm-bot.md) — n8n workflow reference (webhook, AI agent, Telegram).
- [Synta-MCP 8-tool deep analysis](.cursor/plans/synta-mcp_8_tools_deep_analysis_ae80c7b1.plan.md) — full tool specs and suggested test requests.
