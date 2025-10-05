#!/bin/bash

# Azure Functions Deployment Script for TCDynamics
# This script deploys the Python Azure Functions to Azure

set -e  # Exit on any error

# Cleanup function to handle virtual environment deactivation and process cleanup
cleanup() {
    if [ -n "${FUNC_PID:-}" ] && kill -0 "$FUNC_PID" 2>/dev/null; then
        echo "🧹 Cleaning up Azure Functions process (PID: $FUNC_PID)..."
        kill "$FUNC_PID" 2>/dev/null || true
        # Wait for process to actually exit
        wait "$FUNC_PID" 2>/dev/null || true
        echo "✅ Process cleanup complete"
    fi
    deactivate 2>/dev/null || true
}

# Set up trap to call cleanup on exit, interrupt, and terminate signals
trap cleanup EXIT SIGINT SIGTERM

echo "🚀 Starting Azure Functions deployment..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo -E bash"
    exit 1
fi

# Check if Azure Functions Core Tools is installed
if ! command -v func &> /dev/null; then
    echo "❌ Azure Functions Core Tools is not installed. Please install it first:"
    echo "   npm install -g azure-functions-core-tools@4 --unsafe-perm true"
    exit 1
fi

# Check if we're logged into Azure
echo "🔐 Checking Azure login..."
if ! az account show &> /dev/null; then
    echo "❌ Not logged into Azure. Please login first:"
    echo "   az login"
    exit 1
fi

echo "✅ Azure login confirmed"

# Navigate to TCDynamics directory
cd "$(dirname "$0")"

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found"
    exit 1
fi

# Check if function_app.py exists
if [ ! -f "function_app.py" ]; then
    echo "❌ function_app.py not found"
    exit 1
fi

echo "📦 Setting up Python virtual environment..."
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "🔧 Testing functions locally..."
func start --verbose > /dev/null 2>&1 &
FUNC_PID=$!

# Wait for functions to be ready by polling health endpoint with timeout
echo "⏳ Waiting for functions to start..."
MAX_WAIT=60  # 60 seconds timeout
COUNTER=0

while [ $COUNTER -lt $MAX_WAIT ]; do
    if curl --connect-timeout 5 --max-time 10 -f http://localhost:7071/api/health &> /dev/null; then
        echo "✅ Health endpoint working (ready after ${COUNTER}s)"
        break
    fi

    echo "   Waiting... (${COUNTER}s elapsed)"
    sleep 2
    COUNTER=$((COUNTER + 2))

    # Check if process is still running
    if ! kill -0 "$FUNC_PID" 2>/dev/null; then
        echo "❌ Azure Functions process died during startup"
        exit 1
    fi
done

if [ $COUNTER -ge $MAX_WAIT ]; then
    echo "❌ Timeout: Health endpoint not responding after ${MAX_WAIT}s"
    kill "$FUNC_PID" 2>/dev/null || true
    exit 1
fi

# Stop local functions before deployment
echo "🛑 Stopping local functions..."
cleanup

echo "☁️ Deploying to Azure Functions..."
func azure functionapp publish func-tcdynamics-contact --nozip

echo "🔍 Checking deployment status..."
# Wait for deployment to complete
sleep 10

echo "🔗 Testing deployed functions..."

# Test health endpoint
echo "Testing health endpoint..."
if curl --connect-timeout 10 --max-time 30 -f https://func-tcdynamics-contact.azurewebsites.net/api/health &> /dev/null; then
    echo "✅ Health endpoint deployed successfully"
else
    echo "❌ Health endpoint not accessible after deployment"
    echo "   Please check Azure Portal for deployment errors"
    exit 1
fi

# Test contact form endpoint
echo "Testing contact form endpoint..."
CONTACT_RESPONSE=$(curl --connect-timeout 10 --max-time 30 -s -X POST https://func-tcdynamics-contact.azurewebsites.net/api/contactform \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}')

if echo "$CONTACT_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Contact form endpoint working"
else
    echo "❌ Contact form endpoint not working properly"
    echo "   Response: $CONTACT_RESPONSE"
fi

# Test AI chat endpoint (if configured)
echo "Testing AI chat endpoint..."
CHAT_RESPONSE=$(curl --connect-timeout 10 --max-time 30 -s -X POST https://func-tcdynamics-contact.azurewebsites.net/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test123"}')

if echo "$CHAT_RESPONSE" | grep -q "success.*true"; then
    echo "✅ AI chat endpoint working"
else
    echo "⚠️ AI chat endpoint may need Azure OpenAI configuration"
    echo "   Response: $CHAT_RESPONSE"
fi

echo ""
echo "🎉 Azure Functions deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Azure Portal → Function App → Configuration"
echo "2. Add all environment variables from md/AZURE_FUNCTIONS_ENV_SETUP.md"
echo "3. Set CORS allowed origins to include your domain"
echo "4. Test your website frontend integration"
echo ""
echo "🔗 Function App URL: https://func-tcdynamics-contact.azurewebsites.net"
echo "📊 Monitor logs: az functionapp log tail --name func-tcdynamics-contact --resource-group rg-TCDynamics"
