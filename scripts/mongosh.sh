#!/bin/bash
# Connect to MongoDB using connection string from .env.local
# Usage: ./scripts/mongosh.sh [mongosh-args...]

set -e

# Load environment variables from .env.local (preferred) or .env
# Only load lines that look like VAR=value (ignore comments and metadata)
load_env_file() {
  local file="$1"
  if [ -f "$file" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
      # Skip empty lines, comments, and lines that don't contain =
      if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*# && "$line" =~ = ]]; then
        # Export the variable
        export "$line" 2>/dev/null || true
      fi
    done < "$file"
  fi
}

if [ -f .env.local ]; then
  load_env_file .env.local
elif [ -f .env ]; then
  load_env_file .env
else
  echo "Error: No .env.local or .env file found"
  echo "Run: vercel env pull .env.local"
  exit 1
fi

# Check if MONGODB_URI is set
if [ -z "$MONGODB_URI" ]; then
  echo "Error: MONGODB_URI not found in environment"
  echo "Run: vercel env pull .env.local"
  exit 1
fi

# Connect to MongoDB with any additional arguments
# Note: If connection fails, check that your MongoDB URI is properly formatted
# and that your IP is whitelisted in MongoDB Atlas
exec mongosh "$MONGODB_URI" "$@"
