# NIA MCP Tools Reference Guide

This document provides a comprehensive overview of all available NIA MCP (Model Context Protocol) tools for intelligent code search, documentation indexing, and research capabilities.

## Table of Contents

1. [Repository Management](#repository-management)
2. [Documentation Management](#documentation-management)
3. [Search Capabilities](#search-capabilities)
4. [Research Tools](#research-tools)
5. [Package Analysis](#package-analysis)
6. [Context Management](#context-management)
7. [Project Initialization](#project-initialization)
8. [Bug Reporting](#bug-reporting)

---

## Repository Management

### List Repositories

**Tool**: `list_repositories`

- **Purpose**: List all indexed repositories and their status
- **Usage**: `list_repositories()` or `list_repositories("repository")`
- **Returns**: List of indexed repositories with indexing status

### Index Repository

**Tool**: `index_repository`

- **Purpose**: Index a GitHub repository for intelligent code search
- **Usage**: `index_repository("https://github.com/owner/repo")`
- **Parameters**:
  - `repo_url`: GitHub repository URL
  - `branch`: Optional branch name (defaults to main)
- **Returns**: Indexing status confirmation

### Check Repository Status

**Tool**: `check_repository_status`

- **Purpose**: Check the indexing progress of a specific repository
- **Usage**: `check_repository_status("repository", "owner/repo")`
- **Parameters**:
  - `resource_type`: "repository"
  - `identifier`: Repository in "owner/repo" format
- **Returns**: Current indexing status

### Delete Repository

**Tool**: `delete_repository`

- **Purpose**: Remove an indexed repository
- **Usage**: `delete_repository("repository", "owner/repo")`
- **Parameters**:
  - `resource_type`: "repository"
  - `identifier`: Repository in "owner/repo" format
- **Returns**: Deletion confirmation

### Rename Repository

**Tool**: `rename_repository`

- **Purpose**: Rename a repository for better organization
- **Usage**: `rename_repository("repository", "owner/repo", "New Display Name")`
- **Parameters**:
  - `resource_type`: "repository"
  - `identifier`: Repository in "owner/repo" format
  - `new_name`: New display name (1-100 characters)
- **Returns**: Rename confirmation

---

## Documentation Management

### List Documentation

**Tool**: `list_documentation`

- **Purpose**: List all indexed documentation sources
- **Usage**: `list_documentation()` or `list_documentation("documentation")`
- **Returns**: List of indexed documentation with status

### Index Documentation

**Tool**: `index_documentation`

- **Purpose**: Index documentation or website for intelligent search
- **Usage**: `index_documentation("https://docs.example.com")`
- **Parameters**:
  - `url`: Documentation site URL
  - `url_patterns`: Optional URL patterns to include (e.g., `["/docs/*", "/api/*"]`)
  - `exclude_patterns`: Optional patterns to exclude (e.g., `["/blog/*"]`)
  - `max_age`: Maximum age of cached content in seconds
  - `only_main_content`: Extract only main content (default: true)
  - `wait_for`: Page load wait time in milliseconds
  - `include_screenshot`: Capture page screenshots
  - `check_llms_txt`: Check for llms.txt file (default: true)
  - `llms_txt_strategy`: How to use llms.txt ("prefer", "only", "ignore")
- **Returns**: Indexing status confirmation

### Check Documentation Status

**Tool**: `check_documentation_status`

- **Purpose**: Check the indexing progress of documentation
- **Usage**: `check_documentation_status("documentation", "source-uuid")`
- **Parameters**:
  - `resource_type`: "documentation"
  - `identifier`: Source ID (UUID format only)
- **Returns**: Current indexing status

### Delete Documentation

**Tool**: `delete_documentation`

- **Purpose**: Remove indexed documentation
- **Usage**: `delete_documentation("documentation", "source-uuid")`
- **Parameters**:
  - `resource_type`: "documentation"
  - `identifier`: Source ID (UUID format only)
- **Returns**: Deletion confirmation

### Rename Documentation

**Tool**: `rename_documentation`

- **Purpose**: Rename documentation for better organization
- **Usage**: `rename_documentation("documentation", "source-uuid", "New Name")`
- **Parameters**:
  - `resource_type`: "documentation"
  - `identifier`: Source ID (UUID format only)
  - `new_name`: New display name (1-100 characters)
- **Returns**: Rename confirmation

---

## Search Capabilities

### Search Codebase

**Tool**: `search_codebase`

- **Purpose**: Search indexed repositories using natural language
- **Usage**: `search_codebase("How does authentication work?")`
- **Parameters**:
  - `query`: Natural language search query
  - `repositories`: Optional list of specific repositories to search
  - `include_sources`: Include source code in results (default: true)
- **Returns**: Search results with relevant code snippets

**Examples**:

```javascript
// Search all repositories
search_codebase('How does authentication work?')

// Search specific repository
search_codebase('How to create custom hooks?', ['facebook/react'])

// Search specific folder
search_codebase('What is Flox?', ['PostHog/posthog/tree/master/docs'])
```

### Search Documentation

**Tool**: `search_documentation`

- **Purpose**: Search indexed documentation using natural language
- **Usage**: `search_documentation("How to use the API?")`
- **Parameters**:
  - `query`: Natural language search query
  - `sources`: Optional list of documentation sources to search
  - `include_sources`: Include source references (default: true)
- **Returns**: Search results with relevant documentation excerpts

### Read Source Content

**Tool**: `read_source_content`

- **Purpose**: Read complete content from a specific source file
- **Usage**: `read_source_content("repository", "owner/repo:path/to/file.py")`
- **Parameters**:
  - `source_type`: "repository" or "documentation"
  - `source_identifier`: File path or document ID
  - `metadata`: Optional metadata from search results
- **Returns**: Full content of the requested source

---

## Research Tools

### NIA Web Search

**Tool**: `nia_web_search`

- **Purpose**: Search repositories, documentation, and content using AI-powered search
- **Usage**: `nia_web_search("best RAG implementations")`
- **Parameters**:
  - `query`: Natural language search query
  - `num_results`: Number of results (default: 5, max: 10)
  - `category`: Filter by category ("github", "company", "research paper", "news", "tweet", "pdf")
  - `days_back`: Only show results from last N days
  - `find_similar_to`: URL to find similar content to
- **Returns**: Search results with actionable next steps

**When to Use**:

- Finding specific repos/docs/content
- Looking for examples or implementations
- Simple, direct searches
- Finding similar content to a known URL

### Deep Research Agent

**Tool**: `nia_deep_research_agent`

- **Purpose**: Perform deep, multi-step research with comprehensive analysis
- **Usage**: `nia_deep_research_agent("Compare top 3 RAG frameworks with pros/cons")`
- **Parameters**:
  - `query`: Research question
  - `output_format`: Optional structure hint (e.g., "comparison table", "pros and cons list")
- **Returns**: Comprehensive research results with citations

**When to Use**:

- Comparing multiple options (X vs Y vs Z)
- Analyzing pros and cons
- Questions with "best", "top", "which is better"
- Complex questions requiring multiple sources
- Questions about trends, patterns, or developments

---

## Package Analysis

### Package Search Grep

**Tool**: `nia_package_search_grep`

- **Purpose**: Execute grep over public package source code using regex
- **Usage**: `nia_package_search_grep("npm", "react", "function\\s+useState")`
- **Parameters**:
  - `registry`: "crates_io", "golang_proxy", "npm", or "py_pi"
  - `package_name`: Package name as it appears in package manager
  - `pattern`: Regex pattern for exact text matching
  - `version`: Optional specific version (semver format)
  - `language`: Optional language filter
  - `filename_sha256`: Optional file hash filter
  - `a`, `b`, `c`: Lines after/before/both to include
  - `head_limit`: Limit number of results
  - `output_mode`: "content", "files_with_matches", or "count"

### Package Search Hybrid

**Tool**: `nia_package_search_hybrid`

- **Purpose**: Search package source code using semantic understanding AND regex
- **Usage**: `nia_package_search_hybrid("npm", "react", ["how is useState implemented?"])`
- **Parameters**:
  - `registry`: Package registry
  - `package_name`: Package name
  - `semantic_queries`: Array of 1-5 plain English questions
  - `version`: Optional specific version
  - `filename_sha256`: Optional file hash filter
  - `pattern`: Optional regex pattern for prefiltering
  - `language`: Optional language filter
- **Returns**: Hybrid search results combining semantic and regex matching

### Package Search Read File

**Tool**: `nia_package_search_read_file`

- **Purpose**: Read exact lines from a package source file
- **Usage**: `nia_package_search_read_file("npm", "react", "file-hash", 1, 50)`
- **Parameters**:
  - `registry`: Package registry
  - `package_name`: Package name
  - `filename_sha256`: File hash
  - `start_line`: 1-based start line
  - `end_line`: 1-based end line
  - `version`: Optional specific version
- **Returns**: Exact code snippet from specified line range

---

## Context Management

### Save Context

**Tool**: `save_context`

- **Purpose**: Save conversation context for cross-agent sharing
- **Usage**: `save_context("Streaming AI SDK Implementation", "Planning conversation...", content, "cursor")`
- **Parameters**:
  - `title`: Descriptive title (1-200 characters)
  - `summary`: Brief summary (10-1000 characters)
  - `content`: Full conversation context
  - `agent_source`: Agent creating context (e.g., "cursor", "claude-code")
  - `tags`: Optional searchable tags
  - `metadata`: Optional metadata (file paths, repositories, etc.)
  - `nia_references`: Structured NIA resource data
  - `edited_files`: List of modified files with change descriptions
- **Returns**: Context ID for future reference

### List Contexts

**Tool**: `list_contexts`

- **Purpose**: List saved conversation contexts with pagination
- **Usage**: `list_contexts(20, 0, "streaming,ai-sdk", "cursor")`
- **Parameters**:
  - `limit`: Number of contexts (1-100, default: 20)
  - `offset`: Skip count for pagination (default: 0)
  - `tags`: Comma-separated tags to filter by
  - `agent_source`: Filter by agent source
- **Returns**: List of contexts with pagination info

### Retrieve Context

**Tool**: `retrieve_context`

- **Purpose**: Retrieve a specific conversation context by ID
- **Usage**: `retrieve_context("context-uuid")`
- **Parameters**:
  - `context_id`: Unique context ID
- **Returns**: Full conversation context with metadata

### Search Contexts

**Tool**: `search_contexts`

- **Purpose**: Search contexts by content, title, or summary
- **Usage**: `search_contexts("streaming AI SDK", 20, "implementation", "cursor")`
- **Parameters**:
  - `query`: Search query
  - `limit`: Maximum results (1-100, default: 20)
  - `tags`: Optional comma-separated tags
  - `agent_source`: Optional agent source filter
- **Returns**: Search results with matching contexts

### Update Context

**Tool**: `update_context`

- **Purpose**: Update an existing conversation context
- **Usage**: `update_context("context-uuid", "Updated Title", null, null, ["streaming", "completed"])`
- **Parameters**:
  - `context_id`: Context ID to update
  - `title`: Updated title (optional)
  - `summary`: Updated summary (optional)
  - `content`: Updated content (optional)
  - `tags`: Updated tags (optional)
  - `metadata`: Updated metadata (optional)
- **Returns**: Update confirmation

### Delete Context

**Tool**: `delete_context`

- **Purpose**: Delete a conversation context
- **Usage**: `delete_context("context-uuid")`
- **Parameters**:
  - `context_id`: Context ID to delete
- **Returns**: Deletion confirmation

---

## Project Initialization

### Initialize Project

**Tool**: `initialize_project`

- **Purpose**: Initialize a NIA-enabled project with IDE-specific rules
- **Usage**: `initialize_project("/path/to/project", ["cursor", "vscode"])`
- **Parameters**:
  - `project_root`: Absolute path to project root
  - `profiles`: IDE profiles to set up (default: ["cursor"])
    - Options: cursor, vscode, claude, windsurf, cline, codex, zed, jetbrains, neovim, sublime
- **Returns**: Initialization status with created files

---

## Bug Reporting

### Bug Report

**Tool**: `nia_bug_report`

- **Purpose**: Submit bug reports or feature requests to NIA development team
- **Usage**: `nia_bug_report("Search not returning results", "bug", "Happens with large repos")`
- **Parameters**:
  - `description`: Detailed description (10-5000 characters)
  - `bug_type`: "bug", "feature-request", "improvement", or "other" (default: "bug")
  - `additional_context`: Optional additional context or steps to reproduce
- **Returns**: Submission confirmation with reference ID

---

## Usage Guidelines

### When to Use Each Tool

#### Repository Management

- **Before searching**: Verify repos are indexed with `list_repositories`
- **New analysis**: Index repositories with `index_repository`
- **Check progress**: Use `check_repository_status` after starting indexing

#### Search Tools

- **Code understanding**: Use `search_codebase` for how-to questions
- **Documentation**: Use `search_documentation` for API references
- **Quick discovery**: Use `nia_web_search` for finding new content
- **Complex analysis**: Use `nia_deep_research_agent` for comparisons

#### Package Analysis

- **Exact code search**: Use `nia_package_search_grep` for regex patterns
- **Understanding features**: Use `nia_package_search_hybrid` for semantic queries
- **Reading specific code**: Use `nia_package_search_read_file` for line ranges

#### Context Management

- **Cross-agent sharing**: Use `save_context` to share conversation state
- **Finding past work**: Use `search_contexts` to locate relevant discussions
- **Resuming work**: Use `retrieve_context` to get full context

### Best Practices

1. **Start with context**: Always check indexed repositories first
2. **Use natural language**: Write complete questions, not keywords
3. **Be specific**: Include version numbers, frameworks, and context
4. **Save important work**: Use context management for complex projects
5. **Report issues**: Use bug reporting for problems or feature requests

### Example Workflows

#### Analyzing a New Repository

```javascript
// 1. Index the repository
index_repository('https://github.com/owner/repo')

// 2. Check indexing status
check_repository_status('repository', 'owner/repo')

// 3. Search for specific functionality
search_codebase('How does authentication work?', ['owner/repo'])

// 4. Read specific files if needed
read_source_content('repository', 'owner/repo:src/auth.js')
```

#### Researching Best Practices

```javascript
// 1. Use deep research for comparisons
nia_deep_research_agent('Compare top 3 React state management libraries')

// 2. Use web search for specific implementations
nia_web_search('React Redux Toolkit examples')

// 3. Search package code for implementation details
nia_package_search_hybrid('npm', 'redux-toolkit', [
  'how is createSlice implemented?',
])
```

#### Managing Context Across Sessions

```javascript
// 1. Save important conversation
save_context(
  'React Authentication Implementation',
  'Discussed JWT implementation patterns',
  'Full conversation content...',
  'cursor',
  ['react', 'authentication', 'jwt']
)

// 2. Later, search for context
search_contexts('React authentication')

// 3. Retrieve full context
retrieve_context('context-uuid')
```

---

## Integration Notes

### Cursor Integration

- NIA MCP server provides direct access to all tools within AI assistant
- Restart Cursor after initialization to load MCP server
- Verify connection with `list_repositories`
- Set API key in environment or Cursor settings

### Composer Usage

- Start with context by checking indexed repositories
- Use natural language for complete questions
- NIA results appear directly in code
- Reference multiple files from search results

This reference guide covers all available NIA MCP tools and provides practical examples for their usage in your development workflow.
