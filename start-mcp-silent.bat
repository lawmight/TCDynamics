@echo off
REM Silent MCP Server Starter for Cursor
REM This starts MCP in the background without opening windows

echo Starting NIA MCP Server silently...

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please ensure Node.js is installed and added to PATH
    exit /b 1
)

REM Start the MCP server in background (no window)
start /B node "%~dp0nia-mcp-server.js" >nul 2>&1

echo NIA MCP Server started in background
echo Check Task Manager for node.exe process
echo.

