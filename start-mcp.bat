@echo off
echo Starting NIA MCP Server for TCDynamics...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please ensure Node.js is installed and added to PATH
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Start the MCP server
echo Launching MCP server...
start "NIA MCP Server" cmd /k "cd /d %~dp0 && node nia-mcp-server.js"

echo.
echo ✅ MCP Server started successfully!
echo.
echo 📋 Next steps:
echo 1. Open Cursor IDE
echo 2. The MCP server should auto-connect
echo 3. Start asking questions about your TCDynamics project!
echo.
echo Press any key to close this window...
pause >nul
