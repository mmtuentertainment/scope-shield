# CLAUDE.md - ScopeShield Development Guide

This file provides guidance to Claude Code when working with the ScopeShield codebase.

## Important: Read Parent Standards First

This project follows the repository-wide standards defined in the parent directory:

- **[Code Organization Standards](../.claude/code-standards.md)** - File size limits, complexity rules, security best practices
- **[MCP Integration Guide](../.claude/mcp-integration.md)** - Context7 and Time MCP usage
- **[Root CLAUDE.md](../CLAUDE.md)** - Repository overview and structure

**All code must comply with these standards in addition to the ScopeShield-specific guidelines below.**

## Project Overview

**ScopeShield** is a Chrome extension that automatically detects scope creep in freelance projects and helps freelancers generate billable change orders.

**Target Users**: Freelancers (developers, designers, writers, consultants) who lose money to scope creep

**Revenue Model**: $9-12/month subscription (freemium: 5 detections/month free, unlimited paid)

## Spec-Driven Development Workflow

This project follows **Spec-Driven Development (SDD)** using GitHub Spec-Kit methodology:

### Constitutional Governance

ALL development decisions MUST comply with the project constitution at [`memory/constitution.md`](memory/constitution.md).

**8 Core Principles**:
1. **Privacy-First**: No data transmission, chrome.storage.local only
2. **Simplicity-First**: Heuristics only for MVP (no AI/ML until 100 users)
3. **Real-Time Performance**: <500ms detection, <5s change order generation
4. **Zero Infrastructure**: No backend, client-side only
5. **User Value First**: Features must help freelancers make money
6. **Chrome Web Store Compliance**: Manifest V3, minimal permissions
7. **Measurable Success**: ≥3 metrics per feature, 70%+ detection accuracy
8. **Graceful Degradation**: Manual fallbacks for all automated features

### Development Workflow Stages

```
Stage 0: Constitution → memory/constitution.md (✅ DONE)
Stage 1: Specify → specs/###-feature/spec.md (user stories, requirements)
Stage 2: Clarify → Resolve ambiguities before planning
Stage 3: Plan → plan.md (architecture, data model, contracts)
Stage 4: Tasks → tasks.md (atomic, dependency-ordered)
Stage 5: Implement → Working code
Stage 6: Analyze → Cross-artifact validation
```

### Spec-Kit Commands

When building features, use these commands:

```bash
# 1. Create feature specification
/speckit.specify [feature description]

# 2. Clarify ambiguities (ALWAYS do this before planning)
/speckit.clarify

# 3. Generate implementation plan
/speckit.plan [tech stack and architecture]

# 4. Break down into atomic tasks
/speckit.tasks

# 5. Validate cross-artifact consistency (optional but recommended)
/speckit.analyze

# 6. Execute implementation
/speckit.implement
```

### Feature Numbering

Features are numbered sequentially: `001-user-auth`, `002-detection-engine`, etc.

- Feature directory: `specs/###-feature-name/`
- Files: `spec.md`, `plan.md`, `tasks.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Technical Architecture

### Tech Stack
- **Extension**: Chrome Extension Manifest V3
- **Frontend**: HTML/CSS/JavaScript (vanilla, no frameworks for MVP)
- **Storage**: chrome.storage.local (no backend needed)
- **Build**: Vite for bundling
- **Testing**: Vitest for unit tests
- **Deployment**: Chrome Web Store

### Project Structure

```
scope-shield/
├── memory/
│   └── constitution.md          # Project governance principles
├── specs/
│   └── ###-feature-name/        # Feature specifications
│       ├── spec.md              # Requirements (technology-agnostic)
│       ├── plan.md              # Implementation plan
│       ├── tasks.md             # Atomic task breakdown
│       ├── data-model.md        # Entity definitions
│       └── contracts/           # API contracts (if applicable)
├── src/
│   ├── manifest.json            # Extension config (Manifest V3)
│   ├── background/
│   │   └── service-worker.js    # Background tasks
│   ├── content/
│   │   ├── content.js           # Inject into Gmail/Slack
│   │   └── content.css          # Highlight styles
│   ├── popup/
│   │   ├── popup.html           # Extension popup UI
│   │   ├── popup.js             # Dashboard logic
│   │   └── popup.css            # Dashboard styles
│   ├── options/
│   │   ├── options.html         # Settings page
│   │   └── options.js           # User preferences
│   └── utils/
│       ├── detector.js          # Scope creep detection logic
│       └── templates.js         # Change order templates
├── assets/
│   ├── icons/                   # Extension icons
│   └── screenshots/             # Chrome Web Store screenshots
├── tests/                       # Unit tests
├── docs/                        # Documentation
└── CLAUDE.md                    # This file
```

## Core Features (MVP - Phase 1)

1. **Scope Input**: User pastes original contract/project description
2. **Detection Engine**: Content script monitors Gmail/Slack for scope creep keywords
3. **Visual Alerts**: Yellow highlight + browser notification
4. **Change Order Generator**: One-click template with pre-filled details
5. **Dashboard**: Simple popup showing "Scope Creep Prevented: $X this month"

### Detection Logic (Heuristic-Based)

**Trigger words/phrases**:
- "also", "additionally", "one more thing", "quick favor"
- "while you're at it", "can you also", "by the way"
- "I forgot to mention", "actually", "instead"
- New feature requests after initial scope defined
- Requests for additional revisions beyond agreed limit

## Development Guidelines

### Constitutional Compliance

**EVERY feature specification MUST include a Constitution Check**:

```markdown
## Constitution Check (Phase -1 Gate)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Privacy-First | No data transmission | ✅ PASS | localStorage only |
| II. Simplicity-First | Heuristics only (MVP) | ✅ PASS | Keyword matching |
| III. Real-Time Performance | <500ms detection | ⚠️ WARN | Needs optimization |
| IV. Zero Infrastructure | Client-side only | ✅ PASS | No backend |
| V. User Value First | Helps freelancers earn | ✅ PASS | Change order = billable |
| VI. Chrome Web Store | Manifest V3, min permissions | ✅ PASS | 3 permissions only |
| VII. Measurable Success | ≥3 metrics defined | ✅ PASS | Accuracy, FP, $ saved |
| VIII. Graceful Degradation | Fallback for failures | ⚠️ WARN | Add manual button |
```

### Code Quality Standards

**CRITICAL**: All code must follow the [Code Organization Standards](../.claude/code-standards.md):

✅ **File Size Limits**:
- Production files: 200-400 lines (max 500, hard limit 800)
- Functions: 10-50 lines (max 75, hard limit 100)
- Cyclomatic complexity: <10 (max 15)
- Function parameters: ≤4
- Nesting depth: ≤4 levels

✅ **ESLint Enforcement**:
- Run `npm run lint` before every commit
- All rules are set to "warn" to allow flexibility
- Never disable rules with blanket `/* eslint-disable */`
- Use specific disables with justification: `// eslint-disable-next-line rule-name -- Reason`

✅ **Security Rules (Auto-enforced by ESLint)**:
- ❌ Never use `innerHTML`, `outerHTML`, `insertAdjacentHTML` with user content
- ❌ Never use `document.write()`, `eval()`, `Function()`, `XMLHttpRequest`
- ✅ Use `textContent`, `createElement()`, `fetch()` instead
- ✅ All Chrome API errors must be checked: `chrome.runtime.lastError`

✅ **ScopeShield-Specific Standards**:
- **Read before writing**: Always read existing files before editing
- **Test-first approach**: Write tests before implementation for detection logic
- **Vanilla JavaScript**: No frameworks for MVP (keeps bundle <500KB)
- **Clear naming**: `detectScopeCreep()`, `generateChangeOrder()`, not `doThing()`
- **JSDoc comments**: For all public functions
- **Defensive programming**: Check if DOM elements exist before accessing
- **Performance monitoring**: Use `performance.now()` for operations >100ms

### Error Handling

- **Graceful degradation**: If detection fails, show manual detection button
- **Clear error messages**: Tell user what happened, why, and what to do
- **No silent failures**: Always notify user of issues
- **Fallback modes**: Every automated feature has manual alternative

### Security

- **No eval() or Function()**: Use safe alternatives
- **Input sanitization**: All user-entered data must be sanitized
- **CSP compliant**: No inline scripts
- **No external scripts**: All code bundled locally

### Performance Budget

| Component | Target | Maximum |
|-----------|--------|---------|
| Extension bundle | <300KB | <500KB |
| Content script load | <50ms | <100ms |
| Detection latency | <300ms | <500ms |
| Highlight rendering | <50ms | <100ms |
| Change order generation | <3s | <5s |

## Testing

### Test Requirements

- **Detection logic**: 80%+ code coverage
- **Edge cases**: Test false positives, false negatives
- **Performance**: Verify detection completes <500ms
- **Manual testing**: Test on real Gmail and Slack

### Test Command

```bash
npm test
```

## Building & Deployment

### Development

```bash
npm install
npm run dev
```

### Build for Chrome Web Store

```bash
npm run build
```

Output: `dist/` directory ready for Chrome Web Store submission

### Load Unpacked Extension (Testing)

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `dist/` directory

## Success Criteria

✅ Detects scope creep with 70%+ accuracy (keyword-based)
✅ Generates change order in <5 seconds
✅ Works on Gmail and Slack web
✅ No data leaves user's browser (privacy-first)
✅ Chrome Web Store approved within 2 weeks

## Key Constraints

- **No backend required**: Everything client-side
- **Privacy-first**: No data collection, local storage only
- **Simple for MVP**: No AI/ML, pure heuristics
- **Fast**: Detection happens in real-time as user reads messages
- **Chrome Web Store compliant**: Manifest V3, minimal permissions

## CodeRabbit CLI Integration

This project uses **CodeRabbit CLI + Claude Code** for autonomous AI development workflows with built-in quality gates.

### CodeRabbit Review Focus

When running code reviews (via `coderabbit --prompt-only`), prioritize these areas:

#### 🚨 CRITICAL (Auto-reject)
1. **Privacy Violations** (Constitution §I)
   - Any `fetch()`, `XMLHttpRequest`, or external API calls
   - Use of `chrome.storage.sync` instead of `.local`
   - Data transmission outside browser
   - Third-party analytics or tracking

2. **Performance Regressions** (Constitution §III)
   - Detection latency >500ms (target: <300ms)
   - Highlighting latency >100ms (target: <50ms)
   - Bundle size >500KB (target: <300KB)
   - Memory leaks in MutationObservers

3. **Security Vulnerabilities**
   - XSS via `innerHTML` without sanitization
   - eval() or Function() constructor usage
   - Missing input validation
   - Permission creep in manifest.json

4. **Chrome Web Store Violations** (Constitution §VI)
   - Manifest V3 non-compliance
   - Forbidden permissions (webRequest, <all_urls>, cookies)
   - Missing or incorrect CSP

#### ⚠️ HIGH (Should fix)
1. **Gmail Integration Stability**
   - Selectors without fallback chains
   - Missing SPA navigation handling
   - No graceful degradation on selector failures

2. **Accuracy Impacts** (Constitution §VII)
   - Changes to trigger patterns without tests
   - Detection rate drops <75%
   - False positive rate exceeds 25%

3. **Missing Error Handling**
   - Async operations without try/catch
   - No fallback for chrome.storage.local failures
   - Silent failures (no user notification)

#### 💡 MEDIUM (Good to fix)
1. **Code Quality**
   - Missing JSDoc comments for public functions
   - Unclear variable names
   - Magic numbers without constants
   - Code duplication

2. **Test Coverage**
   - New detector patterns without tests
   - Missing edge case tests
   - Performance benchmarks missing

3. **Bundle Optimization**
   - Unused imports
   - Duplicated dependencies
   - Unnecessary polyfills

#### ℹ️ LOW (Optional)
1. **Documentation**
   - Missing inline comments for complex logic
   - Outdated README sections
   - Spec artifacts out of sync

2. **Style Consistency**
   - Inconsistent naming conventions
   - Formatting issues
   - Console.log without [ScopeShield] prefix

### Review Integration Commands

Use these prompts with Claude Code for autonomous workflows:

```bash
# Standard implementation + review workflow
Implement [feature] from spec, run coderabbit --prompt-only --type all
in the background, and fix all issues. Let it take as long as needed.

# Quick pre-commit check
Run coderabbit --prompt-only --type uncommitted and fix critical issues.

# Pre-PR comprehensive review
Run coderabbit --prompt-only --base main, fix all findings, then create PR.

# Constitutional validation
Run coderabbit --prompt-only and verify all 8 constitutional principles.
```

### Review Configuration

CodeRabbit automatically reads this file for project context. Key points:

- **Privacy-First**: Reject any external data transmission
- **Performance Budget**: Detection <500ms, highlighting <100ms, bundle <500KB
- **Accuracy Targets**: ≥75% detection rate, <25% false positive rate
- **Chrome Compliance**: Manifest V3, minimal permissions only
- **Gmail Stability**: All selectors must have fallback chains

See [.github/CODERABBIT_INTEGRATION.md](.github/CODERABBIT_INTEGRATION.md) for detailed setup and usage.

## Communication Style

When working with Claude Code:
- Be concise and technical
- Explain WHY not just WHAT when making architectural decisions
- Use bullet points for clarity
- Reference file paths as clickable links: [manifest.json](src/manifest.json)

## Resources

- **Constitution**: [memory/constitution.md](memory/constitution.md)
- **Spec-Kit Docs**: https://github.com/github/spec-kit
- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/mv3/
- **INIT_SCOPE_SHIELD.md**: Original initialization prompt (in parent directory)

## Next Steps After Initialization

After initialization is complete, development starts with:

```
Start Phase 1: Build the core scope creep detection engine.

Focus on:
1. /speckit.specify - Create specification for detection engine
2. /speckit.clarify - Resolve any ambiguities
3. /speckit.plan - Generate implementation plan with tech stack
4. /speckit.tasks - Break down into atomic tasks
5. /speckit.implement - Execute implementation

Keep it simple - just detection and highlighting for now.
```

---

**Remember**: This project follows Spec-Driven Development. Always create specifications BEFORE implementation. Validate against the constitution BEFORE planning. Measure success AFTER shipping.
