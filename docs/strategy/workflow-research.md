# Workflow Automation Platform Research

**Research Date**: 2025-01-06
**Method**: NIA Oracle Deep Research
**Purpose**: Foundation and MVP feature identification for TCDynamics WorkFlowAI

---

## Executive Summary

This document contains pure research findings on workflow automation platform architecture, data models, MVP features, and execution patterns. Use this to inform foundational decisions for TCDynamics WorkFlowAI.

---

## 1. Core Data Models & Architecture Patterns

### Universal Data Model Structure

All major platforms (n8n, Zapier, Make.com, Power Automate) use a **three-tier data model**:

| Tier | Purpose | Example Tables |
|------|---------|----------------|
| **Definition Layer** | Workflow/DAG structure | `workflow_entity`, `workflows`, `dag` |
| **Execution Layer** | Run instances & status | `execution_entity`, `workflow_runs`, `dag_run` |
| **Step/Task Layer** | Individual step records | `workflow_steps`, `steps`, `task_instance` |

### n8n Reference Schema (Open Source)

```sql
-- Core tables
workflow_entity        -- Saved workflow configurations
workflow_history       -- Version control for workflows
execution_entity       -- All saved workflow executions
execution_data         -- Workflow state at runtime + execution data
webhook_entity         -- Active webhooks for all trigger nodes
credentials_entity     -- Encrypted authentication credentials
tag_entity            -- Workflow categorization tags
workflows_tags        -- Many-to-many tag associations
```

### Runtime Data Structure Pattern

All platforms use **JSON-based item/record structure** for passing data between nodes:

```javascript
{
  "json": {
    // Structured data fields
    "orderPrice": 100,
    "customerName": "John"
  },
  "binary": {
    // File/binary data references
    "data": { /* buffer reference */ }
  },
  "pairedItem": {
    // Item linking for traceability
    "item": 0
  }
}
```

**Key Insight**: Separation of `json` (structured data) and `binary` (file data) is universal across platforms.

### Node Operation Types (Universal Pattern)

| Operation Type | Purpose | Examples |
|---------------|---------|----------|
| **Triggers** | Start workflows in response to events | Webhooks, schedules, app events, manual triggers |
| **Actions** | Perform tasks within workflows | API calls, data transformation, notifications, database operations |

---

## 2. Essential MVP Features (Launch Priority)

### Priority 1: Core MVP Features (Launch Day)

**Visual Workflow Builder**
- Node-based canvas with drag-and-drop
- Visual connections between nodes
- Step visualization with clear inputs/outputs

**Trigger System**
- **Webhook Triggers**: Real-time event listeners (GET, POST, PUT, DELETE, PATCH, HEAD)
- **Schedule Triggers**: Time-based automation using cron expressions
- **Polling Triggers**: Periodic checks for services without webhooks

**Core Action Nodes**
- **HTTP Request**: Generic API calls with multiple auth methods (Basic, OAuth1/2, Bearer, Header auth)
- **IF/Switch**: Conditional branching based on comparison operations
- **Data Transform**: Sort, aggregate, split, merge data

**Essential Integrations (5-10 minimum)**
1. Gmail/Email - Most common trigger and action
2. Google Sheets - Data storage and manipulation
3. Slack - Notifications and alerts
4. Microsoft Teams/Outlook - Enterprise communication
5. Airtable - No-code database operations
6. HubSpot - CRM basics
7. Google Calendar - Scheduling automation
8. Google Drive - File operations

**Credentials Management**
- Secure storage with per-node access control
- Supported auth types: OAuth1/OAuth2, API Key, Basic/Digest, Custom JSON

**Execution Monitoring**
- Execution history showing time, status, mode, running time
- Basic error visibility to identify failure points

### Priority 2: Early Growth Features (Weeks 2-4)

**Advanced Flow Logic**
- Splitting (IF, Switch nodes)
- Merging (Merge, Compare Datasets)
- Looping (Loop Over Items)
- Waiting (Delay/pause execution)
- Sub-workflows (Execute Workflow)

**Template Library**
- Pre-built workflows for common SME use cases
- Categories: Data Processing, Notifications, Social Media, Lead Management, Document Processing

**Error Handling & Retry**
- Retry mechanism with exponential backoff
- Error workflows for failure responses
- Stop And Error node for explicit error handling

**Debugging Tools**
- Step-by-step execution view
- Load previous data for debugging

### Priority 3: Team & Scale Features (Month 2+)

- User management with roles (Owner, Admin, Member)
- Role-Based Access Control (RBAC)
- Project-based permissions
- Sub-workflows for modularity
- Version history
- Log streaming for enterprise observability

---

## 3. Database Schema Specifications

### Recommended Minimal Schema

Based on analyzed patterns from n8n, Convex Workflow, Vercel Workflow, and Apache Airflow:

```sql
-- Definition layer
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  definition JSONB,           -- Workflow graph/configuration
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Execution layer
CREATE TABLE workflow_runs (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id),
  status VARCHAR(50),         -- pending, running, completed, failed, canceled
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  result JSONB,
  error TEXT
);

-- Step layer
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES workflow_runs(id),
  step_number INTEGER,
  name VARCHAR(255),
  kind VARCHAR(50),           -- function, workflow, event
  args JSONB,
  result JSONB,
  status VARCHAR(50),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
CREATE INDEX idx_steps_run ON workflow_steps(run_id, step_number);
CREATE INDEX idx_steps_status ON workflow_steps(status, run_id);

-- Event/trigger layer
CREATE TABLE workflow_events (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES workflow_runs(id),
  event_type VARCHAR(100),
  payload JSONB,
  created_at TIMESTAMP
);

-- Webhook triggers
CREATE TABLE workflow_webhooks (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id),
  url VARCHAR(500),
  secret_hash VARCHAR(255),
  active BOOLEAN DEFAULT true
);
```

### Key Technical Insights

1. **Generation numbers** enable totally-ordered mutations for concurrent workflow execution
2. **Event sourcing pattern** enables deterministic replay by persisting all step outcomes
3. **Polymorphic step types** allow unified storage of functions, nested workflows, and event awaits
4. **Webhook entity scope**: Stores all active webhooks, not just Webhook node - includes any trigger node's webhooks

---

## 4. Workflow Execution Engine Patterns

### Core Execution Architectures

**1. Durable Functions Model (Event-Sourced Execution)**
- Two-tier architecture: Workflow Functions (orchestration) + Step Functions (execution)
- Journal entries track step number, status, results
- Enables deterministic replay

**2. DAG-Based Execution (Dependency Resolution)**
- Workflows as Directed Acyclic Graphs
- Explicit upstream/downstream dependencies
- Bitshift operators for dependency declaration

**3. State Machine / Graph Model (Message Passing)**
- Discrete "super-steps" with parallel/sequential execution
- Node activation via incoming messages
- Halt voting when no messages

**4. Node-Based Visual Execution (Depth-First Traversal)**
- Depth-first traversal where each branch completes before next begins
- Multi-input nodes execute only when receiving data on at least one input

### Error Handling and Retry Patterns

**Exponential backoff with jitter** is the standard pattern:

```typescript
defaultRetryBehavior: {
  maxAttempts: 3,
  initialBackoffMs: 100,
  base: 2,  // Exponential multiplier
}
```

**Error Classification Types**

| Error Type | Behavior | Use Case |
|------------|----------|----------|
| `FatalError` | No retry, immediate failure | 404 Not Found, validation errors |
| `RetryableError` | Retry with custom delay | Rate limiting, temporary outages |
| Uncaught exceptions | Default retry behavior | Transient failures |

### Control Flow Patterns

**Sequential Execution**: Steps execute one after another

**Parallel Execution**: Use `Promise.all` for concurrent step execution

**Timeout Racing**: Combine webhooks with sleep for timeout handling

**Saga Pattern**: Multi-step transactions requiring rollback capability with compensating transactions

---

## 5. Trigger Types & Action Types

### Workflow Trigger Types

**Category 1: Real-Time Event Triggers**
- **Webhook Triggers**: Listen for events from services (Zendesk, Telegram, Brevo, Stripe)
- **Message Queue Triggers**: AMQP, RabbitMQ, MQTT, Email Trigger (IMAP)

**Category 2: Time-Based Triggers**
- **Schedule Triggers**: Cron-style schedules (daily, weekly, monthly, custom intervals)
- **Date/Time Sensors**: Wait for specific dates or times

**Category 3: Data-Driven Triggers**
- **Polling Triggers**: Periodically check services (Airtable, Gmail, Google Sheet, RSS Feed)
- **Asset/File Triggers**: Trigger when new data arrives in storage systems

**Category 4: Manual & Dependency Triggers**
- **Manual Triggers**: User-initiated workflow execution
- **External Task Triggers**: Trigger based on completion of other workflows

### Workflow Action Types

**Category 1: Data Operations**
- Data Fetching: HTTP Request, Database queries, Service-specific nodes
- Data Transformation: Aggregate, Filter, Sort, Split Out, Summarize, Remove Duplicates, Limit

**Category 2: Flow Control Actions**
- Conditional Logic: IF node, Switch node
- Merging Actions: Merge, Compare Datasets, Code
- Looping Actions: Loop Over Items

**Category 3: Workflow Management**
- Sub-workflow Actions: Execute Workflow, Execute Workflow Trigger
- Waiting/Timing Actions: Wait
- Error Handling Actions: Stop And Error, Error Trigger

**Category 4: External Service Actions**
- Communication: Send emails, Post to chat, Send SMS
- CRM/Business: Create/update contacts, Sync customer data, Log activities

---

## 6. SME Integration Priorities

### Tier 1: Essential Integrations (Must-Have)

**Communication & Email**
- Gmail: Email triggers, send emails, read/process incoming messages
- Microsoft Outlook: Calendar sync, email automation
- Slack: Team notifications, channel messages, approvals

**Productivity & Data Storage**
- Google Sheets: Data storage, reporting, trigger on new rows
- Microsoft Excel 365: Spreadsheet automation
- Airtable: Database-like storage with triggers

**CRM Systems**
- HubSpot: Contact management, deal tracking, marketing automation
- Salesforce: Enterprise CRM operations
- Pipedrive: Sales pipeline management
- Zoho CRM: Order processing integration

### Tier 2: Business Operations (Growth Stage)

**E-commerce Platforms**
- Shopify: Order management, inventory tracking, product updates
- WooCommerce: WordPress-based store automation

**Payment Processing**
- Stripe: Payment webhooks, subscription management, checkout events
  - Key webhook events: `checkout.session.completed`, `customer.created`

**Accounting & Finance**
- QuickBooks Online: Invoice creation, customer sync, payment tracking
- Xero: Invoice processing, financial reconciliation

**Project Management**
- Notion, Monday.com, Asana, Jira Software

### Tier 3: Productivity Enhancers

- Cloud Storage: Google Drive, Microsoft OneDrive, Nextcloud
- Databases: MySQL, MongoDB, PostgreSQL
- Marketing & Social: LinkedIn, Telegram, ActiveCampaign

---

## 7. Common SME Workflow Patterns

| Pattern | Trigger | Actions | Integration Example |
|---------|---------|---------|---------------------|
| **Lead Capture** | Form submission / Webhook | Create CRM contact → Send notification → Add to email list | Brevo + SuiteCRM + NextCloud |
| **Invoice Processing** | Email with attachment | OCR extraction → Create accounting entry → Notify team | Gmail + OCR.space + Slack + Xero |
| **Order Fulfillment** | New e-commerce order | Update CRM → Track in project tool → Notify team | Shopify + Zoho CRM + Harvest |
| **Payment Reconciliation** | Payment webhook | Update CRM → Create accounting entry → Send receipt | Stripe + HubSpot + QuickBooks |
| **Scheduled Reporting** | Weekly schedule trigger | Fetch data → Transform → Send to spreadsheet → Notify | Schedule + HTTP Request + Google Sheets + Discord |

---

## Key Takeaways for Foundation Decisions

1. **Start with HTTP Request node** - This single node enables connectivity to any API, providing flexibility while building dedicated integrations

2. **Invest heavily in templates** - Pre-built workflows drive adoption and demonstrate value immediately

3. **Prioritize Google Workspace** - Gmail, Sheets, Calendar, and Drive triggers/actions cover most SME use cases

4. **Build debugging early** - The ability to see execution data per-step is critical for user self-service

5. **Design for conditional logic** - IF/Switch nodes are essential for representing complex logic that SMEs need

6. **Use three-tier data model** - Definition → Execution → Step layers provide clear separation of concerns

7. **Implement event sourcing** - Persisting all step outcomes enables deterministic replay and debugging

8. **Support multiple trigger types** - Webhooks (real-time), Schedules (recurring), Polling (services without webhooks), Manual (testing)

---

## MVP Launch Checklist

### Day 1 Requirements
- [ ] Visual node-based workflow builder
- [ ] Webhook + Schedule + Polling triggers
- [ ] HTTP Request node with auth options
- [ ] IF/Switch conditional nodes
- [ ] 5-7 core integrations (Gmail, Sheets, Slack minimum)
- [ ] Secure credentials storage
- [ ] Execution history view
- [ ] Basic error notifications

### Week 2-4 Additions
- [ ] Template library (10-20 templates)
- [ ] Retry failed executions
- [ ] Looping and merging nodes
- [ ] Step-by-step debugger
- [ ] 10+ additional integrations

### Month 2+ Scaling
- [ ] User management with roles
- [ ] Project-based RBAC
- [ ] Sub-workflows
- [ ] Version history
- [ ] Log streaming/monitoring

---

## Research Sources

- n8n open-source documentation and architecture
- Apache Airflow schema and execution patterns
- Convex Workflow implementation
- Vercel Workflow (useworkflow.dev) architecture
- LangGraph state machine patterns
- Zapier, Make.com, Power Automate industry patterns
- Stripe webhook integration patterns

---

**Note**: This document contains pure research findings. Implementation decisions should be made based on TCDynamics' specific requirements, technical constraints, and business priorities.
