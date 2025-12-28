#!/bin/bash
# Azure Functions Deployment Script for TCDynamics
# This script deploys the Python Azure Functions to Azure

# Strict error handling: exit on errors, undefined variables, and pipe failures
set -e  # Exit on any error
set -u  # Exit on undefined variables
set -o pipefail  # Exit if any command in a pipeline fails

# Configuration variables
FUNCTION_APP_NAME="${FUNCTION_APP_NAME:-func-tcdynamics-contact}"
RESOURCE_GROUP="${RESOURCE_GROUP:-rg-TCDynamics}"

# Validation functions
validate_function_app_name() {
    local name="$1"

    # Check if empty
    if [ -z "$name" ]; then
        echo "❌ ERROR: FUNCTION_APP_NAME is empty or not set"
        echo "   Function App name must be provided"
        exit 1
    fi

    # Check length (Azure limit: 2-60 characters)
    local length=${#name}
    if [ $length -lt 2 ] || [ $length -gt 60 ]; then
        echo "❌ ERROR: FUNCTION_APP_NAME '${name}' has invalid length (${length} characters)"
        echo "   Function App name must be between 2 and 60 characters"
        exit 1
    fi

    # Check for leading/trailing hyphens
    if [[ "$name" =~ ^- ]] || [[ "$name" =~ -$ ]]; then
        echo "❌ ERROR: FUNCTION_APP_NAME '${name}' cannot start or end with a hyphen"
        echo "   Function App name must start and end with alphanumeric characters"
        exit 1
    fi

    # Check for allowed characters only (lowercase letters, numbers, hyphens)
    if ! [[ "$name" =~ ^[a-z0-9-]+$ ]]; then
        echo "❌ ERROR: FUNCTION_APP_NAME '${name}' contains invalid characters"
        echo "   Function App name must contain only lowercase letters, numbers, and hyphens"
        echo "   Current value: '${name}'"
        exit 1
    fi

    # Check that it starts and ends with alphanumeric (not hyphen)
    if ! [[ "$name" =~ ^[a-z0-9] ]] || ! [[ "$name" =~ [a-z0-9]$ ]]; then
        echo "❌ ERROR: FUNCTION_APP_NAME '${name}' must start and end with alphanumeric characters"
        exit 1
    fi
}

validate_resource_group() {
    local rg="$1"

    # Check if empty
    if [ -z "$rg" ]; then
        echo "❌ ERROR: RESOURCE_GROUP is empty or not set"
        echo "   Resource Group name must be provided"
        exit 1
    fi

    # Check length (Azure limit: 1-90 characters)
    local length=${#rg}
    if [ $length -lt 1 ] || [ $length -gt 90 ]; then
        echo "❌ ERROR: RESOURCE_GROUP '${rg}' has invalid length (${length} characters)"
        echo "   Resource Group name must be between 1 and 90 characters"
        exit 1
    fi

    # Check for allowed characters (alphanumeric, underscores, hyphens, periods, parentheses)
    # Azure allows more characters, but we'll enforce common safe characters
    if ! [[ "$rg" =~ ^[a-zA-Z0-9._()-]+$ ]]; then
        echo "❌ ERROR: RESOURCE_GROUP '${rg}' contains invalid characters"
        echo "   Resource Group name must contain only alphanumeric characters, underscores, hyphens, periods, and parentheses"
        echo "   Current value: '${rg}'"
        exit 1
    fi
}

# Validate configuration variables
echo "🔍 Validating configuration variables..."
validate_function_app_name "$FUNCTION_APP_NAME"
validate_resource_group "$RESOURCE_GROUP"
echo "✅ Configuration variables validated"

FUNCTION_APP_URL="https://${FUNCTION_APP_NAME}.azurewebsites.net"

# Debug logging flag - set to "true" to enable full response logging (use with caution)
DEBUG_LOGGING="${DEBUG_LOGGING:-false}"

# Maximum response size to log in full (characters) - larger responses will be summarized
MAX_LOG_SIZE="${MAX_LOG_SIZE:-500}"

# Function to redact sensitive keys from JSON
redact_sensitive_json() {
    local json_input="$1"

    # List of sensitive key patterns to redact (case-insensitive)
    local sensitive_keys="apiKey|token|password|sessionId|userEmail|email|secret|auth|credential|key|accessToken|refreshToken|authorization"

    # Try to parse and redact JSON
    if echo "$json_input" | jq -e . > /dev/null 2>&1; then
        # Use jq to recursively remove sensitive keys
        echo "$json_input" | jq --arg keys "$sensitive_keys" '
            def redact_sensitive:
                if type == "object" then
                    . as $obj |
                    reduce keys[] as $key (
                        {};
                        if ($key | ascii_downcase | test($keys)) then
                            . + {($key): "[REDACTED]"}
                        else
                            . + {($key): ($obj[$key] | redact_sensitive)}
                        end
                    )
                elif type == "array" then
                    map(redact_sensitive)
                else
                    .
                end;
            redact_sensitive
        ' 2>/dev/null || echo "$json_input"
    else
        # Not valid JSON, return as-is (will be handled by safe_log_response)
        echo "$json_input"
    fi
}

# Function to safely log HTTP responses without exposing sensitive data
safe_log_response() {
    local response="$1"
    local context="${2:-Response}"
    local http_status="${3:-}"

    # If debug logging is enabled, log full response (still redacted)
    if [ "$DEBUG_LOGGING" = "true" ]; then
        if echo "$response" | jq -e . > /dev/null 2>&1; then
            # Valid JSON - redact and log
            local redacted=$(redact_sensitive_json "$response")
            echo "   [$context] (DEBUG): $redacted"
        else
            # Not JSON - log with size limit
            local preview=$(echo "$response" | head -c "$MAX_LOG_SIZE")
            if [ ${#response} -gt $MAX_LOG_SIZE ]; then
                echo "   [$context] (DEBUG): ${preview}... [truncated, ${#response} chars total]"
            else
                echo "   [$context] (DEBUG): ${preview}"
            fi
        fi
        return
    fi

    # Production logging - only safe summaries
    local response_length=${#response}

    # Check if response is valid JSON
    if echo "$response" | jq -e . > /dev/null 2>&1; then
        # Extract safe summary information
        local success=$(echo "$response" | jq -r '.success // "unknown"' 2>/dev/null || echo "unknown")
        local error=$(echo "$response" | jq -r '.error // empty' 2>/dev/null)
        local message=$(echo "$response" | jq -r '.message // empty' 2>/dev/null | head -c 100)

        # Build safe summary
        local summary="JSON response (${response_length} chars)"
        [ -n "$http_status" ] && summary="${summary}, HTTP ${http_status}"
        [ "$success" != "unknown" ] && summary="${summary}, success=${success}"
        [ -n "$error" ] && summary="${summary}, error=${error}"
        [ -n "$message" ] && summary="${summary}, message=${message}"

        echo "   [$context]: $summary"

        # If response is small and contains useful info, show redacted version
        if [ "$response_length" -le "$MAX_LOG_SIZE" ]; then
            local redacted=$(redact_sensitive_json "$response")
            echo "   [$context] (redacted): $redacted"
        fi
    else
        # Not JSON - log only summary
        if [ "$response_length" -le "$MAX_LOG_SIZE" ]; then
            # Small non-JSON response - safe to show preview
            local preview=$(echo "$response" | head -c "$MAX_LOG_SIZE")
            echo "   [$context]: ${preview}"
        else
            # Large non-JSON response - only hash and size
            local hash=$(echo -n "$response" | sha256sum | cut -d' ' -f1 | head -c 16)
            echo "   [$context]: Non-JSON response (${response_length} chars, hash: ${hash}...)"
        fi
    fi
}

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

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install it first:"
    echo "   Ubuntu/Debian: sudo apt-get install jq"
    echo "   macOS: brew install jq"
    echo "   Windows: choco install jq"
    exit 1
fi

# Check for Python 3 and determine the correct Python executable
echo "🐍 Checking for Python 3..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    echo "✅ Found python3: $(command -v python3)"
elif command -v python &> /dev/null; then
    # Fallback to python, but verify it's Python 3
    PYTHON_VERSION_OUTPUT=$(python --version 2>&1)
    if echo "$PYTHON_VERSION_OUTPUT" | grep -q "Python 3"; then
        PYTHON_CMD="python"
        echo "✅ Found python (Python 3): $(command -v python)"
    else
        echo "❌ Python 3 is required but only Python 2 is available."
        echo "   Detected: $PYTHON_VERSION_OUTPUT"
        echo "   Please install Python 3:"
        echo "   Ubuntu/Debian: sudo apt-get install python3 python3-venv"
        echo "   macOS: brew install python3"
        echo "   Windows: Download from https://www.python.org/downloads/"
        exit 1
    fi
else
    echo "❌ Python 3 is not installed. Please install it first:"
    echo "   Ubuntu/Debian: sudo apt-get install python3 python3-venv"
    echo "   macOS: brew install python3"
    echo "   Windows: Download from https://www.python.org/downloads/"
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

# Check if constraints.txt exists
if [ ! -f "constraints.txt" ]; then
    echo "❌ constraints.txt not found"
    exit 1
fi

echo "📦 Setting up Python virtual environment..."
if [ ! -d ".venv" ]; then
    "$PYTHON_CMD" -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Redirect to a log file for debugging if needed
echo "Upgrading pip, setuptools, and wheel..."
# Use python -m pip to ensure we're using the same interpreter as the venv
# This ensures consistency with the subsequent pip install command
if ! python -m pip install --upgrade pip; then
    echo "❌ Failed to upgrade pip"
    exit 1
fi
if ! python -m pip install --upgrade setuptools wheel; then
    echo "❌ Failed to upgrade setuptools and wheel"
    exit 1
fi
echo "Installing dependencies with constraints..."
pip install -r requirements.txt -c constraints.txt

echo "🔧 Starting function host for local testing..."
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
func azure functionapp publish "$FUNCTION_APP_NAME" --nozip

echo "🔍 Checking deployment status..."
# Poll health endpoint with retries to handle cold starts
echo "⏳ Waiting for deployed functions to be ready..."
MAX_ATTEMPTS=5
ATTEMPT_DELAY=6  # 6 seconds between attempts
COUNTER=0
HEALTH_CHECK_SUCCESS=false

for i in $(seq 1 $MAX_ATTEMPTS); do
    echo "   Attempt $i/$MAX_ATTEMPTS: Checking health endpoint..."

    if curl --connect-timeout 10 --max-time 30 -f "${FUNCTION_APP_URL}/api/health" &> /dev/null; then
        echo "✅ Health endpoint is accessible (ready after ~$((COUNTER))s)"
        HEALTH_CHECK_SUCCESS=true
        break
    fi

    if [ $i -lt $MAX_ATTEMPTS ]; then
        echo "   Health endpoint not ready yet, waiting ${ATTEMPT_DELAY}s before retry..."
        sleep $ATTEMPT_DELAY
        COUNTER=$((COUNTER + ATTEMPT_DELAY))
    fi
done

echo "🔗 Testing deployed functions..."

# Test health endpoint (final check if polling didn't succeed)
if [ "$HEALTH_CHECK_SUCCESS" = false ]; then
    echo "Testing health endpoint (final attempt)..."
    if curl --connect-timeout 10 --max-time 30 -f "${FUNCTION_APP_URL}/api/health" &> /dev/null; then
        echo "✅ Health endpoint deployed successfully"
        HEALTH_CHECK_SUCCESS=true
    else
        echo "❌ Health endpoint not accessible after deployment ($MAX_ATTEMPTS attempts with ${ATTEMPT_DELAY}s delays)"
        echo "   Please check Azure Portal for deployment errors"
        exit 1
    fi
fi

# Test contact form endpoint
echo "Testing contact form endpoint..."
CONTACT_RESPONSE=$(curl --connect-timeout 10 --max-time 30 -s -X POST "${FUNCTION_APP_URL}/api/contactform" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}')

if echo "$CONTACT_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo "✅ Contact form endpoint working"
else
    echo "❌ Contact form endpoint not working properly"
    safe_log_response "$CONTACT_RESPONSE" "Contact Form"
fi

# Test AI chat endpoint (if configured)
echo "Testing AI chat endpoint..."
CHAT_RESPONSE=$(curl --connect-timeout 10 --max-time 30 -s -X POST "${FUNCTION_APP_URL}/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test123"}')

if echo "$CHAT_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo "✅ AI chat endpoint working"
else
    echo "⚠️ AI chat endpoint may need Azure OpenAI configuration"
    safe_log_response "$CHAT_RESPONSE" "AI Chat"
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
echo "🔗 Function App URL: ${FUNCTION_APP_URL}"
echo "📊 Monitor logs: az functionapp log tail --name ${FUNCTION_APP_NAME} --resource-group ${RESOURCE_GROUP}"
