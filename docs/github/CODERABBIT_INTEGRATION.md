# CodeRabbit CLI + Claude Code Integration

> Autonomous AI development workflow for ScopeShield with built-in quality gates that catch issues before they reach production.

## Overview

This integration enables Claude Code to execute CodeRabbit reviews directly in your development workflow, creating fully autonomous AI development cycles for ScopeShield.

**Workflow**: Claude Code → Implement Feature → Run CodeRabbit → Fix Issues → Verify → Repeat

## Why This Integration for ScopeShield

<table>
<tr>
<td width="50%">

### Expert Issue Detection
CodeRabbit spots issues specific to Chrome extensions:
- Race conditions in MutationObservers
- Memory leaks in content scripts
- Gmail selector stability issues
- Chrome storage quota problems
- Permission creep in manifest.json
- Performance regressions >500ms

</td>
<td width="50%">

### Constitutional Compliance
Validates against ScopeShield's 8 principles:
- Privacy violations (data transmission)
- Infrastructure dependencies
- Performance budget violations
- Accuracy regressions
- Security vulnerabilities
- Chrome Web Store violations

</td>
</tr>
</table>

## Prerequisites

### 1. Install CodeRabbit CLI

```bash
# Install globally
curl -fsSL https://cli.coderabbit.ai/install.sh | sh

# Restart shell
source ~/.zshrc  # or ~/.bashrc

# Verify installation
coderabbit --version
```

### 2. Authenticate Within Claude Code

**Important**: Authentication must be done inside Claude Code, not your terminal.

Ask Claude Code:
```
Run: coderabbit auth login
```

Claude will provide a URL. Open it in your browser, log in to CodeRabbit, and paste the token back to Claude.

Verify:
```
Run: coderabbit auth status
```

<details>
<summary>Why authenticate in Claude Code?</summary>

CodeRabbit authentication is session-specific. Even if you're logged in via terminal, Claude Code needs its own authentication to execute reviews on your behalf.

Authentication persists across Claude Code instances - you only need to do this once.
</details>

### 3. Configure Claude Code for ScopeShield

CodeRabbit automatically reads your `CLAUDE.md` file for project context. I've already created one optimized for ScopeShield reviews.

## Integration Workflows

### Workflow 1: Feature Implementation + Review

**Best for**: New features, architectural changes, complex implementations

```bash
# In Claude Code
Implement the change order generation feature from specs/002-change-orders/spec.md.
Then run coderabbit --prompt-only --type all in the background and fix any issues.
Let CodeRabbit take as long as it needs.
```

**What happens:**
1. Claude implements the feature
2. Runs CodeRabbit analysis in background
3. Waits for completion (7-30+ minutes)
4. Creates task list from CodeRabbit findings
5. Systematically fixes each issue
6. Re-runs CodeRabbit to verify
7. Reports completion

### Workflow 2: Pre-Commit Review

**Best for**: Quick validation before committing

```bash
# In Claude Code
Run coderabbit --prompt-only --type uncommitted and fix any critical issues
```

**What happens:**
1. Reviews only uncommitted changes
2. Faster than full review (2-5 minutes)
3. Fixes critical/high severity issues
4. Leaves low-priority items for later

### Workflow 3: Pre-PR Review

**Best for**: Final validation before creating pull request

```bash
# In Claude Code
I'm ready to create a PR for the detection accuracy improvements.
First run coderabbit --prompt-only --base main and address all findings.
```

**What happens:**
1. Reviews all changes vs main branch
2. Comprehensive analysis (10-30 minutes)
3. Addresses ALL findings (not just critical)
4. Ensures PR is review-ready
5. Creates PR when clean

### Workflow 4: Constitutional Validation

**Best for**: Ensuring compliance with ScopeShield principles

```bash
# In Claude Code
Run coderabbit --prompt-only and verify constitutional compliance:
- No privacy violations
- Performance budget <500ms
- No external dependencies
- Accuracy maintained ≥75%
```

**What happens:**
1. CodeRabbit analyzes against constitution
2. Claude validates each principle
3. Fixes violations immediately
4. Reports compliance status

## ScopeShield-Specific Review Focus

CodeRabbit is configured to prioritize issues specific to ScopeShield:

### High Priority (Auto-fix)
- ❌ Privacy violations (data transmission, external APIs)
- ❌ Performance regressions >100ms
- ❌ Gmail selector changes without fallbacks
- ❌ Chrome storage quota violations
- ❌ Security vulnerabilities (XSS, injection)
- ❌ Manifest V3 compliance issues

### Medium Priority (Review + fix)
- ⚠️ Memory leaks in observers
- ⚠️ Missing error handling
- ⚠️ Detection accuracy impacts
- ⚠️ Bundle size increases >50KB
- ⚠️ Missing JSDoc comments
- ⚠️ Test coverage gaps

### Low Priority (Log for later)
- ℹ️ Code style inconsistencies
- ℹ️ Minor optimizations
- ℹ️ Documentation improvements
- ℹ️ Variable naming suggestions

## Advanced Usage

### Review Specific File Types

```bash
# Only review detector changes
coderabbit --prompt-only --path "src/utils/detector.js" --path "src/utils/trigger-words.js"

# Review all content scripts
coderabbit --prompt-only --path "src/content/**"

# Review manifest and permissions
coderabbit --prompt-only --path "manifest.json"
```

### Review Against Specific Branch

```bash
# Compare with develop branch
coderabbit --prompt-only --base develop

# Compare with feature branch
coderabbit --prompt-only --base feature/new-detection-engine
```

### Control Review Depth

```bash
# Quick review (uncommitted only)
coderabbit --prompt-only --type uncommitted

# Full review (committed + uncommitted)
coderabbit --prompt-only --type all

# Only committed changes
coderabbit --prompt-only --type committed
```

### Background Execution

For long-running reviews, ensure Claude runs CodeRabbit in background:

```bash
# Explicit background instruction
Run coderabbit --prompt-only in the background.
Let it run as long as it needs (even 30+ minutes).
Check status every 5 minutes and let me know when it's done.
```

## Example: Real Implementation Workflow

### Scenario: Adding Export Feature

```bash
# 1. Start feature branch
git checkout -b feature/export-change-orders

# 2. Ask Claude to implement + review
Claude, implement the change order export feature:
1. Read specs/003-export/spec.md
2. Implement the feature
3. Run coderabbit --prompt-only --type all in background
4. Fix all issues found
5. Verify accuracy ≥75%
6. Create PR when clean

# 3. Claude executes workflow
# (implementing... 15 minutes)
# (running CodeRabbit... 12 minutes)
# (fixing 8 issues... 10 minutes)
# (verifying... 3 minutes)

# 4. Review results
✅ Feature implemented
✅ CodeRabbit found 8 issues
✅ All issues resolved
✅ Accuracy: 78.5% (target ≥75%)
✅ Performance: 420ms (target <500ms)
✅ Constitutional compliance verified
✅ PR created: #42
```

### CodeRabbit Findings Example

```
🚨 CRITICAL: Privacy violation detected
  File: src/utils/analytics.js:23
  Issue: Sending usage data to external API
  Fix: Remove fetch() call, use chrome.storage.local only
  Constitutional violation: Privacy-First (§I)

⚠️ HIGH: Performance regression
  File: src/content/content.js:156
  Issue: MutationObserver without debouncing (850ms latency)
  Fix: Add 300ms debounce to scanMessages()
  Target: <500ms detection latency

💡 MEDIUM: Missing error handling
  File: src/utils/storage.js:45
  Issue: No try/catch around chrome.storage.local.get()
  Fix: Wrap in try/catch with fallback to empty array
```

## Configuration

### Custom Review Instructions

CodeRabbit reads `CLAUDE.md` for project context. Update it to customize reviews:

```markdown
## CodeRabbit Review Focus

When reviewing ScopeShield code, prioritize:

1. **Privacy**: Zero data transmission outside browser
2. **Performance**: Detection <500ms, highlighting <100ms
3. **Gmail Stability**: All selectors have fallback chains
4. **Accuracy**: Maintain ≥75% detection, <25% false positives
5. **Chrome Compliance**: Manifest V3, minimal permissions
```

### Review Thresholds

Create `.coderabbit.yml` for custom severity thresholds:

```yaml
# ScopeShield CodeRabbit Configuration

# Constitutional principles (auto-reject)
critical_patterns:
  - pattern: "fetch\\(|XMLHttpRequest"
    message: "Privacy violation: No external requests allowed"
    severity: critical

  - pattern: "chrome\\.storage\\.sync"
    message: "Privacy violation: Use chrome.storage.local only"
    severity: critical

# Performance budget (auto-reject)
performance:
  max_detection_latency_ms: 500
  max_highlight_latency_ms: 100
  max_bundle_size_kb: 500

# Accuracy requirements (auto-reject)
accuracy:
  min_detection_rate: 75
  max_false_positive_rate: 25
```

## Optimization Tips

### Faster Reviews

1. **Review smaller changesets**: Work on focused feature branches
2. **Use uncommitted flag**: `--type uncommitted` for quick pre-commit checks
3. **Review specific paths**: `--path "src/content/**"` to focus on changed areas
4. **Configure base branch**: `--base main` instead of comparing to distant branches

### Better Issue Detection

1. **Authenticate CodeRabbit**: Logged-in users get higher-quality reviews
2. **Provide context in CLAUDE.md**: More context = more relevant findings
3. **Use prompt-only mode**: Optimized for AI agent integration
4. **Let reviews run fully**: Don't interrupt long-running analyses

### Efficient Fix Cycles

1. **Group related fixes**: Fix all privacy issues together, then performance, etc.
2. **Verify after each group**: Re-run CodeRabbit to confirm fixes worked
3. **Address critical first**: Fix 🚨 and ⚠️ issues before 💡 and ℹ️
4. **Update tests**: Add tests for each fixed issue to prevent regression

## Troubleshooting

### CodeRabbit Not Finding Issues

**Problem**: CodeRabbit runs but reports no issues

**Solutions**:
1. Check git status: `git status` (CodeRabbit only reviews tracked changes)
2. Verify review type: Use `--type all` to review everything
3. Check base branch: Ensure `--base main` is correct
4. Verify authentication: `coderabbit auth status`

### Claude Not Applying Fixes

**Problem**: Claude gets CodeRabbit output but doesn't fix issues

**Solutions**:
1. Use explicit instruction: "fix all issues found by CodeRabbit"
2. Ensure prompt-only mode: `--prompt-only` provides AI-optimized output
3. Check background execution: "let it run as long as it needs"
4. Verify completion: Ask "Is CodeRabbit finished running?"

### Review Taking Too Long

**Problem**: CodeRabbit runs for 30+ minutes

**Solutions**:
1. Review smaller changesets: `--type uncommitted` or `--path "src/content/**"`
2. Use feature branches: Compare against recent branch, not ancient main
3. Break into chunks: Review detector changes separately from UI changes
4. Configure properly: Ensure `--base` is set to appropriate branch

### Authentication Issues

**Problem**: "Not authenticated" error in Claude Code

**Solutions**:
1. Authenticate in Claude Code: `Run: coderabbit auth login` (not in terminal)
2. Check status: `Run: coderabbit auth status`
3. Re-authenticate if expired: Token may need refresh

## Integration with GitHub Claude Review

CodeRabbit CLI + Claude Code complements the GitHub Claude review bot:

| Stage | Tool | Purpose |
|-------|------|---------|
| **Development** | CodeRabbit CLI + Claude Code | Autonomous fixing during implementation |
| **Pre-commit** | CodeRabbit CLI | Quick validation before committing |
| **Pre-PR** | CodeRabbit CLI | Comprehensive review before creating PR |
| **PR Review** | GitHub Claude Bot | Final validation against constitution |
| **Post-merge** | Both | Continuous quality monitoring |

## Cost Optimization

CodeRabbit CLI reviews are included in paid plans. Optimize usage:

1. **Review uncommitted first**: Catch issues early with `--type uncommitted`
2. **Use path filters**: `--path` to focus on changed areas
3. **Authenticate**: Logged-in users get more efficient reviews
4. **Batch fixes**: Group related changes to reduce review cycles

## Quick Reference

### Common Commands

```bash
# Standard workflow review
coderabbit --prompt-only --type all

# Quick pre-commit check
coderabbit --prompt-only --type uncommitted

# Pre-PR comprehensive review
coderabbit --prompt-only --base main

# Review specific files
coderabbit --prompt-only --path "src/utils/detector.js"

# Background review
coderabbit --prompt-only --type all  # Claude runs in background

# Check authentication
coderabbit auth status

# Get help
coderabbit --help
```

### Claude Code Prompts

```bash
# Full autonomous workflow
Implement [feature] from spec, run CodeRabbit in background, and fix all issues.

# Pre-commit validation
Run CodeRabbit on uncommitted changes and fix critical issues.

# Constitutional validation
Run CodeRabbit and verify all 8 constitutional principles are met.

# Performance validation
Run CodeRabbit and ensure detection latency <500ms and accuracy ≥75%.

# Pre-PR review
Run full CodeRabbit review against main, fix all issues, then create PR.
```

---

## Next Steps

1. **Install CodeRabbit CLI**: `curl -fsSL https://cli.coderabbit.ai/install.sh | sh`
2. **Authenticate in Claude Code**: `Run: coderabbit auth login`
3. **Test integration**: Ask Claude to run a review
4. **Customize CLAUDE.md**: Add project-specific review instructions
5. **Create first autonomous workflow**: Implement a feature with automatic review + fix

**Ready to start autonomous AI development with built-in quality gates!** 🚀