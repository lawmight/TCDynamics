#!/bin/bash
# Dependency validation script for Azure Functions
# Checks for pre-release versions in requirements.txt and constraints.txt

set -e

REQUIREMENTS_FILE="requirements.txt"
CONSTRAINTS_FILE="constraints.txt"
ERRORS=0

# Function to check for pre-release versions
check_file() {
    local file=$1
    if [ ! -f "$file" ]; then
        echo "⚠️  File $file not found, skipping..."
        return
    fi

    echo "Checking $file for pre-release dependencies..."

    # Pattern matches: ==1.0.0b2, ==1.0.0a1, ==1.0.0rc1, ==1.0.0dev1, etc.
    # Pattern matches PEP 440 pre-release versions: alpha, beta, rc, dev (post-releases excluded per PEP 440)
    # Capture output and use || true to prevent set -e from aborting when grep finds no matches (exit code 1)
    matches=$(grep -E "==[0-9]+(\.[0-9]+)*\.?(a|alpha|b|beta|c|rc|dev)[0-9]+" "$file" 2>/dev/null || true)
    if [ -n "$matches" ]; then
        echo "❌ ERROR: Pre-release dependencies found in $file:"
        echo "$matches" | while read -r line; do
            echo "   - $line"
        done
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ No pre-release dependencies found in $file"
    fi
}

# Check both files
check_file "$REQUIREMENTS_FILE"
check_file "$CONSTRAINTS_FILE"

# Exit with error if any pre-release dependencies found
if [ $ERRORS -gt 0 ]; then
    echo ""
    echo "❌ Validation failed: $ERRORS file(s) contain pre-release dependencies"
    echo "Pre-release versions should not be used in production requirements."
    echo "If a stable version is not available, document the risk and create a migration plan."
    exit 1
else
    echo ""
    echo "✅ All dependencies validated successfully"
    exit 0
fi
