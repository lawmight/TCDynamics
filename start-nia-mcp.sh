#!/bin/bash

# NIA MCP Server Startup Script
echo "Starting NIA MCP Server..."

# Check if NIA_API_KEY is set
if [ -z "$NIA_API_KEY" ]; then
    echo "⚠️  NIA_API_KEY environment variable is not set."
    echo "Please set it with: export NIA_API_KEY=your_api_key_here"
    echo "You can get an API key from: https://nia.ai"
    exit 1
fi

# Start NIA Codebase MCP Server
echo "Starting NIA Codebase MCP Server..."
nia-codebase-mcp --api-key="$NIA_API_KEY" &

# Start NIA Web Eval MCP Server  
echo "Starting NIA Web Eval MCP Server..."
nia-web-eval-agent-mcp --api-key="$NIA_API_KEY" &

echo "✅ NIA MCP Servers started successfully!"
echo "You can now use NIA tools in Cursor."