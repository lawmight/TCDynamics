#!/bin/bash

# Script to setup Nginx CSP nonces for TCDynamics
# This script installs and configures the required nginx module for CSP nonces

set -e

echo "🔒 Setting up Nginx CSP Nonces for enhanced security..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root"
   exit 1
fi

# Install nginx set-misc module
echo "📦 Installing nginx set-misc module..."

# For Ubuntu/Debian
if command -v apt-get &> /dev/null; then
    apt-get update
    apt-get install -y nginx-module-set-misc

# For CentOS/RHEL
elif command -v yum &> /dev/null; then
    yum install -y nginx-module-set-misc

# For Alpine (Docker containers)
elif command -v apk &> /dev/null; then
    apk add nginx-mod-http-set-misc

else
    echo "❌ Unsupported package manager. Please install nginx-module-set-misc manually."
    exit 1
fi

# Check if module is available
MODULE_PATH="/usr/lib/nginx/modules/ngx_http_set_misc_module.so"
if [[ ! -f "$MODULE_PATH" ]]; then
    echo "❌ Module not found at $MODULE_PATH"

    # Try alternative locations
    ALT_PATHS=(
        "/usr/share/nginx/modules/ngx_http_set_misc_module.so"
        "/usr/local/lib/nginx/modules/ngx_http_set_misc_module.so"
    )

    for path in "${ALT_PATHS[@]}"; do
        if [[ -f "$path" ]]; then
            MODULE_PATH="$path"
            break
        fi
    done
fi

if [[ ! -f "$MODULE_PATH" ]]; then
    echo "❌ Could not find ngx_http_set_misc_module.so"
    echo "💡 You may need to compile nginx from source with the module:"
    echo "   ./configure --with-http_set_misc_module"
    exit 1
fi

echo "✅ Module found at: $MODULE_PATH"

# Update nginx configuration
NGINX_CONF="/etc/nginx/nginx.conf"
if [[ ! -f "$NGINX_CONF" ]]; then
    echo "❌ Nginx configuration not found at $NGINX_CONF"
    exit 1
fi

# Add load_module directive if not present
if ! grep -q "load_module.*set_misc" "$NGINX_CONF"; then
    echo "🔧 Adding load_module directive to nginx.conf..."

    # Create backup
    cp "$NGINX_CONF" "$NGINX_CONF.backup.$(date +%Y%m%d_%H%M%S)"

    # Add load_module at the top
    sed -i '1i load_module modules/ngx_http_set_misc_module.so;' "$NGINX_CONF"

    echo "✅ Added load_module directive"
else
    echo "✅ load_module directive already present"
fi

# Test nginx configuration
echo "🔍 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"

    # Reload nginx
    echo "🔄 Reloading nginx..."
    nginx -s reload

    echo "✅ Nginx reloaded successfully"
    echo ""
    echo "🎉 CSP Nonces are now active!"
    echo ""
    echo "📋 What was configured:"
    echo "   • CSP nonces for inline scripts and styles"
    echo "   • Enhanced security headers"
    echo "   • Permissions policy for modern browsers"
    echo "   • Mixed content protection"
    echo ""
    echo "🔒 Your site is now protected against:"
    echo "   • XSS attacks via CSP nonces"
    echo "   • Clickjacking (X-Frame-Options)"
    echo "   • MIME sniffing attacks"
    echo "   • Mixed content vulnerabilities"
    echo ""
    echo "📝 Next steps:"
    echo "   • Update your React app to use the CSP nonce"
    echo "   • Test your application thoroughly"
    echo "   • Monitor security headers in browser dev tools"

else
    echo "❌ Nginx configuration test failed"
    echo "💡 Please check your nginx.conf syntax"
    exit 1
fi
