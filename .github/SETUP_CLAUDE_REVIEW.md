# Setting Up AI Code Review for ScopeShield

This guide walks you through the **3-tier AI review system** for the ScopeShield repository.

## Overview: Triple Coverage Strategy

Since Anthropic doesn't provide an official `anthropic-review-action`, we've implemented **Option D: Maximum Coverage** with three complementary workflows:

1. **CI Workflow** - Fast feedback (tests, build, constitutional checks)
2. **CodeRabbit GitHub Action** - Comprehensive code analysis
3. **Custom Claude Review** - Constitutional compliance validation

## Prerequisites

1. GitHub repository with admin access
2. (Optional) Anthropic API key for custom Claude reviews
3. (Free) CodeRabbit account for automated reviews

## Active Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`) ✅ REQUIRED

**What it does:**
- Runs all 57 unit tests
- Builds the extension
- Validates constitutional compliance
- Checks for Privacy-First violations (network requests, storage.sync)
- Validates Manifest V3 compliance

**Setup:** None required - runs automatically on all PRs

**Speed:** ~30-60 seconds

### 2. CodeRabbit GitHub Action (`.github/workflows/coderabbit-review.yml`) ✅ ACTIVE

**What it does:**
- Comprehensive code analysis
- Security vulnerability scanning
- Best practices validation
- Posts review comments automatically

**Setup:** CodeRabbit automatically reviews PRs when you have an account (free tier available)

**Speed:** ~1-2 minutes

### 3. Custom Claude Review (`.github/workflows/claude-custom-review.yml`) ⚙️ OPTIONAL

**What it does:**
- Reviews against constitutional principles
- Uses your `.github/claude-review-config.yml`
- Posts detailed Claude-powered review comments
- Validates architecture decisions

**Setup:** Requires `ANTHROPIC_API_KEY` secret (see below)

**Speed:** ~30-90 seconds
**Cost:** ~$0.01-0.30 per PR

---

## Step 1: Get Anthropic API Key (Optional - For Custom Claude Reviews)

**Skip this if you only want CI + CodeRabbit reviews.**

1. Go to https://console.anthropic.com/
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Name it: `github-scopeshield-review`
6. Copy the API key (starts with `sk-ant-`)
7. **Important**: Save it securely - you won't see it again!

## Step 2: Add API Key to GitHub Secrets

### Option A: Via GitHub Web UI

1. Go to your repository: `https://github.com/YOUR_USERNAME/scope-shield`
2. Click **Settings** tab
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Secret**: Paste your Anthropic API key
6. Click **Add secret**

### Option B: Via GitHub CLI

```bash
# Make sure you're in the repo directory
cd /home/matt/Idea-dreams/scope-shield

# Add the secret (replace YOUR_KEY with actual key)
gh secret set ANTHROPIC_API_KEY --body "sk-ant-YOUR_KEY_HERE"

# Verify it was added
gh secret list
```

## Step 3: Enable GitHub Actions

1. Go to repository **Settings** → **Actions** → **General**
2. Under **Actions permissions**, select:
   - ✅ "Allow all actions and reusable workflows"
3. Under **Workflow permissions**, select:
   - ✅ "Read and write permissions"
   - ✅ "Allow GitHub Actions to create and approve pull requests"
4. Click **Save**

## Step 4: Test the Setup

### Create a Test PR

```bash
# Create a test branch
git checkout -b test/claude-review

# Make a small change
echo "# Test change for Claude review" >> README.md

# Commit and push
git add README.md
git commit -m "test: Claude review setup"
git push origin test/claude-review

# Create PR via GitHub CLI
gh pr create --title "Test: Claude Review Setup" --body "Testing automated Claude code review"
```

### Verify Review Bot

1. Go to the PR you just created
2. Click **Checks** tab
3. You should see **Claude Code Review** workflow running
4. Wait for completion (~30-60 seconds)
5. Check **Conversation** tab for Claude's review comments

## Step 5: Review Configuration (Optional)

The Claude review bot is configured via these files:

- **`.github/workflows/claude-review.yml`** - GitHub Actions workflow
- **`.github/claude-review-config.yml`** - Project-specific review rules
- **`.github/pull_request_template.md`** - PR template with checklists

### Customizing Review Behavior

Edit `.github/workflows/claude-review.yml` to adjust:

```yaml
# Change the model (sonnet is recommended for speed/quality)
model: claude-sonnet-4

# Adjust review scope
review_scope: "changed_files"  # or "entire_codebase"

# Change max files per review
max_files_per_review: 20
```

### Adjusting Review Strictness

Edit `.github/claude-review-config.yml`:

```yaml
# Make reviews stricter
accuracy:
  detection_rate: "≥80%"  # Increase from 75%
  false_positive_rate: "<20%"  # Decrease from 25%

# Add more auto-reject rules
automation:
  auto_request_changes:
    - "Privacy violations (data transmission)"
    - "Performance regression >50ms"  # Stricter threshold
```

## Step 6: Understanding Review Output

### Review Levels

Claude will categorize issues by severity:

- **🚨 CRITICAL** - Constitutional violations, security issues (blocks merge)
- **⚠️ HIGH** - Performance regressions, breaking changes (requires fix)
- **💡 MEDIUM** - Code quality, missing tests (should fix)
- **ℹ️ LOW** - Style issues, minor improvements (optional)
- **✨ SUGGESTION** - Optimizations, best practices (nice to have)

### Constitutional Validation

Every PR is automatically checked against the 8 core principles:

1. **Privacy-First** - No data transmission
2. **Simplicity-First** - Vanilla JS only
3. **Real-Time Performance** - <500ms latency
4. **Zero Infrastructure** - No servers
5. **User Value** - Solves real problems
6. **Chrome Web Store Compliance** - Manifest V3
7. **Measurable Success** - Accuracy metrics
8. **Graceful Degradation** - Fallback selectors

### Review Triggers

Claude review runs automatically on:

- ✅ New pull requests
- ✅ PR updates (new commits)
- ✅ PR re-opens
- ✅ Review comment replies (for clarification)

Claude does NOT review:

- ❌ Direct commits to main branch
- ❌ Draft PRs (until marked ready)
- ❌ Files in `dist/`, `node_modules/`, `.github/`

## Troubleshooting

### Review Doesn't Run

**Check workflow file syntax:**
```bash
# Validate YAML syntax
cat .github/workflows/claude-review.yml | yq eval
```

**Check Actions permissions:**
- Settings → Actions → General → Workflow permissions
- Must have "Read and write permissions"

**Check API key:**
```bash
# Verify secret exists
gh secret list | grep ANTHROPIC_API_KEY
```

### Review Takes Too Long

**Reduce review scope:**
```yaml
# In .github/workflows/claude-review.yml
max_files_per_review: 10  # Reduce from 20
review_scope: "changed_files"  # Focus on changes only
```

**Exclude large files:**
```yaml
exclude_patterns: |
  dist/**
  node_modules/**
  tests/fixtures/**  # Add fixture data
  **/*.min.js  # Skip minified files
```

### Too Many Comments

**Increase comment threshold:**
```yaml
# In .github/workflows/claude-review.yml
max_comments_per_file: 5  # Reduce from 10
aggregate_reviews: true  # Group similar issues
```

**Adjust severity thresholds:**
```yaml
# In .github/claude-review-config.yml
automation:
  auto_approve:
    - "LOW severity issues"
    - "SUGGESTION level improvements"
```

## Cost Management

### Estimated Costs

- **Small PR** (1-5 files): ~$0.01-0.05 per review
- **Medium PR** (6-15 files): ~$0.06-0.15 per review
- **Large PR** (16-20 files): ~$0.16-0.30 per review

### Cost Optimization Tips

1. **Use file limits**: `max_files_per_review: 20`
2. **Exclude non-critical files**: Add to `exclude_patterns`
3. **Use Sonnet model**: Faster and cheaper than Opus
4. **Aggregate reviews**: `aggregate_reviews: true`
5. **Skip draft PRs**: Only review when marked "Ready"

### Monitor Usage

Check your Anthropic console for API usage:
- https://console.anthropic.com/settings/usage

## Advanced Configuration

### Custom Review Rules for Specific Files

Add to `.github/claude-review-config.yml`:

```yaml
file_specific_rules:
  "src/utils/new-feature.js":
    critical: true
    require_tests: true
    custom_checks:
      - "Must have JSDoc comments"
      - "Must handle errors"
      - "Must validate input"
```

### Integration with CI/CD

Block merges if Claude requests changes:

```yaml
# In .github/workflows/claude-review.yml
- name: Check Review Status
  run: |
    if [[ "${{ steps.claude-review.outputs.status }}" == "changes_requested" ]]; then
      echo "::error::Claude requested changes. Please address feedback."
      exit 1
    fi
```

### Slack Notifications

Add to workflow:

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Claude review found critical issues in PR #${{ github.event.pull_request.number }}"
      }
```

## Best Practices

### For PR Authors

1. ✅ Fill out PR template completely
2. ✅ Check constitutional compliance before submitting
3. ✅ Run tests locally: `npm test`
4. ✅ Build locally: `npm run build`
5. ✅ Add JSDoc comments for new functions
6. ✅ Keep PRs focused (one feature per PR)

### For Reviewers

1. ✅ Review Claude's feedback first
2. ✅ Address CRITICAL and HIGH issues before approving
3. ✅ Verify constitutional compliance
4. ✅ Check test coverage
5. ✅ Validate accuracy metrics for detector changes

## Support

### Getting Help

- **Claude Review Issues**: Check GitHub Actions logs
- **Configuration Help**: See `.github/claude-review-config.yml` comments
- **Anthropic API Issues**: https://support.anthropic.com/

### Updating the Review Bot

Pull latest changes to workflow:

```bash
git pull origin main
# Review changes to .github/ files
git log --oneline .github/
```

---

## Quick Reference

### Essential Commands

```bash
# Check if secret is set
gh secret list | grep ANTHROPIC_API_KEY

# Test workflow locally (requires act)
act pull_request -e .github/workflows/test-event.json

# View workflow runs
gh run list --workflow=claude-review.yml

# View specific run logs
gh run view <run-id> --log

# Re-run failed workflow
gh run rerun <run-id>
```

### Configuration Files

| File | Purpose | Used By |
|------|---------|---------|
| `.github/workflows/ci.yml` | CI tests & build validation | All PRs (required) |
| `.github/workflows/coderabbit-review.yml` | CodeRabbit GitHub Action | CodeRabbit service |
| `.github/workflows/claude-custom-review.yml` | Custom Claude API reviews | Anthropic API (optional) |
| `.github/claude-review-config.yml` | Project-specific review rules | Custom Claude review |
| `.github/pull_request_template.md` | PR checklist template | All PRs |
| `memory/constitution.md` | 8 core principles | CI + Custom Claude review |
| `.coderabbit.yaml` | CodeRabbit configuration | CodeRabbit reviews |

---

**Setup Complete!** 🎉

Claude will now automatically review all pull requests against your constitutional principles and project standards.