#!/bin/bash

# ================================================
# TC Dynamics - Phase 2 Environment Variables Setup
# ================================================
# This script adds all required environment variables to Vercel
# Run this after completing Supabase and Resend setup
# ================================================

set -e  # Exit on error

echo "🚀 TC Dynamics Phase 2 - Environment Variables Setup"
echo "===================================================="
echo ""

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI is not installed"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""


# Prompt for Resend credentials
echo "📧 RESEND CONFIGURATION"
echo "----------------------"
echo "Enter your Resend credentials:"
echo ""

read -sp "RESEND_API_KEY (hidden): " RESEND_API_KEY
echo ""
echo ""

# Prompt for email addresses
echo "📬 EMAIL CONFIGURATION"
echo "---------------------"
read -p "CONTACT_EMAIL [tom.coustols@tcdynamics.fr]: " CONTACT_EMAIL
CONTACT_EMAIL=${CONTACT_EMAIL:-tom.coustols@tcdynamics.fr}

read -p "DEMO_EMAIL [tom.coustols@tcdynamics.fr]: " DEMO_EMAIL
DEMO_EMAIL=${DEMO_EMAIL:-tom.coustols@tcdynamics.fr}

echo ""
echo "🔍 Review your configuration:"
echo "----------------------------"
echo "RESEND_API_KEY: ${RESEND_API_KEY:0:10}..."
echo "CONTACT_EMAIL: $CONTACT_EMAIL"
echo "DEMO_EMAIL: $DEMO_EMAIL"
echo ""

read -p "Is this correct? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "❌ Setup cancelled"
    exit 1
fi

echo ""
echo "📤 Adding environment variables to Vercel..."
echo "--------------------------------------------"

# Function to add environment variable to all environments
add_vercel_env() {
    local VAR_NAME=$1
    local VAR_VALUE=$2

    echo "Adding $VAR_NAME..."

    # Add to production
    echo "$VAR_VALUE" | vercel env add "$VAR_NAME" production > /dev/null 2>&1 || true

    # Add to preview
    echo "$VAR_VALUE" | vercel env add "$VAR_NAME" preview > /dev/null 2>&1 || true

    # Add to development
    echo "$VAR_VALUE" | vercel env add "$VAR_NAME" development > /dev/null 2>&1 || true

    echo "✅ $VAR_NAME added to all environments"
}

# Add all environment variables
add_vercel_env "RESEND_API_KEY" "$RESEND_API_KEY"
add_vercel_env "CONTACT_EMAIL" "$CONTACT_EMAIL"
add_vercel_env "DEMO_EMAIL" "$DEMO_EMAIL"

echo ""
echo "✅ All environment variables added successfully!"
echo ""
echo "📝 Next steps:"
echo "-------------"
echo "1. Pull the environment variables locally:"
echo "   vercel env pull"
echo ""
echo "2. Redeploy your project:"
echo "   vercel --prod"
echo ""
echo "3. Test your API endpoints (see PHASE_2_SETUP.md)"
echo ""
echo "🎉 Phase 2 environment setup complete!"
