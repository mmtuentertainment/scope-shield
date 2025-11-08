#!/bin/bash

# ScopeShield - Claude Code Review Setup Script
# This script helps configure automated Claude code reviews for GitHub

set -e

echo "🤖 ScopeShield - Claude Code Review Setup"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "memory/constitution.md" ]; then
    echo "❌ Error: Must run from ScopeShield root directory"
    exit 1
fi

# Check if git repo exists
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository. Initialize git first."
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI not found. Install it for easier setup:"
    echo "   https://cli.github.com/"
    echo ""
    echo "   Or manually add the secret at:"
    echo "   https://github.com/YOUR_USERNAME/scope-shield/settings/secrets/actions"
    echo ""
    SKIP_GH_CLI=true
else
    SKIP_GH_CLI=false
    echo "✅ GitHub CLI detected"
fi

echo ""
echo "📋 Prerequisites Checklist:"
echo "   [ ] GitHub repository created"
echo "   [ ] Anthropic API key obtained"
echo "   [ ] GitHub Actions enabled in repo settings"
echo ""

read -p "Do you have an Anthropic API key? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please get an API key first:"
    echo "1. Go to https://console.anthropic.com/"
    echo "2. Navigate to API Keys"
    echo "3. Create a new key named 'github-scopeshield-review'"
    echo "4. Copy the key (starts with sk-ant-)"
    echo ""
    echo "Then run this script again."
    exit 0
fi

echo ""

if [ "$SKIP_GH_CLI" = false ]; then
    echo "📝 Setting up GitHub Secret..."
    echo ""
    echo "Please enter your Anthropic API key:"
    read -s ANTHROPIC_API_KEY

    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo "❌ No API key provided"
        exit 1
    fi

    # Validate key format
    if [[ ! $ANTHROPIC_API_KEY =~ ^sk-ant- ]]; then
        echo "⚠️  Warning: API key doesn't start with 'sk-ant-'"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi

    # Add secret to GitHub
    echo ""
    echo "Adding secret to GitHub..."
    if gh secret set ANTHROPIC_API_KEY --body "$ANTHROPIC_API_KEY" 2>/dev/null; then
        echo "✅ Secret added successfully!"
    else
        echo "❌ Failed to add secret. You may need to:"
        echo "   1. Authenticate: gh auth login"
        echo "   2. Check repo permissions"
        echo "   Or add manually at: Settings → Secrets and variables → Actions"
        exit 1
    fi

    # Verify secret was added
    echo ""
    echo "Verifying secret..."
    if gh secret list | grep -q "ANTHROPIC_API_KEY"; then
        echo "✅ Secret verified!"
    else
        echo "⚠️  Secret not found in list. It may still work."
    fi
else
    echo "⚠️  GitHub CLI not available. Please add the secret manually:"
    echo ""
    echo "1. Go to: https://github.com/YOUR_USERNAME/scope-shield/settings/secrets/actions"
    echo "2. Click 'New repository secret'"
    echo "3. Name: ANTHROPIC_API_KEY"
    echo "4. Value: Your Anthropic API key"
    echo ""
    read -p "Press Enter when done..."
fi

echo ""
echo "🔧 Checking GitHub Actions configuration..."

# Check if Actions are enabled (can only do this with API)
if [ "$SKIP_GH_CLI" = false ]; then
    echo "Checking workflow permissions..."
    # Note: This requires admin access
    if gh api repos/:owner/:repo/actions/permissions 2>/dev/null | grep -q "write"; then
        echo "✅ Workflow permissions configured"
    else
        echo "⚠️  Please enable workflow permissions:"
        echo "   Settings → Actions → General → Workflow permissions"
        echo "   Select: 'Read and write permissions'"
        echo "   Check: 'Allow GitHub Actions to create and approve pull requests'"
    fi
fi

echo ""
echo "📦 Checking workflow files..."

if [ -f ".github/workflows/claude-review.yml" ]; then
    echo "✅ Claude review workflow found"
else
    echo "❌ Workflow file missing"
    exit 1
fi

if [ -f ".github/claude-review-config.yml" ]; then
    echo "✅ Review configuration found"
else
    echo "⚠️  Review configuration missing (optional)"
fi

if [ -f ".github/pull_request_template.md" ]; then
    echo "✅ PR template found"
else
    echo "⚠️  PR template missing (optional)"
fi

echo ""
echo "🧪 Testing setup with a test PR..."
echo ""

read -p "Create a test PR to verify Claude review? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Create test branch
    TIMESTAMP=$(date +%s)
    TEST_BRANCH="test/claude-review-$TIMESTAMP"

    echo "Creating test branch: $TEST_BRANCH"
    git checkout -b "$TEST_BRANCH" 2>/dev/null || true

    # Make a small test change
    echo "" >> README.md
    echo "<!-- Test change for Claude review setup - $TIMESTAMP -->" >> README.md

    git add README.md
    git commit -m "test: Claude review setup verification" || true

    echo "Pushing branch..."
    git push -u origin "$TEST_BRANCH" || {
        echo "❌ Failed to push. Make sure you have push access."
        git checkout main 2>/dev/null || git checkout master 2>/dev/null
        git branch -D "$TEST_BRANCH"
        exit 1
    }

    if [ "$SKIP_GH_CLI" = false ]; then
        echo "Creating pull request..."
        PR_URL=$(gh pr create \
            --title "Test: Claude Review Setup" \
            --body "Testing automated Claude code review configuration.

This is an automated test PR created by setup script.

Expected behavior:
- ✅ Claude Code Review workflow should run
- ✅ Claude should review the PR
- ✅ Review comments should appear

If the review runs successfully, this setup is complete!" \
            2>/dev/null) || {
            echo "❌ Failed to create PR. Create manually or check permissions."
            git checkout main 2>/dev/null || git checkout master 2>/dev/null
            exit 1
        }

        echo ""
        echo "✅ Test PR created: $PR_URL"
        echo ""
        echo "📊 Monitoring review status..."
        echo "   Check the PR for Claude's review (usually takes 30-60 seconds)"
        echo ""

        # Open PR in browser
        read -p "Open PR in browser? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            gh pr view --web
        fi
    else
        echo ""
        echo "✅ Test branch pushed: $TEST_BRANCH"
        echo ""
        echo "Please create a PR manually to test the setup:"
        echo "   https://github.com/YOUR_USERNAME/scope-shield/compare/main...$TEST_BRANCH"
    fi

    # Switch back to main
    git checkout main 2>/dev/null || git checkout master 2>/dev/null
fi

echo ""
echo "=================================="
echo "✅ Claude Code Review Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Check your test PR for Claude's review"
echo "2. Review the setup guide: .github/SETUP_CLAUDE_REVIEW.md"
echo "3. Customize review rules in: .github/claude-review-config.yml"
echo ""
echo "Documentation:"
echo "- Setup Guide: .github/SETUP_CLAUDE_REVIEW.md"
echo "- PR Template: .github/pull_request_template.md"
echo "- Constitution: memory/constitution.md"
echo ""
echo "Claude will now automatically review all pull requests! 🎉"