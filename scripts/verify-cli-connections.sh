#!/bin/bash
# Verify CLI tool connections for TCDynamics project
# Usage: ./scripts/verify-cli-connections.sh

set -e

echo "🔍 Verifying CLI Tool Connections..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. GitHub CLI
echo "1. GitHub CLI (gh)"
if command -v gh &> /dev/null; then
  if gh auth status &> /dev/null; then
    echo -e "   ${GREEN}✓${NC} Authenticated"
    gh auth status 2>&1 | grep -E "Logged in|Active account" | sed 's/^/   /'
  else
    echo -e "   ${RED}✗${NC} Not authenticated"
    echo "   Run: gh auth login"
  fi
else
  echo -e "   ${RED}✗${NC} Not installed"
fi
echo ""

# 2. Vercel CLI
echo "2. Vercel CLI (vercel)"
if command -v vercel &> /dev/null; then
  if vercel whoami &> /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Authenticated"
    vercel whoami 2>&1 | sed 's/^/   /'
  else
    echo -e "   ${YELLOW}⚠${NC} Not authenticated (or not logged in)"
    echo "   Run: vercel login"
  fi
else
  echo -e "   ${RED}✗${NC} Not installed"
fi
echo ""

# 3. MongoDB Shell
echo "3. MongoDB Shell (mongosh)"
if command -v mongosh &> /dev/null; then
  echo -e "   ${GREEN}✓${NC} Installed"
  
  # Check for connection string (check .env.local first, then .env)
  ENV_FILE=""
  if [ -f .env.local ]; then
    ENV_FILE=".env.local"
  elif [ -f .env ]; then
    ENV_FILE=".env"
  fi
  
  if [ -n "$ENV_FILE" ]; then
    if grep -q "^MONGODB_URI=" "$ENV_FILE"; then
      echo -e "   ${GREEN}✓${NC} MONGODB_URI found in $ENV_FILE"
      
      # Try to load and test connection (non-blocking)
      set +e
      source "$ENV_FILE" 2>/dev/null
      if [ -n "$MONGODB_URI" ]; then
        echo "   Testing connection..."
        if mongosh "$MONGODB_URI" --quiet --eval "db.adminCommand('ping')" &> /dev/null; then
          echo -e "   ${GREEN}✓${NC} Connection successful"
        else
          echo -e "   ${YELLOW}⚠${NC} Connection failed (check your MONGODB_URI)"
        fi
      fi
      set -e
    else
      echo -e "   ${YELLOW}⚠${NC} MONGODB_URI not found in $ENV_FILE"
      echo "   Run: vercel env pull .env.local"
    fi
  else
    echo -e "   ${YELLOW}⚠${NC} No .env or .env.local file found"
    echo "   Run: vercel env pull .env.local"
  fi
else
  echo -e "   ${RED}✗${NC} Not installed"
  echo "   Install: npm install -g mongosh"
fi
echo ""

# 4. Other useful tools
echo "4. Other CLI Tools"
TOOLS=("jq" "http" "bat" "fd" "rg")
for tool in "${TOOLS[@]}"; do
  if command -v "$tool" &> /dev/null; then
    echo -e "   ${GREEN}✓${NC} $tool installed"
  else
    echo -e "   ${YELLOW}○${NC} $tool not installed (optional)"
  fi
done
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
echo "  • Essential tools should be authenticated"
echo "  • MongoDB connection requires MONGODB_URI in .env"
echo "  • See docs/cli-tools.md for detailed setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
