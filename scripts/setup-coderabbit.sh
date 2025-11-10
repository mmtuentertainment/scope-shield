#!/bin/bash

# ScopeShield - CodeRabbit CLI Setup Script
# Sets up autonomous AI development workflow with built-in quality gates

set -e

echo "🐰 ScopeShield - CodeRabbit CLI Setup"
echo "======================================"
echo ""

# Check if CodeRabbit is already installed
if command -v coderabbit &> /dev/null; then
    VERSION=$(coderabbit --version 2>&1 | head -n1)
    echo "✅ CodeRabbit CLI already installed: $VERSION"
    echo ""
else
    echo "📦 Installing CodeRabbit CLI..."
    echo ""

    if curl -fsSL https://cli.coderabbit.ai/install.sh | sh; then
        echo ""
        echo "✅ CodeRabbit CLI installed successfully!"
        echo ""

        # Restart shell instructions
        echo "⚠️  Please restart your shell to activate CodeRabbit:"
        echo ""
        echo "   source ~/.zshrc    # If using zsh"
        echo "   source ~/.bashrc   # If using bash"
        echo ""

        read -p "Press Enter after restarting your shell..."
    else
        echo "❌ Installation failed. Please install manually:"
        echo "   curl -fsSL https://cli.coderabbit.ai/install.sh | sh"
        exit 1
    fi
fi

# Verify installation
echo "🔍 Verifying installation..."
if ! command -v coderabbit &> /dev/null; then
    echo "❌ CodeRabbit not found in PATH. Please restart your shell:"
    echo "   source ~/.zshrc  # or ~/.bashrc"
    exit 1
fi

echo "✅ CodeRabbit CLI is ready"
echo ""

# Check authentication status
echo "🔐 Checking authentication..."
AUTH_STATUS=$(coderabbit auth status 2>&1 || echo "not authenticated")

if echo "$AUTH_STATUS" | grep -q "Logged in"; then
    echo "✅ Already authenticated to CodeRabbit"
    echo ""
else
    echo "⚠️  Not authenticated. Authentication improves review quality."
    echo ""

    read -p "Authenticate now? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "📝 Starting authentication..."
        echo ""
        echo "⚠️  IMPORTANT: This must be done in Claude Code!"
        echo ""
        echo "Please copy this command and run it in Claude Code:"
        echo ""
        echo "    Run: coderabbit auth login"
        echo ""
        echo "Claude will provide a URL. Open it, log in, and paste the token back."
        echo ""

        read -p "Press Enter after completing authentication in Claude Code..."

        # Verify authentication
        if coderabbit auth status 2>&1 | grep -q "Logged in"; then
            echo "✅ Authentication successful!"
        else
            echo "⚠️  Authentication not detected. You can authenticate later:"
            echo "    Ask Claude Code: Run: coderabbit auth login"
        fi
    fi
fi

echo ""
echo "📋 Configuration Check"
echo "====================="
echo ""

# Check if CLAUDE.md exists and has CodeRabbit section
if grep -q "CodeRabbit CLI Integration" CLAUDE.md 2>/dev/null; then
    echo "✅ CLAUDE.md configured for CodeRabbit reviews"
else
    echo "⚠️  CLAUDE.md missing CodeRabbit configuration"
fi

# Check if integration guide exists
if [ -f ".github/CODERABBIT_INTEGRATION.md" ]; then
    echo "✅ Integration guide available"
else
    echo "⚠️  Integration guide missing"
fi

echo ""
echo "🧪 Testing CodeRabbit CLI"
echo "========================"
echo ""

# Test basic command
if coderabbit --help > /dev/null 2>&1; then
    echo "✅ CodeRabbit CLI is working"
else
    echo "❌ CodeRabbit CLI test failed"
    exit 1
fi

echo ""
echo "📖 Quick Start Guide"
echo "===================="
echo ""
echo "1. Authenticate in Claude Code (if not done):"
echo "   > Run: coderabbit auth login"
echo ""
echo "2. Test a quick review:"
echo "   > Run coderabbit --prompt-only --type uncommitted"
echo ""
echo "3. Full autonomous workflow:"
echo "   > Implement [feature], run CodeRabbit in background, fix all issues"
echo ""
echo "4. Pre-PR review:"
echo "   > Run full CodeRabbit review against main, fix all issues, create PR"
echo ""

echo "📚 Documentation"
echo "================"
echo ""
echo "- Integration Guide: .github/CODERABBIT_INTEGRATION.md"
echo "- Review Instructions: CLAUDE.md (CodeRabbit section)"
echo "- Constitution: memory/constitution.md"
echo ""

echo "💡 Pro Tips"
echo "==========="
echo ""
echo "1. Always use --prompt-only for Claude Code integration"
echo "2. Let long reviews run in background (can take 7-30+ minutes)"
echo "3. Review smaller changesets for faster feedback"
echo "4. Authenticate for higher-quality reviews"
echo "5. Use --type uncommitted for quick pre-commit checks"
echo ""

echo "🎯 Example Workflows"
echo "==================="
echo ""
echo "Quick pre-commit check:"
echo "  > Run coderabbit --prompt-only --type uncommitted and fix critical issues"
echo ""
echo "Full autonomous feature development:"
echo "  > Implement change order generation from spec, run CodeRabbit in"
echo "  > background, fix all issues, verify accuracy ≥75%, create PR when clean"
echo ""
echo "Pre-PR validation:"
echo "  > Run coderabbit --prompt-only --base main, address all findings,"
echo "  > verify constitutional compliance, create PR"
echo ""

echo "=================================="
echo "✅ CodeRabbit CLI Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. If not authenticated, do so in Claude Code"
echo "2. Read integration guide: .github/CODERABBIT_INTEGRATION.md"
echo "3. Try a test review on your current changes"
echo "4. Start autonomous AI development workflow!"
echo ""
echo "Ready for autonomous AI development with quality gates! 🚀"