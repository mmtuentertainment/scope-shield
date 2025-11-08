# GitHub Automation for ScopeShield

This directory contains automated workflows and configuration for the ScopeShield project.

## 🤖 Claude Code Review

Automated AI code reviews using Claude to enforce our [constitutional principles](../memory/constitution.md).

### Quick Setup

```bash
# Run the automated setup script
./scripts/setup-claude-review.sh
```

Or manually follow the [detailed setup guide](SETUP_CLAUDE_REVIEW.md).

### What Gets Reviewed

Claude automatically reviews every pull request for:

#### **Constitutional Compliance** (8 Core Principles)
1. ✅ Privacy-First - No data transmission
2. ✅ Simplicity-First - Vanilla JS only
3. ✅ Real-Time Performance - <500ms latency
4. ✅ Zero Infrastructure - No servers
5. ✅ User Value - Solves real problems
6. ✅ Chrome Web Store Compliance - Manifest V3
7. ✅ Measurable Success - Accuracy metrics
8. ✅ Graceful Degradation - Fallback selectors

#### **Code Quality**
- Security vulnerabilities (XSS, injection attacks)
- Performance regressions
- Memory leaks
- Missing error handling
- Unclear naming
- Missing tests

#### **Chrome Extension Best Practices**
- Manifest V3 compliance
- Minimal permissions
- Content Security Policy
- Message passing patterns
- Background worker usage

#### **Gmail Integration**
- Selector fallback chains
- SPA navigation handling
- Multiple view compatibility

### Configuration Files

| File | Purpose |
|------|---------|
| `workflows/claude-review.yml` | GitHub Actions workflow definition |
| `claude-review-config.yml` | Project-specific review rules |
| `pull_request_template.md` | PR checklist template |
| `SETUP_CLAUDE_REVIEW.md` | Detailed setup instructions |

### Review Severity Levels

- 🚨 **CRITICAL** - Blocks merge (security, privacy violations)
- ⚠️ **HIGH** - Should fix before merge (performance, breaking changes)
- 💡 **MEDIUM** - Should address (code quality, missing tests)
- ℹ️ **LOW** - Optional (style, minor improvements)
- ✨ **SUGGESTION** - Nice to have (optimizations)

### Customization

Edit [`claude-review-config.yml`](claude-review-config.yml) to adjust:

```yaml
# Make reviews stricter
accuracy:
  detection_rate: "≥80%"  # Increase threshold

# Add custom checks
custom_checks:
  - name: "Your Custom Check"
    file_patterns: ["src/**/*.js"]

# Auto-approve certain changes
automation:
  auto_approve:
    - "Documentation updates"
```

### Cost Optimization

Typical costs per PR:
- Small (1-5 files): ~$0.01-0.05
- Medium (6-15 files): ~$0.06-0.15
- Large (16-20 files): ~$0.16-0.30

Reduce costs by:
- Limiting files: `max_files_per_review: 10`
- Excluding patterns: Add to `exclude_patterns`
- Using Sonnet model: Fast and affordable

### Troubleshooting

**Review doesn't run:**
- Check Actions permissions (Settings → Actions → General)
- Verify ANTHROPIC_API_KEY secret exists
- Check workflow YAML syntax

**Too many comments:**
- Increase: `max_comments_per_file: 5`
- Enable: `aggregate_reviews: true`

**Review too slow:**
- Reduce: `max_files_per_review: 10`
- Focus: `review_scope: "changed_files"`

See [SETUP_CLAUDE_REVIEW.md](SETUP_CLAUDE_REVIEW.md) for detailed troubleshooting.

## 📝 Pull Request Template

The [pull request template](pull_request_template.md) provides:

- Constitutional compliance checklist
- Test coverage requirements
- Performance metrics validation
- Security checklist
- Breaking change documentation

Fill out all sections for faster reviews!

## 🔐 Required Secrets

| Secret | Purpose | Setup |
|--------|---------|-------|
| `ANTHROPIC_API_KEY` | Claude API access | [Setup Guide](SETUP_CLAUDE_REVIEW.md) |
| `GITHUB_TOKEN` | Automatic (no setup needed) | Created by GitHub |

## 📊 Workflow Status

Check workflow runs:
```bash
# List recent runs
gh run list --workflow=claude-review.yml

# View specific run
gh run view <run-id> --log

# Re-run failed workflow
gh run rerun <run-id>
```

## 🎯 Best Practices for Contributors

### Before Creating a PR

1. ✅ Read [memory/constitution.md](../memory/constitution.md)
2. ✅ Run tests: `npm test`
3. ✅ Build: `npm run build`
4. ✅ Fill out PR template completely
5. ✅ Keep PRs focused (one feature per PR)
6. ✅ Add JSDoc for new public functions

### During Review

1. ✅ Address CRITICAL and HIGH issues first
2. ✅ Respond to Claude's questions
3. ✅ Update tests if detector changes
4. ✅ Verify accuracy metrics
5. ✅ Check constitutional compliance

### After Approval

1. ✅ Squash commits if requested
2. ✅ Update CHANGELOG.md
3. ✅ Verify CI passes
4. ✅ Merge when ready

## 🆘 Getting Help

- **Setup Issues**: See [SETUP_CLAUDE_REVIEW.md](SETUP_CLAUDE_REVIEW.md)
- **Review Questions**: Check workflow logs
- **API Issues**: https://support.anthropic.com/
- **GitHub Actions**: https://docs.github.com/actions

---

**Questions?** Open an issue or check the [setup guide](SETUP_CLAUDE_REVIEW.md).