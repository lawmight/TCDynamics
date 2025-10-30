# Claude Code: Complete Guide to Using Claude CLI at Its Fullest

> **Last Updated:** October 2025
> **Source:** Official Anthropic Claude Code Documentation
> **Comprehensive guide covering all features from installation to advanced usage**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Core Commands & CLI Reference](#core-commands--cli-reference)
5. [Configuration & Settings](#configuration--settings)
6. [Slash Commands](#slash-commands)
7. [Model Context Protocol (MCP)](#model-context-protocol-mcp)
8. [Hooks System](#hooks-system)
9. [Subagents](#subagents)
10. [Agent Skills](#agent-skills)
11. [Plugins](#plugins)
12. [Memory Management](#memory-management)
13. [Interactive Mode Features](#interactive-mode-features)
14. [Common Workflows](#common-workflows)
15. [CI/CD Integration](#cicd-integration)
16. [Troubleshooting](#troubleshooting)
17. [Best Practices](#best-practices)
18. [Additional Resources](#additional-resources)

---

## Introduction

### What is Claude Code?

Claude Code is Anthropic's official agentic CLI tool designed to streamline development workflows by integrating AI capabilities directly into your terminal environment. It's a powerful command-line interface that brings Claude's capabilities to your development workflow.

### Key Features

**Core Capabilities:**
- **Build features from descriptions** - Provide plain English requests that Claude translates into functional code
- **Debugging assistance** - Error analysis and automated fixes across your codebase
- **Codebase navigation** - Comprehensive understanding of your project structure and documentation
- **Task automation** - Automate repetitive development tasks

**Developer-Friendly Design:**
- Operates natively within terminal environments
- Takes direct action including file editing, command execution, and commit creation
- Follows Unix philosophy principles - composable and scriptable
- Supports piping and integration with CI/CD systems
- VS Code extension (Beta) available for GUI preference

**Enterprise Capabilities:**
- Claude API integration
- AWS Bedrock and Google Vertex AI hosting options
- Built-in security and compliance features
- Customizable configuration for organizational workflows

---

## Installation

### System Requirements

- **Node.js:** 18+ required
- **Operating Systems:**
  - macOS 10.15+
  - Ubuntu 20.04+ / Debian 10+
  - Windows 10+ (with WSL or Git Bash)
- **Shell Support:** Best with Bash, Zsh, or Fish
- **Internet Connection:** Required for authentication and AI processing

### Installation Methods

#### Method 1: NPM (Standard)

```bash
npm install -g @anthropic-ai/claude-code
```

**Important:** Avoid using `sudo` to prevent permission issues.

#### Method 2: Homebrew (macOS/Linux)

```bash
brew install --cask claude-code
```

#### Method 3: Native Binary (Beta)

**macOS/Linux/WSL:**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell:**
```powershell
irm https://claude.ai/install.ps1 | iex
```

### Verification

After installation, verify your setup:

```bash
claude doctor
```

This command checks:
- Installation type (npm vs native)
- System compatibility
- Authentication status
- Configuration health

### Updates

**Automatic Updates:**
- Claude Code automatically updates to the latest version
- Disable via `DISABLE_AUTOUPDATER` environment variable

**Manual Updates:**
```bash
claude update
```

---

## Getting Started

### Authentication

Claude Code supports three authentication methods:

1. **Claude Console** (Default) - Requires active billing
2. **Claude App** - Available with Pro or Max subscription
3. **Enterprise Platforms** - Amazon Bedrock or Google Vertex AI

**Initial Login:**
```bash
claude
# Follow the authentication prompt
```

**Switch Accounts:**
```bash
/login
```

### First Steps

#### 1. Navigate to Your Project

```bash
cd /path/to/your/project
```

#### 2. Launch Claude Code

```bash
claude
```

#### 3. Start Asking Questions

Try these initial queries:
- "What does this project do?"
- "Explain the project structure"
- "What technologies are used here?"

### Quick Command Overview

| Command | Purpose |
|---------|---------|
| `claude` | Launch interactive mode |
| `claude "task"` | Execute single task |
| `claude -p "query"` | Run query and exit (print mode) |
| `claude -c` | Continue most recent conversation |
| `claude -r` | Resume conversation (interactive picker) |
| `/help` | Display available commands |
| `/clear` | Clear conversation history |

---

## Core Commands & CLI Reference

### Execution Modes

#### Interactive REPL Mode

Start a conversational session:
```bash
claude
# or
claude "what does this project do?"
```

#### Print Mode (Non-Interactive)

Query and exit immediately:
```bash
claude -p "explain this error: $(cat error.log)"
```

#### Piped Input

Process files with pipes:
```bash
cat file.txt | claude -p "summarize this"
git diff | claude -p "review these changes"
```

#### Session Management

**Continue Last Conversation:**
```bash
claude -c
# or
claude --continue
```

**Resume Specific Session:**
```bash
claude -r
# or
claude --resume [session-id]
```

### Essential Flags

#### Output & Input Control

- `--print` / `-p` - Non-interactive query mode
- `--output-format [text|json|stream-json]` - Control output format
- `--input-format [text|stream-json]` - Handle different input formats
- `--verbose` - Enable detailed turn-by-turn logging

#### Behavior Customization

- `--model [sonnet|opus|haiku]` - Select model version
- `--max-turns [number]` - Limit agentic iterations in non-interactive mode
- `--permission-mode [ask|allow|plan]` - Set access control level
- `--continue` / `-c` - Resume last conversation
- `--resume [id]` / `-r` - Resume specific conversation

#### Advanced Options

- `--add-dir [path]` - Include additional working directories
- `--agents [json]` - Define custom subagents dynamically
- `--allowedTools [tools]` - Whitelist specific tools
- `--disallowedTools [tools]` - Blacklist specific tools
- `--append-system-prompt [text]` - Add custom instructions (print mode only)
- `--dangerously-skip-permissions` - Bypass consent checks (use cautiously)

### Maintenance Commands

```bash
# Update Claude Code
claude update

# Configure MCP servers
claude mcp

# Check installation health
claude doctor

# Migrate to native installer
claude migrate-installer
```

### Examples

**Single Task Execution:**
```bash
claude "add a hello world function to main.js"
```

**Piping Git Changes:**
```bash
git diff | claude -p "explain what changed and why"
```

**Automated Script:**
```bash
# In package.json
"scripts": {
  "lint:claude": "claude -p 'check code quality and suggest improvements'"
}
```

**CI/CD Integration:**
```bash
claude -p "review this PR for security issues" \
  --max-turns 3 \
  --output-format json \
  --dangerously-skip-permissions
```

---

## Configuration & Settings

### Settings Files Structure

Claude Code uses hierarchical JSON configuration across three levels:

1. **User Settings** - `~/.claude/settings.json` (Global preferences)
2. **Project Settings** - `.claude/settings.json` (Project-specific)
3. **Local Project Settings** - `.claude/settings.local.json` (Git-ignored)
4. **Enterprise Policies** - System administrator deployments

**Priority Order:** Enterprise > Project > Local > User

### Accessing Configuration

**Open Settings File:**
```bash
/config
```

**Manual Edit:**
```bash
# User settings
nano ~/.claude/settings.json

# Project settings
nano .claude/settings.json
```

### Core Configuration Options

#### Authentication Settings

```json
{
  "apiKeyHelper": "command-to-get-api-key",
  "forceLoginMethod": "console|app",
  "forceLoginOrgUUID": "org-uuid-here"
}
```

#### Model Selection

```json
{
  "model": "claude-sonnet-4",
  "ANTHROPIC_MODEL": "claude-sonnet-4"
}
```

#### Behavior Settings

```json
{
  "cleanupPeriodDays": 30,
  "outputStyle": "default",
  "statusLine": "auto",
  "includeCoAuthoredBy": true
}
```

#### Extensibility

```json
{
  "hooks": [],
  "disableAllHooks": false,
  "enabledPlugins": ["plugin-name@marketplace"]
}
```

#### Environment Variables

```json
{
  "env": {
    "CUSTOM_VAR": "value",
    "PATH": "/custom/path:${PATH}"
  }
}
```

#### MCP Servers

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["server-name"],
  "disabledMcpjsonServers": ["server-name"]
}
```

### Permission Management

Permissions control tool access with three operations:

**Allow:** Grant permission without prompting
```json
{
  "permissions": [
    {
      "allow": "Bash(npm run test:*)"
    },
    {
      "allow": "Read(~/.zshrc)"
    }
  ]
}
```

**Ask:** Require confirmation
```json
{
  "permissions": [
    {
      "ask": "Write(**/*.ts)"
    }
  ]
}
```

**Deny:** Block access
```json
{
  "permissions": [
    {
      "deny": "Bash(rm -rf *)"
    },
    {
      "deny": "Edit(.env)"
    },
    {
      "deny": "Read(.git/**)"
    }
  ]
}
```

### Available Tools

Claude Code has 12 tools requiring permission management:

- **Bash** - Execute shell commands
- **Edit** - Modify existing files
- **Write** - Create new files
- **Read** - View file contents
- **WebFetch** - Fetch web content
- **WebSearch** - Search the internet
- **Glob** - Find files by pattern
- **Grep** - Search file contents
- **NotebookRead** - Read Jupyter notebooks
- **NotebookEdit** - Edit Jupyter notebooks
- **SlashCommand** - Execute slash commands
- **Task** - Launch subagents

### Sandbox Configuration

Advanced isolation for bash commands:

```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "readRules": ["allow:/home/user/project/**"],
      "editRules": ["deny:/etc/**"]
    },
    "network": {
      "allowLocalhost": false,
      "allowUnixSockets": false
    }
  }
}
```

### Environment Variables

Over 40 environment variables control behavior:

**API & Authentication:**
- `ANTHROPIC_API_KEY` - API key for authentication
- `ANTHROPIC_API_URL` - Custom API endpoint
- `ANTHROPIC_ORG_UUID` - Organization UUID

**Model Selection:**
- `ANTHROPIC_MODEL` - Default model to use
- `CLAUDE_MODEL` - Alternative model variable

**Proxy Configuration:**
- `HTTP_PROXY` / `HTTPS_PROXY` - Proxy settings
- `NO_PROXY` - Bypass proxy for specific hosts

**Feature Toggles:**
- `DISABLE_TELEMETRY` - Disable usage analytics
- `DISABLE_AUTOUPDATER` - Disable automatic updates
- `DISABLE_ERROR_REPORTING` - Disable crash reports

**Advanced Settings:**
- `USE_BUILTIN_RIPGREP` - Use bundled ripgrep
- `CLAUDE_CODE_DEBUG` - Enable debug logging
- `MAX_CONTEXT_SIZE` - Limit context window

---

## Slash Commands

### Overview

Slash commands are shortcuts for controlling Claude Code during interactive sessions. They provide quick access to common operations without leaving the conversation flow.

### Built-in Commands (24+)

#### Conversation Management

- `/clear` - Remove conversation history
- `/compact` - Condense conversation to save context
- `/rewind` - Revert recent changes
- `/continue` - Resume previous conversation
- `/resume` - Select conversation to resume

#### Configuration & Account

- `/config` - Open settings file
- `/login` - Switch account
- `/logout` - Sign out
- `/model` - Switch AI model
- `/permissions` - Manage tool permissions
- `/mcp` - Configure MCP servers

#### Development Tools

- `/review` - Request code analysis
- `/bug` - Report issues to Anthropic
- `/terminal-setup` - Configure key bindings
- `/status` - Display version and connectivity
- `/cost` - Show token usage
- `/usage` - Show rate limit data

#### Project Setup

- `/init` - Initialize project with CLAUDE.md
- `/add-dir` - Include additional directories
- `/memory` - Edit memory files
- `/hooks` - Configure hooks

#### Viewing Information

- `/agents` - List available subagents
- `/help` - Show all commands
- `/plugin` - Manage plugins

### Custom Slash Commands

Create reusable prompts as Markdown files in two locations:

**Project Commands** (shared with team):
```
.claude/commands/command-name.md
```

**Personal Commands** (available everywhere):
```
~/.claude/commands/command-name.md
```

#### Basic Command Structure

**File:** `.claude/commands/fix-typos.md`

```markdown
---
description: Fix spelling and grammar errors
---

Please review all files in the current directory and fix any spelling or grammar errors you find. Focus on:
- Comments
- Documentation
- String literals
- README files
```

#### Commands with Arguments

Use `$ARGUMENTS`, `$1`, `$2` for dynamic values:

**File:** `.claude/commands/fix-issue.md`

```markdown
---
description: Fix a GitHub issue by number
argument-hint: <issue-number>
---

Please fix GitHub issue #$1. Steps:
1. Read the issue details
2. Locate relevant code
3. Implement the fix
4. Add tests
5. Create a commit
```

**Usage:**
```bash
/fix-issue 123
```

#### Advanced Features

**Execute Bash Commands:**

```markdown
---
description: Run tests and fix failures
allowed-tools: Bash, Edit, Write
---

!npm test

Please analyze any test failures and fix them.
```

**Include File References:**

```markdown
---
description: Review security in authentication
---

Please review the security of @src/auth.ts and @src/middleware/auth.ts
```

**Specify Model:**

```markdown
---
description: Deep architectural analysis
model: opus
---

Analyze the entire codebase architecture...
```

**Disable Auto-execution:**

```markdown
---
description: Template for new features
disable-model-invocation: true
---

Feature implementation template content...
```

#### Namespacing with Subdirectories

Organize commands without affecting command names:

```
.claude/commands/
  review/
    security.md     -> /security
    performance.md  -> /performance
  git/
    commit.md       -> /commit
    pr.md           -> /pr
```

### Plugin & MCP Commands

**Plugin Commands:**
```bash
/plugin-name:command-name
```

**MCP Commands:**
```bash
/mcp__server-name__prompt-name
```

### SlashCommand Tool

Allows Claude to execute commands programmatically. Requirements:
- Commands must have `description` frontmatter
- Doesn't support built-in commands
- Can be restricted via permissions

**Permission Examples:**
```json
{
  "permissions": [
    {"deny": "SlashCommand:/commit"},
    {"allow": "SlashCommand:/review-pr:*"}
  ]
}
```

---

## Model Context Protocol (MCP)

### What is MCP?

MCP is an open-source standard for AI-tool integrations that enables Claude Code to access external tools, databases, and APIs without custom code modifications.

### Capabilities

With MCP servers, you can:
- Extract and implement features from issue trackers
- Analyze monitoring and performance data
- Query databases naturally
- Integrate design files (Figma, etc.)
- Automate multi-step tasks across platforms

### Installation Methods

#### HTTP Servers (Recommended for Cloud Services)

```bash
claude mcp add --transport http github-server https://api.github.com/mcp
```

#### Stdio Servers (Local Processes)

```bash
claude mcp add --transport stdio postgres-db -- psql -h localhost
```

#### SSE Servers (Deprecated)

```bash
claude mcp add --transport sse monitoring -- node monitoring-server.js
```

### Configuration Scopes

**Local** (Default) - Private to current project:
```bash
claude mcp add my-server --scope local -- command
```

**Project** - Shared via `.mcp.json` in version control:
```bash
claude mcp add my-server --scope project -- command
```

**User** - Available across all projects:
```bash
claude mcp add my-server --scope user -- command
```

### Popular MCP Servers (40+)

#### Project Management
- **Asana** - Task management integration
- **Linear** - Issue tracking
- **Monday.com** - Workflow automation
- **Notion** - Documentation and databases

#### Development Tools
- **GitHub** - Repository management
- **Sentry** - Error monitoring
- **Socket** - Security scanning

#### Payments
- **Stripe** - Payment processing
- **PayPal** - Transaction handling
- **Square** - Commerce platform

#### Infrastructure
- **Vercel** - Deployment platform
- **Netlify** - Web hosting
- **Cloudflare** - CDN and security

#### Design Tools
- **Figma** - Design files
- **Canva** - Graphics creation

#### Data & AI
- **PostgreSQL** - Database queries
- **Hugging Face** - ML models
- **Airtable** - Flexible databases

### Authentication

Many MCP servers require authentication. Claude Code supports OAuth 2.0:

```bash
# Configure MCP with authentication
/mcp

# Follow the OAuth flow
```

Claude automatically handles:
- Secure token storage
- Automatic token refresh
- Credential management

### Example: Setting Up GitHub MCP

```bash
# Add GitHub MCP server
claude mcp add github \
  -e GITHUB_TOKEN=your_token_here \
  --scope user \
  -- npx @modelcontextprotocol/server-github

# Use in conversation
"Get all open issues from my repository"
"Create a new branch for the authentication feature"
```

### Example: Setting Up PostgreSQL MCP

```bash
# Add PostgreSQL MCP server
claude mcp add postgres \
  -e DATABASE_URL=postgresql://localhost/mydb \
  --scope project \
  -- npx @modelcontextprotocol/server-postgres

# Use in conversation
"Show me all users created in the last week"
"What's the average order value this month?"
```

### Security Considerations

**Important:** Only install trusted MCP servers. Anthropic has not verified the correctness or security of all community servers.

**Best Practices:**
- Review server code before installation
- Use environment variables for secrets
- Limit server permissions when possible
- Regularly update servers
- Monitor server activity

### Managing MCP Servers

**List Installed Servers:**
```bash
claude mcp list
```

**Remove Server:**
```bash
claude mcp remove server-name
```

**Update Server:**
```bash
claude mcp update server-name
```

---

## Hooks System

### What Are Hooks?

Hooks are user-defined shell commands that execute at specific lifecycle points in Claude Code. They provide deterministic control over behavior without relying on LLM decision-making.

### Key Use Cases

- **Notifications** - Custom alerts when Claude awaits input
- **Automatic Formatting** - Run formatters (prettier, gofmt) after edits
- **Logging** - Track executed commands for compliance
- **Feedback** - Provide automated responses when code violates conventions
- **Custom Permissions** - Prevent modifications to sensitive files

### Available Hook Events

| Event | Trigger Point |
|-------|---------------|
| `PreToolUse` | Before tool execution |
| `PostToolUse` | After tool execution |
| `UserPromptSubmit` | When users submit prompts |
| `Notification` | During notification dispatch |
| `Stop` | When response completes |
| `SubagentStop` | When subagent task completes |
| `PreCompact` | Before compact operations |
| `SessionStart` | Session initialization |
| `SessionEnd` | Session termination |

### Creating Hooks

#### Quick Implementation

1. Run `/hooks` command
2. Select hook event (e.g., `PreToolUse`)
3. Add a matcher (e.g., Bash commands)
4. Enter your shell command

#### Example: Command Logging

**Event:** `PreToolUse`
**Matcher:** `Bash`
**Command:**
```bash
jq -r '"\(.tool_input.command) - \(.tool_input.description // "No description")"' >> ~/.claude/bash-command-log.txt
```

### Advanced Examples

#### Automatic Code Formatting

**Hook Configuration:**
```json
{
  "hooks": [
    {
      "event": "PostToolUse",
      "matcher": "Edit(**/*.ts)",
      "command": "npx prettier --write $CLAUDE_EDITED_FILE"
    }
  ]
}
```

#### Markdown Enhancement

**Python Script:** `fix-markdown.py`
```python
#!/usr/bin/env python3
import json
import sys
import re

data = json.load(sys.stdin)
content = data['tool_input']['content']

# Add missing language tags
if '```\n' in content:
    print(json.dumps({
        "block": True,
        "feedback": "Code blocks are missing language identifiers"
    }))
    sys.exit(1)
```

**Hook Configuration:**
```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "matcher": "Edit(**/*.md)",
      "command": "python3 fix-markdown.py"
    }
  ]
}
```

#### Desktop Notifications

**Linux (notify-send):**
```json
{
  "hooks": [
    {
      "event": "Notification",
      "command": "notify-send 'Claude Code' 'Waiting for your input'"
    }
  ]
}
```

**macOS (osascript):**
```json
{
  "hooks": [
    {
      "event": "Notification",
      "command": "osascript -e 'display notification \"Waiting for input\" with title \"Claude Code\"'"
    }
  ]
}
```

#### File Protection

Prevent edits to sensitive files:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "matcher": "Edit(.env*)",
      "command": "echo '{\"block\": true, \"feedback\": \"Cannot edit .env files\"}'"
    },
    {
      "event": "PreToolUse",
      "matcher": "Edit(.git/**)",
      "command": "echo '{\"block\": true, \"feedback\": \"Cannot edit git internals\"}'"
    }
  ]
}
```

### Hook Input/Output Format

#### Input (stdin)

Hooks receive JSON input:

```json
{
  "event": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test",
    "description": "Run test suite"
  },
  "conversation_id": "abc123",
  "turn_number": 5
}
```

#### Output (stdout)

Hooks can return JSON to control behavior:

```json
{
  "block": true,
  "feedback": "This action is not allowed"
}
```

Or simply exit with status code:
- `0` - Allow (success)
- Non-zero - Block (failure)

### Security Warning

**Critical:** Hooks run automatically with your environment's credentials. Always review hook code before implementation to prevent:
- Data exfiltration
- Unintended file modifications
- Credential exposure
- Malicious command execution

---

## Subagents

### What Are Subagents?

Subagents are specialized AI assistants that handle specific tasks independently. Each operates with:
- Its own context window
- Custom system prompts
- Configurable tool access
- Specific model selection

**Key Benefit:** Separate context windows prevent pollution of the main conversation and keep it focused on high-level objectives.

### Why Use Subagents?

1. **Context Preservation** - Main conversation stays focused
2. **Specialized Expertise** - Fine-tuned for specific domains
3. **Reusability** - Use across projects and share with teams
4. **Flexible Permissions** - Different tool access levels

### Creating Subagents

#### Quick Start Method

```bash
/agents
```

From the interactive interface:
1. Create project-level or user-level subagent
2. Generate with Claude's assistance or write manually
3. Select specific tools or inherit all
4. Save configuration

#### File Format

**Location:**
- Project: `.claude/agents/agent-name.md`
- User: `~/.claude/agents/agent-name.md`

**Structure:**
```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and best practices. Use PROACTIVELY after significant code changes.
tools: Read, Grep, Glob
model: sonnet
---

You are an expert code reviewer specializing in security, performance, and maintainability.

When reviewing code:
1. Check for security vulnerabilities
2. Identify performance bottlenecks
3. Suggest architectural improvements
4. Verify test coverage
5. Ensure documentation quality

Provide specific, actionable feedback with code examples.
```

### Configuration Fields

#### Required Fields

- **`name`** - Lowercase identifier with hyphens (e.g., `data-scientist`)
- **`description`** - Natural language purpose (include trigger words)

#### Optional Fields

- **`tools`** - Comma-separated list (e.g., `Read, Edit, Bash`)
- **`model`** - Specific model (`sonnet`, `opus`, `haiku`, `inherit`)

### Using Subagents

#### Automatic Delegation

Claude intelligently delegates based on:
- Task description matching
- Subagent description keywords
- Current conversation context

**Tip:** Include phrases like "use PROACTIVELY" or "MUST BE USED" in descriptions to encourage automatic usage.

#### Explicit Invocation

Directly request a specific subagent:

```
"Use the code-reviewer subagent to check my changes"
"Have the debugger investigate this error"
"Ask the data-scientist to analyze this CSV"
```

### Example Subagents

#### 1. Code Reviewer

```markdown
---
name: code-reviewer
description: Expert code reviewer. Use after any significant code changes to ensure quality and security.
tools: Read, Grep, Glob
model: sonnet
---

You are an expert code reviewer with 15+ years of experience.

Review code for:
- **Security**: SQL injection, XSS, auth issues
- **Performance**: N+1 queries, inefficient algorithms
- **Maintainability**: Code duplication, complex functions
- **Testing**: Coverage gaps, edge cases
- **Documentation**: Missing comments, unclear APIs

Provide:
1. Severity rating (Critical/High/Medium/Low)
2. Specific location (file:line)
3. Problem description
4. Recommended fix with code example
```

#### 2. Debugger

```markdown
---
name: debugger
description: Root cause analysis specialist. Use when encountering errors, exceptions, or unexpected behavior.
tools: Read, Bash, Grep, Glob
model: sonnet
---

You are a debugging specialist focused on root cause analysis.

Debugging process:
1. Reproduce the issue
2. Analyze stack traces and error messages
3. Review relevant code sections
4. Check logs and system state
5. Identify root cause
6. Propose fix with explanation
7. Suggest preventive measures

Always:
- Explain WHY the bug occurred
- Provide step-by-step fix instructions
- Suggest tests to prevent regression
```

#### 3. Data Scientist

```markdown
---
name: data-scientist
description: Data analysis and SQL expert. Use for database queries, data analysis, and visualization tasks.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL and data analysis.

For data tasks:
1. Understand the question clearly
2. Write efficient SQL queries
3. Analyze results statistically
4. Identify patterns and anomalies
5. Create visualizations when helpful
6. Provide actionable insights

SQL best practices:
- Use CTEs for readability
- Add appropriate indexes
- Explain query performance
- Handle NULL values explicitly
```

### Best Practices

1. **Single Responsibility** - Focus each subagent on one domain
2. **Detailed Prompts** - Write specific, comprehensive system prompts
3. **Appropriate Tools** - Restrict to necessary tools only
4. **Proactive Use** - Include trigger phrases in descriptions
5. **Version Control** - Commit project subagents for team sharing
6. **Iterate** - Start with Claude-generated, then customize
7. **Test Thoroughly** - Verify behavior matches expectations
8. **Chain When Needed** - Combine multiple subagents for complex workflows

### Advanced Features

#### Dynamic Subagents via CLI

```bash
claude --agents '[
  {
    "name": "security-auditor",
    "description": "Security vulnerability scanner",
    "tools": ["Read", "Grep"],
    "prompt": "You are a security auditor..."
  }
]' "audit the codebase"
```

#### Plugin-Provided Subagents

Plugins can include subagents that automatically become available:

```
my-plugin/
  .claude-plugin/
    plugin.json
  agents/
    plugin-agent.md
```

---

## Agent Skills

### Overview

Agent Skills are modular capabilities that extend Claude's functionality. Unlike slash commands (user-invoked), Skills are autonomously activated by Claude based on context.

**Key Difference:**
- **Slash Commands:** User explicitly invokes (`/command`)
- **Agent Skills:** Claude decides when to use them

### Primary Benefits

1. **Extend Capabilities** - Add specialized workflows
2. **Share Expertise** - Distribute team knowledge via git
3. **Reduce Repetition** - Eliminate repeated prompting
4. **Compose Workflows** - Chain multiple Skills together

### Storage Locations

| Type | Location | Scope |
|------|----------|-------|
| Personal | `~/.claude/skills/` | Individual workflows |
| Project | `.claude/skills/` | Team workflows (git) |
| Plugin | Plugin bundle | Automatic with plugin |

### Skill Structure

**Directory Layout:**
```
.claude/skills/my-skill/
  SKILL.md          # Required: Main skill definition
  reference.md      # Optional: Additional documentation
  examples.md       # Optional: Usage examples
  scripts/          # Optional: Helper scripts
  templates/        # Optional: Code templates
```

### SKILL.md Format

```markdown
---
name: security-audit
description: Performs comprehensive security audit of code, including OWASP top 10 vulnerabilities. Use when security review is mentioned or before production deploys.
allowed-tools: Read, Grep, Glob
---

# Security Audit Skill

## Scope
Analyze code for:
- SQL Injection
- XSS vulnerabilities
- Authentication flaws
- Authorization issues
- Sensitive data exposure
- CSRF vulnerabilities

## Process
1. Scan all source files
2. Check dependencies for CVEs
3. Review authentication logic
4. Analyze authorization rules
5. Check input validation
6. Report findings with severity

## Output Format
- Critical issues first
- File and line number
- Vulnerability description
- Exploitation scenario
- Remediation steps
```

### Required Frontmatter

- **`name`** - Lowercase, hyphens, numbers only (max 64 chars)
- **`description`** - What it does AND when to use it (max 1024 chars)

**Critical:** The description must include trigger words so Claude knows when to activate the Skill.

### Optional Frontmatter

- **`allowed-tools`** - Restrict tool access (useful for read-only Skills)

```markdown
---
name: readonly-analyzer
description: Analyzes code patterns without making changes
allowed-tools: Read, Grep, Glob
---
```

### Supporting Files

Claude loads supporting files progressively to manage context:

**reference.md** - Additional documentation:
```markdown
# API Reference

## Functions
- `analyzeFile(path)` - Scans single file
- `scanDirectory(dir)` - Recursive directory scan
- `generateReport(findings)` - Creates report
```

**examples.md** - Usage examples:
```markdown
# Examples

## Basic Usage
"Run security audit on the API endpoints"

## Advanced Usage
"Perform security audit focusing on authentication"
```

**scripts/** - Helper scripts:
```
scripts/
  vulnerability-scanner.py
  dependency-checker.sh
  report-generator.js
```

**templates/** - Code templates:
```
templates/
  security-report.md
  vulnerability-fix.diff
```

### Creating Skills

#### Method 1: Interactive Creation

```bash
# Ask Claude to create a skill
"Create a skill for API documentation generation"

# Claude will:
# 1. Ask for details about the skill
# 2. Create the directory structure
# 3. Write SKILL.md and supporting files
# 4. Explain how to test it
```

#### Method 2: Manual Creation

```bash
# Create directory
mkdir -p .claude/skills/api-docs

# Create SKILL.md
cat > .claude/skills/api-docs/SKILL.md << 'EOF'
---
name: api-docs
description: Generates comprehensive API documentation from code. Use when API documentation is requested or routes are modified.
allowed-tools: Read, Grep, Write
---

# API Documentation Generator

Scans code for API endpoints and generates documentation including:
- Endpoint paths and methods
- Request/response formats
- Authentication requirements
- Rate limits
- Error codes

Output format: OpenAPI 3.0 specification
EOF
```

### Using Skills

#### Automatic Activation

Claude decides when to use Skills based on your request:

```
"I need API documentation for all endpoints"
# Claude may activate api-docs skill

"Review security before deployment"
# Claude may activate security-audit skill
```

#### Viewing Available Skills

```
"What Skills are available?"
"List all Skills"
```

Claude will show:
- Skill name
- Description
- Source (personal/project/plugin)

### Testing Skills

After creating a Skill:

1. **Ask a matching question:**
   ```
   "Generate API documentation"
   ```

2. **Watch for Skill invocation:**
   Claude will indicate: "Using api-docs skill..."

3. **Check the output:**
   Verify it matches expectations

4. **Refine description:**
   If not activated, make description more specific

### Debugging Skills

**Common Issues:**

1. **Skill not activating:**
   - Description too vague
   - Missing trigger words
   - Try more explicit request

2. **Syntax errors:**
   - Verify YAML frontmatter
   - Check file paths
   - Review allowed-tools

3. **Enable debug mode:**
   ```bash
   claude --debug
   ```

### Example Skills

#### 1. Code Coverage Analyzer

```markdown
---
name: coverage-analyzer
description: Analyzes test coverage and identifies untested code. Use when test coverage is mentioned or before releases.
allowed-tools: Read, Bash, Grep
---

# Code Coverage Analyzer

## Process
1. Run test suite with coverage
2. Parse coverage reports
3. Identify uncovered functions
4. Prioritize by criticality
5. Generate test suggestions

## Output
- Coverage percentage by file
- List of untested functions
- Suggested test cases
- Critical gaps highlighted
```

#### 2. Performance Profiler

```markdown
---
name: performance-profiler
description: Profiles code performance and identifies bottlenecks. Use when performance issues are reported or before optimization.
allowed-tools: Read, Bash, Grep, Write
---

# Performance Profiler

## Analysis Steps
1. Identify hot paths
2. Measure execution time
3. Analyze memory usage
4. Check database queries
5. Review network calls

## Recommendations
- Specific bottlenecks
- Optimization strategies
- Expected improvements
- Implementation priority
```

### Best Practices

1. **Focused Skills** - One capability per Skill
2. **Descriptive Names** - Clear, specific trigger phrases
3. **Include Keywords** - Use terms users would naturally say
4. **Document Thoroughly** - Use supporting files effectively
5. **Test Extensively** - Verify activation and output
6. **Iterate Based on Use** - Refine descriptions over time
7. **Share via Git** - Commit project Skills for team use

### Sharing Skills

#### Via Git (Recommended for Teams)

```bash
# Commit Skills to project
git add .claude/skills/
git commit -m "Add API documentation skill"
git push

# Team members automatically get it
git pull
```

#### Via Plugins (Recommended for Distribution)

Package Skills in plugins for broader sharing:

```
my-plugin/
  .claude-plugin/
    plugin.json
  skills/
    api-docs/
      SKILL.md
      examples.md
```

### Lifecycle Operations

**Update Skill:**
```bash
# Edit SKILL.md
nano .claude/skills/my-skill/SKILL.md

# Restart Claude Code for changes to take effect
/clear
```

**Remove Skill:**
```bash
# Delete directory
rm -rf .claude/skills/my-skill/

# Commit if project skill
git add -A
git commit -m "Remove obsolete skill"
```

---

## Plugins

### What Are Plugins?

Plugins extend Claude Code with shareable, packaged functionality that can include:
- Custom slash commands
- Specialized subagents
- Agent Skills
- Hooks
- MCP servers

**Key Benefit:** Plugins let you bundle functionality and share it across projects and teams.

### Plugin Components

A plugin can include any combination of:

| Component | Purpose |
|-----------|---------|
| **Commands** | Custom slash commands |
| **Agents** | Specialized subagents |
| **Skills** | Autonomous capabilities |
| **Hooks** | Event handlers |
| **MCP Servers** | External integrations |

### Plugin Structure

```
my-plugin/
  .claude-plugin/
    plugin.json         # Required manifest
  commands/             # Optional: Slash commands
    deploy.md
    test.md
  agents/               # Optional: Subagents
    reviewer.md
  skills/               # Optional: Skills
    lint/
      SKILL.md
  hooks/                # Optional: Hooks
    pre-commit.sh
  README.md             # Optional but recommended
```

### Plugin Manifest

**File:** `.claude-plugin/plugin.json`

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "Awesome development tools",
  "author": "Your Name",
  "homepage": "https://github.com/you/claude-plugin",
  "keywords": ["testing", "deployment"],
  "mcpServers": {
    "my-server": {
      "transport": "stdio",
      "command": "node",
      "args": ["server.js"]
    }
  }
}
```

### Installing Plugins

#### Interactive Installation

```bash
/plugin
```

Choose from:
- Browse marketplace
- Install by name
- Manage installed plugins

#### Direct Installation

```bash
/plugin install plugin-name@marketplace-name
```

### Available Plugins

Official Anthropic plugins:

1. **commit-commands** - Git commit helpers
2. **pr-review-toolkit** - Pull request review automation
3. **feature-dev** - Feature development workflows
4. **security-guidance** - Security best practices
5. **agent-sdk-dev** - Agent SDK development tools

### Managing Plugins

**List Installed:**
```bash
/plugin list
```

**Enable/Disable:**
```bash
/plugin enable plugin-name
/plugin disable plugin-name
```

**Uninstall:**
```bash
/plugin uninstall plugin-name
```

**Update:**
```bash
/plugin update plugin-name
```

### Creating Plugins

#### Step 1: Initialize Structure

```bash
mkdir my-plugin
cd my-plugin
mkdir -p .claude-plugin commands agents skills
```

#### Step 2: Create Manifest

```bash
cat > .claude-plugin/plugin.json << 'EOF'
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My custom Claude Code plugin",
  "author": "Your Name"
}
EOF
```

#### Step 3: Add Components

**Add a command:**
```bash
cat > commands/deploy.md << 'EOF'
---
description: Deploy to production
---

Please deploy the application:
1. Run tests
2. Build production bundle
3. Deploy to server
4. Run smoke tests
5. Notify team
EOF
```

**Add a subagent:**
```bash
cat > agents/tester.md << 'EOF'
---
name: tester
description: Automated testing specialist
tools: Bash, Read, Write
---

You are a testing specialist. Generate comprehensive tests.
EOF
```

#### Step 4: Test Locally

```bash
# Create local marketplace
mkdir -p ~/.claude/marketplaces/local

# Link your plugin
ln -s /path/to/my-plugin ~/.claude/marketplaces/local/

# Install from local marketplace
/plugin install my-plugin@local
```

### Distributing Plugins

#### GitHub Marketplace (Recommended)

1. Create GitHub repository
2. Add plugin files
3. Create release with tag
4. Submit to Claude Code marketplace registry

#### Private Marketplace

**For Teams/Organizations:**

```json
// .claude/settings.json
{
  "pluginMarketplaces": [
    {
      "name": "company-internal",
      "url": "https://plugins.company.com/registry.json"
    }
  ],
  "enabledPlugins": [
    "internal-tools@company-internal"
  ]
}
```

### Auto-installing Plugins

**Project-level auto-install:**

```json
// .claude/settings.json
{
  "enabledPlugins": [
    "pr-review-toolkit@anthropic",
    "company-tools@internal"
  ]
}
```

When team members run Claude Code in this project, these plugins automatically install.

### Plugin Namespacing

Commands from plugins use namespace format:

```bash
# Plugin command
/plugin-name:command-name

# Example
/pr-review-toolkit:review-pr 123
```

### Best Practices

1. **Clear Naming** - Descriptive plugin and command names
2. **Good Documentation** - Comprehensive README
3. **Version Properly** - Semantic versioning
4. **Test Thoroughly** - All components in isolation
5. **Minimal Permissions** - Request only needed tools
6. **Update Regularly** - Keep dependencies current
7. **Provide Examples** - Show usage patterns

---

## Memory Management

### Memory Hierarchy

Claude Code uses four memory locations in order of precedence:

1. **Enterprise Policy** - Organization-wide rules (highest priority)
2. **Project Memory** - Team instructions via `CLAUDE.md`
3. **User Memory** - Personal preferences
4. **Local Project Memory** - Deprecated (use imports instead)

### Memory Files

| Type | Location | Scope | Priority |
|------|----------|-------|----------|
| Enterprise | Managed by admin | All users | 1 (Highest) |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Current project | 2 |
| User | `~/.claude/CLAUDE.md` | All projects | 3 |

### How Memory Works

**Automatic Loading:**
All memory files are automatically loaded into Claude's context when launched. Files cascade with higher-level memories taking precedence.

**Discovery Process:**
Claude searches recursively from your current working directory upward (excluding root), loading relevant memory files.

### Creating Memory

#### Quick Method

Start your input with `#`:

```bash
# Always use 2-space indentation for JavaScript
```

Claude will ask where to save:
- User memory (all projects)
- Project memory (current project)

#### Via Command

```bash
/memory
```

Opens the memory file in your system editor for extensive edits.

#### Initialize Project

```bash
/init
```

Bootstraps a project `CLAUDE.md` file with common sections.

### Memory Content Structure

**Example:** `.claude/CLAUDE.md`

```markdown
# Project Guidelines

## Code Style
- Use 2-space indentation
- Always use TypeScript strict mode
- Prefer functional components in React
- Use async/await over promises

## Testing
- Write tests for all new features
- Maintain 80%+ code coverage
- Use Jest for unit tests
- Use Playwright for E2E tests

## Git Workflow
- Create feature branches from `develop`
- Use conventional commits format
- Squash commits before merging
- Require PR reviews from 2+ people

## Architecture
- Follow clean architecture principles
- Keep business logic in domain layer
- Use dependency injection
- Document all public APIs

## Security
- Never commit secrets
- Use environment variables for config
- Sanitize all user inputs
- Implement rate limiting on APIs

## File Organization
@docs/file-structure.md
```

### Import Syntax

Include external files in memory:

```markdown
# Import files
@path/to/guidelines.md
@docs/architecture.md
@.env.example

# Imports support up to 5 levels of nesting
```

**Note:** Imports are NOT evaluated inside markdown code blocks or code spans.

### User Memory

**Location:** `~/.claude/CLAUDE.md`

**Use for:**
- Personal preferences across all projects
- Common patterns you frequently use
- Your coding style conventions
- Frequently used commands

**Example:**
```markdown
# My Personal Preferences

## Code Style
- I prefer verbose variable names
- Always add TODO comments for future improvements
- Prefer explicit over implicit

## Communication
- Explain your reasoning
- Show alternatives when relevant
- Ask clarifying questions when ambiguous

## Git Commits
- Write detailed commit messages
- Include "why" not just "what"
- Reference issue numbers
```

### Project Memory

**Location:** `./CLAUDE.md` or `./.claude/CLAUDE.md`

**Use for:**
- Team coding standards
- Project-specific conventions
- Architecture decisions
- Deployment procedures

**Example:**
```markdown
# MyApp Project Guidelines

## Technology Stack
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS for styling
- Prisma for database
- PostgreSQL database

## Code Organization
- `app/` - Next.js app router pages
- `components/` - Reusable React components
- `lib/` - Utility functions
- `prisma/` - Database schema and migrations

## Environment Variables
Required variables documented in `.env.example`

## Development Workflow
1. Create feature branch
2. Implement with tests
3. Run `npm run validate` (lint, type-check, test)
4. Create PR with description
5. Wait for CI and review

## Deployment
- `main` branch auto-deploys to production
- `develop` branch auto-deploys to staging
```

### Import Best Practices

**Organize documentation:**

```markdown
# Project Memory
@docs/style-guide.md
@docs/architecture.md
@docs/testing.md
@docs/deployment.md
```

**Reference examples:**

```markdown
# API Guidelines
@examples/api-endpoint.ts
@examples/error-handling.ts
```

### Memory Best Practices

1. **Be Specific** - "Use 2-space indentation" not "follow best practices"
2. **Use Markdown Structure** - Headings, lists, code blocks
3. **Keep Updated** - Review and update as project evolves
4. **Avoid Duplication** - Use imports instead of copying
5. **Version Control** - Commit project memory to git
6. **Test Changes** - Verify Claude follows new guidelines
7. **Document Reasoning** - Explain WHY not just WHAT

### Viewing Current Memory

Ask Claude:

```
"What memory files are loaded?"
"Show me the current project guidelines"
"What coding standards should I follow?"
```

### Disabling Memory

**Temporarily ignore memory:**
Add to prompt:
```
"Ignore all memory files for this task..."
```

**Remove memory:**
```bash
# Delete user memory
rm ~/.claude/CLAUDE.md

# Delete project memory
rm .claude/CLAUDE.md
# or
rm CLAUDE.md
```

---

## Interactive Mode Features

### General Controls

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel current input or generation |
| `Ctrl+D` | Exit session (EOF signal) |
| `Ctrl+L` | Clear terminal screen (preserve conversation) |
| `Ctrl+O` | Toggle detailed output visibility |
| `Ctrl+R` | Search command history interactively |
| `Ctrl+V` / `Alt+V` | Paste images from clipboard |
| `Arrow Keys` | Navigate through previous inputs |
| `Esc Esc` | Restore code to earlier checkpoint |

### Extended Capabilities

| Shortcut | Action |
|----------|--------|
| `Tab` | Toggle extended thinking mode on/off |
| `Shift+Tab` / `Alt+M` | Cycle through permission modes |
| `Ctrl+B` | Background current process |
| `?` | Show keyboard shortcuts help |

### Multiline Input

Multiple ways to write across multiple lines:

- **Backslash-Enter** - `\` then `Enter`
- **Option+Enter** - macOS
- **Shift+Enter** - After terminal setup (`/terminal-setup`)
- **Ctrl+J** - Alternative on some systems

### Quick Input Starters

| Prefix | Purpose | Example |
|--------|---------|---------|
| `#` | Save to memory | `# Use 2-space tabs` |
| `/` | Slash command | `/review` |
| `!` | Direct bash | `!ls -la` |
| `@` | File reference | `@src/app.ts` |

### File & Directory References

**Include file content:**
```
@filename.ts
```

**Include directory structure:**
```
@src/components/
```

**MCP resource reference:**
```
@server:resource-name
```

### Image Analysis

**Paste from clipboard:**
- `Ctrl+V` (Linux/Windows)
- `Cmd+V` (macOS)
- `Alt+V` (Alternative)

**Drag and drop:**
Simply drag an image file into the terminal

**Use cases:**
- Analyze screenshots
- Understand diagrams
- Review mockups
- Debug visual issues
- Generate code from designs

### Extended Thinking Mode

**Toggle with Tab:**
```
[Press Tab key]
```

**Or use prompts:**
```
"think about this problem"
"think hard about the architecture"
"think longer about edge cases"
```

**When to use:**
- Architectural decisions
- Complex debugging
- Multi-step planning
- Trade-off analysis
- Performance optimization

**Intensifiers:**
- "think" - Standard extended thinking
- "think hard" - Deeper analysis
- "think longer" - Maximum depth

### Permission Modes

**Cycle with Shift+Tab:**

1. **Ask** - Prompt for every tool use (default)
2. **Allow** - Auto-approve all tool uses
3. **Plan** - Read-only exploration mode

**Or use flags:**
```bash
claude --permission-mode ask
claude --permission-mode allow
claude --permission-mode plan
```

**Plan Mode Benefits:**
- Safe codebase exploration
- No accidental modifications
- Research complex implementations
- Interactive planning

### Vim Mode

**Enable:**
```bash
/terminal-setup
# Select "Enable vim mode"
```

**Standard vim operations:**
- `Esc` - Command mode
- `i` - Insert mode
- `a` - Append mode
- `hjkl` - Navigation
- `dd` - Delete line
- `yy` - Yank line
- `p` - Paste

### Background Processing

**Background a task:**
```
"background this process"
```

**Or use keyboard:**
```
Ctrl+B
```

**Use cases:**
- Long-running tests
- Build processes
- Database migrations
- Large file operations

**While task runs:**
- Continue other work
- Ask unrelated questions
- Check progress anytime

### History & Navigation

**Search history:**
```
Ctrl+R
```
Start typing to search previous inputs

**Navigate history:**
- `Up Arrow` - Previous input
- `Down Arrow` - Next input
- `Ctrl+P` - Previous (alternative)
- `Ctrl+N` - Next (alternative)

### Checkpointing & Rewind

**Create checkpoint:**
Automatic checkpoints before significant changes

**Rewind to checkpoint:**
```bash
/rewind
```

**Or keyboard:**
```
Esc Esc
```

**Restore specific checkpoint:**
Select from interactive list showing:
- Timestamp
- Description of changes
- Files affected

---

## Common Workflows

### Understanding Codebases

#### Quick Overview

```
"What does this project do?"
"Explain the architecture"
"What technologies are used?"
```

#### Deep Dive

```
"How does authentication work?"
"Trace the flow when a user creates an order"
"What are the main components and their interactions?"
```

#### Find Specific Code

```
"Where is the user validation logic?"
"Find all API endpoints related to payments"
"Show me where database migrations are defined"
```

**Tip:** Start with broad questions, then narrow down to specific areas.

### Bug Fixing

#### Share Error Information

```
"I'm getting this error: [paste error message]

Steps to reproduce:
1. Login as user
2. Navigate to /dashboard
3. Click 'Export' button

Expected: Download starts
Actual: 500 error"
```

#### Get Fix Recommendations

```
"What's causing this error?"
"How should I fix this?"
"Are there any edge cases I should consider?"
```

#### Apply and Verify

```
"Apply the fix"
"Add tests to prevent regression"
"Run the tests to verify"
```

**Tip:** Provide stack traces and note if errors are intermittent or consistent.

### Code Refactoring

#### Identify Issues

```
"Find uses of deprecated API functions"
"Where are we using callback hell instead of async/await?"
"Identify code duplication in the auth module"
```

#### Get Recommendations

```
"How should I refactor this to use modern patterns?"
"What's the best way to eliminate this duplication?"
"Suggest improvements for this complex function"
```

#### Apply Changes Incrementally

```
"Refactor one file at a time"
"Run tests after each change"
"Maintain backward compatibility"
```

### Testing Workflows

#### Identify Coverage Gaps

```
"What functions lack test coverage?"
"Find untested edge cases in the payment flow"
"Which modules have less than 80% coverage?"
```

#### Generate Tests

```
"Create unit tests for the UserService class"
"Add edge case tests for null inputs"
"Generate E2E tests for the checkout flow"
```

#### Fix Test Failures

```
"Run the test suite"
"Fix any failing tests"
"Explain why the tests failed"
```

### Documentation

#### Find Missing Docs

```
"Which exported functions lack documentation?"
"Find components without prop descriptions"
"Identify undocumented API endpoints"
```

#### Generate Documentation

```
"Add JSDoc comments to all public functions"
"Generate API documentation in OpenAPI format"
"Create README for the authentication module"
```

#### Improve Documentation

```
"Add examples to the API docs"
"Ensure documentation follows project standards"
"Update outdated documentation"
```

### Feature Development

#### Plan Implementation

```
"I need to add user profile avatars. What's the best approach?"
"Plan the implementation of real-time notifications"
"What changes are needed to support multi-tenancy?"
```

#### Implement Step-by-Step

```
"Let's implement this feature:
1. Add database migration for avatar_url
2. Update User model
3. Create upload endpoint
4. Add UI component
5. Write tests"
```

#### Review and Refine

```
"Review the implementation for security issues"
"Are there any performance concerns?"
"What edge cases should we handle?"
```

### Git Workflows

#### Check Status

```
"What files have I changed?"
"Show me the diff"
"Are there any uncommitted changes?"
```

#### Create Commits

```
"Commit my changes with a descriptive message"
"Create a commit for just the authentication changes"
"Amend the last commit to include this fix"
```

#### Pull Request Creation

```
"Create a PR for these changes"
"Add a detailed description of what changed and why"
"Include testing instructions"
```

### Using Plan Mode

**Enable plan mode:**
```bash
claude --permission-mode plan
```

**Or toggle during session:**
```
Shift+Tab
```

**Use for:**
- Research before implementing
- Explore unfamiliar codebases
- Plan complex refactors
- Interactive development

**Example workflow:**
```
1. Enter plan mode (Shift+Tab)
2. "Analyze the authentication system"
3. "What would break if we add 2FA?"
4. "Plan the implementation steps"
5. Exit plan mode (Shift+Tab)
6. "Implement the plan"
```

### Parallel Development with Git Worktrees

**Create worktrees:**
```bash
# Main feature
git worktree add ../myapp-feature-a -b feature-a

# Separate bugfix
git worktree add ../myapp-bugfix-b -b bugfix-b
```

**Run separate sessions:**
```bash
# Terminal 1
cd ../myapp-feature-a
claude

# Terminal 2
cd ../myapp-bugfix-b
claude
```

**Benefits:**
- Independent contexts
- No branch switching
- Parallel workflows
- Isolated changes

### CLI Integration

#### Build Scripts

```json
// package.json
{
  "scripts": {
    "lint:claude": "claude -p 'check code quality'",
    "review:security": "claude -p 'audit for security issues'",
    "docs:generate": "claude -p 'update API documentation'"
  }
}
```

#### Piping Data

```bash
# Analyze logs
cat error.log | claude -p "summarize errors by type"

# Review changes
git diff main | claude -p "review these changes"

# Process CSV
cat data.csv | claude -p "find anomalies in this data"
```

#### Output Formats

```bash
# JSON output for scripts
claude -p "list all TODO comments" --output-format json | jq

# Plain text for logging
claude -p "run tests" --output-format text > test-results.txt

# Streaming JSON
claude -p "analyze codebase" --output-format stream-json
```

### Resume Previous Sessions

**Quick resume:**
```bash
claude -c
# or
claude --continue
```

**Select specific session:**
```bash
claude -r
# or
claude --resume
```

**Interactive picker shows:**
- Session timestamp
- Last message
- Project directory
- Token usage

---

## CI/CD Integration

### GitHub Actions

#### Overview

Claude Code integrates with GitHub Actions to provide AI-powered automation. Simply mention `@claude` in PR or issue comments to trigger Claude.

#### Quick Setup

**Method 1: Terminal Command (Recommended)**

```bash
/install-github-app
```

This automatically:
1. Configures the GitHub app
2. Sets up required secrets
3. Creates workflow file

**Method 2: Manual Setup**

1. **Install GitHub App:**
   Visit https://github.com/apps/claude

2. **Add API Key Secret:**
   - Go to repository Settings → Secrets
   - Add `ANTHROPIC_API_KEY` secret
   - Never commit keys directly!

3. **Create Workflow File:**

**File:** `.github/workflows/claude.yml`

```yaml
name: Claude Code

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    runs-on: ubuntu-latest
    if: contains(github.event.comment.body, '@claude')

    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          max-turns: 10
          timeout-minutes: 30
```

#### Usage Examples

**In PR comments:**

```
@claude review this PR for security vulnerabilities

@claude implement the feature described in #123

@claude fix the failing tests

@claude update documentation for the new API endpoints
```

**In issue comments:**

```
@claude analyze this bug and suggest a fix

@claude create a PR that implements this feature

@claude add tests for the payment processing flow
```

#### Advanced Configuration

**Custom workflow with cost limits:**

```yaml
name: Claude Code with Limits

on:
  issue_comment:
    types: [created]

jobs:
  claude:
    runs-on: ubuntu-latest
    if: |
      contains(github.event.comment.body, '@claude') &&
      github.event.comment.user.login != 'dependabot[bot]'

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          ref: ${{ github.event.pull_request.head.ref }}

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          max-turns: 5
          timeout-minutes: 15
          model: claude-sonnet-4
        env:
          CLAUDE_MAX_TOKENS: 100000
```

**Scheduled code reviews:**

```yaml
name: Nightly Code Review

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily

jobs:
  review:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Review recent changes
        run: |
          npm install -g @anthropic-ai/claude-code
          claude -p "Review commits from the last 24 hours for quality and security issues" \
            --output-format json \
            --max-turns 3 \
            --dangerously-skip-permissions \
            > review-results.json
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Create issue if problems found
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('review-results.json'));
            // Process results and create issue if needed
```

#### Cloud Provider Integration

**AWS Bedrock (with OIDC):**

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v2
  with:
    role-to-assume: arn:aws:iam::ACCOUNT:role/GithubActionsRole
    aws-region: us-east-1

- name: Run Claude via Bedrock
  run: claude -p "review this PR"
  env:
    AWS_REGION: us-east-1
    ANTHROPIC_BEDROCK: true
```

**Google Vertex AI (with Workload Identity):**

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v1
  with:
    workload_identity_provider: projects/PROJECT/locations/global/workloadIdentityPools/POOL
    service_account: github-actions@PROJECT.iam.gserviceaccount.com

- name: Run Claude via Vertex
  run: claude -p "review this PR"
  env:
    ANTHROPIC_VERTEX: true
    GOOGLE_PROJECT_ID: my-project
```

#### Security Considerations

**Never commit secrets:**
```yaml
# ❌ WRONG - Never do this
env:
  ANTHROPIC_API_KEY: "sk-ant-..."

# ✅ CORRECT - Use secrets
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

**Required permissions:**
The Claude GitHub app requires:
- **Contents:** Read/Write
- **Issues:** Read/Write
- **Pull Requests:** Read/Write

#### Cost Management

**Two cost factors:**

1. **GitHub Actions minutes:**
   - Public repos: Free
   - Private repos: Varies by plan

2. **Anthropic API tokens:**
   - Based on prompt/response length
   - Larger codebases cost more

**Optimize costs:**

```yaml
# Limit turns to control costs
max-turns: 3

# Set shorter timeout
timeout-minutes: 10

# Use haiku for simpler tasks
model: claude-haiku-4

# Only run on specific branches
if: github.base_ref == 'main'
```

### GitLab CI/CD

**File:** `.gitlab-ci.yml`

```yaml
claude_review:
  image: node:18
  before_script:
    - npm install -g @anthropic-ai/claude-code
  script:
    - claude -p "Review this MR for security and quality issues"
        --output-format json
        --max-turns 3
        --dangerously-skip-permissions
  only:
    - merge_requests
  variables:
    ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY
```

### CircleCI

**File:** `.circleci/config.yml`

```yaml
version: 2.1

jobs:
  claude-review:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run:
          name: Install Claude Code
          command: npm install -g @anthropic-ai/claude-code
      - run:
          name: Run Review
          command: |
            claude -p "Review changes and suggest improvements" \
              --output-format text \
              --max-turns 3

workflows:
  review:
    jobs:
      - claude-review:
          filters:
            branches:
              only: main
```

### Best Practices

1. **Limit max-turns** - Control cost and time
2. **Set timeouts** - Prevent runaway processes
3. **Use appropriate models** - Haiku for simple tasks
4. **Specific prompts** - Clear instructions get better results
5. **Store results** - Save artifacts for review
6. **Monitor costs** - Track API usage
7. **Secure secrets** - Never commit API keys

---

## Troubleshooting

### Installation Issues

#### Windows/WSL Problems

**Issue:** OS/platform detection issues

**Solution:**
```bash
npm config set os linux
npm install -g @anthropic-ai/claude-code
```

**Issue:** Node.js PATH conflicts (WSL using Windows npm)

**Solution:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Or prepend Linux paths
export PATH="/usr/local/bin:/usr/bin:$PATH"
```

#### Linux/Mac Issues

**Issue:** Permission errors with npm global

**Solution 1 (Recommended):**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Solution 2:**
```bash
claude migrate-installer
```

**Solution 3:**
```bash
# Configure npm to use user directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Authentication & Permissions

**Issue:** Repeated approval prompts

**Solution:**
```bash
/permissions
# Add allow rules for trusted operations
```

**Issue:** Authentication failures

**Solution:**
```bash
/logout
# Close Claude
# Restart and login again
```

**Issue:** Stuck on old credentials

**Solution:**
```bash
rm ~/.config/claude-code/auth.json
claude
```

### Performance & Stability

**Issue:** High resource usage with large codebases

**Solution:**
```bash
# Compact conversation history
/compact

# Start fresh
/clear

# Use plan mode for exploration
claude --permission-mode plan
```

**Issue:** Unresponsive sessions

**Solution:**
```bash
# Cancel current operation
Ctrl+C

# If frozen, kill process
pkill claude

# Restart
claude --continue
```

**Issue:** Slow search performance

**Solution 1 - Install system ripgrep:**
```bash
# Ubuntu/Debian
sudo apt install ripgrep

# macOS
brew install ripgrep

# Then use system version
echo 'export USE_BUILTIN_RIPGREP=0' >> ~/.bashrc
```

**Solution 2 - WSL performance:**
```bash
# Move project to Linux filesystem
mv /mnt/c/projects/myapp ~/projects/myapp
cd ~/projects/myapp
```

### IDE Integration

**Issue:** JetBrains on WSL2 connection problems

**Solution 1 - Configure Windows Firewall:**
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "WSL2 Claude" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000-4000
```

**Solution 2 - Use mirrored networking:**
```ini
# .wslconfig (in Windows user directory)
[wsl2]
networkingMode=mirrored
```

**Issue:** ESC key issues in JetBrains

**Solution:**
```
JetBrains Settings → Tools → Terminal
Disable: "Move focus to editor with Escape"
```

### Markdown Generation

**Issue:** Missing language tags on code blocks

**Solution 1 - Ask explicitly:**
```
"Add the changes and ensure all code blocks have language tags"
```

**Solution 2 - Use formatting hook:**
```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "matcher": "Edit(**/*.md)",
      "command": "check-markdown-formatting.sh"
    }
  ]
}
```

### Connection Issues

**Issue:** Cannot connect to API

**Solution:**
```bash
# Check network
curl https://api.anthropic.com/health

# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY

# Test with proxy bypass
unset HTTP_PROXY HTTPS_PROXY
claude
```

**Issue:** Corporate firewall blocking

**Solution:**
```bash
# Configure proxy
export HTTPS_PROXY=http://proxy.company.com:8080
export NO_PROXY=localhost,127.0.0.1

# Or in settings.json
{
  "env": {
    "HTTPS_PROXY": "http://proxy.company.com:8080"
  }
}
```

### Command Not Found

**Issue:** `claude: command not found`

**Solution:**
```bash
# Check installation
which claude

# If installed via npm, check PATH
echo $PATH | grep npm

# Add npm global bin to PATH
export PATH="$(npm config get prefix)/bin:$PATH"

# Make permanent
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Version Issues

**Issue:** Old version behavior

**Solution:**
```bash
# Check current version
claude --version

# Force update
claude update

# If stuck, reinstall
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code
```

### Debug Mode

**Enable detailed logging:**

```bash
# Debug mode
claude --debug

# Or set environment variable
export CLAUDE_CODE_DEBUG=1
claude
```

**Check logs:**
```bash
# View recent logs
cat ~/.claude/logs/claude-code.log

# Follow logs in real-time
tail -f ~/.claude/logs/claude-code.log
```

### Quick Diagnostics

**Run health check:**
```bash
claude doctor
```

This checks:
- Installation type
- System compatibility
- Authentication status
- Configuration health
- Network connectivity
- Tool availability

---

## Best Practices

### General Guidelines

#### 1. Provide Specific, Detailed Requests

**❌ Vague:**
```
"Make the code better"
```

**✅ Specific:**
```
"Refactor the UserService class to:
1. Extract validation logic into separate functions
2. Add error handling for network failures
3. Improve variable naming for clarity
4. Add JSDoc comments to public methods"
```

#### 2. Break Complex Tasks into Steps

**❌ Too broad:**
```
"Build a user authentication system"
```

**✅ Step-by-step:**
```
"Let's build user authentication:
1. First, create the database schema for users
2. Then implement password hashing
3. Next, create login/logout endpoints
4. Add JWT token generation
5. Implement middleware for protected routes
6. Finally, add tests for each component"
```

#### 3. Let Claude Analyze Before Changing

**❌ Immediate changes:**
```
"Change all var declarations to const"
```

**✅ Analysis first:**
```
"First, analyze where we use var declarations and whether const or let is more appropriate for each case. Then make the changes."
```

### Project Setup

#### 1. Initialize Properly

```bash
cd your-project
claude /init
```

This creates `CLAUDE.md` with:
- Project description
- Tech stack
- Code conventions
- Common workflows

#### 2. Configure Memory

**Create `.claude/CLAUDE.md`:**
```markdown
# Project Guidelines

## Tech Stack
- Framework: Next.js 14
- Language: TypeScript (strict mode)
- Database: PostgreSQL with Prisma
- Styling: Tailwind CSS

## Code Style
- 2-space indentation
- ESLint + Prettier for formatting
- Functional components only
- Custom hooks in `hooks/` directory

## Testing
- Unit tests with Jest
- E2E tests with Playwright
- Minimum 80% coverage

## Import External Docs
@docs/architecture.md
@docs/api-conventions.md
```

#### 3. Set Up Useful Commands

**Create `.claude/commands/test-fix.md`:**
```markdown
---
description: Run tests and fix any failures
---

Please:
1. Run the full test suite
2. Analyze any failures
3. Fix the issues
4. Run tests again to verify
5. Create a commit if all pass
```

#### 4. Configure Permissions

**In `.claude/settings.json`:**
```json
{
  "permissions": [
    {"allow": "Bash(npm run *)"},
    {"allow": "Bash(git status)"},
    {"allow": "Bash(git diff)"},
    {"allow": "Read(**/*.{ts,tsx,js,jsx})"},
    {"ask": "Edit(**/*.{ts,tsx})"},
    {"deny": "Edit(.env*)"},
    {"deny": "Edit(.git/**)"},
    {"deny": "Bash(rm -rf *)"}
  ]
}
```

### Prompting Strategies

#### 1. Context-Rich Prompts

**❌ No context:**
```
"Fix the bug"
```

**✅ With context:**
```
"There's a bug in the checkout flow:

Error: Cannot read property 'total' of undefined
File: src/components/CheckoutSummary.tsx:45

This happens when:
1. User adds items to cart
2. Navigates to checkout
3. Removes all items
4. Returns to checkout page

Expected: Show empty cart message
Actual: App crashes"
```

#### 2. Reference Relevant Files

```
"Review the authentication flow in @src/auth/login.ts and @src/middleware/auth.ts for security issues"
```

#### 3. Specify Output Format

```
"Analyze the database schema and provide:
1. A list of tables with their purposes
2. Any missing indexes
3. Potential N+1 query issues
4. Recommendations in priority order"
```

#### 4. Request Explanations

```
"Explain your reasoning before making changes"
"Show me alternatives before implementing"
"What are the trade-offs of each approach?"
```

### Git Workflows

#### 1. Descriptive Commits

**❌ Generic:**
```
"Commit my changes"
```

**✅ Descriptive:**
```
"Create a commit for the authentication fixes with a message explaining:
- What was broken
- How it was fixed
- Why this approach was chosen"
```

#### 2. Incremental Commits

```
"Let's commit incrementally:
1. Commit the schema changes
2. Commit the API implementation
3. Commit the tests
4. Commit the documentation"
```

#### 3. Review Before Committing

```
"Show me what files changed"
"Explain the key changes"
"Are there any files that shouldn't be committed?"
"Create a commit if everything looks good"
```

### Code Quality

#### 1. Request Reviews

```
"Review this implementation for:
- Security vulnerabilities
- Performance issues
- Code duplication
- Missing error handling
- Test coverage gaps"
```

#### 2. Ask for Alternatives

```
"Show me 3 different ways to implement this feature with pros and cons of each"
```

#### 3. Verify Edge Cases

```
"What edge cases should we handle?"
"Test the implementation with:
- Empty inputs
- Very large inputs
- Invalid inputs
- Concurrent requests"
```

### Testing

#### 1. Test-Driven Development

```
"Let's use TDD:
1. Write failing tests for the new feature
2. Implement minimal code to pass
3. Refactor for quality
4. Add edge case tests"
```

#### 2. Comprehensive Coverage

```
"Add tests covering:
- Happy path
- Error conditions
- Edge cases
- Boundary conditions
- Concurrent access"
```

### Collaboration

#### 1. Team Conventions

Share configuration via git:
```bash
git add .claude/
git commit -m "Add Claude Code configuration"
git push
```

Team members automatically get:
- Memory files (guidelines)
- Custom commands
- Project-specific subagents
- MCP servers (via `.mcp.json`)

#### 2. Plugin-Based Sharing

For wider distribution:
```bash
# Create plugin with team tools
mkdir company-tools
cd company-tools

# Add commands, agents, skills
mkdir commands agents skills

# Distribute via private marketplace
```

#### 3. Document Decisions

In `CLAUDE.md`:
```markdown
## Architecture Decisions

### Authentication: JWT vs Session
**Decision:** JWT
**Reasoning:**
- Stateless scaling
- Mobile app support
- Microservices friendly

**Trade-offs:**
- Cannot revoke tokens immediately
- Requires refresh token rotation
```

### Security

#### 1. Protect Sensitive Files

```json
{
  "permissions": [
    {"deny": "Read(**/.env*)"},
    {"deny": "Edit(**/.env*)"},
    {"deny": "Read(**/secrets.*)"},
    {"deny": "Bash(curl * | bash)"},
    {"deny": "Bash(**/rm -rf *)"}
  ]
}
```

#### 2. Review Before Deployment

```
"Before deploying:
1. Run security audit
2. Check for hardcoded secrets
3. Verify all tests pass
4. Review recent changes
5. Update changelog"
```

#### 3. Use Hooks for Validation

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "matcher": "Bash(git push *main*)",
      "command": "echo '{\"block\": true, \"feedback\": \"Direct push to main blocked\"}'"
    }
  ]
}
```

### Performance

#### 1. Manage Context

```bash
# When conversation gets long
/compact

# Start fresh when switching topics
/clear

# Use plan mode for exploration
claude --permission-mode plan
```

#### 2. Targeted Searches

**❌ Broad:**
```
"Find all functions"
```

**✅ Targeted:**
```
"Find all exported functions in the src/api/ directory that handle user authentication"
```

#### 3. Incremental Analysis

```
"Let's analyze the codebase module by module:
1. Start with the auth module
2. Then the API layer
3. Then the database layer
4. Finally the frontend"
```

### Cost Optimization

#### 1. Use Appropriate Models

```bash
# Simple tasks - use haiku (faster, cheaper)
claude --model haiku "format this code"

# Complex tasks - use sonnet (better reasoning)
claude --model sonnet "architect this feature"

# Critical tasks - use opus (best quality)
claude --model opus "review security architecture"
```

#### 2. Limit Iterations

```bash
# In CI/CD
claude -p "review this PR" --max-turns 3
```

#### 3. Reuse Sessions

```bash
# Continue previous work
claude -c

# Resume specific session
claude -r
```

---

## Additional Resources

### Official Documentation

- **Main Docs:** https://docs.claude.com/en/docs/claude-code/overview
- **API Reference:** https://docs.claude.com/en/docs/claude-code/cli-reference
- **GitHub Repo:** https://github.com/anthropics/claude-code

### Community

- **GitHub Issues:** https://github.com/anthropics/claude-code/issues
- **Discord:** (Check official docs for invite link)
- **Twitter:** @AnthropicAI

### Related Tools

- **Claude API:** https://docs.anthropic.com/
- **MCP Protocol:** https://modelcontextprotocol.io/
- **VS Code Extension:** Available in VS Code marketplace

### Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel current operation |
| `Ctrl+D` | Exit Claude Code |
| `Ctrl+L` | Clear screen |
| `Ctrl+O` | Toggle detailed output |
| `Ctrl+R` | Search history |
| `Ctrl+V` | Paste image |
| `Tab` | Toggle extended thinking |
| `Shift+Tab` | Cycle permission modes |
| `Esc Esc` | Rewind to checkpoint |
| `?` | Show help |

### Environment Variables Reference

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | API authentication |
| `ANTHROPIC_MODEL` | Default model |
| `DISABLE_AUTOUPDATER` | Disable auto-updates |
| `DISABLE_TELEMETRY` | Disable analytics |
| `USE_BUILTIN_RIPGREP` | Use bundled search |
| `CLAUDE_CODE_DEBUG` | Enable debug logging |
| `HTTP_PROXY` | HTTP proxy server |
| `HTTPS_PROXY` | HTTPS proxy server |

### Model Selection Guide

| Model | When to Use | Speed | Cost | Quality |
|-------|-------------|-------|------|---------|
| **Haiku** | Simple tasks, formatting, quick queries | Fast | Low | Good |
| **Sonnet** | Most development tasks, balanced quality | Medium | Medium | Excellent |
| **Opus** | Complex architecture, critical reviews | Slow | High | Best |

### Common File Locations

| File/Directory | Purpose |
|----------------|---------|
| `~/.claude/settings.json` | User configuration |
| `~/.claude/CLAUDE.md` | User memory |
| `~/.claude/commands/` | Personal slash commands |
| `~/.claude/agents/` | Personal subagents |
| `~/.claude/skills/` | Personal skills |
| `~/.config/claude-code/` | Auth and state |
| `.claude/settings.json` | Project configuration |
| `.claude/CLAUDE.md` | Project memory |
| `.claude/commands/` | Project commands |
| `.claude/agents/` | Project subagents |
| `.claude/skills/` | Project skills |
| `.mcp.json` | MCP server configuration |

### Useful Commands Quick Reference

```bash
# Installation & Updates
npm install -g @anthropic-ai/claude-code
claude update
claude doctor

# Starting Sessions
claude                          # Interactive mode
claude "task"                   # Single task
claude -p "query"               # Print mode
claude -c                       # Continue last
claude -r                       # Resume specific

# Configuration
claude mcp                      # Configure MCP
/config                        # Open settings
/permissions                   # Manage permissions
/hooks                         # Configure hooks

# Session Management
/clear                         # Clear history
/compact                       # Condense conversation
/rewind                        # Revert changes
/memory                        # Edit memory

# Information
/status                        # Show status
/cost                          # Token usage
/usage                         # Rate limits
/help                          # List commands
/agents                        # List subagents

# Project Setup
/init                          # Initialize project
/add-dir                       # Add directory
/terminal-setup                # Configure terminal

# Development
/review                        # Code review
/plugin                        # Manage plugins
```

---

## Conclusion

This comprehensive guide covers Claude Code from installation to advanced usage. Key takeaways:

### Essential Concepts

1. **Interactive Development** - Claude Code operates conversationally in your terminal
2. **Extensibility** - Customize via commands, subagents, skills, hooks, and plugins
3. **Team Collaboration** - Share configuration via git
4. **Security** - Control access via permissions and sandbox
5. **Integration** - Works with CI/CD, MCP, and external tools

### Getting the Most Value

- **Start Simple** - Begin with basic tasks, gradually explore features
- **Use Plan Mode** - Explore safely before making changes
- **Leverage Memory** - Document project conventions
- **Create Commands** - Automate repetitive workflows
- **Build Subagents** - Specialize for your domain
- **Install MCP Servers** - Integrate your tools
- **Configure Permissions** - Balance convenience and safety

### Next Steps

1. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
2. Initialize your project: `claude /init`
3. Start with simple tasks: `"What does this project do?"`
4. Gradually explore advanced features
5. Share your configuration with your team

### Getting Help

- **In Claude Code:** `/help` or ask questions naturally
- **Documentation:** https://docs.claude.com/en/docs/claude-code/
- **Issues:** https://github.com/anthropics/claude-code/issues
- **Community:** Discord and Twitter @AnthropicAI

---

**Document Version:** 1.0
**Last Updated:** October 2025
**License:** Based on official Anthropic documentation
**Maintained by:** Community (based on official sources)

Happy coding with Claude! 🚀
