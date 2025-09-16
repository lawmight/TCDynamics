#!/bin/bash

# TCDynamics Secure Environment Setup Script
# This script helps you set up your environment variables securely

echo "🔒 TCDynamics Secure Environment Setup"
echo "======================================"
echo ""

# Function to generate secure random keys
generate_key() {
    if command -v openssl &> /dev/null; then
        openssl rand -hex 32
    else
        # Fallback to /dev/urandom if openssl is not available
        head -c 32 /dev/urandom | base64 | tr -d "=+/" | cut -c1-32
    fi
}

# Check if .env files already exist
if [ -f ".env" ]; then
    echo "⚠️  Warning: .env file already exists!"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file."
    else
        cp .env.example .env
        echo "✅ Created new .env from .env.example"
    fi
else
    cp .env.example .env
    echo "✅ Created .env from .env.example"
fi

if [ -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env file already exists!"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing backend/.env file."
    else
        cp backend/env.example backend/.env
        echo "✅ Created new backend/.env from backend/env.example"
    fi
else
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env from backend/env.example"
fi

echo ""
echo "🔑 Generating secure keys..."
echo ""

SESSION_SECRET=$(generate_key)
ADMIN_API_KEY=$(generate_key)

echo "Generated secure keys:"
echo "====================="
echo "SESSION_SECRET=$SESSION_SECRET"
echo "ADMIN_API_KEY=$ADMIN_API_KEY"
echo ""
echo "📋 Next steps:"
echo "1. Copy these keys to your backend/.env file"
echo "2. Update ZOHO_EMAIL and ZOHO_PASSWORD with your actual Zoho credentials"
echo "3. Update VITE_API_URL and VITE_AZURE_FUNCTION_URL in .env"
echo "4. Never commit .env files to version control!"
echo ""
echo "⚠️  IMPORTANT REMINDERS:"
echo "- Use Zoho App Passwords, not your main password"
echo "- Keep your .env files secure and never share them"
echo "- Rotate your keys regularly (quarterly recommended)"
echo "- Review the SECURITY_UPDATE.md for more details"
echo ""
echo "✅ Setup complete! Remember to update the values with your actual credentials."
