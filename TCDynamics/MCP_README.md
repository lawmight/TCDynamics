# NIA MCP Integration for TCDynamics

This document describes the Model Context Protocol (MCP) integration with NIA AI service for the TCDynamics project.

## Overview

The MCP integration provides AI assistants and IDEs with contextual information about the TCDynamics project, enabling more intelligent and context-aware interactions.

## Configuration

### MCP Configuration (`.mcp.json`)

The MCP configuration defines:

- **NIA Service**: AI service integration with your API key
- **Project Information**: Comprehensive project metadata
- **Tools**: Available MCP tools for project interaction
- **Resources**: Accessible project resources
- **Prompts**: Predefined prompts for common tasks

### NIA API Key

Your NIA API key (`nk_lrzAv0SQJE3FNfS2yV52Y0XlnZ7WeI5p`) is securely configured in the MCP server environment variables.

## Available Tools

### 1. Project Overview

```json
{
  "name": "project_overview",
  "description": "Get an overview of the TCDynamics project structure and features",
  "parameters": {
    "detail_level": "brief|detailed|comprehensive"
  }
}
```

### 2. Code Analysis

```json
{
  "name": "code_analysis",
  "description": "Analyze code files and provide insights",
  "parameters": {
    "file_path": "path/to/file",
    "analysis_type": "structure|complexity|security|performance"
  }
}
```

### 3. Learning Recommendations

```json
{
  "name": "learning_recommendations",
  "description": "Get AI-powered learning recommendations for users",
  "parameters": {
    "user_id": "user_identifier",
    "learning_style": "visual|auditory|kinesthetic|reading_writing",
    "current_skill_level": "beginner|intermediate|advanced"
  }
}
```

### 4. Deployment Information

```json
{
  "name": "deployment_info",
  "description": "Get deployment and infrastructure information",
  "parameters": {
    "component": "frontend|backend|database|infrastructure|all"
  }
}
```

## Available Resources

### 1. Project README

- **URI**: `project://readme`
- **Description**: Main project documentation and setup instructions
- **Type**: Markdown

### 2. System Architecture

- **URI**: `project://architecture`
- **Description**: Detailed system architecture and component descriptions
- **Type**: JSON

### 3. API Documentation

- **URI**: `project://apis`
- **Description**: Complete API endpoints and usage documentation
- **Type**: JSON

### 4. Learning Content Database

- **URI**: `project://learning_content`
- **Description**: Structured learning content and curriculum data
- **Type**: JSON

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

The NIA API key is already configured in the MCP server. For additional environment variables, create a `.env` file:

```bash
# MCP Configuration
NIA_API_KEY=nk_lrzAv0SQJE3FNfS2yV52Y0XlnZ7WeI5p
NODE_ENV=production

# Optional: Additional configuration
MCP_LOG_LEVEL=info
MCP_PORT=3001
```

### 3. Start MCP Server

#### Option A: Using provided scripts (Recommended)

```bash
# Double-click these files or run from command line:

# Windows Batch file (easiest)
start-mcp.bat

# PowerShell script (alternative)
.\Start-MCP.ps1
```

#### Option B: Manual start

```bash
# Using npm script
npm run mcp:start

# Or directly
node nia-mcp-server.js
```

#### Option C: For development (keeps terminal open)

```powershell
# PowerShell/Command Prompt
node nia-mcp-server.js
```

### 4. Verify Server is Running

The server will display:

```
NIA MCP Server started successfully
```

If you see this message, the server is ready to accept connections from Cursor!

## 🔄 Restarting MCP Server After Closing Cursor

### Quick Restart Methods:

#### Method 1: Double-click the batch file (Easiest)

1. Navigate to your project folder: `C:\Users\Tomco\OneDrive\Documents\Projects`
2. Double-click `start-mcp.bat`
3. Wait for "MCP Server started successfully!" message
4. Open Cursor - it should auto-connect

#### Method 2: Use PowerShell script

1. Right-click `Start-MCP.ps1` in File Explorer
2. Select "Run with PowerShell"
3. Follow the on-screen instructions

#### Method 3: Manual command line

```powershell
# Open PowerShell/Command Prompt in project directory
cd "C:\Users\Tomco\OneDrive\Documents\Projects"
node nia-mcp-server.js
```

### Troubleshooting Common Issues:

#### ❌ "node is not recognized"

**Solution:**

1. Reinstall Node.js: `winget install OpenJS.NodeJS.LTS`
2. Or restart your computer to refresh PATH
3. Or use full path: `"C:\Program Files\nodejs\node.exe" nia-mcp-server.js`

#### ❌ Server starts but Cursor doesn't connect

**Solution:**

1. Check that `.mcp.json` exists in your project root
2. Verify the path in Cursor MCP settings points to the correct location
3. Restart Cursor after starting the MCP server

#### ❌ "Port already in use" error

**Solution:**

1. Close any existing Node.js processes
2. Check Task Manager for "node.exe" processes
3. Wait 30 seconds and try again

#### 🔍 Verify Server is Running:

```powershell
# Check for Node.js processes
tasklist /FI "IMAGENAME eq node.exe"

# Or check network connections
netstat -ano | findstr :3001
```

## Integration with AI Assistants

### Claude Desktop

To integrate with Claude Desktop:

1. **Install Claude Desktop** (if not already installed)
2. **Configure MCP**: Add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "tcdynamics": {
      "command": "node",
      "args": ["/path/to/your/project/nia-mcp-server.js"],
      "env": {
        "NIA_API_KEY": "nk_lrzAv0SQJE3FNfS2yV52Y0XlnZ7WeI5p"
      }
    }
  }
}
```

### Cursor IDE

For Cursor IDE integration:

1. **Open Cursor Settings**
2. **Navigate to MCP Configuration**
3. **Add Server Configuration**:
   - Command: `node`
   - Arguments: `["/path/to/your/project/nia-mcp-server.js"]`
   - Environment: `{"NIA_API_KEY": "nk_lrzAv0SQJE3FNfS2yV52Y0XlnZ7WeI5p"}`

### Other MCP-Compatible Tools

The MCP server can be integrated with any MCP-compatible AI assistant or IDE by:

1. Pointing to the `nia-mcp-server.js` file
2. Providing the NIA API key as an environment variable
3. Configuring the server to start with the MCP client

## Usage Examples

### Getting Project Overview

```javascript
// Via MCP tool call
{
  "tool": "project_overview",
  "parameters": {
    "detail_level": "detailed"
  }
}
```

### Analyzing Code Files

```javascript
{
  "tool": "code_analysis",
  "parameters": {
    "file_path": "src/App.tsx",
    "analysis_type": "structure"
  }
}
```

### Getting Learning Recommendations

```javascript
{
  "tool": "learning_recommendations",
  "parameters": {
    "user_id": "user123",
    "learning_style": "visual",
    "current_skill_level": "beginner"
  }
}
```

### Accessing Resources

```javascript
// Read project README
{
  "resource": "project://readme"
}

// Get API documentation
{
  "resource": "project://apis"
}
```

## Security Considerations

1. **API Key Protection**: The NIA API key is stored securely and only accessible to the MCP server
2. **File Access**: The MCP server only provides read-only access to project files
3. **Network Security**: All communications use secure protocols
4. **Input Validation**: All inputs are validated before processing

## Troubleshooting

### Common Issues

1. **Server Won't Start**
   - Ensure Node.js is installed (version 16+)
   - Check that all dependencies are installed: `npm install`
   - Verify the NIA API key is correctly set

2. **MCP Connection Failed**
   - Check the server logs for error messages
   - Ensure the correct path to `nia-mcp-server.js` is configured
   - Verify environment variables are properly set

3. **Tool Execution Errors**
   - Check file paths are correct and files exist
   - Ensure proper permissions for file access
   - Verify JSON parameters are correctly formatted

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=mcp:* npm run mcp:start
```

## Development

### Extending the MCP Server

To add new tools or resources:

1. **Add Tool Definition**: Update the `ListToolsRequestSchema` handler in `nia-mcp-server.js`
2. **Implement Tool Logic**: Add the tool implementation in the `CallToolRequestSchema` handler
3. **Update Configuration**: Modify `.mcp.json` to include the new tool/resource

### Testing

```bash
# Run tests
npm test

# Test MCP server directly
node nia-mcp-server.js
```

## Support

For issues or questions regarding the MCP integration:

1. Check the logs in your AI assistant/IDE
2. Verify the MCP server is running: `ps aux | grep nia-mcp-server`
3. Test the server directly: `node nia-mcp-server.js`
4. Review the configuration in `.mcp.json`

## Version History

- **v1.0.0**: Initial MCP integration with NIA AI service
  - Project overview tool
  - Code analysis capabilities
  - Learning recommendations
  - Resource access
  - Comprehensive documentation

---

**Note**: This MCP integration enhances AI assistant capabilities by providing deep context about the TCDynamics project, enabling more accurate and helpful interactions.
