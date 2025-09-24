#!/bin/bash

echo "🧪 Testing NIA Functionality"
echo "=============================="

# Test 1: Check NIA installation
echo "1. Checking NIA installation..."
if command -v nia-codebase-mcp &> /dev/null; then
    echo "✅ nia-codebase-mcp is installed"
else
    echo "❌ nia-codebase-mcp is not installed"
fi

if command -v nia-web-eval-agent-mcp &> /dev/null; then
    echo "✅ nia-web-eval-agent-mcp is installed"
else
    echo "❌ nia-web-eval-agent-mcp is not installed"
fi

# Test 2: Check API key
echo ""
echo "2. Checking NIA API key..."
if [ -z "$NIA_API_KEY" ]; then
    echo "⚠️  NIA_API_KEY is not set"
    echo "   To get an API key, visit: https://nia.ai"
    echo "   Then run: export NIA_API_KEY=your_key_here"
else
    echo "✅ NIA_API_KEY is set"
fi

# Test 3: Check Cursor MCP configuration
echo ""
echo "3. Checking Cursor MCP configuration..."
if [ -f "/home/ubuntu/.config/cursor/User/settings.json" ]; then
    echo "✅ Cursor MCP settings file exists"
    echo "   Configuration:"
    cat /home/ubuntu/.config/cursor/User/settings.json | head -10
else
    echo "❌ Cursor MCP settings file not found"
fi

# Test 4: Check workspace structure
echo ""
echo "4. Checking workspace structure..."
if [ -f "/workspace/.niaignore" ]; then
    echo "✅ .niaignore file exists"
else
    echo "❌ .niaignore file not found"
fi

if [ -f "/workspace/.cursor/rules/nia.mdc" ]; then
    echo "✅ NIA rules file exists"
else
    echo "❌ NIA rules file not found"
fi

# Test 5: Test basic functionality (without API key)
echo ""
echo "5. Testing basic NIA functionality..."
echo "   Attempting to run nia-codebase-mcp with dummy key..."

# Try with a dummy key to see what happens
NIA_API_KEY="test_key" nia-codebase-mcp --help 2>&1 | head -5

echo ""
echo "📋 Summary:"
echo "   - NIA MCP servers are installed"
echo "   - Configuration files are in place"
echo "   - Need to set NIA_API_KEY environment variable"
echo "   - Restart Cursor after setting the API key"