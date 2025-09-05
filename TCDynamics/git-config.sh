#!/bin/bash
# Git configuration to prevent pager issues
# Run this once to configure git properly

echo "🔧 Configuring Git to prevent pager issues..."

# Disable pager for common commands
git config --global pager.status false
git config --global pager.branch false
git config --global pager.log false
git config --global pager.diff false

# Alternative: Set pager to cat (no interactive paging)
git config --global core.pager "cat"

# For Windows users, ensure proper line endings
git config --global core.autocrlf true

echo "✅ Git configuration complete!"
echo "Now git commands won't get stuck in pagers."
